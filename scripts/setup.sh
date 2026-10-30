#!/bin/bash
set -e

echo "=== GASTECT Project Setup ==="

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r bridge/requirements.txt

# Initialize database
echo "Initializing SQLite database..."
python bridge/init_db.py

# Install Next.js dependencies
echo "Installing website dependencies..."
cd website
npm install
cd ..

touch .setup_done
echo "=== Setup Complete! Run ./scripts/start.sh to launch. ==="
