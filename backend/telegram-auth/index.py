import json
import os
import random
import psycopg2
from datetime import datetime, timedelta
import requests

def handler(event: dict, context) -> dict:
    '''API для авторизации через Telegram с отправкой 6-значного кода'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'send_code':
                return send_code(body)
            elif action == 'verify_code':
                return verify_code(body)
            else:
                return error_response('Invalid action', 400)
                
        except Exception as e:
            return error_response(str(e), 500)
    
    return error_response('Method not allowed', 405)


def send_code(body: dict) -> dict:
    '''Генерирует код и отправляет через Telegram бота'''
    telegram_username = body.get('telegram_username', '').strip()
    
    if not telegram_username:
        return error_response('Telegram username required', 400)
    
    if not telegram_username.startswith('@'):
        telegram_username = '@' + telegram_username
    
    code = str(random.randint(100000, 999999))
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute('''
            INSERT INTO auth_sessions (telegram_username, code, verified)
            VALUES (%s, %s, FALSE)
            ON CONFLICT (telegram_username) 
            DO UPDATE SET code = EXCLUDED.code, created_at = NOW(), expires_at = NOW() + INTERVAL '10 minutes', verified = FALSE
        ''', (telegram_username, code))
        conn.commit()
        
        telegram_user_id = body.get('telegram_user_id')
        if telegram_user_id:
            send_telegram_message(telegram_user_id, code)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': f'Код отправлен в Telegram для {telegram_username}'
            })
        }
    except Exception as e:
        conn.rollback()
        return error_response(f'Database error: {str(e)}', 500)
    finally:
        cur.close()
        conn.close()


def verify_code(body: dict) -> dict:
    '''Проверяет введенный код'''
    telegram_username = body.get('telegram_username', '').strip()
    code = body.get('code', '').strip()
    
    if not telegram_username or not code:
        return error_response('Username and code required', 400)
    
    if not telegram_username.startswith('@'):
        telegram_username = '@' + telegram_username
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute('''
            SELECT code, expires_at, verified 
            FROM auth_sessions 
            WHERE telegram_username = %s
        ''', (telegram_username,))
        
        result = cur.fetchone()
        
        if not result:
            return error_response('Сессия не найдена', 404)
        
        stored_code, expires_at, verified = result
        
        if datetime.now() > expires_at:
            return error_response('Код истёк', 400)
        
        if verified:
            return error_response('Код уже использован', 400)
        
        if stored_code != code:
            return error_response('Неверный код', 400)
        
        cur.execute('''
            UPDATE auth_sessions 
            SET verified = TRUE 
            WHERE telegram_username = %s
        ''', (telegram_username,))
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Авторизация успешна',
                'telegram_username': telegram_username
            })
        }
    except Exception as e:
        conn.rollback()
        return error_response(f'Database error: {str(e)}', 500)
    finally:
        cur.close()
        conn.close()


def send_telegram_message(chat_id: str, code: str):
    '''Отправляет код через Telegram бота'''
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    if not bot_token:
        return
    
    message = f'🔐 Ваш код для входа в CryptoMixer:\n\n<code>{code}</code>\n\nКод действителен 10 минут.'
    
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    
    try:
        requests.post(url, json={
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }, timeout=5)
    except:
        pass


def get_db_connection():
    '''Подключение к PostgreSQL'''
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def error_response(message: str, status_code: int) -> dict:
    '''Стандартный ответ с ошибкой'''
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message})
    }
