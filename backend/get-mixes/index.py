import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''Получение списка миксов пользователя из базы данных'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Username'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    username = event.get('headers', {}).get('X-User-Username') or event.get('headers', {}).get('x-user-username')
    
    if not username:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Username is required'})
        }
    
    conn = None
    try:
        database_url = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = f'''
            SELECT id, user_username, currency, amount, fee, delay, minimum, 
                   preset, input_address, output_address, deposit_address, 
                   status, created_at, updated_at
            FROM {schema}.mixes
            WHERE user_username = %s
            ORDER BY created_at DESC
        '''
        
        cur.execute(query, (username,))
        mixes = cur.fetchall()
        
        result = []
        for mix in mixes:
            result.append({
                'id': mix['id'],
                'user_username': mix['user_username'],
                'currency': mix['currency'],
                'amount': str(mix['amount']),
                'fee': mix['fee'],
                'delay': mix['delay'],
                'minimum': mix['minimum'],
                'preset': mix['preset'],
                'input_address': mix['input_address'],
                'output_address': mix['output_address'],
                'deposit_address': mix['deposit_address'],
                'status': mix['status'],
                'created_at': mix['created_at'].isoformat() if mix['created_at'] else None,
                'updated_at': mix['updated_at'].isoformat() if mix['updated_at'] else None
            })
        
        cur.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'mixes': result})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if conn:
            conn.close()
