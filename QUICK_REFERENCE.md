# Quick Reference Guide

## Project Structure

```
MCO2/
├── README.md                      # Main project documentation
├── SETUP.md                       # Quick setup instructions
├── IMPLEMENTATION_ROADMAP.md      # Detailed implementation plan
├── RAILWAY_DEPLOYMENT.md          # Railway deployment guide
├── .gitignore
├── docker-compose.yml
│
├── backend/
│   ├── package.json              # Dependencies
│   ├── server.js                 # Main Express server
│   ├── .env                      # Environment (fill with credentials)
│   ├── .env.example              # Template
│   └── Dockerfile                # (To be created)
│
└── frontend/
    ├── package.json              # Dependencies
    ├── index.html                # Dashboard UI
    ├── styles.css                # Styling
    ├── vite.config.js            # Vite config
    ├── Dockerfile                # (To be created)
    └── src/
        ├── api.js                # API client
        └── app.js                # App logic
```

## Quick Start (5 minutes)

### Terminal 1: Backend
```powershell
cd backend
# Edit .env with your credentials
notepad .env
# Then:
npm install
npm start
```

### Terminal 2: Frontend
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in browser.

## API Endpoints Reference

### Node Management
```
GET  /api/nodes/status              # Get all node statuses
POST /api/nodes/kill                # Kill node (simulate failure)
POST /api/nodes/recover             # Recover node
```

### Query Execution
```
POST /api/query/execute             # Execute query on node
  Body: {
    node: "node0|node1|node2",
    query: "SELECT ...",
    isolationLevel: "READ_COMMITTED|READ_UNCOMMITTED|REPEATABLE_READ|SERIALIZABLE"
  }
```

### Data & Logs
```
GET  /api/data/:node                # Get 50 rows from node
GET  /api/logs/transactions         # Get all transaction logs
GET  /api/replication/queue         # Get replication queue
POST /api/logs/clear                # Clear all logs
```

### System
```
GET  /api/health                    # Backend health check
POST /api/db/init                   # Initialize database
```

## Environment Variables

### Backend (.env)
```
DB_HOST_NODE0=...
DB_PORT_NODE0=...
DB_USER_NODE0=...
DB_PASSWORD_NODE0=...
[repeat for NODE1, NODE2]
DB_NAME=distributed_db
PORT=5000
NODE_ENV=development
```

### Frontend (vite.config.js)
```javascript
VITE_API_URL=http://localhost:5000/api  // For development
```

## Common Commands

### Backend
```powershell
npm install           # Install dependencies
npm start            # Start server
npm run dev          # Start with auto-reload
npm list             # Show packages
npm update           # Update packages
```

### Frontend
```powershell
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Git
```powershell
git init             # Initialize repo
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push origin main # Push to GitHub
```

## Database Configuration Reference

### Your Setup
- **Node 0 (Master)**: ccscloud.dlsu.edu.ph:60709 - Full dataset
- **Node 1 (Fragment A)**: ccscloud.dlsu.edu.ph:60710 - First half rows
- **Node 2 (Fragment B)**: ccscloud.dlsu.edu.ph:60711 - Second half rows
- **Username**: root
- **Password**: (You provide)
- **Database**: distributed_db

### Connection Testing
```powershell
# Test from backend terminal
npm start
# Check logs for connection status

