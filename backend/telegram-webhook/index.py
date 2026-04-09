import json
import os
import psycopg2
import requests

def handler(event: dict, context) -> dict:
    '''Webhook для Telegram бота авторизации — сохраняет chat_id при /start'''
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    if event.get('httpMethod') != 'POST':
        return ok()

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body)
    message = body.get('message', {})

    if not message:
        return ok()

    chat_id = message.get('chat', {}).get('id')
    username = message.get('from', {}).get('username', '')
    text = message.get('text', '')

    if not chat_id or not username:
        return ok()

    telegram_username = '@' + username.lower()

    database_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    cur.execute(
        f'SELECT 1 FROM {schema}.telegram_users WHERE telegram_username = %s',
        (telegram_username,)
    )
    is_new_user = cur.fetchone() is None

    cur.execute(
        f'''INSERT INTO {schema}.telegram_users (telegram_username, chat_id)
            VALUES (%s, %s)
            ON CONFLICT (telegram_username)
            DO UPDATE SET chat_id = EXCLUDED.chat_id''',
        (telegram_username, chat_id)
    )
    conn.commit()
    cur.close()
    conn.close()

    if text == '/start':
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if bot_token:
            if is_new_user:
                msg = (
                    '✅ <b>Регистрация прошла успешно!</b>\n\n'
                    f'Добро пожаловать в <b>BLQOU</b>, {telegram_username}!\n\n'
                    'Теперь вы можете авторизоваться на сайте:\n'
                    '1. Перейдите на <b>blqou.com</b>\n'
                    '2. Введите ваш Telegram username\n'
                    '3. Получите код авторизации прямо сюда\n\n'
                    '🔐 Код действует 10 минут.'
                )
            else:
                msg = (
                    '👋 <b>С возвращением!</b>\n\n'
                    f'{telegram_username}, вы уже зарегистрированы.\n'
                    'Перейдите на <b>blqou.com</b> и авторизуйтесь — код придёт в этот чат.'
                )
            requests.post(
                f'https://api.telegram.org/bot{bot_token}/sendMessage',
                json={'chat_id': chat_id, 'text': msg, 'parse_mode': 'HTML'},
                timeout=5
            )

    return ok()


def ok():
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True})
    }