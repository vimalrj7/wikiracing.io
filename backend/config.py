import os

class ProdConfig():
    FLASK_ENV = 'production'
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
    CORS_HEADER = 'Content-Type'


class DevConfig():
    FLASK_ENV = 'development'
    DEBUG = True
    TESTING = True
    SECRET_KEY = 'dev'
    CORS_HEADER = 'Content-Type'