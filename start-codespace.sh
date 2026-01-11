#!/bin/bash

echo "🚀 Starting SafeMind in GitHub Codespace..."

# Install services if not already installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    sudo apt-get update -qq
    sudo apt-get install -y -qq postgresql postgresql-contrib
fi

if ! command -v redis-server &> /dev/null; then
    echo "📦 Installing Redis..."
    sudo apt-get install -y -qq redis-server
fi

# Start services
echo "▶️  Starting PostgreSQL..."
sudo service postgresql start

echo "▶️  Starting Redis..."
redis-server --daemonize yes

# Wait for PostgreSQL to be ready
sleep 2

# Setup database (check if already exists)
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw safemind_db; then
    echo "🗄️  Setting up database..."
    sudo -u postgres psql -c "CREATE DATABASE safemind_db;"
    sudo -u postgres psql -c "CREATE USER safemind WITH PASSWORD 'safemind_dev_password';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE safemind_db TO safemind;"
    sudo -u postgres psql -c "ALTER DATABASE safemind_db OWNER TO safemind;"
    sudo -u postgres psql -d safemind_db -c "GRANT ALL ON SCHEMA public TO safemind;"
    echo "✅ Database created!"
else
    echo "✅ Database already exists!"
fi

# Setup environment files if they don't exist
if [ ! -f server/.env ]; then
    echo "📝 Creating server/.env..."
    cp server/.env.example server/.env
fi

if [ ! -f ml-service/.env ]; then
    echo "📝 Creating ml-service/.env..."
    cp ml-service/.env.example ml-service/.env
fi

if [ ! -f client/.env ]; then
    echo "📝 Creating client/.env..."
    cp client/.env.example client/.env
fi

# Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd server && npm install -q && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client && npm install -q && cd ..
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Terminal 1: cd server && npm run dev"
echo "2. Terminal 2: cd ml-service && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo "3. Terminal 3: cd client && npm start"
echo ""
echo "🌐 Access your app from the PORTS tab when services start"
