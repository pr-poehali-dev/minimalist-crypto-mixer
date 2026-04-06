import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''Получение заказа по short_id'''
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    params = event.get('queryStringParameters') or {}
    short_id = params.get('id', '')

    if not short_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'id parameter is required'})
        }

    database_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(
        f'''SELECT id, short_id, from_currency, to_currency, from_amount, to_amount,
                   rate, deposit_address, output_address, status, created_at, updated_at
            FROM {schema}.exchanges
            WHERE short_id = %s''',
        (short_id.upper(),)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Order not found'})
        }

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'order': {
                'id': row['id'],
                'short_id': row['short_id'],
                'from_currency': row['from_currency'],
                'to_currency': row['to_currency'],
                'from_amount': str(row['from_amount']),
                'to_amount': str(row['to_amount']),
                'rate': str(row['rate']),
                'deposit_address': row['deposit_address'],
                'output_address': row['output_address'],
                'status': row['status'],
                'created_at': row['created_at'].isoformat() if row['created_at'] else None,
                'updated_at': row['updated_at'].isoformat() if row['updated_at'] else None,
            }
        })
    }
