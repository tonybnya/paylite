"""
Script Name : utils.py
Description : Helper to ensure every response follows the same structure
Author      : @tonybnya
"""

import bcrypt
from flask import jsonify


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def make_response(data=None, count=0, error=None, status=200, pagination=None):
    success = True if status < 400 else False
    response = {"success": success, "data": data, "count": count, "error": error}
    if pagination:
        response["pagination"] = pagination
    return jsonify(response), status
