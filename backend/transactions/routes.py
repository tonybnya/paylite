"""
Script Name : routes.py
Description : Handle transactions creation and record
Author      : @tonybnya
"""

from flask import Blueprint, request
from users.models import Wallet, Transaction
from utils import make_response
from core import db
from decimal import Decimal

tx_bp = Blueprint("transaction", __name__, url_prefix="/transactions")

VALID_TRANSACTION_TYPES = ["DEPOSIT", "WITHDRAWAL", "TRANSFER_IN", "TRANSFER_OUT"]


@tx_bp.route("/deposit", methods=["POST"])
def deposit():
    """Deposit money into a wallet."""
    data = request.get_json()

    # validation
    if not data or "user_id" not in data or "amount" not in data:
        return make_response(error="Missing required fields", status=400)

    try:
        amount = Decimal(str(data["amount"]))
        if amount <= 0:
            return make_response(error="Amount must be positive", status=400)
    except (ValueError, TypeError):
        return make_response(error="Invalid amount", status=400)

    wallet = Wallet.query.filter_by(user_id=data["user_id"]).first_or_404()

    try:
        # Business Logic: Increase balance
        wallet.balance += amount

        # Log Transaction
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
def withdraw():
    """Withdraw money from a wallet."""
    data = request.get_json()

    # validation
    if not data or "user_id" not in data or "amount" not in data:
        return make_response(error="Missing required fields", status=400)

    try:
        amount = Decimal(str(data["amount"]))
        if amount <= 0:
            return make_response(error="Amount must be positive", status=400)
    except (ValueError, TypeError):
        return make_response(error="Invalid amount", status=400)

    wallet = Wallet.query.filter_by(user_id=data["user_id"]).first_or_404()

    # check sufficient balance
    if wallet.balance < amount:
        return make_response(error="Insufficient balance", status=400)

    try:
        # Business Logic: Decrease balance
        wallet.balance -= amount

        # Log Transaction
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
def transfer():
    """Transfer money between wallets."""
    data = request.get_json()

    # validation
    required_fields = ["from_user_id", "to_user_id", "amount"]
    if not data or not all(field in data for field in required_fields):
        return make_response(error="Missing required fields", status=400)

    if data["from_user_id"] == data["to_user_id"]:
        return make_response(error="Cannot transfer to same wallet", status=400)

    try:
        amount = Decimal(str(data["amount"]))
        if amount <= 0:
            return make_response(error="Amount must be positive", status=400)
    except (ValueError, TypeError):
        return make_response(error="Invalid amount", status=400)

    # get both wallets
    from_wallet = Wallet.query.filter_by(user_id=data["from_user_id"]).first_or_404()
    to_wallet = Wallet.query.filter_by(user_id=data["to_user_id"]).first_or_404()

    # check sufficient balance
    if from_wallet.balance < amount:
        return make_response(error="Insufficient balance", status=400)

    try:
        # Business Logic: Transfer
        from_wallet.balance -= amount
        to_wallet.balance += amount

        # Log both transactions
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
def get_all_transactions():
    """Get all transactions globally."""
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


@tx_bp.route("/<string:user_id>", methods=["GET"])
def get_user_transactions(user_id):
    """Get all transactions for a user's wallet."""
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
def get_user_all_transactions(user_id):
    """Get all transactions for a user's wallet without pagination."""
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
