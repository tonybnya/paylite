"""
Script Name : utils.py
Description : Helper to ensure every response follows the same structure
Author      : @tonybnya
"""

from flask import jsonify


def make_response(data=None, count=0, error=None, status=200):
    success = True if status < 400 else False
    return jsonify({
        "success": success,
        "data": data,
        "count": count,
        "error": error
    }), status
