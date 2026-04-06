import json
import os
import random
import string
import psycopg2

DEPOSIT_WALLETS = {
    'BTC': 'bc1qnuu9k4eucxgyz67a7g20rm5e0v8k9t86er6vn9',
    'ETH': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'USDT-TRC20': 'TYGv5ES688MeWB1fsVYBrx8QF8FpbRZaGE',
    'USDT-ERC20': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'USDC-ERC20': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'USDC-TRC20': 'TYGv5ES688MeWB1fsVYBrx8QF8FpbRZaGE',
    'TRX': 'TYGv5ES688MeWB1fsVYBrx8QF8FpbRZaGE',
    'LTC': 'ltc1qdq0zhvnux59m63tx9k8fx7spnjt388yx6hpuw3',
    'TON': 'UQDdwW5NBvcxlny8J9Uo9-x-ZFM9kBxpheYu_m2KVQGLhNJb',
    'SOL': 'HRh36ePux3hAixkHo4RG4cFPQKrtRuERScvU9H7ZLaQp',
    'BNB': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'XRP': 'rN1vZfuySeWMUVJKxEBW5jApWXNvC9ZdBT',
    'BCH': 'qzra9nf5amxh6e0fy2ch680uw8zs7tpmggw3pf2kzj',
    'LINK': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'UNI': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'SHIB': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'PEPE': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'AAVE': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'GRT': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'INJ': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'RENDER': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'FET': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'SAND': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'MANA': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'AXS': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'CRV': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'ENS': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'ETC': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'MATIC': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'ARB': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'OP': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'WLD': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'CAKE': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'BONK': 'HRh36ePux3hAixkHo4RG4cFPQKrtRuERScvU9H7ZLaQp',
    'ADA': 'addr1q89pah7fjryrqmjw4hkrup9ef6c0pkwhzz8rh07p0hd6jeejjyey86x5yn2yuerlpewy2p3vu8wytxg2tzq9ask8fcls7umvh8',
    'DOGE': 'DGAf9Ey2z7t2W57oLDEdqRrG9tsmvNxQNr',
    'AVAX': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'DOT': '13pF3A3kJYM5RheYnU1KjnREUsRUjiamue8J322w5bkY2YCK',
    'ATOM': 'cosmos1tl89g02kdqqwkm9zauetzqah0z46tzhuw3jf6d',
    'FIL': 'f1gkigdikvu26dkwvwcjtj765jhq5rrosxku5a6hy',
    'APT': '0x2b73b7e5df30c0b328727ef2f0e49faab71c88319a7d9b3dd5274f39e35ba118',
    'NEAR': '82af0ef5b53b9d53ec785a6f8dda82861b479ad5bc9f21187831e60d5e0786ce',
    'SUI': '0x929506cbcc55980de69ea0cde6acfcbb46eceb0e488515d3d8c4019afaf45f94',
    'XLM': 'GDHVOX3XAMCUUC5EDIFSKOJLYF4YDKX6KHVOYEAVM26XKYWAA5AFQIZY',
    'ALGO': 'F42FICSWKWVM5FXS5N55SCMX2AP65JAQNSUHPXRBABFPEILEZO53TFXIV4',
    'VET': '0xa64aD74cB1CBEC1537D4926FF6a6119b463DA91d',
    'FTM': '0xcF53BC73cc1b39056d2013723F1eE6340F40eef7',
    'DASH': 'XfBTpvujmdqnhjDjJoXi6BtHYLNrB5HL7e',
    'ZEC': 't1Mj3iTZycg8cwkLMotfVgFbzdgCJTnuXUS',
    'SEI': 'sei1tl89g02kdqqwkm9zauetzqah0z46tzhurarluv',
}

def generate_short_id():
    letters = random.choices(string.ascii_uppercase, k=2)
    digits = random.choices(string.digits, k=2)
    return ''.join(letters) + ''.join(digits)

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
            'body': json.dumps({'error': 'All fields are required'})
        }

    deposit_address = DEPOSIT_WALLETS.get(from_currency)
    if not deposit_address:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Currency {from_currency} is not supported for deposits'})
        }

    database_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    for _ in range(10):
        short_id = generate_short_id()
        cur.execute(f'SELECT 1 FROM {schema}.exchanges WHERE short_id = %s', (short_id,))
        if not cur.fetchone():
            break

    cur.execute(
        f'''INSERT INTO {schema}.exchanges
            (user_username, from_currency, to_currency, from_amount, to_amount, rate, deposit_address, output_address, short_id, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id''',
        (username, from_currency, to_currency, from_amount, to_amount, rate, deposit_address, output_address, short_id, 'Ожидает оплаты')
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
            'short_id': short_id,
            'deposit_address': deposit_address
        })
    }