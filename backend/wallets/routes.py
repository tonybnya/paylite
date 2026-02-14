"""
Script Name : routes.py
Description : Handle balance checks and initial wallet creation
Author      : @tonybnya
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from users.models import Wallet, User
from utils import make_response

wallets_bp = Blueprint("wallet", __name__, url_prefix="/wallets")


@wallets_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_wallet():
    user_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        return make_response(error="Wallet not found", status=404)
    return make_response(
        data={
            "id": wallet.id,
            "balance": float(wallet.balance),
            "currency": wallet.currency,
        }
    )


@wallets_bp.route("/<string:user_id>", methods=["GET"])
@jwt_required()
def get_wallet_balance(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if current_user.id != user_id and not current_user.is_admin:
        return make_response(error="Unauthorized", status=403)

    wallet = Wallet.query.filter_by(user_id=user_id).first_or_404()
    return make_response(
        data={
            "id": wallet.id,
            "balance": float(wallet.balance),
            "currency": wallet.currency,
        }
    )
