#!/bin/bash

set -e  # Exit on error

echo "🚀 SafeMind Quick Setup for Codespaces"
echo "========================================"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Install PostgreSQL and Redis if needed
echo "📦 Step 1/5: Installing services..."
if ! command_exists psql; then
    sudo apt-get update -qq
    sudo apt-get install -y postgresql postgresql-contrib redis-server
    echo "✅ PostgreSQL and Redis installed"
else
    echo "✅ Services already installed"
fi

# 2. Start services
echo ""
echo "▶️  Step 2/5: Starting services..."
sudo service postgresql start
redis-server --daemonize yes
sleep 2
echo "✅ PostgreSQL and Redis started"

# 3. Setup database
echo ""
echo "🗄️  Step 3/5: Configuring database..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw safemind_db; then
    echo "✅ Database already exists"
else
    sudo -u postgres psql -c "CREATE DATABASE safemind_db;"
    sudo -u postgres psql -c "CREATE USER safemind WITH PASSWORD 'safemind_dev_password';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE safemind_db TO safemind;"
    sudo -u postgres psql -c "ALTER DATABASE safemind_db OWNER TO safemind;"
    sudo -u postgres psql -d safemind_db -c "GRANT ALL ON SCHEMA public TO safemind;"
    echo "✅ Database created and configured"
fi

# 4. Setup environment files
echo ""
echo "📝 Step 4/5: Creating environment files..."
[ ! -f server/.env ] && cp server/.env.example server/.env && echo "✅ Created server/.env"
[ ! -f ml-service/.env ] && cp ml-service/.env.example ml-service/.env && echo "✅ Created ml-service/.env"
[ ! -f client/.env ] && cp client/.env.example client/.env && echo "✅ Created client/.env"

# 5. Install dependencies
echo ""
echo "📦 Step 5/5: Installing dependencies (this may take 2-3 minutes)..."
echo "   Installing backend dependencies..."
cd server && npm install --silent
echo "✅ Backend dependencies installed"

echo "   Installing Python dependencies..."
cd ../ml-service && pip install -q -r requirements.txt
echo "✅ ML service dependencies installed"

echo "   Installing frontend dependencies..."
cd ../client && npm install --silent
echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "🎯 To start the application, open 3 terminals:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd server && npm run dev"
echo ""
echo "Terminal 2 (ML Service):"
echo "  cd ml-service && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "Terminal 3 (Frontend):"
echo "  cd client && npm start"
echo ""
echo "Then click the PORTS tab and open port 3000 in your browser!"
echo ""
