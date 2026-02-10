"""
Script Name : models.py
Description : Define resource models for users, wallets, and transactions
Author      : @tonybnya
"""

import uuid
from core import db
from datetime import datetime, timezone
from utils import hash_password, verify_password


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firstname = db.Column(db.String(80), nullable=False)
    lastname = db.Column(db.String(80), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # Relationship: One User -> One Wallet
    wallet = db.relationship(
        "Wallet", backref="owner", uselist=False, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "username": self.username,
            "email": self.email,
        }

    def __str__(self):
        return f"<User {self.firstname} {self.lastname} ({self.username})>"

    def set_password(self, password):
        """Hash and set the user's password."""
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        self.password_hash = hash_password(password)

    def check_password(self, password):
        """Verify the user's password."""
        return verify_password(password, self.password_hash)


class Wallet(db.Model):
    __tablename__ = "wallets"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    balance = db.Column(db.Numeric(20, 2), default=0.00, nullable=False)
    currency = db.Column(db.String(3), default="XAF", nullable=False)

    # Foreign Key
    user_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False, unique=True
    )

    # Relationship: One Wallet -> Many Transactions
    transactions = db.relationship(
        "Transaction", backref="wallet", lazy=True, cascade="all, delete-orphan"
    )

    # Constraint: Balance can't be negative
    __table_args__ = (
        db.CheckConstraint("balance >= 0", name="check_balance_non_negative"),
    )


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    amount = db.Column(db.Numeric(20, 2), nullable=False)
    # 'DEPOSIT' or 'WITHDRAWAL' or 'TRANSFER_OUT' or 'TRANSFER_IN'
    transaction_type = db.Column(db.String(15), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Foreign Key
    wallet_id = db.Column(db.String(36), db.ForeignKey("wallets.id"), nullable=False)
