"""
Script Name : test_db.py
Description : Quick script to verify database connection string
Author      : @tonybnya
"""

import os

from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv(".env")

url = os.environ.get("DATABASE_URL")
if not url:
    print("No DATABASE_URL found in .env")
    exit(1)

# Sometimes SQLAlchemy needs postgresql+psycopg2
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://")

try:
    engine = create_engine(url)
    connection = engine.connect()
    print("SUCCESS: Connected to the database.")
    connection.close()
except Exception as e:
    print(f"FAILED: Could not connect to the database. Error: {e}")
