"""
Script Name : decorators.py
Description : Auth decorators for role-based access control
Author      : @tonybnya
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from users.models import User


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify(
                {"success": False, "data": None, "error": "User not found"}
            ), 404

        if not user.is_admin:
            return jsonify(
                {"success": False, "data": None, "error": "Admin access required"}
            ), 403

        return fn(*args, **kwargs)

    return wrapper
