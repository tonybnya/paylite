"""
Script Name : routes.py
Description : Definition of the users routes
Author      : @tonybnya
"""

from flask import Blueprint, request
from .models import User
from core import db
from utils import make_response, hash_password

users_bp = Blueprint("user", __name__, url_prefix="/users")


# CREATE - POST
@users_bp.route("", methods=["POST"])
def create_user():
    data = request.get_json()

    # Required fields validation
    required_fields = ["firstname", "lastname", "username", "email", "password"]
    if not data or not all(field in data for field in required_fields):
        return make_response(
            error="Missing required fields: firstname, lastname, username, email, password",
            status=400,
        )

    # Password validation
    password = data["password"]
    if len(password) < 8:
        return make_response(
            error="Password must be at least 8 characters long", status=400
        )

    new_user = User(
        username=data["username"],
        email=data["email"],
        firstname=data["firstname"],
        lastname=data["lastname"],
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return make_response(data=new_user.to_dict(), status=201)


# READ ALL - GET
@users_bp.route("", methods=["GET"])
def read_users():
    users = User.query.all()
    return make_response(data=[user.to_dict() for user in users], count=len(users))


# READ ONE - GET
@users_bp.route("/<string:user_id>", methods=["GET"])
def read_user(user_id):
    user = User.query.get_or_404(user_id)
    return make_response(data=user.to_dict())


# UPDATE - PUT
@users_bp.route("<string:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    # Allow updating firstname, lastname, username, email
    user.firstname = data.get("firstname", user.firstname)
    user.lastname = data.get("lastname", user.lastname)
    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)

    # Handle password update if provided
    if "password" in data:
        password = data["password"]
        if len(password) < 8:
            return make_response(
                error="Password must be at least 8 characters long", status=400
            )
        user.set_password(password)

    db.session.commit()
    return make_response(data=user.to_dict())


# DELETE - DELETE
@users_bp.route("<string:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return make_response(data={"message": "User deleted"}, status=200)
