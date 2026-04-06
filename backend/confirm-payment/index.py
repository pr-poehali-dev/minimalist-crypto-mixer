import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''Пользователь подтверждает отправку средств'''
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
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
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
        f"SELECT id, status FROM {schema}.exchanges WHERE short_id = %s",
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

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'status': 'Оплата отправлена'})
    }
