# SafeMind Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed
- Redis installed
- Python 3.9+ (for ML service)

## Quick Start

### 1. Start PostgreSQL and Redis

```bash
# Start PostgreSQL
service postgresql start

# Start Redis
redis-server --daemonize yes
```

### 2. Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# Run these commands in psql:
CREATE DATABASE safemind_db;
CREATE USER safemind WITH PASSWORD 'safemind_dev_password';
GRANT ALL PRIVILEGES ON DATABASE safemind_db TO safemind;
GRANT ALL ON SCHEMA public TO safemind;
ALTER DATABASE safemind_db OWNER TO safemind;
\q
```

### 3. Setup Environment Variables

```bash
# Server
cp server/.env.example server/.env

# ML Service
cp ml-service/.env.example ml-service/.env

# Client
cp client/.env.example client/.env
```

### 4. Install Dependencies

```bash
# Backend
cd server
npm install

# ML Service
cd ../ml-service
pip install -r requirements.txt

# Frontend
cd ../client
npm install
```

### 5. Start Services

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - ML Service:**
```bash
cd ml-service
uvicorn main:app --reload --port 8000
```

**Terminal 3 - Frontend:**
```bash
cd client
npm start
```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- ML Service: http://localhost:8000

## Testing Registration

You can now register a new user:
1. Go to http://localhost:3000
2. Click "Register" (or navigate to register page)
3. Fill in:
   - Email: your@email.com
   - Password: YourPassword123
   - First Name: Your First Name
   - Last Name: Your Last Name
   - Role: guardian (default)

## Troubleshooting

### "Failed to Register" Error

This was caused by:
1. PostgreSQL not running
2. Database not created
3. Backend server not started

**Solution Applied:**
- Started PostgreSQL and Redis services
- Created database and user
- Fixed TypeScript compilation errors
- Started backend server successfully

### Database Connection Issues

If you see database connection errors:
```bash
# Check if PostgreSQL is running
service postgresql status

# Check if database exists
psql -U postgres -l | grep safemind
```

### Redis Connection Issues

If you see Redis connection errors:
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not running, start it:
redis-server --daemonize yes
```

### Backend Won't Start

Check the logs:
```bash
# If running in background, check logs
tail -f /tmp/server.log

# Or run in foreground for debugging
cd server
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Youth Management
- `GET /api/youth` - List all youth
- `POST /api/youth` - Create youth profile
- `GET /api/youth/:id` - Get youth details
- `PUT /api/youth/:id` - Update youth profile

### Analysis
- `POST /api/analyze` - Submit text for analysis
- `GET /api/analyze/youth/:youthId` - Get analyses for youth

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get alert details
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert
- `PUT /api/alerts/:id/resolve` - Resolve alert

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/youth/:youthId` - Youth report
- `GET /api/reports/trends` - Trend analysis

## Development Notes

### Database Schema

The application automatically creates tables on startup in development mode:
- `users` - Guardian/counselor accounts
- `youth` - Youth profiles being monitored
- `conversations` - AI conversation sessions
- `analyses` - Toxicity analysis results
- `alerts` - Safety alerts generated

### ML Service

The ML service uses the Detoxify model which provides:
- Toxicity detection
- Threat detection
- Insult detection
- Identity attack detection
- Obscene language detection

### SendGrid Integration

To enable email alerts:
1. Sign up for SendGrid (free tier available)
2. Create an API key
3. Add to `server/.env`:
   ```
   SENDGRID_API_KEY=SG.your_actual_key_here
   SENDGRID_FROM_EMAIL=alerts@yourdomain.com
   ```

## Security Notes

**Important:** Change these values in production:
- `JWT_SECRET` in server/.env
- Database passwords
- Enable HTTPS
- Configure proper CORS origins
- Enable rate limiting with Redis

## Next Steps

1. Set up SendGrid for email notifications
2. Create youth profiles
3. Test text analysis functionality
4. Configure alert thresholds
5. Set up monitoring dashboard

## Support

For issues or questions:
- Check server logs: `tail -f /tmp/server.log`
- Check database: `psql -U postgres -d safemind_db`
- Check Redis: `redis-cli monitor`
