#!/bin/bash
# Quick service startup script for SafeMind
# Run this at the start of each Codespace session

echo "🚀 Starting SafeMind services..."

# Start PostgreSQL
if ! service postgresql status > /dev/null 2>&1; then
    echo "▶️  Starting PostgreSQL..."
    service postgresql start
else
    echo "✅ PostgreSQL already running"
fi

# Start Redis
if ! redis-cli ping > /dev/null 2>&1; then
    echo "▶️  Starting Redis..."
    redis-server --daemonize yes
    sleep 1
else
    echo "✅ Redis already running"
fi

# Reset database password (in case it changed)
echo "🔐 Resetting database credentials..."
psql -U postgres -c "ALTER USER safemind WITH PASSWORD 'safemind_dev_password';" > /dev/null 2>&1
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE safemind_db TO safemind;" > /dev/null 2>&1
psql -U postgres -c "ALTER DATABASE safemind_db OWNER TO safemind;" > /dev/null 2>&1
psql -U postgres -d safemind_db -c "GRANT ALL ON SCHEMA public TO safemind;" > /dev/null 2>&1

echo ""
echo "✅ All services ready!"
echo ""
echo "Now start your application:"
echo "  Terminal 1: cd server && npm run dev"
echo "  Terminal 2: cd ml-service && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo "  Terminal 3: cd client && npm start"
