import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''Создание нового микса и сохранение в базе данных'''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Username'
            },
            'body': ''
        }
    
    if method != 'POST':
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
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        currency = body.get('currency')
        amount = body.get('amount')
        fee = body.get('fee')
        delay = body.get('delay')
        minimum = body.get('minimum')
        preset = body.get('preset')
        input_address = body.get('input_address')
        output_address = body.get('output_address')
        
        if not all([currency, amount, fee, delay, minimum, preset, input_address, output_address]):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'All fields are required'})
            }
        
        # Generate deposit address
        import random
        deposit_address = f"{currency}Mix{random.randint(100000, 999999)}{username[1:4]}"
        
        database_url = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        query = f'''
            INSERT INTO {schema}.mixes 
            (user_username, currency, amount, fee, delay, minimum, preset, 
             input_address, output_address, deposit_address, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        '''
        
        cur.execute(query, (
            username, currency, amount, fee, delay, minimum, preset,
            input_address, output_address, deposit_address, 'В процессе'
        ))
        
        mix_id = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'mix_id': mix_id,
                'deposit_address': deposit_address
            })
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON'})
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
