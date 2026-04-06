import json
import os
import psycopg2
import requests

CATEGORIES = {
    '1': 'Проблема с обменом',
    '2': 'Вопрос по статусу',
    '3': 'Технические проблемы',
    '4': 'Другое'
}

def handler(event: dict, context) -> dict:
    '''Webhook бота поддержки — тикеты пользователей и ответы админа'''
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

    message = body.get('message')
    callback = body.get('callback_query')

    if callback:
        return handle_callback(callback)

    if not message:
        return ok()

    chat_id = message.get('chat', {}).get('id')
    text = message.get('text', '')
    username = message.get('from', {}).get('username', '')
    first_name = message.get('from', {}).get('first_name', '')
    reply_to = message.get('reply_to_message')

    if not chat_id or not text:
        return ok()

    bot_token = os.environ.get('SUPPORT_BOT_TOKEN')
    admin_chat_id = os.environ.get('SUPPORT_ADMIN_CHAT_ID')

    if not bot_token or not admin_chat_id:
        return ok()

    admin_chat_id = int(admin_chat_id)
    database_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    if text == '/start':
        send_welcome(bot_token, chat_id)
        return ok()

    if text == '/help':
        send_help(bot_token, chat_id)
        return ok()

    if text == '/ticket':
        send_category_menu(bot_token, chat_id)
        return ok()

    if text == '/status':
        send_ticket_status(bot_token, chat_id, database_url, schema)
        return ok()

    if chat_id == admin_chat_id and reply_to:
        handle_admin_reply(bot_token, text, reply_to, database_url, schema)
        return ok()

    if chat_id != admin_chat_id:
        handle_user_message(bot_token, admin_chat_id, chat_id, username, first_name, text, database_url, schema, category='Другое')
        return ok()

    return ok()


def handle_callback(callback):
    bot_token = os.environ.get('SUPPORT_BOT_TOKEN')
    admin_chat_id = os.environ.get('SUPPORT_ADMIN_CHAT_ID')
    database_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    if not bot_token or not admin_chat_id:
        return ok()

    chat_id = callback['message']['chat']['id']
    data = callback.get('data', '')
    username = callback['from'].get('username', '')
    first_name = callback['from'].get('first_name', '')
    callback_id = callback['id']

    answer_callback(bot_token, callback_id)

    if data.startswith('cat_'):
        cat_key = data.replace('cat_', '')
        category = CATEGORIES.get(cat_key, 'Другое')
        edit_message(bot_token, chat_id, callback['message']['message_id'],
            f'📋 Категория: <b>{category}</b>\n\nТеперь опишите вашу проблему одним сообщением:')
        set_user_state(database_url, schema, chat_id, f'awaiting_message:{category}')
        return ok()

    return ok()


def send_welcome(bot_token, chat_id):
    text = (
        '👋 <b>Добро пожаловать в поддержку!</b>\n\n'
        'Я помогу вам связаться с оператором.\n\n'
        '📝 <b>Команды:</b>\n'
        '/ticket — создать тикет (с выбором категории)\n'
        '/status — проверить статус тикетов\n'
        '/help — справка\n\n'
        'Или просто напишите ваш вопрос — я сразу передам его оператору.\n\n'
        '⏱ Среднее время ответа: <b>~15 минут</b>'
    )
    send_msg(bot_token, chat_id, text)


def send_help(bot_token, chat_id):
    text = (
        'ℹ️ <b>Справка по боту поддержки</b>\n\n'
        '• Напишите любое сообщение — оно будет передано оператору\n'
        '• /ticket — создать тикет с категорией\n'
        '• /status — узнать статус ваших обращений\n\n'
        '⚠️ Мы никогда не просим пароли, seed-фразы или приватные ключи.\n'
        'Работаем 24/7.'
    )
    send_msg(bot_token, chat_id, text)


def send_category_menu(bot_token, chat_id):
    keyboard = {
        'inline_keyboard': [
            [{'text': '💱 Проблема с обменом', 'callback_data': 'cat_1'}],
            [{'text': '🔍 Вопрос по статусу', 'callback_data': 'cat_2'}],
            [{'text': '⚙️ Технические проблемы', 'callback_data': 'cat_3'}],
            [{'text': '📩 Другое', 'callback_data': 'cat_4'}]
        ]
    }
    try:
        requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={
                'chat_id': chat_id,
                'text': '📋 <b>Выберите категорию обращения:</b>',
                'parse_mode': 'HTML',
                'reply_markup': keyboard
            },
            timeout=5
        )
    except Exception:
        pass


