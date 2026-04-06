import json
import os
import random
import psycopg2

def handler(event: dict, context) -> dict:
    '''Создание заявки на обмен криптовалюты'''
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
            'body': json.dumps({'error': 'Username is required'})
        }

    body = json.loads(event.get('body', '{}'))
    from_currency = body.get('from_currency')
    to_currency = body.get('to_currency')
    from_amount = body.get('from_amount')
    to_amount = body.get('to_amount')
    rate = body.get('rate')
    output_address = body.get('output_address')

    if not all([from_currency, to_currency, from_amount, to_amount, rate, output_address]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'All fields are required: from_currency, to_currency, from_amount, to_amount, rate, output_address'})
        }

    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'
    deposit_address = from_currency + '_' + ''.join(random.choice(chars) for _ in range(32))

    database_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    cur.execute(
        f'''INSERT INTO {schema}.exchanges
            (user_username, from_currency, to_currency, from_amount, to_amount, rate, deposit_address, output_address, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id''',
        (username, from_currency, to_currency, from_amount, to_amount, rate, deposit_address, output_address, 'Ожидает оплаты')
    )
    exchange_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'exchange_id': exchange_id,
            'deposit_address': deposit_address
        })
    }
