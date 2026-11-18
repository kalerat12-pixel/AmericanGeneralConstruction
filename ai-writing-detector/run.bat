@echo off
REM One-command setup + run for Windows: double-click run.bat
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (set PY=py -3) else (set PY=python)
%PY% -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)" 2>nul
if errorlevel 1 (
  echo Python 3.10 or newer is required. Install it from https://www.python.org/downloads/
  echo During install, tick "Add python.exe to PATH". Then run this file again.
  pause
  exit /b 1
)

if not exist .venv\.installed (
  echo == First-time setup ^(only happens once, takes a few minutes^) ==
  %PY% -m venv .venv || goto :fail
  .venv\Scripts\python -m pip install --upgrade pip || goto :fail
  .venv\Scripts\python -m pip install -r requirements.txt || goto :fail
  echo == Downloading the AI models ^(one time, about 1 GB^) ==
  .venv\Scripts\python -m detector.download || goto :fail
  echo done> .venv\.installed
)

echo == Starting the app. It will open in your browser at http://localhost:8501 ==
echo    ^(Close this window to stop it.^)
.venv\Scripts\python -m streamlit run app.py
exit /b 0

:fail
echo Setup failed. See the messages above.
pause
exit /b 1
