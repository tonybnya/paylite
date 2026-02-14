"""
Script Name : routes.py
Description : Handle transactions creation and record
Author      : @tonybnya
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from users.models import Wallet, Transaction, User
from utils import make_response
from core import db
from decimal import Decimal

tx_bp = Blueprint("transaction", __name__, url_prefix="/transactions")

VALID_TRANSACTION_TYPES = ["DEPOSIT", "WITHDRAWAL", "TRANSFER_IN", "TRANSFER_OUT"]


@tx_bp.route("/deposit", methods=["POST"])
@jwt_required()
def deposit():
    """Deposit money into a wallet."""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    data = request.get_json()

    if not data or "amount" not in data:
        return make_response(error="Missing required fields", status=400)

    try:
        amount = Decimal(str(data["amount"]))
        if amount <= 0:
            return make_response(error="Amount must be positive", status=400)
    except (ValueError, TypeError):
        return make_response(error="Invalid amount", status=400)

    if not current_user.is_admin and "user_id" in data:
        return make_response(error="Cannot deposit to other users", status=403)

    target_user_id = data.get("user_id", current_user_id)
    wallet = Wallet.query.filter_by(user_id=target_user_id).first_or_404()

    try:
        wallet.balance += amount

        new_tx = Transaction(
            wallet_id=wallet.id, amount=amount, transaction_type="DEPOSIT"
        )

        db.session.add(new_tx)
        db.session.commit()

        return make_response(
            data={
                "transaction_id": new_tx.id,
                "new_balance": float(wallet.balance),
                "amount_deposited": float(amount),
            },
            status=201,
        )
    except Exception as e:
        db.session.rollback()
        return make_response(error=str(e), status=400)


@tx_bp.route("/withdraw", methods=["POST"])
@jwt_required()
def withdraw():
    """Withdraw money from a wallet."""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    data = request.get_json()

    if not data or "amount" not in data:
        return make_response(error="Missing required fields", status=400)

    try:
        amount = Decimal(str(data["amount"]))
        if amount <= 0:
            return make_response(error="Amount must be positive", status=400)
    except (ValueError, TypeError):
        return make_response(error="Invalid amount", status=400)

    if not current_user.is_admin and "user_id" in data:
        return make_response(error="Cannot withdraw from other users", status=403)

    target_user_id = data.get("user_id", current_user_id)
    wallet = Wallet.query.filter_by(user_id=target_user_id).first_or_404()

    if wallet.balance < amount:
        return make_response(error="Insufficient balance", status=400)

    try:
        wallet.balance -= amount

        new_tx = Transaction(
            wallet_id=wallet.id, amount=amount, transaction_type="WITHDRAWAL"
        )

        db.session.add(new_tx)
        db.session.commit()

        return make_response(
            data={
                "transaction_id": new_tx.id,
                "new_balance": float(wallet.balance),
                "amount_withdrawn": float(amount),
            },
            status=201,
        )
    except Exception as e:
        db.session.rollback()
        return make_response(error=str(e), status=400)


@tx_bp.route("/transfer", methods=["POST"])
@jwt_required()
def transfer():
    """Transfer money between wallets."""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ["to_user_id", "amount"]
    if not data or not all(field in data for field in required_fields):
        return make_response(error="Missing required fields", status=400)

    if data["to_user_id"] == current_user_id:
        return make_response(error="Cannot transfer to same wallet", status=400)

    try:
        amount = Decimal(str(data["amount"]))
        if amount <= 0:
            return make_response(error="Amount must be positive", status=400)
    except (ValueError, TypeError):
        return make_response(error="Invalid amount", status=400)

    from_wallet = Wallet.query.filter_by(user_id=current_user_id).first_or_404()
    to_wallet = Wallet.query.filter_by(user_id=data["to_user_id"]).first_or_404()

    if from_wallet.balance < amount:
        return make_response(error="Insufficient balance", status=400)

    try:
        from_wallet.balance -= amount
        to_wallet.balance += amount

        transfer_out = Transaction(
            wallet_id=from_wallet.id, amount=amount, transaction_type="TRANSFER_OUT"
        )
        transfer_in = Transaction(
            wallet_id=to_wallet.id, amount=amount, transaction_type="TRANSFER_IN"
        )

        db.session.add(transfer_out)
        db.session.add(transfer_in)
        db.session.commit()

        return make_response(
            data={
                "transfer_out_id": transfer_out.id,
                "transfer_in_id": transfer_in.id,
                "amount_transferred": float(amount),
                "from_wallet_balance": float(from_wallet.balance),
                "to_wallet_balance": float(to_wallet.balance),
            }
        )
    except Exception as e:
        db.session.rollback()
        return make_response(error=str(e), status=400)


@tx_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_transactions():
    """Get all transactions globally (admin only)."""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user.is_admin:
        return make_response(error="Admin access required", status=403)

    tx_type = request.args.get("type")

    if tx_type and tx_type not in VALID_TRANSACTION_TYPES:
        return make_response(
            error=f"Invalid transaction type. Valid types: {', '.join(VALID_TRANSACTION_TYPES)}",
            status=400,
        )

    query = Transaction.query
    if tx_type:
        query = query.filter_by(transaction_type=tx_type)

    transactions = query.order_by(Transaction.created_at.desc()).all()
    return make_response(
        data=[
            {
                "id": tx.id,
                "wallet_id": tx.wallet_id,
                "amount": float(tx.amount),
                "type": tx.transaction_type,
                "created_at": tx.created_at.isoformat(),
            }
            for tx in transactions
        ],
        count=len(transactions),
    )


@tx_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_transactions():
    """Get all transactions for current user's wallet."""
    current_user_id = get_jwt_identity()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    tx_type = request.args.get("type")

    if page < 1:
        return make_response(error="Page must be >= 1", status=400)
    if per_page < 1 or per_page > 100:
        return make_response(error="per_page must be between 1 and 100", status=400)

    if tx_type and tx_type not in VALID_TRANSACTION_TYPES:
        return make_response(
            error=f"Invalid transaction type. Valid types: {', '.join(VALID_TRANSACTION_TYPES)}",
            status=400,
        )

    wallet = Wallet.query.filter_by(user_id=current_user_id).first_or_404()

    query = Transaction.query.filter_by(wallet_id=wallet.id)
    if tx_type:
        query = query.filter_by(transaction_type=tx_type)

    pagination = query.order_by(Transaction.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return make_response(
        data={
            "wallet_id": wallet.id,
            "current_balance": float(wallet.balance),
            "transactions": [
                {
                    "id": tx.id,
                    "amount": float(tx.amount),
                    "type": tx.transaction_type,
                    "created_at": tx.created_at.isoformat(),
                }
                for tx in pagination.items
            ],
        },
        count=len(pagination.items),
        pagination={
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
        },
        status=200,
    )


@tx_bp.route("/<string:user_id>", methods=["GET"])
@jwt_required()
def get_user_transactions(user_id):
    """Get all transactions for a user's wallet."""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if current_user.id != user_id and not current_user.is_admin:
        return make_response(error="Unauthorized", status=403)

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    tx_type = request.args.get("type")

    if page < 1:
        return make_response(error="Page must be >= 1", status=400)
    if per_page < 1 or per_page > 100:
        return make_response(error="per_page must be between 1 and 100", status=400)

    if tx_type and tx_type not in VALID_TRANSACTION_TYPES:
        return make_response(
            error=f"Invalid transaction type. Valid types: {', '.join(VALID_TRANSACTION_TYPES)}",
            status=400,
        )

    wallet = Wallet.query.filter_by(user_id=user_id).first_or_404()

    query = Transaction.query.filter_by(wallet_id=wallet.id)
    if tx_type:
        query = query.filter_by(transaction_type=tx_type)

    pagination = query.order_by(Transaction.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return make_response(
        data={
            "wallet_id": wallet.id,
            "current_balance": float(wallet.balance),
            "transactions": [
                {
                    "id": tx.id,
                    "amount": float(tx.amount),
                    "type": tx.transaction_type,
                    "created_at": tx.created_at.isoformat(),
                }
                for tx in pagination.items
            ],
        },
        count=len(pagination.items),
        pagination={
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
        },
        status=200,
    )


@tx_bp.route("/<string:user_id>/all", methods=["GET"])
@jwt_required()
def get_user_all_transactions(user_id):
    """Get all transactions for a user's wallet without pagination."""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if current_user.id != user_id and not current_user.is_admin:
        return make_response(error="Unauthorized", status=403)

    tx_type = request.args.get("type")

    if tx_type and tx_type not in VALID_TRANSACTION_TYPES:
        return make_response(
            error=f"Invalid transaction type. Valid types: {', '.join(VALID_TRANSACTION_TYPES)}",
            status=400,
        )

    wallet = Wallet.query.filter_by(user_id=user_id).first_or_404()

    query = Transaction.query.filter_by(wallet_id=wallet.id)
    if tx_type:
        query = query.filter_by(transaction_type=tx_type)

    transactions = query.order_by(Transaction.created_at.desc()).all()

    return make_response(
        data={
            "wallet_id": wallet.id,
            "current_balance": float(wallet.balance),
            "transactions": [
                {
                    "id": tx.id,
                    "amount": float(tx.amount),
                    "type": tx.transaction_type,
                    "created_at": tx.created_at.isoformat(),
                }
                for tx in transactions
            ],
        },
        count=len(transactions),
    )
