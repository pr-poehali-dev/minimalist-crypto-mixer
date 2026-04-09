import json
import os
import random
import string
from datetime import datetime, timedelta
import psycopg2
import requests

CASH_CURRENCIES = {'USD-CASH', 'RUB-CASH', 'CHF-CASH'}

COINS = {
    'BTC': 'bitcoin', 'ETH': 'ethereum', 'USDT': 'tether', 'USDC': 'usd-coin',
    'BNB': 'binancecoin', 'SOL': 'solana', 'XRP': 'ripple', 'ADA': 'cardano',
    'DOGE': 'dogecoin', 'LTC': 'litecoin', 'TRX': 'tron', 'TON': 'the-open-network',
    'AVAX': 'avalanche-2', 'DOT': 'polkadot', 'MATIC': 'matic-network',
    'LINK': 'chainlink', 'UNI': 'uniswap', 'ATOM': 'cosmos', 'FIL': 'filecoin',
    'APT': 'aptos', 'NEAR': 'near', 'ARB': 'arbitrum', 'OP': 'optimism',
    'SUI': 'sui', 'SHIB': 'shiba-inu', 'PEPE': 'pepe', 'ETC': 'ethereum-classic',
    'BCH': 'bitcoin-cash', 'XLM': 'stellar', 'ALGO': 'algorand', 'VET': 'vechain',
    'FTM': 'fantom', 'AAVE': 'aave', 'GRT': 'the-graph', 'INJ': 'injective-protocol',
    'RENDER': 'render-token', 'FET': 'fetch-ai', 'SAND': 'the-sandbox',
    'MANA': 'decentraland', 'AXS': 'axie-infinity', 'CRV': 'curve-dao-token',
    'DASH': 'dash', 'ZEC': 'zcash', 'CAKE': 'pancakeswap-token',
    'ENS': 'ethereum-name-service', 'WLD': 'worldcoin-wld', 'SEI': 'sei-network',
    'BONK': 'bonk',
}

RATE_KEY_MAP = {
    'USDT-TRC20': 'USDT', 'USDT-ERC20': 'USDT',
    'USDC-ERC20': 'USDC', 'USDC-TRC20': 'USDC',
    'USD-CASH': 'USD', 'RUB-CASH': 'RUB', 'CHF-CASH': 'CHF',
}

FIAT_VS = ['rub', 'chf']

def get_rate_key(currency):
    return RATE_KEY_MAP.get(currency, currency)

def fetch_server_rates():
    ids = ','.join(COINS.values())
    vs = 'usd,' + ','.join(FIAT_VS)
    resp = requests.get(
        f'https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies={vs}',
        timeout=10
    )
    data = resp.json()
    rates = {}
    for symbol, cg_id in COINS.items():
        if cg_id in data and 'usd' in data[cg_id]:
            rates[symbol] = data[cg_id]['usd']
    rates['USD'] = 1.0
    tether_data = data.get('tether', {})
    for fiat in FIAT_VS:
        fu = fiat.upper()
        if fiat in tether_data and tether_data[fiat] > 0:
            rates[fu] = 1.0 / tether_data[fiat]
    if 'RUB' not in rates:
        rates['RUB'] = 1.0 / 87.0
    if 'CHF' not in rates:
        rates['CHF'] = 1.0 / 0.88
    return rates

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

def notify_admin_new_exchange(username, short_id, from_currency, to_currency, from_amount, to_amount, is_cash, city):
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('ADMIN_NOTIFY_CHAT_ID')
    if not bot_token or not chat_id:
        return

    exchange_type = "💵 Наличный обмен" if is_cash else "🔄 Онлайн-обмен"
    city_text = f"\n🏙 Город: {city}" if city else ""

    msg = (
        f"🆕 <b>Новая заявка на обмен</b>\n\n"
        f"📋 ID: <code>{short_id}</code>\n"
        f"👤 Пользователь: @{username.lstrip('@')}\n"
        f"💱 {from_amount} {from_currency} → {to_amount} {to_currency}\n"
        f"📌 Тип: {exchange_type}{city_text}\n"
        f"🕐 {datetime.utcnow().strftime('%d.%m.%Y %H:%M')} UTC"
    )

    try:
        requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={'chat_id': chat_id, 'text': msg, 'parse_mode': 'HTML'},
            timeout=5
        )
    except Exception:
        pass


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
    output_address = body.get('output_address', '')
    is_cash = body.get('is_cash', False)
    city = body.get('city', '')

    is_cash_exchange = from_currency in CASH_CURRENCIES or to_currency in CASH_CURRENCIES
    if is_cash:
        is_cash_exchange = True

    receiving_cash = to_currency in CASH_CURRENCIES

    if not all([from_currency, to_currency, from_amount]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'All fields are required'})
        }

    if not receiving_cash and not output_address:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Output address is required'})
        }

    deposit_address = ''
    if from_currency not in CASH_CURRENCIES:
        deposit_address = DEPOSIT_WALLETS.get(from_currency, '')
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

    markup_percent = 2.0
    cur.execute(f'SELECT markup_percent FROM {schema}.exchange_markup ORDER BY id DESC LIMIT 1')
    row = cur.fetchone()
    if row:
        markup_percent = float(row[0])

    discount_applied = False
    use_discount = body.get('use_discount', False)

    if use_discount:
        cur.execute(
            f'''SELECT id FROM {schema}.referral_links
                WHERE referred_username = %s AND discount_used = FALSE''',
            (username,)
        )
        link_row = cur.fetchone()
        if link_row:
            cur.execute(
                f'UPDATE {schema}.referral_links SET discount_used = TRUE WHERE id = %s',
                (link_row[0],)
            )
            discount_applied = True

    effective_markup = max(0, markup_percent - 1) if discount_applied else markup_percent

    server_rates = fetch_server_rates()
    from_key = get_rate_key(from_currency)
    to_key = get_rate_key(to_currency)

    if from_key not in server_rates or to_key not in server_rates:
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unable to fetch current rates'})
        }

    raw_rate = server_rates[from_key] / server_rates[to_key]
    server_rate = raw_rate * (1 - effective_markup / 100)

    from_amount_num = float(from_amount)
    to_amount = round(from_amount_num * server_rate, 8)
    rate = server_rate

    for _ in range(10):
        short_id = generate_short_id()
        cur.execute(f'SELECT 1 FROM {schema}.exchanges WHERE short_id = %s', (short_id,))
        if not cur.fetchone():
            break

    status = 'Ожидание менеджера' if is_cash_exchange else 'Ожидает оплаты'
    expires_at = None
    if is_cash_exchange:
        expires_at = datetime.utcnow() + timedelta(hours=48)

    cur.execute(
        f'''INSERT INTO {schema}.exchanges
            (user_username, from_currency, to_currency, from_amount, to_amount, rate, deposit_address, output_address, short_id, status, is_cash, expires_at, city)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id''',
        (username, from_currency, to_currency, from_amount, to_amount, rate, deposit_address, output_address, short_id, status, is_cash_exchange, expires_at, city)
    )
    exchange_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    notify_admin_new_exchange(username, short_id, from_currency, to_currency, from_amount, to_amount, is_cash_exchange, city)

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'exchange_id': exchange_id,
            'short_id': short_id,
            'deposit_address': deposit_address,
            'discount_applied': discount_applied,
            'is_cash': is_cash_exchange,
            'server_rate': rate,
            'to_amount': to_amount
        })
    }