def send_ticket_status(bot_token, chat_id, database_url, schema):
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    cur.execute(
        f'''SELECT id, message_text, direction, created_at
            FROM {schema}.support_messages
            WHERE user_chat_id = %s
            ORDER BY created_at DESC LIMIT 10''',
        (chat_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        send_msg(bot_token, chat_id, '📭 У вас пока нет обращений.\n\nНапишите /ticket чтобы создать первое.')
        return

    lines = ['📋 <b>Ваши последние обращения:</b>\n']
    for row in rows:
        msg_id, text, direction, created_at = row
        arrow = '➡️ Вы' if direction == 'in' else '⬅️ Оператор'
        short_text = text[:80] + '...' if len(text) > 80 else text
        date_str = created_at.strftime('%d.%m.%y %H:%M') if hasattr(created_at, 'strftime') else str(created_at)[:16]
        lines.append(f'<b>#{msg_id}</b> | {date_str} | {arrow}\n{short_text}\n')

    send_msg(bot_token, chat_id, '\n'.join(lines))


def handle_user_message(bot_token, admin_chat_id, user_chat_id, username, first_name, text, database_url, schema, category='Другое'):
    state = get_user_state(database_url, schema, user_chat_id)
    if state and state.startswith('awaiting_message:'):
        category = state.replace('awaiting_message:', '')
        clear_user_state(database_url, schema, user_chat_id)

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
        f'🎫 <b>Тикет #{msg_id}</b>\n'
        f'👤 От: {display_name}\n'
        f'🆔 ID: <code>{user_chat_id}</code>\n'
        f'📁 Категория: {category}\n'
        f'{"─" * 25}\n'
        f'{text}\n'
        f'{"─" * 25}\n'
        f'↩️ Ответьте реплаем на это сообщение'
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
        f'✅ <b>Тикет #{msg_id} создан</b>\n\n'
        f'Категория: {category}\n'
        f'Оператор ответит в ближайшее время.\n\n'
        f'Проверить статус: /status')


def handle_admin_reply(bot_token, text, reply_to, database_url, schema):
    reply_msg_id = reply_to.get('message_id')
    reply_text = reply_to.get('text', '')
    user_chat_id = None

    for line in reply_text.split('\n'):
        if 'ID: ' in line or line.startswith('🆔'):
            cleaned = line.replace('🆔', '').replace('ID:', '').strip()
            try:
                user_chat_id = int(cleaned)
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

    send_msg(bot_token, user_chat_id,
        f'💬 <b>Ответ поддержки:</b>\n\n{text}')

    admin_chat_id = int(os.environ.get('SUPPORT_ADMIN_CHAT_ID', 0))
    send_msg(bot_token, admin_chat_id, f'✅ Ответ отправлен пользователю {user_chat_id}')


def get_user_state(database_url, schema, chat_id):
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    cur.execute(
        f'SELECT state FROM {schema}.support_user_states WHERE chat_id = %s',
        (chat_id,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else None


def set_user_state(database_url, schema, chat_id, state):
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    cur.execute(
        f'''INSERT INTO {schema}.support_user_states (chat_id, state)
            VALUES (%s, %s)
            ON CONFLICT (chat_id) DO UPDATE SET state = EXCLUDED.state''',
        (chat_id, state)
    )
    conn.commit()
    cur.close()
    conn.close()


def clear_user_state(database_url, schema, chat_id):
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    cur.execute(
        f'DELETE FROM {schema}.support_user_states WHERE chat_id = %s',
        (chat_id,)
    )
    conn.commit()
    cur.close()
    conn.close()


def send_msg(bot_token, chat_id, text):
    try:
        resp = requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'},
            timeout=5
        )
        return resp.json()
    except Exception:
        return None


def edit_message(bot_token, chat_id, message_id, text):
    try:
        requests.post(
            f'https://api.telegram.org/bot{bot_token}/editMessageText',
            json={'chat_id': chat_id, 'message_id': message_id, 'text': text, 'parse_mode': 'HTML'},
            timeout=5
        )
    except Exception:
        pass


def answer_callback(bot_token, callback_id):
    try:
        requests.post(
            f'https://api.telegram.org/bot{bot_token}/answerCallbackQuery',
            json={'callback_query_id': callback_id},
            timeout=5
        )
    except Exception:
        pass


def ok():
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True})
    }
