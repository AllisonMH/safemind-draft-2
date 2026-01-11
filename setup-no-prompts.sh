#!/bin/bash

echo "🚀 SafeMind Setup (Minimal sudo)"
echo "=================================="
echo ""

# Check if PostgreSQL is already installed
if command -v psql >/dev/null 2>&1; then
    echo "✅ PostgreSQL already installed"
else
    echo "❌ PostgreSQL needs to be installed with sudo"
    echo "Please run: sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib redis-server"
    exit 1
fi

# Start services (requires sudo)
echo "▶️  Starting PostgreSQL..."
sudo service postgresql start || echo "⚠️  Could not start PostgreSQL - may already be running"

echo "▶️  Starting Redis..."
redis-server --daemonize yes 2>/dev/null || echo "⚠️  Could not start Redis - may already be running"

sleep 2

# Setup database (requires sudo to switch to postgres user)
echo "🗄️  Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE safemind_db;" 2>/dev/null || echo "Database may already exist"
sudo -u postgres psql -c "CREATE USER safemind WITH PASSWORD 'safemind_dev_password';" 2>/dev/null || echo "User may already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE safemind_db TO safemind;" 2>/dev/null
sudo -u postgres psql -c "ALTER DATABASE safemind_db OWNER TO safemind;" 2>/dev/null
sudo -u postgres psql -d safemind_db -c "GRANT ALL ON SCHEMA public TO safemind;" 2>/dev/null

echo "✅ Database setup complete"

# These don't need sudo
echo ""
echo "📝 Creating environment files..."
[ ! -f server/.env ] && cp server/.env.example server/.env && echo "✅ Created server/.env"
[ ! -f ml-service/.env ] && cp ml-service/.env.example ml-service/.env && echo "✅ Created ml-service/.env"
[ ! -f client/.env ] && cp client/.env.example client/.env && echo "✅ Created client/.env"

echo ""
echo "📦 Installing dependencies (this takes 2-3 minutes)..."
echo "   Backend..."
cd server && npm install --silent && cd ..
echo "✅ Backend done"

echo "   ML Service..."
cd ml-service && pip install -q -r requirements.txt && cd ..
echo "✅ ML Service done"

echo "   Frontend..."
cd client && npm install --silent && cd ..
echo "✅ Frontend done"

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
