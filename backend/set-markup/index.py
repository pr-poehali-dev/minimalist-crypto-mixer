import json
import os
import psycopg2

ADMIN_USERNAMES = ['@admin', '@cryptocurrency_mixer_bot', '@fafaker123']

def handler(event: dict, context) -> dict:
    '''Установка процента наценки администратором'''
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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

    if event.get('httpMethod') == 'GET':
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        cur.execute(f'SELECT markup_percent, updated_by, updated_at FROM {schema}.exchange_markup ORDER BY id DESC LIMIT 1')
        row = cur.fetchone()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'markup_percent': float(row[0]) if row else 2.0,
                'updated_by': row[1] if row else 'system',
                'updated_at': row[2].isoformat() if row and row[2] else None
            })
        }

    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body', '{}'))
        markup = body.get('markup_percent')
        if markup is None or not isinstance(markup, (int, float)) or markup < 0 or markup > 99:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'markup_percent must be a number between 0 and 99'})
            }

        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        cur.execute(
            f'''INSERT INTO {schema}.exchange_markup (markup_percent, updated_by) VALUES (%s, %s)''',
            (markup, username)
        )
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'markup_percent': markup})
        }

    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }