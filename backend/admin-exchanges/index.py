import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

ADMIN_USERNAMES = ['@admin', '@cryptocurrency_mixer_bot', '@fafaker123']

def handler(event: dict, context) -> dict:
    '''Получение всех заявок на обмен для администратора'''
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Username'
            },
            'body': ''
        }

    username = event.get('headers', {}).get('X-User-Username') or event.get('headers', {}).get('x-user-username')
    if not username or username.lower() not in ADMIN_USERNAMES:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Access denied. Admin only.'})
        }

    database_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(
        f'''SELECT id, user_username, from_currency, to_currency, from_amount, to_amount,
                   rate, deposit_address, output_address, status, created_at, updated_at
            FROM {schema}.exchanges
            ORDER BY created_at DESC'''
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for r in rows:
        result.append({
            'id': r['id'],
            'user_username': r['user_username'],
            'from_currency': r['from_currency'],
            'to_currency': r['to_currency'],
            'from_amount': str(r['from_amount']),
            'to_amount': str(r['to_amount']),
            'rate': str(r['rate']),
            'deposit_address': r['deposit_address'],
            'output_address': r['output_address'],
            'status': r['status'],
            'created_at': r['created_at'].isoformat() if r['created_at'] else None,
            'updated_at': r['updated_at'].isoformat() if r['updated_at'] else None,
        })

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'exchanges': result})
    }