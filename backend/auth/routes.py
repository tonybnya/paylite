"""
Script Name : routes.py
Description : Auth routes for registration and login
Author      : @tonybnya
"""

from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from core import db
from users.models import User, Wallet
from utils import make_response
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    required_fields = ["firstname", "lastname", "username", "email", "password"]
    if not data or not all(field in data for field in required_fields):
        return make_response(
            error="Missing required fields: firstname, lastname, username, email, password",
            status=400,
        )

    password = data["password"]
    if len(password) < 8:
        return make_response(
            error="Password must be at least 8 characters long", status=400
        )

    existing_username = User.query.filter_by(username=data["username"]).first()
    if existing_username:
        return make_response(error="Username already exists", status=409)

    existing_email = User.query.filter_by(email=data["email"]).first()
    if existing_email:
        return make_response(error="Email already exists", status=409)

    try:
        new_user = User(
            username=data["username"],
            email=data["email"],
            firstname=data["firstname"],
            lastname=data["lastname"],
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.flush()

        wallet = Wallet(user_id=new_user.id)
        db.session.add(wallet)
        db.session.commit()

        return make_response(data=new_user.to_dict(), status=201)
    except IntegrityError:
        db.session.rollback()
        return make_response(error="Username or email already exists", status=409)
    except Exception as e:
        db.session.rollback()
        return make_response(error=str(e), status=400)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return make_response(
            error="Missing required fields: email, password", status=400
        )

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return make_response(error="Invalid email or password", status=401)

    if not user.is_active:
        return make_response(error="Account is inactive", status=403)

    access_token = create_access_token(identity=user.id)

    return make_response(
        data={
            "access_token": access_token,
            "user": user.to_dict(),
        },
        status=200,
    )
