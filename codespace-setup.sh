#!/bin/bash

echo "🚀 SafeMind Codespace Setup (No Sudo Password Needed)"
echo "======================================================"
echo ""

# Function to run command with sudo, handling password prompt
run_sudo() {
    echo "$1" | sudo -S "$@" 2>/dev/null || sudo "$@"
}

# Check if PostgreSQL is installed
if ! command -v psql >/dev/null 2>&1; then
    echo "❌ PostgreSQL not found. Installing..."
    echo "⚠️  You may be prompted for password - just press ENTER"
    sudo apt-get update -qq
    sudo apt-get install -y postgresql postgresql-contrib redis-server
else
    echo "✅ PostgreSQL already installed"
fi

# Check if Redis is installed
if ! command -v redis-server >/dev/null 2>&1; then
    echo "❌ Redis not found. Installing..."
    sudo apt-get install -y redis-server
else
    echo "✅ Redis already installed"
fi

echo ""
echo "▶️  Starting services..."

# Start PostgreSQL - try different methods
if sudo service postgresql start 2>/dev/null; then
    echo "✅ PostgreSQL started via service"
elif pg_ctl status -D /var/lib/postgresql/data 2>/dev/null; then
    echo "✅ PostgreSQL already running"
else
    echo "⚠️  PostgreSQL may need manual start"
fi

# Start Redis
redis-server --daemonize yes 2>/dev/null && echo "✅ Redis started" || echo "⚠️  Redis may already be running"

sleep 2

echo ""
echo "🗄️  Setting up database..."

# Try to create database as current user first
if psql -U postgres -c "SELECT 1" 2>/dev/null; then
    # Can connect as postgres directly
    psql -U postgres -c "CREATE DATABASE safemind_db;" 2>/dev/null || echo "Database may exist"
    psql -U postgres -c "CREATE USER safemind WITH PASSWORD 'safemind_dev_password';" 2>/dev/null || echo "User may exist"
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE safemind_db TO safemind;" 2>/dev/null
    psql -U postgres -c "ALTER DATABASE safemind_db OWNER TO safemind;" 2>/dev/null
    psql -U postgres -d safemind_db -c "GRANT ALL ON SCHEMA public TO safemind;" 2>/dev/null
    echo "✅ Database configured successfully"
else
    # Need sudo to switch to postgres user
    echo "⚠️  Attempting database setup with sudo..."
    echo "   If prompted for password, press ENTER"
    sudo -u postgres psql -c "CREATE DATABASE safemind_db;" 2>/dev/null || echo "Database may exist"
    sudo -u postgres psql -c "CREATE USER safemind WITH PASSWORD 'safemind_dev_password';" 2>/dev/null || echo "User may exist"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE safemind_db TO safemind;" 2>/dev/null
    sudo -u postgres psql -c "ALTER DATABASE safemind_db OWNER TO safemind;" 2>/dev/null
    sudo -u postgres psql -d safemind_db -c "GRANT ALL ON SCHEMA public TO safemind;" 2>/dev/null
    echo "✅ Database setup attempted"
fi

echo ""
echo "📝 Creating environment files..."
[ ! -f server/.env ] && cp server/.env.example server/.env && echo "✅ server/.env"
[ ! -f ml-service/.env ] && cp ml-service/.env.example ml-service/.env && echo "✅ ml-service/.env"
[ ! -f client/.env ] && cp client/.env.example client/.env && echo "✅ client/.env"

echo ""
echo "📦 Installing dependencies..."
echo "   This takes 2-3 minutes. Please wait..."
echo ""

echo "   [1/3] Backend dependencies..."
cd server && npm install --silent 2>&1 | tail -1 && cd .. && echo "   ✅ Backend complete"

echo "   [2/3] Python ML dependencies..."
cd ml-service && pip install -q -r requirements.txt 2>&1 | tail -1 && cd .. && echo "   ✅ ML Service complete"

echo "   [3/3] Frontend dependencies..."
cd client && npm install --silent 2>&1 | tail -1 && cd .. && echo "   ✅ Frontend complete"

echo ""
echo "======================================================"
echo "✅ Setup Complete!"
echo "======================================================"
echo ""
echo "🎯 Start your application with these commands in 3 terminals:"
echo ""
echo "Terminal 1: cd server && npm run dev"
echo "Terminal 2: cd ml-service && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo "Terminal 3: cd client && npm start"
echo ""
echo "📱 Access the frontend from the PORTS tab (port 3000)"
echo ""
