"""
Script Name : migrate_db.py
Description : Data migration script from SQLite (local) to PostgreSQL (Neon)
Author      : @tonybnya
"""

import os
import sqlite3
from datetime import datetime, timezone
from decimal import Decimal
from core import create_app, db
from users.models import User, Wallet, Transaction

# SQLITE source file
SQLITE_DB_PATH = "instance/dev.db"

def migrate():
    # 1. Initialize the app with production config (PostgreSQL)
    os.environ["FLASK_CONFIG"] = "prod"
    app = create_app("prod")
    
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"❌ SQLite database not found at {SQLITE_DB_PATH}")
        return

    # 2. Connect to SQLite
    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_curr = sqlite_conn.cursor()

    with app.app_context():
        print("🚀 Starting migration to PostgreSQL...")
        
        # 3. Migrate Users
        print("👤 Migrating Users...")
        sqlite_curr.execute("SELECT * FROM users")
        sqlite_users = sqlite_curr.fetchall()
        
        for row in sqlite_users:
            if not User.query.get(row['id']):
                user = User(
                    id=row['id'],
                    firstname=row['firstname'],
                    lastname=row['lastname'],
                    username=row['username'],
                    email=row['email'],
                    password_hash=row['password_hash'],
                    is_active=bool(row['is_active']),
                    is_admin=bool(row['is_admin']),
                    created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else datetime.now(timezone.utc)
                )
                db.session.add(user)
        db.session.commit()
        print(f"  ✓ {len(sqlite_users)} users processed.")

        # 4. Migrate Wallets
        print("💳 Migrating Wallets...")
        sqlite_curr.execute("SELECT * FROM wallets")
        sqlite_wallets = sqlite_curr.fetchall()
        
        for row in sqlite_wallets:
            if not Wallet.query.get(row['id']):
                wallet = Wallet(
                    id=row['id'],
                    balance=Decimal(str(row['balance'])),
                    currency=row['currency'],
                    user_id=row['user_id'],
                    created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else datetime.now(timezone.utc)
                )
                db.session.add(wallet)
        db.session.commit()
        print(f"  ✓ {len(sqlite_wallets)} wallets processed.")

        # 5. Migrate Transactions
        print("📊 Migrating Transactions...")
        sqlite_curr.execute("SELECT * FROM transactions")
        sqlite_transactions = sqlite_curr.fetchall()
        
        for row in sqlite_transactions:
            if not Transaction.query.get(row['id']):
                tx = Transaction(
                    id=row['id'],
                    amount=Decimal(str(row['amount'])),
                    transaction_type=row['transaction_type'],
                    wallet_id=row['wallet_id'],
                    created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else datetime.now(timezone.utc)
                )
                db.session.add(tx)
        db.session.commit()
        print(f"  ✓ {len(sqlite_transactions)} transactions processed.")

        print("✨ Migration completed successfully!")

    sqlite_conn.close()

if __name__ == "__main__":
    migrate()
