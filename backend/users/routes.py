"""
Script Name : routes.py
Description : Definition of the users routes
Author      : @tonybnya
"""

from flask import Blueprint, request
from .models import User
from core import db
from utils import make_response

users_bp = Blueprint('user', __name__, url_prefix='/users')


# CREATE - POST
@users_bp.route('', methods=['POST'])
def create_user():
    data = request.get_json()

    # simple paylod validation
    if not data or 'username' not in data or 'email' not in data:
        return make_response(
            error="Missing username or email",
            status=400
        )

    new_user = User(username=data['username'], email=data['email'])
    db.session.add(new_user)
    db.session.commit()

    return make_response(data=new_user.to_dict(), status=201)


# READ ALL - GET
@users_bp.route('', methods=['GET'])
def read_users():
    users = User.query.all()
    return make_response(data=[user.to_dict() for user in users], count=len(users))


# READ ONE - GET
@users_bp.route('/<string:user_id>', methods=['GET'])
def read_user(user_id):
    user = User.query.get_or_404(user_id)
    return make_response(data=user.to_dict())


# UPDATE - PUT
@users_bp.route('<string:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)

    db.session.commit()
    return make_response(data=user.to_dict())


# DELETE - DELETE
@users_bp.route('<string:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return make_response(data={"message": "User deleted"}, status=200)
