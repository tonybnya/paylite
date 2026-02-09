"""
Script Name : manage.py
Description : Database management and seeding with Faker
Author      : @tonybnya
"""

import sys
import random
from faker import Faker
from sqlalchemy.exc import IntegrityError
from core import create_app, db
from users.models import User, Wallet, Transaction

fake = Faker()

def seed_db(count=10):
    """Populates the DB with fake Fintech data."""
    app = create_app()
    with app.app_context():
        print(f"🌱 Seeding {count} users...")
        
        fake.unique.clear()  # Reset Faker's unique tracker
        created_count = 0
        max_retries = 3
        
        for i in range(count):
            retry_count = 0
            user_created = False
            
            while retry_count < max_retries and not user_created:
                try:
                    # Use unique generator with fallback
                    if retry_count == 0:
                        username = fake.unique.user_name()
                        email = fake.unique.email()
                    else:
                        # Add timestamp/random suffix on retry
                        base_username = fake.user_name()
                        username = f"{base_username}_{random.randint(1000, 9999)}"
                        email = f"{fake.user_name()}_{random.randint(1000, 9999)}@example.com"
                    
                    # 1. Create User
                    user = User(username=username, email=email)
                    db.session.add(user)
                    db.session.flush()
                    
                    # 2. Create Wallet
                    wallet = Wallet(
                        user_id=user.id,
                        balance=round(random.uniform(500, 5000), 2),
                        currency="XAF"
                    )
                    db.session.add(wallet)
                    db.session.flush()
                    
                    # 3. Create transactions
                    for _ in range(random.randint(1, 5)):
                        tx_type = random.choice(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER_OUT', 'TRANSFER_IN'])
                        amount = round(random.uniform(10, 100), 2)
                        tx = Transaction(
                            wallet_id=wallet.id,
                            amount=amount,
                            transaction_type=tx_type
                        )
                        db.session.add(tx)
                    
                    db.session.commit()
                    created_count += 1
                    user_created = True
                    
                    if created_count % 100 == 0:
                        print(f"  ✓ Created {created_count}/{count} users...")
                    
                except IntegrityError:
                    db.session.rollback()
                    retry_count += 1
                    if retry_count >= max_retries:
                        print(f"  ⚠ Failed to create user {i+1} after {max_retries} retries")
                except Exception as e:
                    db.session.rollback()
                    print(f"  ✗ Unexpected error: {str(e)}")
                    break
        
        print(f"✅ Successfully seeded {created_count}/{count} users, wallets, and transactions!")


def init_db():
    """Initializes the database tables."""
    app = create_app()
    with app.app_context():
        db.create_all()
    print("✅ Database tables created successfully!")


def drop_db():
    """Deletes all database tables."""
    app = create_app()
    with app.app_context():
        db.drop_all()
    print("⚠️ Database tables dropped.")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "init":
            from core import db # ensures db is in scope
            init_db()
        elif command == "drop":
            drop_db()
        elif command == "seed":
            # Optional: pass count as 2nd arg, e.g., uv run python manage.py seed 50
            num = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            seed_db(num)
        else:
            print("Usage: uv run python manage.py [init|drop|seed]")
