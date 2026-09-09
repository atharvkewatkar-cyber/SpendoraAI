@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo SpendoraAI - Indian Rupees (INR) Edition
echo ========================================
if not exist "backend\venv\Scripts\python.exe" (
  echo Creating Python virtual environment...
  python -m venv backend\venv
)
call backend\venv\Scripts\activate.bat
python -m pip install -r backend\requirements.txt
start "SpendoraAI Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload"
cd /d "%~dp0frontend"
if not exist node_modules (
  echo Installing frontend dependencies...
  call npm install
)
start "SpendoraAI Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
endlocal