# Or test with MySQL client
mysql -h ccscloud.dlsu.edu.ph -P 60709 -u root -p
```

## Features Implemented (Phase 1)

✅ Multi-node connection management
✅ Basic dashboard UI
✅ Query execution on selected nodes
✅ Isolation level selection
✅ Node failure simulation
✅ Node recovery initiation
✅ Transaction logging
✅ Real-time node status
✅ Data viewing (50 rows)
✅ Auto-refresh mechanism

## Features To Implement (Phases 2-5)

- [ ] Phase 2: Concurrency control (locks, conflict detection)
- [ ] Phase 3: Replication logic (write propagation, retry queue)
- [ ] Phase 4: Failure recovery (WAL, recovery manager)
- [ ] Phase 5: Test case automation

See `IMPLEMENTATION_ROADMAP.md` for detailed implementation steps.

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Backend won't start | Check .env credentials, verify DB is running |
| Frontend won't load | Verify backend running on :5000, check CORS |
| Nodes show offline | Wait 5 seconds, click "Reinitialize Backend" |
| Query fails | Check SQL syntax, verify table exists on node |
| CORS error | Backend CORS already configured, check API URL |

## Example SQL for Testing

```sql
-- Create test table (run once on each node)
CREATE TABLE IF NOT EXISTS data_table (
  id INT PRIMARY KEY AUTO_INCREMENT,
  data VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO data_table (data) VALUES ('Record 1');
INSERT INTO data_table (data) VALUES ('Record 2');
INSERT INTO data_table (data) VALUES ('Record 3');

-- Test queries
SELECT * FROM data_table;
SELECT COUNT(*) FROM data_table;
SELECT * FROM data_table WHERE id = 1;
UPDATE data_table SET data = 'Updated' WHERE id = 1;
```

## Dashboard UI Sections

### Left Sidebar: Node Management
- Node status indicators (online/offline)
- Kill/Recover buttons per node
- View Data button
- Control Panel (reinitialize, logs)

### Center: Query Execution
- Target node selector
- Isolation level selector
- SQL query input
- Transaction logs (last 10)

### Right Sidebar: Replication & Testing
- Replication queue display
- Retry button
- Test case buttons

## Browser Console Tips

Press F12 to open developer tools, check:
- **Console**: Application errors/messages
- **Network**: API call details
- **Application**: Local storage
- **Elements**: HTML structure

## Performance Notes

- Connection pooling: 10 connections per node
- Auto-refresh interval: 3000ms (configurable)
- Transaction log max display: 10 entries
- Data view limit: 50 rows
- Lock timeout: 5 seconds (configurable)

## Next Steps After Setup

1. ✅ Verify all three nodes connect
2. ✅ Execute test SQL queries
3. ✅ Test node failure simulation
4. ✅ Review transaction logs
5. 📋 Implement Phase 2 (Concurrency)
6. 📋 Implement Phase 3 (Replication)
7. 📋 Deploy on Railway

## File Edit Checklist

When getting started, you need to edit:

- [ ] `backend/.env` - Add your database credentials
- [ ] Optional: `backend/server.js` - Modify if DB schema differs
- [ ] Optional: `frontend/src/api.js` - If backend URL changes

Everything else is ready to go!

## Development Workflow

```powershell
# 1. Start backend
cd backend
npm start

# 2. In new terminal, start frontend
cd frontend
npm run dev

# 3. Make changes to code
# Frontend: Auto-refreshes in browser
# Backend: Need to restart with Ctrl+C and npm start

# 4. Test changes
# Use browser to test UI
# Use API endpoint logs to verify

# 5. Commit changes
git add .
git commit -m "Feature description"
git push origin main
```

## Performance Tuning (Future)

When implementing phases, consider:

1. **Concurrency Phase**
   - Lock queue optimization
   - Deadlock detection algorithm efficiency
   - Timeout handling

2. **Replication Phase**
   - Batch replication operations
   - Async processing
   - Retry backoff strategy

3. **Recovery Phase**
   - WAL checkpoint frequency
   - Recovery log compression
   - Parallel recovery

4. **Test Cases**
   - Transaction throughput tracking
   - Conflict rate measurement
   - Latency monitoring

## Railway Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Create backend service
- [ ] Add environment variables
- [ ] Create frontend service
- [ ] Set backend API URL for frontend
- [ ] Test deployed application
- [ ] Set up custom domain (optional)
- [ ] Monitor logs and performance

See `RAILWAY_DEPLOYMENT.md` for detailed instructions.

## Support Resources

- Node.js Docs: https://nodejs.org/docs
- Express Docs: https://expressjs.com
- MySQL2 Docs: https://github.com/sidorares/node-mysql2
- Vite Docs: https://vitejs.dev
- Railway Docs: https://railway.app/docs

## Key Concepts

### Distributed Database
- Data spread across multiple nodes
- Each node handles portion of data
- Replication for consistency

### Concurrency Control
- Multiple transactions simultaneously
- Isolation levels control visibility
- Locking prevents conflicts

### Replication
- Write propagation between nodes
- Retry queue for failed operations
- Eventually consistent

### Recovery
- Write-Ahead Logging (WAL)
- Transaction replay on recovery
- Synchronization with master

### Fragmentation
- Horizontal: Different rows on different nodes
- Node 0: Full dataset (master)
- Node 1: Even ID rows
- Node 2: Odd ID rows

---

**You're ready to start! Begin with:**
1. Fill in `.env` credentials
2. Run `npm install` in both folders
3. Start backend and frontend
4. Open `http://localhost:3000`
5. Verify connections work
