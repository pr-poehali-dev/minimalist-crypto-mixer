import json
import os
import psycopg2
import requests

COINS = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'LTC': 'litecoin',
    'TRX': 'tron',
    'TON': 'the-open-network',
    'AVAX': 'avalanche-2',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'ATOM': 'cosmos',
    'FIL': 'filecoin',
    'APT': 'aptos',
    'NEAR': 'near',
    'ARB': 'arbitrum',
    'OP': 'optimism',
    'SUI': 'sui',
    'SHIB': 'shiba-inu',
    'PEPE': 'pepe',
    'ETC': 'ethereum-classic',
    'BCH': 'bitcoin-cash',
    'XLM': 'stellar',
    'ALGO': 'algorand',
    'VET': 'vechain',
    'FTM': 'fantom',
    'AAVE': 'aave',
    'GRT': 'the-graph',
    'INJ': 'injective-protocol',
    'RENDER': 'render-token',
    'FET': 'fetch-ai',
    'SAND': 'the-sandbox',
    'MANA': 'decentraland',
    'AXS': 'axie-infinity',
    'CRV': 'curve-dao-token',
    'DASH': 'dash',
    'ZEC': 'zcash',
    'CAKE': 'pancakeswap-token',
    'ENS': 'ethereum-name-service',
    'WLD': 'worldcoin-wld',
    'SEI': 'sei-network',
    'BONK': 'bonk',
}

def handler(event: dict, context) -> dict:
    '''Получение курсов криптовалют с CoinGecko + наценка администратора'''
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

    database_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    markup_percent = 2.0
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    cur.execute(f'SELECT markup_percent FROM {schema}.exchange_markup ORDER BY id DESC LIMIT 1')
    row = cur.fetchone()
    if row:
        markup_percent = float(row[0])
    cur.close()
    conn.close()

    ids = ','.join(COINS.values())
    resp = requests.get(
        f'https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd',
        timeout=10
    )
    data = resp.json()

    rates = {}
    for symbol, cg_id in COINS.items():
        if cg_id in data and 'usd' in data[cg_id]:
            rates[symbol] = data[cg_id]['usd']

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        },
        'body': json.dumps({
            'rates': rates,
            'markup_percent': markup_percent,
            'coins': list(COINS.keys())
        })
    }