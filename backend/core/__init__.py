"""
Script Name : __init__.py
Description : This is where the factory lives
Author      : @tonybnya
"""

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import config_dict

db = SQLAlchemy()
jwt = JWTManager()


def create_app(config_name="dev"):
    app = Flask(__name__)

    # load configuration
    app.config.from_object(config_dict[config_name])

    # bind extensions to the app instance
    db.init_app(app)
    jwt.init_app(app)

    # CORS configuration
    CORS(
        app,
        origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        supports_credentials=True,
    )

    # register blueprints (the routes)
    from .routes import core_bp
    from auth.routes import auth_bp
    from users.routes import users_bp
    from wallets.routes import wallets_bp
    from transactions.routes import tx_bp

    app.register_blueprint(core_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(wallets_bp)
    app.register_blueprint(tx_bp)

    # global error handler for 404
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify(
            {"success": False, "data": None, "error": "Resource not found"}
        ), 404

    # global error handler for 500
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify(
            {
                "success": False,
                "data": None,
                "error": "An internal server error occurred",
            }
        ), 500

    return app
