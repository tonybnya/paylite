"""
Script Name : routes.py
Description : Handle balance checks and initial wallet creation
Author      : @tonybnya
"""

from flask import Blueprint
from users.models import Wallet
from utils import make_response

wallets_bp = Blueprint('wallet', __name__, url_prefix='/wallets')


@wallets_bp.route('<string:user_id>', methods=['GET'])
def get_wallet_balance(user_id):
    wallet = Wallet.query.filter_by(user_id=user_id).first_or_404()
    return make_response(data={
        "balance": float(wallet.balance),
        "currency": wallet.currency
    })
