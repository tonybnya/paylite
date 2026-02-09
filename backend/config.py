"""
Script Name : config.py
Description : Configuration classes
Author      : @tonybnya
"""

import os
from dotenv import load_dotenv


basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))


class Config:
    """Base config."""
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STATIC_FOLDER = 'static'
    TEMPLATES_FOLDER = 'templates'


class DevConfig(Config):
    FLASK_ENV = 'development'
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///dev.db'


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'
    WTF_CSRF_ENABLED = False  # easier for from testing


class ProdConfig(Config):
    FLASK_ENV = 'production'
    DEBUG = False
    # use environment variables for sensitive prod data
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')


config_dict = {
    "dev": DevConfig,
    "prod": ProdConfig,
    "test": TestConfig
}
