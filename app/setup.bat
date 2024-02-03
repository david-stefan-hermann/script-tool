@echo off

REM install requirements
pip install -r requirements.txt

REM start main.py with pythonw as a separate process
start /B pythonw main.py
