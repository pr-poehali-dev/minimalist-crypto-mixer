import json
import os
import psycopg2
import requests
from datetime import datetime, timedelta


def notify_admin_payment_sent(short_id, username, from_currency, to_currency, from_amount, to_amount):
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('ADMIN_NOTIFY_CHAT_ID')
    if not bot_token or not chat_id:
        return

    msg = (
        f"💸 <b>Пользователь подтвердил оплату</b>\n\n"
        f"📋 ID: <code>{short_id}</code>\n"
        f"👤 Пользователь: @{username.lstrip('@')}\n"
        f"💱 {from_amount} {from_currency} → {to_amount} {to_currency}\n"
        f"🕐 {datetime.now().strftime('%d.%m.%Y %H:%M')}\n\n"
        f"⚡ Проверьте поступление средств!"
    )

    try:
        requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={'chat_id': chat_id, 'text': msg, 'parse_mode': 'HTML'},
            timeout=5
        )
    except Exception:
        pass

def handler(event: dict, context) -> dict:
    '''Пользователь подтверждает отправку средств'''
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Username'
            },
            'body': ''
        }

    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    username = event.get('headers', {}).get('X-User-Username') or event.get('headers', {}).get('x-user-username')
    if not username:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Необходимо авторизоваться'})
        }

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body)
    short_id = body.get('short_id', '')

    if not short_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'short_id is required'})
        }

    database_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    cur.execute(
        f"SELECT id, status, created_at, user_username, from_currency, to_currency, from_amount, to_amount FROM {schema}.exchanges WHERE short_id = %s",
        (short_id.upper(),)
    )
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Order not found'})
        }

    order_username = (row[3] or '').lower().lstrip('@')
    request_username = username.lower().lstrip('@')
    if order_username != request_username:
        cur.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Нет доступа к этой заявке'})
        }

    if row[1] == 'Ожидает оплаты' and row[2]:
        expire_time = row[2] + timedelta(minutes=30)
        if datetime.now() > expire_time:
            cur.execute(
                f"UPDATE {schema}.exchanges SET status = 'Не оплачена', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (row[0],)
            )
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Время на оплату истекло', 'expired': True})
            }

    if row[1] != 'Ожидает оплаты':
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Order is not awaiting payment'})
        }

    cur.execute(
        f"UPDATE {schema}.exchanges SET status = 'Оплата отправлена', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
        (row[0],)
    )
    conn.commit()
    cur.close()
    conn.close()

    notify_admin_payment_sent(
        short_id.upper(),
        row[3] or '',
        row[4] or '',
        row[5] or '',
        row[6] or '',
        row[7] or ''
    )

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'status': 'Оплата отправлена'})
    }