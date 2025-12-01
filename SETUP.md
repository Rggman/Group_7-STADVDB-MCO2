# Setup Guide - Distributed Database Simulator

## Step 1: Environment Configuration

### Backend Configuration

1. Open `backend/.env`:
   ```powershell
   cd backend
   notepad .env
   ```

2. Fill in your database credentials (you mentioned they'll be provided):
   ```
   DB_HOST_NODE0=ccscloud.dlsu.edu.ph
   DB_PORT_NODE0=60709
   DB_USER_NODE0=root
   DB_PASSWORD_NODE0=<YOUR_PASSWORD_HERE>
   
   DB_HOST_NODE1=ccscloud.dlsu.edu.ph
   DB_PORT_NODE1=60710
   DB_USER_NODE1=root
   DB_PASSWORD_NODE1=<YOUR_PASSWORD_HERE>
   
   DB_HOST_NODE2=ccscloud.dlsu.edu.ph
   DB_PORT_NODE2=60711
   DB_USER_NODE2=root
   DB_PASSWORD_NODE2=<YOUR_PASSWORD_HERE>
   
   DB_NAME=distributed_db
   PORT=5000
   NODE_ENV=development
   ```

3. Save and close

## Step 2: Backend Setup & Installation

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start backend server
npm start
```

Expected output:
```
[SERVER] Distributed DB Simulator Backend running on port 5000
[SERVER] Health check: http://localhost:5000/health

Node Configuration:
  - Node 0 (Master): ccscloud.dlsu.edu.ph:60709
  - Node 1 (Fragment A): ccscloud.dlsu.edu.ph:60710
  - Node 2 (Fragment B): ccscloud.dlsu.edu.ph:60711
```

**Keep this terminal open and running!**

## Step 3: Frontend Setup & Installation (New Terminal)

```powershell
# Open a NEW PowerShell terminal

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

The browser should automatically open to `http://localhost:3000`

## Step 4: Verify Connection

1. You should see the dashboard
2. Click "Reinitialize Backend" button
3. Check the Node Status section - you should see node status indicators
4. Check browser console (F12) for any errors

## Step 5: Test Basic Functionality

### Testing Node Connection:
1. Wait a few seconds for health checks
2. Node status indicators should show "online" or "offline"
3. Check browser console for connection messages

### Testing Query Execution:
1. Select a node from "Target Node" dropdown
2. Select an isolation level
3. Enter a simple SQL query:
   ```sql
   SELECT COUNT(*) as total FROM your_table_name;
   ```
   (Replace `your_table_name` with actual table name)
4. Click "Execute Query"
5. View results in "Recent Transactions" section

### Testing Node Simulation:
1. Click "Kill" button on any node
2. Watch status indicator change to offline
3. Click "Recover" button
4. Status should return online

## Troubleshooting

### Issue: "Cannot connect to backend"
- Verify backend is running (check terminal 1)
- Check `backend/.env` credentials
- Try health check: `http://localhost:5000/health` in browser
- Check firewall settings

### Issue: "Database connection failed"
- Verify database credentials in `.env`
- Check database is running
- Test connection with MySQL client separately
- Verify port numbers are correct

### Issue: "Frontend shows no data"
- Check browser console (F12) for errors
- Verify backend API URL in `frontend/src/api.js`
- Ensure both backend and frontend are running

### Issue: Auto-refresh not working
- Check browser console for JavaScript errors
- Click "Start Auto-Refresh" button manually
- Try refreshing page (Ctrl+R)

## Development Tips

### Backend Development
- Use `npm run dev` for auto-restart on file changes:
  ```powershell
  npm run dev
  ```
- Check `server.js` for available endpoints
- Logs will show in the terminal

### Frontend Development
- Auto-refresh is built into Vite dev server
- Changes to CSS, HTML, JS apply immediately
- Check browser console (F12) for errors
- Network tab shows API calls

### Environment Variables
- Backend looks for variables in `backend/.env`
- Frontend looks for `VITE_*` prefixed variables
- Changes require server restart (backend) or reload (frontend)

## Next Phase: Adding Database Schema

After setup is working, you'll need to:

1. Create tables on each node with the same schema:
   ```sql
   CREATE TABLE data_table (
     id INT PRIMARY KEY AUTO_INCREMENT,
     data VARCHAR(255),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

2. For horizontal fragmentation:
   - **Node 0**: All data
   - **Node 1**: Data where `id % 2 = 0` (even IDs)
   - **Node 2**: Data where `id % 2 = 1` (odd IDs)

3. Insert test data:
   ```sql
   INSERT INTO data_table (data) VALUES ('record 1');
   INSERT INTO data_table (data) VALUES ('record 2');
   -- ... more records
   ```

## Building for Production

### Backend Build
```powershell
# No build step needed for Node.js
# Just ensure dependencies are installed and .env is set
npm install --production
```

### Frontend Build
```powershell
npm run build
# Creates optimized files in 'dist' folder
npm run preview  # Preview production build locally
```

## Railway Deployment Preparation

1. Push code to GitHub:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. For Railway deployment:
   - Connect GitHub repository to Railway
   - Set environment variables in Railway dashboard
   - Backend should deploy to: `https://your-backend.railway.app`
   - Frontend points to: `https://your-backend.railway.app/api`

## Key Files Reference

| File | Purpose | Edit When |
|------|---------|-----------|
| `backend/.env` | Database credentials | Need to add passwords |
| `backend/server.js` | Main backend server | Adding new endpoints |
| `frontend/index.html` | Dashboard UI | Changing layout/buttons |
| `frontend/styles.css` | Visual styling | Adjusting colors/layout |
| `frontend/src/api.js` | API client | Changing backend URL |
| `frontend/src/app.js` | Frontend logic | Adding new features |

## Quick Command Reference

```powershell
# Backend
cd backend
npm install        # Install dependencies
npm start          # Start backend
npm run dev        # Start with auto-restart

# Frontend
cd frontend
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build

# General
npm list           # Show installed packages
npm update         # Update packages
npm audit          # Check for vulnerabilities
```

## Support

For issues or questions:
1. Check browser console (F12)
2. Check backend terminal for errors
3. Verify `.env` configuration
4. Check network tab to see API calls
5. Review README.md for more details
