"""
Script Name : run.py
Description : Entry point
Author      : @tonybnya
"""

from core import create_app

app =  create_app()

if __name__ == '__main__':
    app.run(debug=True)
