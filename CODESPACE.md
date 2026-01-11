# Running SafeMind in GitHub Codespaces

This guide will help you run the SafeMind application in a GitHub Codespace.

## Quick Start (Automated Setup)

1. **Create Codespace**
   - Go to your GitHub repository
   - Click **Code** > **Codespaces** > **Create codespace**
   - Wait for the Codespace to initialize (this may take 3-5 minutes)

2. **Automatic Setup**
   - The devcontainer will automatically install PostgreSQL, Redis, and dependencies
   - Wait for the setup to complete (check terminal output)

3. **Start Services**

   Open 3 terminals in VS Code:

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - ML Service:**
   ```bash
   cd ml-service
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   **Terminal 3 - Frontend:**
   ```bash
   cd client
   npm start
   ```

4. **Access Application**
   - Click the **PORTS** tab at the bottom of VS Code
   - Click the globe icon next to port **3000** to open the frontend
   - Ports 3001 (Backend) and 8000 (ML Service) will be forwarded automatically

## Manual Setup (If Needed)

If the automatic setup doesn't work, run:

```bash
./start-codespace.sh
```

This will:
- Install PostgreSQL and Redis
- Create the database
- Set up environment files
- Install all dependencies

## Verify Services

Check that all services are running:

```bash
# PostgreSQL
sudo service postgresql status

# Redis
redis-cli ping  # Should return: PONG

# Backend API
curl http://localhost:3001/health

# ML Service
curl http://localhost:8000/health
```

## Port Forwarding

GitHub Codespaces automatically forwards these ports:
- **3000**: React Frontend (Public)
- **3001**: Express Backend API (Private)
- **8000**: FastAPI ML Service (Private)

To make a port public:
1. Go to the **PORTS** tab
2. Right-click the port
3. Select **Port Visibility** > **Public**

## Environment Variables

The default environment files work out of the box in Codespaces:

- `server/.env` - Backend configuration
- `ml-service/.env` - ML service configuration
- `client/.env` - Frontend configuration

If the frontend can't connect to the backend, update `client/.env`:

```bash
# Get your Codespace URL from the PORTS tab
# Format: https://[codespace-name]-3001.preview.app.github.dev

echo "REACT_APP_API_URL=https://[your-codespace]-3001.preview.app.github.dev" > client/.env
```

Then restart the frontend (Ctrl+C and `npm start` again).

## Database Access

Access PostgreSQL in the Codespace:

```bash
# Connect to database
sudo -u postgres psql -d safemind_db

# Common commands
\dt              # List tables
\d users         # Describe users table
SELECT * FROM users;
\q               # Quit
```

## Troubleshooting

### Services Not Starting

Restart services manually:
```bash
sudo service postgresql restart
redis-server --daemonize yes
```

### Port Already in Use

Kill the process using the port:
```bash
# Find process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use fuser
fuser -k 3001/tcp
```

### Frontend Can't Connect to Backend

1. Check backend is running: `curl http://localhost:3001/health`
2. Check CORS settings in `server/src/index.ts`
3. Update `client/.env` with the correct backend URL from PORTS tab

### Database Connection Error

Reset the database:
```bash
sudo -u postgres psql -c "DROP DATABASE safemind_db;"
sudo -u postgres psql -c "CREATE DATABASE safemind_db;"
sudo -u postgres psql -c "ALTER DATABASE safemind_db OWNER TO safemind;"
sudo -u postgres psql -d safemind_db -c "GRANT ALL ON SCHEMA public TO safemind;"
```

Then restart the backend server.

## Development Workflow

### Making Code Changes

All services support hot reload:
- **Backend**: Nodemon automatically restarts on file changes
- **ML Service**: Uvicorn automatically reloads
- **Frontend**: React automatically recompiles

### Testing Registration

1. Open the frontend URL (port 3000)
2. Navigate to Register page
3. Fill in:
   - Email: test@example.com
   - Password: TestPassword123
   - First Name: Test
   - Last Name: User
4. Submit

### Testing API Endpoints

Use the VS Code REST Client or curl:

```bash
# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Testing ML Service

```bash
# Analyze text
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a test message"}'
```

## Stopping Services

To stop the application:

1. Press `Ctrl+C` in each terminal to stop the services
2. Optionally stop database services:
   ```bash
   sudo service postgresql stop
   redis-cli shutdown
   ```

## Deleting Codespace

When you're done:
1. Go to GitHub > Your repositories > safemind-draft-2
2. Click **Code** > **Codespaces**
3. Click the **...** menu next to your Codespace
4. Select **Delete**

## Performance Tips

- **Prebuild**: Consider setting up a prebuild for faster Codespace creation
- **Machine Type**: Use at least a 4-core machine for better performance
- **Close Unused Services**: Only run services you're actively developing

## VS Code Extensions

Recommended extensions (auto-installed via devcontainer):
- ESLint - JavaScript linting
- Prettier - Code formatting
- Python - Python support
- Pylance - Python IntelliSense

## Additional Resources

- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)
- [Devcontainer Reference](https://containers.dev/)
- SafeMind README: `README.md`
- Setup Guide: `SETUP.md`

## Support

If you encounter issues:
1. Check the terminal output for error messages
2. Verify all services are running
3. Check the PORTS tab for correct port forwarding
4. Review logs: `tail -f /tmp/server.log`
