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
        f'''INSERT INTO {schema}.telegram_users (telegram_username, chat_id)
            VALUES (%s, %s)
            ON CONFLICT (telegram_username)
            DO UPDATE SET chat_id = EXCLUDED.chat_id''',
        (telegram_username, chat_id)
    )
    conn.commit()
    cur.close()
    conn.close()

    print(f'[WEBHOOK] chat_id={chat_id}, username={telegram_username}, text={text}')

    if text == '/start':
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        print(f'[WEBHOOK] bot_token exists={bool(bot_token)}, token_start={bot_token[:10] if bot_token else "NONE"}...')
        if bot_token:
            resp = requests.post(
                f'https://api.telegram.org/bot{bot_token}/sendMessage',
                json={
                    'chat_id': chat_id,
                    'text': 'Вы успешно подключены к BLQOU!\n\nТеперь вы можете авторизоваться на сайте — введите ваш username и получите код прямо сюда.',
                    'parse_mode': 'HTML'
                },
                timeout=5
            )
            print(f'[WEBHOOK] TG response: {resp.status_code} {resp.text}')

    return ok()


def ok():
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True})
    }