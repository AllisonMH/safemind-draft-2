#!/bin/bash

echo "🚀 Setting up SafeMind development environment..."

# Install PostgreSQL and Redis
echo "📦 Installing PostgreSQL and Redis..."
sudo apt-get update -qq
sudo apt-get install -y -qq postgresql postgresql-contrib redis-server

# Start services
echo "▶️  Starting services..."
sudo service postgresql start
redis-server --daemonize yes

# Wait for PostgreSQL to start
sleep 3

# Configure PostgreSQL
echo "🗄️  Configuring database..."
sudo -u postgres psql -c "CREATE DATABASE safemind_db;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER safemind WITH PASSWORD 'safemind_dev_password';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE safemind_db TO safemind;" 2>/dev/null || true
sudo -u postgres psql -c "ALTER DATABASE safemind_db OWNER TO safemind;" 2>/dev/null || true
sudo -u postgres psql -d safemind_db -c "GRANT ALL ON SCHEMA public TO safemind;" 2>/dev/null || true

# Create environment files
echo "📝 Creating environment files..."
[ ! -f server/.env ] && cp server/.env.example server/.env
[ ! -f ml-service/.env ] && cp ml-service/.env.example ml-service/.env
[ ! -f client/.env ] && cp client/.env.example client/.env

# Install dependencies
echo "📦 Installing Node.js dependencies..."
cd server && npm install --silent
cd ../client && npm install --silent

echo "📦 Installing Python dependencies..."
cd ../ml-service && pip install -q -r requirements.txt

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 To start the application:"
echo "   Terminal 1: cd server && npm run dev"
echo "   Terminal 2: cd ml-service && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo "   Terminal 3: cd client && npm start"
echo ""
echo "Or run: ./start-codespace.sh (services only, dependencies already installed)"
