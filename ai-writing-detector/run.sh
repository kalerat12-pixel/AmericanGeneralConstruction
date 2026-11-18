#!/usr/bin/env bash
# One-command setup + run for macOS and Linux:   ./run.sh
set -e
cd "$(dirname "$0")"

PY="${PYTHON:-python3}"
if ! command -v "$PY" >/dev/null 2>&1; then
  echo "Python 3 was not found. Install Python 3.10 or newer from https://www.python.org/downloads/ and try again."
  exit 1
fi
if ! "$PY" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)'; then
  echo "Python 3.10 or newer is required (you have $("$PY" --version))."
  exit 1
fi

if [ ! -f .venv/.installed ]; then
  echo "== First-time setup (only happens once, takes a few minutes) =="
  "$PY" -m venv .venv
  .venv/bin/python -m pip install --upgrade pip
  if [ "$(uname)" = "Linux" ]; then
    # CPU-only PyTorch: much smaller download, works on any laptop
    .venv/bin/python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
  fi
  .venv/bin/python -m pip install -r requirements.txt
  echo "== Downloading the AI models (one time, about 1 GB) =="
  .venv/bin/python -m detector.download
  touch .venv/.installed
fi

echo "== Starting the app. It will open in your browser at http://localhost:8501 =="
echo "   (Press Ctrl+C in this window to stop it.)"
# open the browser once the server has had a few seconds to start
( sleep 5; .venv/bin/python -m webbrowser -t "http://localhost:8501" >/dev/null 2>&1 || true ) &
.venv/bin/python -m streamlit run app.py "$@"
