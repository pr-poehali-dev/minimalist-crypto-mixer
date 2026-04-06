import json
import os
import psycopg2

ADMIN_USERNAMES = ['@admin', '@cryptocurrency_mixer_bot', '@fafaker123']

def process_referral_earning(exchange_id, schema, conn):
    """Начислить реферальный бонус при завершении обмена"""
    cur = conn.cursor()
    cur.execute(f'SELECT 1 FROM {schema}.referral_earnings WHERE exchange_id = %s', (exchange_id,))
    if cur.fetchone():
        cur.close()
        return
    cur.execute(
        f'SELECT user_username, from_amount, from_currency FROM {schema}.exchanges WHERE id = %s AND status = %s',
        (exchange_id, 'Завершено')
    )
    ex = cur.fetchone()
    if not ex:
        cur.close()
        return
    user, amount, currency = ex
    cur.execute(
        f'SELECT referrer_username FROM {schema}.referral_links WHERE referred_username = %s',
        (user,)
    )
    link = cur.fetchone()
    if not link:
        cur.close()
        return
    referrer = link[0]
    earning = float(amount) * 0.01
    cur.execute(
        f'''INSERT INTO {schema}.referral_earnings (referrer_username, referred_username, exchange_id, amount_usd, currency, status)
            VALUES (%s, %s, %s, %s, %s, %s)''',
        (referrer, user, exchange_id, earning, currency, 'начислено')
    )
    conn.commit()
    cur.close()

ALLOWED_STATUSES = [
    'Ожидает оплаты',
    'Оплата отправлена',
    'Оплата получена',
    'В обработке',
    'Отправлено',
    'Завершено',
    'Отменено',
    'Не оплачена'
]

def handler(event: dict, context) -> dict:
    '''Обновление статуса обмена (только для администраторов)'''
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
    if not username or username.lower() not in ADMIN_USERNAMES:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Access denied. Admin only.'})
        }

    body = json.loads(event.get('body', '{}'))
    exchange_id = body.get('exchange_id')
    new_status = body.get('status')
    tx_hash = body.get('tx_hash', '')

    if not exchange_id or not new_status:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'exchange_id and status are required'})
        }

    if new_status not in ALLOWED_STATUSES:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Invalid status. Allowed: {", ".join(ALLOWED_STATUSES)}'})
        }

    database_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    if tx_hash and new_status == 'Отправлено':
        cur.execute(
            f'''UPDATE {schema}.exchanges SET status = %s, tx_hash = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING id''',
            (new_status, tx_hash, exchange_id)
        )
    else:
        cur.execute(
            f'''UPDATE {schema}.exchanges SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING id''',
            (new_status, exchange_id)
        )
    result = cur.fetchone()

    if not result:
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Exchange not found'})
        }

    conn.commit()

    if new_status == 'Завершено':
        process_referral_earning(exchange_id, schema, conn)

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Status updated'})
    }