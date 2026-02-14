"""
Script Name : routes.py
Description : Definition of the users routes
Author      : @tonybnya
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import User
from core import db
from utils import make_response
from auth.decorators import admin_required
from sqlalchemy.exc import IntegrityError

users_bp = Blueprint("user", __name__, url_prefix="/users")


@users_bp.route("", methods=["POST"])
@admin_required
def create_user():
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

    existing_username_user = User.query.filter_by(username=data["username"]).first()
    if existing_username_user:
        return make_response(
            error="Username already exists",
            status=409,
        )

    existing_email_user = User.query.filter_by(email=data["email"]).first()
    if existing_email_user:
        return make_response(
            error="Email already exists",
            status=409,
        )

    try:
        new_user = User(
            username=data["username"],
            email=data["email"],
            firstname=data["firstname"],
            lastname=data["lastname"],
        )
        new_user.set_password(password)

        if "is_admin" in data:
            new_user.is_admin = data["is_admin"]

        db.session.add(new_user)
        db.session.commit()

        return make_response(data=new_user.to_dict(), status=201)
    except IntegrityError:
        db.session.rollback()
        return make_response(error="Username or email already exists", status=409)
    except Exception as e:
        db.session.rollback()
        return make_response(error=str(e), status=400)


@users_bp.route("", methods=["GET"])
@jwt_required()
def read_users():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    if page < 1:
        return make_response(error="Page must be >= 1", status=400)
    if per_page < 1 or per_page > 100:
        return make_response(error="per_page must be between 1 and 100", status=400)

    pagination = User.query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return make_response(
        data=[user.to_dict() for user in pagination.items],
        count=len(pagination.items),
        pagination={
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
        },
    )


@users_bp.route("/all", methods=["GET"])
@jwt_required()
def read_all_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return make_response(data=[user.to_dict() for user in users], count=len(users))


@users_bp.route("/me", methods=["GET"])
@jwt_required()
def read_current_user():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return make_response(data=user.to_dict())


@users_bp.route("/<string:user_id>", methods=["GET"])
@jwt_required()
def read_user(user_id):
    user = User.query.get_or_404(user_id)
    return make_response(data=user.to_dict())


@users_bp.route("/<string:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    user = User.query.get_or_404(user_id)

    if current_user.id != user_id and not current_user.is_admin:
        return make_response(error="Unauthorized to update this user", status=403)

    data = request.get_json()

    user.firstname = data.get("firstname", user.firstname)
    user.lastname = data.get("lastname", user.lastname)
    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)

    if current_user.is_admin and "is_admin" in data:
        user.is_admin = data["is_admin"]
    if current_user.is_admin and "is_active" in data:
        user.is_active = data["is_active"]

    if "password" in data:
        password = data["password"]
        if len(password) < 8:
            return make_response(
                error="Password must be at least 8 characters long", status=400
            )
        user.set_password(password)

    db.session.commit()
    return make_response(data=user.to_dict())


@users_bp.route("/<string:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user.is_admin:
        return make_response(error="Admin access required", status=403)

    try:
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return make_response(data={"message": "User deleted"}, status=200)
    except Exception as e:
        db.session.rollback()
        return make_response(error=str(e), status=400)
