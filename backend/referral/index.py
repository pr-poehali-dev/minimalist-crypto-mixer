import json
import os
import string
import random
import psycopg2
from psycopg2.extras import RealDictCursor
from decimal import Decimal

ADMIN_USERNAMES = ['@admin', '@cryptocurrency_mixer_bot', '@fafaker123']


def handler(event: dict, context) -> dict:
    '''Реферальная система: управление кодами, начислениями и выводами'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Username'
            },
            'body': ''
        }

    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')

        if action == 'get_referral_code':
            return get_referral_code(event, body)
        elif action == 'apply_referral_code':
            return apply_referral_code(event, body)
        elif action == 'get_referral_stats':
            return get_referral_stats(event, body)
        elif action == 'request_withdrawal':
            return request_withdrawal(event, body)
        elif action == 'process_earning':
            return process_earning(event, body)
        elif action == 'admin_get_referrals':
            return admin_get_referrals(event, body)
        elif action == 'admin_process_withdrawal':
            return admin_process_withdrawal(event, body)
        else:
            return error_response('Invalid action', 400)

    return error_response('Method not allowed', 405)


def get_username(event: dict) -> str | None:
    '''Извлекает имя пользователя из заголовков запроса'''
    headers = event.get('headers', {})
    return headers.get('X-User-Username') or headers.get('x-user-username')


def is_admin(username: str) -> bool:
    '''Проверяет, является ли пользователь администратором'''
    return username and username.lower() in ADMIN_USERNAMES


def generate_code(length: int = 6) -> str:
    '''Генерирует случайный алфавитно-цифровой код'''
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))


def get_db_connection():
    '''Создаёт подключение к базе данных'''
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def get_schema() -> str:
    '''Возвращает схему базы данных'''
    return os.environ.get('MAIN_DB_SCHEMA', 'public')


def success_response(data: dict) -> dict:
    '''Формирует успешный HTTP-ответ'''
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(data, default=str)
    }


def error_response(message: str, status_code: int) -> dict:
    '''Формирует HTTP-ответ с ошибкой'''
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message})
    }


def get_referral_code(event: dict, body: dict) -> dict:
    '''Получает или создаёт реферальный код для пользователя. Возвращает код и статистику.'''
    username = get_username(event)
    if not username:
        return error_response('Authorization required', 401)

    schema = get_schema()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Получаем или создаём реферальный код
        cur.execute(
            f'SELECT code FROM {schema}.referral_codes WHERE username = %s',
            (username,)
        )
        row = cur.fetchone()

        if row:
            code = row['code']
        else:
            # Генерируем уникальный код
            for _ in range(10):
                code = generate_code()
                cur.execute(
                    f'SELECT id FROM {schema}.referral_codes WHERE code = %s',
                    (code,)
                )
                if not cur.fetchone():
                    break
            else:
                return error_response('Не удалось сгенерировать уникальный код', 500)

            cur.execute(
                f'INSERT INTO {schema}.referral_codes (username, code) VALUES (%s, %s)',
                (username, code)
            )
            conn.commit()

        # Считаем статистику
        cur.execute(
            f'SELECT COUNT(*) as total FROM {schema}.referral_links WHERE referrer_username = %s',
            (username,)
        )
        total_referrals = cur.fetchone()['total']

        cur.execute(
            f'''SELECT COALESCE(SUM(amount_usd), 0) as total
                FROM {schema}.referral_earnings
                WHERE referrer_username = %s''',
            (username,)
        )
        total_earned = cur.fetchone()['total']

        # Баланс = начисления со статусом "начислено" минус выводы со статусом "Ожидает" или "Выполнено"
        cur.execute(
            f'''SELECT COALESCE(SUM(amount_usd), 0) as total
                FROM {schema}.referral_earnings
                WHERE referrer_username = %s AND status = %s''',
            (username, 'начислено')
        )
        earned_balance = cur.fetchone()['total']

        cur.execute(
            f'''SELECT COALESCE(SUM(amount_usd), 0) as total
                FROM {schema}.referral_withdrawals
                WHERE username = %s AND status IN (%s, %s)''',
            (username, 'Ожидает', 'Выполнено')
        )
        withdrawn = cur.fetchone()['total']

        balance = float(Decimal(str(earned_balance)) - Decimal(str(withdrawn)))

        return success_response({
            'success': True,
            'code': code,
            'total_referrals': total_referrals,
            'total_earned': float(total_earned),
            'balance': balance
        })
    except Exception as e:
        conn.rollback()
        return error_response(f'Database error: {str(e)}', 500)
    finally:
        cur.close()
        conn.close()


def apply_referral_code(event: dict, body: dict) -> dict:
    '''Применяет реферальный код. Проверяет: код существует, нельзя использовать свой, нельзя быть приглашённым дважды.'''
    username = get_username(event)
    if not username:
        return error_response('Authorization required', 401)

    code = body.get('code', '').strip().upper()
    if not code:
        return error_response('Реферальный код обязателен', 400)

    schema = get_schema()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Проверяем, существует ли код
        cur.execute(
            f'SELECT username FROM {schema}.referral_codes WHERE code = %s',
            (code,)
        )
        referrer = cur.fetchone()

        if not referrer:
            return error_response('Реферальный код не найден', 404)

        referrer_username = referrer['username']

        # Нельзя использовать свой собственный код
        if referrer_username.lower() == username.lower():
            return error_response('Нельзя использовать собственный реферальный код', 400)

        # Проверяем, не был ли пользователь уже приглашён
        cur.execute(
            f'SELECT id FROM {schema}.referral_links WHERE referred_username = %s',
            (username,)
        )
        if cur.fetchone():
            return error_response('Вы уже использовали реферальный код', 400)

        # Создаём реферальную связь
        cur.execute(
            f'''INSERT INTO {schema}.referral_links (referrer_username, referred_username)
                VALUES (%s, %s)''',
            (referrer_username, username)
        )
        conn.commit()

        return success_response({
            'success': True,
            'message': 'Реферальный код успешно применён'
        })
    except Exception as e:
        conn.rollback()
        return error_response(f'Database error: {str(e)}', 500)
    finally:
        cur.close()
        conn.close()


def get_referral_stats(event: dict, body: dict) -> dict:
    '''Получает подробную статистику: список рефералов, начисления, баланс, выводы.'''
    username = get_username(event)
    if not username:
        return error_response('Authorization required', 401)

    schema = get_schema()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Список рефералов
        cur.execute(
            f'''SELECT referred_username, created_at
                FROM {schema}.referral_links
                WHERE referrer_username = %s
                ORDER BY created_at DESC''',
            (username,)
        )
        referrals = []
        for r in cur.fetchall():
            referrals.append({
                'username': r['referred_username'],
                'joined_at': r['created_at'].isoformat() if r['created_at'] else None
            })

        # Список начислений
        cur.execute(
            f'''SELECT id, referred_username, exchange_id, amount_usd, currency, status, created_at
                FROM {schema}.referral_earnings
                WHERE referrer_username = %s
                ORDER BY created_at DESC''',
            (username,)
        )
        earnings = []
        for r in cur.fetchall():
            earnings.append({
                'id': r['id'],
                'referred_username': r['referred_username'],
                'exchange_id': r['exchange_id'],
                'amount_usd': float(r['amount_usd']) if r['amount_usd'] else 0,
                'currency': r['currency'],
                'status': r['status'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None
            })

        # Баланс
        cur.execute(
            f'''SELECT COALESCE(SUM(amount_usd), 0) as total
                FROM {schema}.referral_earnings
                WHERE referrer_username = %s AND status = %s''',
            (username, 'начислено')
        )
        earned_balance = cur.fetchone()['total']

        cur.execute(
            f'''SELECT COALESCE(SUM(amount_usd), 0) as total
                FROM {schema}.referral_withdrawals
                WHERE username = %s AND status IN (%s, %s)''',
            (username, 'Ожидает', 'Выполнено')
        )
        withdrawn = cur.fetchone()['total']

        balance = float(Decimal(str(earned_balance)) - Decimal(str(withdrawn)))

        # Список выводов
        cur.execute(
            f'''SELECT id, amount_usd, wallet_address, currency, status, created_at, processed_at
                FROM {schema}.referral_withdrawals
                WHERE username = %s
                ORDER BY created_at DESC''',
            (username,)
        )
        withdrawals = []
        for r in cur.fetchall():
            withdrawals.append({
                'id': r['id'],
                'amount_usd': float(r['amount_usd']) if r['amount_usd'] else 0,
                'wallet_address': r['wallet_address'],
                'currency': r['currency'],
                'status': r['status'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                'processed_at': r['processed_at'].isoformat() if r['processed_at'] else None
            })

        return success_response({
            'success': True,
            'referrals': referrals,
            'earnings': earnings,
            'balance': balance,
            'withdrawals': withdrawals
        })
    except Exception as e:
        return error_response(f'Database error: {str(e)}', 500)
    finally:
        cur.close()
        conn.close()


def request_withdrawal(event: dict, body: dict) -> dict:
    '''Запрос на вывод средств. Минимальная сумма $5. Проверяет достаточность баланса.'''
    username = get_username(event)
    if not username:
        return error_response('Authorization required', 401)

    wallet_address = body.get('wallet_address', '').strip()
    currency = body.get('currency', '').strip()
    amount = body.get('amount')

    if not wallet_address:
        return error_response('Адрес кошелька обязателен', 400)

    if not currency:
        return error_response('Валюта обязательна', 400)

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return error_response('Некорректная сумма', 400)

    if amount < 5:
        return error_response('Минимальная сумма вывода $5', 400)

    schema = get_schema()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Считаем баланс
        cur.execute(
            f'''SELECT COALESCE(SUM(amount_usd), 0) as total
                FROM {schema}.referral_earnings
                WHERE referrer_username = %s AND status = %s''',
            (username, 'начислено')
        )
        earned_balance = cur.fetchone()['total']

        cur.execute(
            f'''SELECT COALESCE(SUM(amount_usd), 0) as total
                FROM {schema}.referral_withdrawals
                WHERE username = %s AND status IN (%s, %s)''',
            (username, 'Ожидает', 'Выполнено')
        )
        withdrawn = cur.fetchone()['total']

        balance = float(Decimal(str(earned_balance)) - Decimal(str(withdrawn)))

        if balance < amount:
            return error_response(f'Недостаточно средств. Доступно: ${balance:.2f}', 400)

        cur.execute(
            f'''INSERT INTO {schema}.referral_withdrawals (username, amount_usd, wallet_address, currency, status)
                VALUES (%s, %s, %s, %s, %s)''',
            (username, amount, wallet_address, currency, 'Ожидает')
        )
        conn.commit()

        return success_response({
            'success': True,
            'message': 'Заявка на вывод создана',
            'new_balance': balance - amount
        })
    except Exception as e:
        conn.rollback()
        return error_response(f'Database error: {str(e)}', 500)
    finally:
        cur.close()
        conn.close()


def process_earning(event: dict, body: dict) -> dict:
    '''Начисление за завершённый обмен. Вызывается при смене статуса обмена на "Завершено".
    Рассчитывает 1% от from_amount в валюте отправления. Проверяет дубликаты по exchange_id.'''
    exchange_id = body.get('exchange_id')
    if not exchange_id:
        return error_response('exchange_id обязателен', 400)

    schema = get_schema()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Проверяем, не было ли уже начисления за этот обмен
        cur.execute(
            f'SELECT id FROM {schema}.referral_earnings WHERE exchange_id = %s',
            (exchange_id,)
        )
        if cur.fetchone():
            return success_response({
                'success': True,
                'message': 'Начисление уже существует для этого обмена',
                'duplicate': True
            })

        # Получаем данные обмена
        cur.execute(
            f'''SELECT id, user_username, from_currency, from_amount, rate, status
                FROM {schema}.exchanges
                WHERE id = %s''',
            (exchange_id,)
        )
        exchange = cur.fetchone()

        if not exchange:
            return error_response('Обмен не найден', 404)

        if exchange['status'] != 'Завершено':
            return error_response('Обмен ещё не завершён', 400)

        user_username = exchange['user_username']

        # Проверяем, есть ли реферер у пользователя
        cur.execute(
            f'SELECT referrer_username FROM {schema}.referral_links WHERE referred_username = %s',
            (user_username,)
        )
        link = cur.fetchone()

        if not link:
            return success_response({
                'success': True,
                'message': 'У пользователя нет реферера',
                'earning_created': False
            })

        referrer_username = link['referrer_username']

        # Рассчитываем 1% от from_amount
        from_amount = Decimal(str(exchange['from_amount']))
        earning_amount = from_amount * Decimal('0.01')
        currency = exchange['from_currency']

        # Создаём начисление
        cur.execute(
            f'''INSERT INTO {schema}.referral_earnings
                (referrer_username, referred_username, exchange_id, amount_usd, currency, status)
                VALUES (%s, %s, %s, %s, %s, %s)''',
            (referrer_username, user_username, exchange_id, float(earning_amount), currency, 'начислено')
        )
        conn.commit()

        return success_response({
            'success': True,
            'message': 'Реферальное начисление создано',
            'earning_created': True,
            'referrer': referrer_username,
            'amount': float(earning_amount),
            'currency': currency
        })
    except Exception as e:
        conn.rollback()
        return error_response(f'Database error: {str(e)}', 500)
    finally:
        cur.close()
        conn.close()


def admin_get_referrals(event: dict, body: dict) -> dict:
    '''Админ: получение всех реферальных данных — коды, связи, начисления, ожидающие выводы.'''
    username = get_username(event)
    if not is_admin(username):
        return error_response('Access denied. Admin only.', 403)

    schema = get_schema()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Все реферальные коды
        cur.execute(
            f'SELECT id, username, code, created_at FROM {schema}.referral_codes ORDER BY created_at DESC'
        )
        codes = []
        for r in cur.fetchall():
            codes.append({
                'id': r['id'],
                'username': r['username'],
                'code': r['code'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None
            })

        # Все реферальные связи
        cur.execute(
            f'''SELECT id, referrer_username, referred_username, created_at
                FROM {schema}.referral_links ORDER BY created_at DESC'''
        )
        links = []
        for r in cur.fetchall():
            links.append({
                'id': r['id'],
                'referrer_username': r['referrer_username'],
                'referred_username': r['referred_username'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None
            })

        # Все начисления
        cur.execute(
            f'''SELECT id, referrer_username, referred_username, exchange_id, amount_usd, currency, status, created_at
                FROM {schema}.referral_earnings ORDER BY created_at DESC'''
        )
        earnings = []
        for r in cur.fetchall():
            earnings.append({
                'id': r['id'],
                'referrer_username': r['referrer_username'],
                'referred_username': r['referred_username'],
                'exchange_id': r['exchange_id'],
                'amount_usd': float(r['amount_usd']) if r['amount_usd'] else 0,
                'currency': r['currency'],
                'status': r['status'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None
            })

        # Ожидающие выводы
        cur.execute(
            f'''SELECT id, username, amount_usd, wallet_address, currency, status, created_at, processed_at
                FROM {schema}.referral_withdrawals ORDER BY created_at DESC'''
        )
        withdrawals = []
        for r in cur.fetchall():
            withdrawals.append({
                'id': r['id'],
                'username': r['username'],
                'amount_usd': float(r['amount_usd']) if r['amount_usd'] else 0,
                'wallet_address': r['wallet_address'],
                'currency': r['currency'],
                'status': r['status'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                'processed_at': r['processed_at'].isoformat() if r['processed_at'] else None
            })

        return success_response({
            'success': True,
            'codes': codes,
            'links': links,
            'earnings': earnings,
            'withdrawals': withdrawals
        })
    except Exception as e:
        return error_response(f'Database error: {str(e)}', 500)
    finally:
        cur.close()
        conn.close()


def admin_process_withdrawal(event: dict, body: dict) -> dict:
    '''Админ: одобрение или отклонение заявки на вывод по ID.'''
    username = get_username(event)
    if not is_admin(username):
        return error_response('Access denied. Admin only.', 403)

    withdrawal_id = body.get('withdrawal_id')
    action = body.get('status')  # "Выполнено" или "Отклонено"

    if not withdrawal_id:
        return error_response('withdrawal_id обязателен', 400)

    if action not in ('Выполнено', 'Отклонено'):
        return error_response('Статус должен быть "Выполнено" или "Отклонено"', 400)

    schema = get_schema()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute(
            f'SELECT id, status FROM {schema}.referral_withdrawals WHERE id = %s',
            (withdrawal_id,)
        )
        withdrawal = cur.fetchone()

        if not withdrawal:
            return error_response('Заявка на вывод не найдена', 404)

        if withdrawal['status'] != 'Ожидает':
            return error_response(f'Заявка уже обработана (статус: {withdrawal["status"]})', 400)

        cur.execute(
            f'''UPDATE {schema}.referral_withdrawals
                SET status = %s, processed_at = NOW()
                WHERE id = %s''',
            (action, withdrawal_id)
        )
        conn.commit()

        return success_response({
            'success': True,
            'message': f'Заявка на вывод обновлена: {action}',
            'withdrawal_id': withdrawal_id,
            'new_status': action
        })
    except Exception as e:
        conn.rollback()
        return error_response(f'Database error: {str(e)}', 500)
    finally:
        cur.close()
        conn.close()
