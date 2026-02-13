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
    return "PayLite API Application Factory!"


@core_bp.route('/health', methods=['GET'])
def health_check():
    return {
        "status": "ok",
        "service": "PayLite API",
        "timestamp": datetime.now()
    }, 200
