import json
import os
import psycopg2
import requests

def handler(event: dict, context) -> dict:
    '''Webhook бота — авторизация (/start) + поддержка (сообщения)'''
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
    first_name = message.get('from', {}).get('first_name', '')
    text = message.get('text', '')
    reply_to = message.get('reply_to_message')

    if not chat_id:
        return ok()

    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    admin_chat_id = os.environ.get('SUPPORT_ADMIN_CHAT_ID')
    database_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    if username:
        telegram_username = '@' + username.lower()
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

    if text == '/start':
        if bot_token:
            send_msg(bot_token, chat_id,
                'Добро пожаловать!\n\n'
                '1. Для авторизации на сайте — введите username на сайте и получите код сюда\n'
                '2. Для связи с поддержкой — просто напишите ваш вопрос\n\n'
                'Среднее время ответа: ~15 минут.')
        return ok()

    if text.startswith('/'):
        return ok()

    if admin_chat_id and str(chat_id) == str(admin_chat_id) and reply_to:
        handle_admin_reply(bot_token, text, reply_to, database_url, schema)
    elif admin_chat_id and str(chat_id) != str(admin_chat_id):
        handle_user_message(bot_token, int(admin_chat_id), chat_id, username, first_name, text, database_url, schema)

    return ok()


def handle_user_message(bot_token, admin_chat_id, user_chat_id, username, first_name, text, database_url, schema):
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    cur.execute(
        f'''INSERT INTO {schema}.support_messages (user_chat_id, user_username, direction, message_text)
            VALUES (%s, %s, 'in', %s) RETURNING id''',
        (user_chat_id, f'@{username}' if username else first_name, text)
    )
    msg_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    display_name = f'@{username}' if username else first_name
    admin_text = (
        f'Тикет #{msg_id}\n'
        f'От: {display_name}\n'
        f'ID: {user_chat_id}\n'
        f'{"─" * 20}\n'
        f'{text}\n'
        f'{"─" * 20}\n'
        f'Ответьте реплаем на это сообщение.'
    )

    result = send_msg(bot_token, admin_chat_id, admin_text)

    if result and result.get('ok'):
        admin_msg_id = result['result']['message_id']
        conn2 = psycopg2.connect(database_url)
        cur2 = conn2.cursor()
        cur2.execute(
            f'UPDATE {schema}.support_messages SET admin_message_id = %s WHERE id = %s',
            (admin_msg_id, msg_id)
        )
        conn2.commit()
        cur2.close()
        conn2.close()

    send_msg(bot_token, user_chat_id,
        'Ваше сообщение получено! Оператор ответит в ближайшее время.')


def handle_admin_reply(bot_token, text, reply_to, database_url, schema):
    reply_msg_id = reply_to.get('message_id')
    reply_text = reply_to.get('text', '')
    user_chat_id = None

    for line in reply_text.split('\n'):
        if line.startswith('ID: '):
            try:
                user_chat_id = int(line.replace('ID: ', '').strip())
            except ValueError:
                pass
            break

    if not user_chat_id:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        cur.execute(
            f'SELECT user_chat_id FROM {schema}.support_messages WHERE admin_message_id = %s',
            (reply_msg_id,)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            user_chat_id = row[0]

    if not user_chat_id:
        return

    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    cur.execute(
        f'''INSERT INTO {schema}.support_messages (user_chat_id, user_username, direction, message_text)
            VALUES (%s, 'admin', 'out', %s)''',
        (user_chat_id, text)
    )
    conn.commit()
    cur.close()
    conn.close()

    send_msg(bot_token, user_chat_id, f'Ответ поддержки:\n\n{text}')


def send_msg(bot_token, chat_id, text):
    try:
        resp = requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={'chat_id': chat_id, 'text': text},
            timeout=5
        )
        return resp.json()
    except Exception:
        return None


def ok():
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True})
    }
