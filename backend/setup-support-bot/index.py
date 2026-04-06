import json
import os
import requests

def handler(event: dict, context) -> dict:
    '''Установка webhook и команд для бота поддержки'''
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    bot_token = os.environ.get('SUPPORT_BOT_TOKEN')
    if not bot_token:
        return response(500, {'error': 'SUPPORT_BOT_TOKEN not set'})

    params = event.get('queryStringParameters') or {}
    webhook_url = params.get('webhook_url', '')

    results = {}

    if webhook_url:
        r = requests.post(
            f'https://api.telegram.org/bot{bot_token}/setWebhook',
            json={'url': webhook_url},
            timeout=10
        )
        results['setWebhook'] = r.json()

    commands = [
        {'command': 'start', 'description': 'Начать работу с ботом'},
        {'command': 'ticket', 'description': 'Создать тикет с выбором категории'},
        {'command': 'status', 'description': 'Проверить статус обращений'},
        {'command': 'help', 'description': 'Справка по боту'}
    ]

    r2 = requests.post(
        f'https://api.telegram.org/bot{bot_token}/setMyCommands',
        json={'commands': commands},
        timeout=10
    )
    results['setMyCommands'] = r2.json()

    r3 = requests.post(
        f'https://api.telegram.org/bot{bot_token}/setMyDescription',
        json={'description': 'Бот поддержки обменника. Напишите ваш вопрос — оператор ответит в кратчайшие сроки.'},
        timeout=10
    )
    results['setDescription'] = r3.json()

    r4 = requests.post(
        f'https://api.telegram.org/bot{bot_token}/setMyShortDescription',
        json={'short_description': 'Поддержка обменника 24/7'},
        timeout=10
    )
    results['setShortDescription'] = r4.json()

    return response(200, results)


def response(status, body):
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body, ensure_ascii=False)
    }
