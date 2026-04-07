import json
import os
import random
import sys
import psycopg2
from datetime import datetime
import requests

def handler(event: dict, context) -> dict:
    '''API для авторизации через Telegram с отправкой кода в бот'''
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
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')

        if action == 'send_code':
            return send_code(body)
        elif action == 'verify_code':
            return verify_code(body)
        else:
            return error_response('Invalid action', 400)

    return error_response('Method not allowed', 405)


def send_code(body: dict) -> dict:
    '''Генерирует код и отправляет через Telegram бота по chat_id из БД'''
    telegram_username = body.get('telegram_username', '').strip().lower()

    if not telegram_username:
        return error_response('Telegram username required', 400)

    if not telegram_username.startswith('@'):
        telegram_username = '@' + telegram_username

    conn = get_db_connection()
    cur = conn.cursor()

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    cur.execute(
        f'SELECT chat_id FROM {schema}.telegram_users WHERE telegram_username = %s',
        (telegram_username,)
    )
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return error_response('Сначала напишите /start нашему боту в Telegram, затем повторите попытку', 400)

    chat_id = row[0]
    code = str(random.randint(1000, 9999))

    cur.execute(
        f'''INSERT INTO {schema}.auth_sessions (telegram_username, code, verified)
            VALUES (%s, %s, FALSE)
            ON CONFLICT (telegram_username)
            DO UPDATE SET code = EXCLUDED.code, created_at = NOW(), expires_at = NOW() + INTERVAL '10 minutes', verified = FALSE''',
        (telegram_username, code)
    )
    conn.commit()
    cur.close()
    conn.close()

    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    print(f'[AUTH] Sending code to chat_id={chat_id}, username={telegram_username}, bot_token_exists={bool(bot_token)}')
    if bot_token:
        msg = f'<b>Код для входа в обменник:</b>\n\n<code>{code}</code>\n\nКод действителен 10 минут.'
        tg_resp = requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={'chat_id': chat_id, 'text': msg, 'parse_mode': 'HTML'},
            timeout=5
        )
        print(f'[AUTH] Telegram API response: status={tg_resp.status_code}, body={tg_resp.text}')
    else:
        print('[AUTH] ERROR: TELEGRAM_BOT_TOKEN not found in env')

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': f'Код отправлен в Telegram для {telegram_username}'
        })
    }


def notify_admin_new_user(telegram_username):
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('ADMIN_NOTIFY_CHAT_ID')
    if not bot_token or not chat_id:
        return

    msg = (
        f"👤 <b>Новый пользователь</b>\n\n"
        f"📱 Telegram: {telegram_username}\n"
        f"🕐 {datetime.now().strftime('%d.%m.%Y %H:%M')}"
    )

    try:
        requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={'chat_id': chat_id, 'text': msg, 'parse_mode': 'HTML'},
            timeout=5
        )
    except Exception:
        pass


def verify_code(body: dict) -> dict:
    '''Проверяет введённый код'''
    telegram_username = body.get('telegram_username', '').strip().lower()
    code = body.get('code', '').strip()

    if not telegram_username or not code:
        return error_response('Username and code required', 400)

    if not telegram_username.startswith('@'):
        telegram_username = '@' + telegram_username

    conn = get_db_connection()
    cur = conn.cursor()

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    cur.execute(
        f'SELECT code, expires_at, verified FROM {schema}.auth_sessions WHERE telegram_username = %s',
        (telegram_username,)
    )
    result = cur.fetchone()

    if not result:
        cur.close()
        conn.close()
        return error_response('Сессия не найдена', 404)

    stored_code, expires_at, verified = result

    if datetime.now() > expires_at:
        cur.close()
        conn.close()
        return error_response('Код истёк', 400)

    if verified:
        cur.close()
        conn.close()
        return error_response('Код уже использован', 400)

    if stored_code != code:
        cur.close()
        conn.close()
        return error_response('Неверный код', 400)

    cur.execute(
        f"SELECT COUNT(*) FROM {schema}.exchanges WHERE user_username = %s",
        (telegram_username,)
    )
    exchange_count = cur.fetchone()[0]
    is_new_user = exchange_count == 0

    cur.execute(
        f'UPDATE {schema}.auth_sessions SET verified = TRUE WHERE telegram_username = %s',
        (telegram_username,)
    )
    conn.commit()
    cur.close()
    conn.close()

    if is_new_user:
        notify_admin_new_user(telegram_username)

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': 'Авторизация успешна',
            'telegram_username': telegram_username
        })
    }


def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def error_response(message: str, status_code: int) -> dict:
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message})
    }