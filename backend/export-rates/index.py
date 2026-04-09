import json
import os
import csv
import io
import base64
from datetime import datetime
import psycopg2
import requests

ADMIN_USERNAMES = ['@admin', '@cryptocurrency_mixer_bot', '@fafaker123']

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

def handler(event: dict, context) -> dict:
    '''Экспорт актуальных курсов с наценкой в CSV — только для админа'''
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
            'body': json.dumps({'error': 'Access denied'})
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
        f'https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd,rub',
        timeout=10
    )
    data = resp.json()

    rates_usd = {}
    rates_rub = {}
    for symbol, cg_id in COINS.items():
        if cg_id in data:
            if 'usd' in data[cg_id]:
                rates_usd[symbol] = data[cg_id]['usd']
            if 'rub' in data[cg_id]:
                rates_rub[symbol] = data[cg_id]['rub']

    markup_mult = 1 + markup_percent / 100
    now = datetime.utcnow().strftime('%d.%m.%Y %H:%M UTC')

    output = io.StringIO()
    output.write('\ufeff')
    writer = csv.writer(output, delimiter=';')

    writer.writerow([f'Курсы BLQOU на {now}'])
    writer.writerow([f'Наценка: {markup_percent}%'])
    writer.writerow([])
    writer.writerow(['Монета', 'Курс USD (бирж.)', 'Курс USD (с наценкой)', 'Курс RUB (бирж.)', 'Курс RUB (с наценкой)'])

    for symbol in sorted(COINS.keys()):
        usd_raw = rates_usd.get(symbol)
        rub_raw = rates_rub.get(symbol)
        if usd_raw is None:
            continue

        usd_markup = round(usd_raw * markup_mult, 6)
        rub_markup = round(rub_raw * markup_mult, 2) if rub_raw else ''
        rub_raw_str = round(rub_raw, 2) if rub_raw else ''

        writer.writerow([symbol, usd_raw, usd_markup, rub_raw_str, rub_markup])

    csv_content = output.getvalue()
    csv_base64 = base64.b64encode(csv_content.encode('utf-8')).decode('utf-8')

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'csv_base64': csv_base64,
            'filename': f'blqou_rates_{datetime.utcnow().strftime("%Y%m%d_%H%M")}.csv',
            'markup_percent': markup_percent,
            'coins_count': len([s for s in COINS if s in rates_usd]),
            'generated_at': now
        })
    }
