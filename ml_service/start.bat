@echo off
echo ========================================================
echo   Kaiser AI Local Machine Learning Service (FastAPI)
echo   YOLOv8 Defect Detection ^& DBSCAN Deduplication
echo ========================================================
cd /d "%~dp0"
call .venv\Scripts\activate.bat
python app.py
pause
