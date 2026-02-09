"""
Script Name : routes.py
Description : Definition of the core routes
Author      : @tonybnya
"""

from flask import Blueprint
from datetime import datetime

core_bp = Blueprint('core', __name__)


@core_bp.route('/', methods=['GET'])
def index():
    return "PayLite Application Factory!"


@core_bp.route('/health', methods=['GET'])
def health_check():
    return {
        "status": "ok",
        "date": datetime.now()
    }, 200
