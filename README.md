# Distributed Database Simulator

A web application for demonstrating concurrency control, replication, and global crash recovery across distributed database nodes.

## System Overview

- **Node 0 (Master)**: Central node with full dataset
- **Node 1 (Fragment A)**: First half of rows (horizontal fragmentation)
- **Node 2 (Fragment B)**: Second half of rows (horizontal fragmentation)

All three nodes share the same schema, but data is distributed horizontally.

## Project Structure

```
MCO2/
├── backend/          # Node.js Express backend
│   ├── server.js     # Main server file
│   ├── package.json  # Dependencies
│   ├── .env.example  # Environment template
│   └── .env          # Environment variables (fill with your credentials)
└── frontend/         # Vite + Vanilla JS frontend
    ├── index.html    # Main HTML file
    ├── styles.css    # CSS styling
    ├── src/
    │   ├── api.js    # API client
    │   └── app.js    # Application logic
    ├── vite.config.js
    └── package.json
```

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Three MySQL database instances running
- Database connection credentials

### Backend Setup

1. Navigate to backend folder:
   ```powershell
   cd backend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   DB_HOST_NODE0=ccscloud.dlsu.edu.ph
   DB_PORT_NODE0=60709
   DB_USER_NODE0=root
   DB_PASSWORD_NODE0=your_password
   
   DB_HOST_NODE1=ccscloud.dlsu.edu.ph
   DB_PORT_NODE1=60710
   DB_USER_NODE1=root
   DB_PASSWORD_NODE1=your_password
   
   DB_HOST_NODE2=ccscloud.dlsu.edu.ph
   DB_PORT_NODE2=60711
   DB_USER_NODE2=root
   DB_PASSWORD_NODE2=your_password
   
   PORT=5000
   ```

4. Start the backend:
   ```powershell
   npm start
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. In a new terminal, navigate to frontend folder:
   ```powershell
   cd frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start development server:
   ```powershell
   npm run dev
   ```
   Frontend will open on `http://localhost:3000`

## Current Features (Phase 1)

✅ **Multi-Node Connection Management**
- Connects to three separate database instances
- Real-time node health checks
- Connection pooling with error handling

✅ **Basic UI Dashboard**
- Node status indicators (online/offline)
- Real-time status updates with auto-refresh
- Query execution interface
- Isolation level selection

✅ **Query Execution**
- Execute SQL queries on selected nodes
- Transaction logging
- Selectable isolation levels

✅ **Node Management**
- Simulate node failures (kill)
- Simulate node recovery
- Status tracking

✅ **Data Viewing**
- View first 50 rows from any node
- Modal-based data display

## Next Steps - Implementation Roadmap

### Phase 2: Concurrency Control Implementation

1. **Transaction Manager Enhancement**
   ```js
   // Features to implement:
   - Lock management (READ, WRITE locks)
   - Deadlock detection and resolution
   - Conflict detection
   - Wait-for graphs
   - Two-phase locking (2PL)
   - Isolation level enforcement
   ```

   Files to modify:
   - `backend/concurrency.js` (new)
   - `backend/transaction-manager.js` (new)
   - Implement in `server.js` query execution

2. **Conflict Detection**
   - Track read/write sets per transaction
   - Detect read-write conflicts
   - Detect write-write conflicts
   - Implement conflict resolution strategies

3. **Simulate Concurrent Operations**
   ```js
   // Frontend: Implement concurrent transaction launching
   - Multiple simultaneous queries
   - Track transaction states
   - Show conflicts in UI
   - Display wait chains
   ```

### Phase 3: Replication Logic

1. **Replication Manager**
   ```js
   // backend/replication-manager.js (new)
   - Track which node owns which rows
   - Implement write propagation:
     * Node1/Node2 write → replicate to Node0
     * Node0 write → replicate to appropriate fragment
   - Create replication queue for failed replications
   - Implement retry logic
   ```

2. **Replication Failure Handling**
   - Add items to retry queue on replication failure
   - Implement retry button functionality
   - Track replication history with timestamps

3. **Fragment Awareness**
   ```js
   // Determine fragment ownership
   // Example: if ID % 2 == 0 -> Node1, else -> Node2
   function determineFragment(recordId) {
     if (recordId % 2 === 0) return 'node1';
     return 'node2';
   }
   ```

### Phase 4: Failure & Recovery Simulation

1. **Node State Persistence**
   - Track unfinished transactions during node failure
   - Store transaction logs (Write-Ahead Logging)
   - Implement recovery log replay

2. **Automatic Recovery Process**
   ```js
   // backend/recovery-manager.js (new)
   - On recovery:
     1. Replay transaction logs
     2. Check replication queue
     3. Apply pending replications
     4. Synchronize with master node
   ```

3. **Redirect Read Operations**
   - When node is offline, route reads to available node
   - Implement read-anywhere strategy

### Phase 5: Test Case Automation

Implement test case runners:

1. **Test Case 1: Concurrent Reads**
   ```js
   // Launch 2 simultaneous SELECT queries on same record
   // Show: Both should succeed, no conflicts
   ```

2. **Test Case 2: Write + Reads**
   ```js
   // Launch 1 write + 2 reads simultaneously
   // Show: Isolation level determines visibility
   ```

3. **Test Case 3: Concurrent Writes**
   ```js
   // Launch 2 writes on same record
   // Show: Conflict detection, one should rollback
   ```

4. **Failure Cases**
   ```js
   // Failure 1: Replication fails writing to Node0
   // - Add to queue, show retry
   
   // Failure 2: Node0 recovery and sync
   // - Kill Node0, perform writes, recover
   // - Show recovery log replay
   
   // Failure 3: Replication from Node0 fails
   // - Kill target fragment, write to Master
   // - Show pending replication
   
   // Failure 4: Fragment recovery with logs
   // - Kill fragment node, recover
   // - Show log replay
   ```

### Phase 6: Advanced Features

1. **Visualization Enhancements**
   - Add transaction timeline chart
   - Show dependency graphs
   - Replication status timeline

2. **Performance Metrics**
   - Transaction throughput
   - Conflict rate
   - Replication latency
   - Lock wait times

3. **Export & Analysis**
   - Export transaction logs as CSV
   - Generate reports
   - Analyze patterns

## Backend API Endpoints

### Node Management
- `GET /api/nodes/status` - Get all node statuses
- `POST /api/nodes/kill` - Kill a node (simulate failure)
- `POST /api/nodes/recover` - Recover a node

### Query Execution
- `POST /api/query/execute` - Execute query on specific node
  ```json
  {
    "node": "node0",
    "query": "SELECT * FROM table",
    "isolationLevel": "READ_COMMITTED"
  }
  ```

### Data & Logs
- `GET /api/data/:node` - Get data from node
- `GET /api/logs/transactions` - Get transaction logs
- `GET /api/replication/queue` - Get replication queue
- `POST /api/logs/clear` - Clear all logs

### Database
- `POST /api/db/init` - Initialize database

## Environment Variables

Create `.env` file in backend folder with:

```
DB_HOST_NODE0=hostname
DB_PORT_NODE0=port
DB_USER_NODE0=username
DB_PASSWORD_NODE0=password

DB_HOST_NODE1=hostname
DB_PORT_NODE1=port
DB_USER_NODE1=username
DB_PASSWORD_NODE1=password

DB_HOST_NODE2=hostname
DB_PORT_NODE2=port
DB_USER_NODE2=username
DB_PASSWORD_NODE2=password

DB_NAME=database_name
PORT=5000
NODE_ENV=development
```

## Deployment on Railway

1. Create Railway account
2. Connect GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy backend and frontend as separate services
5. Configure custom domains

### Railway Backend Deployment
```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node server.js"
```

### Railway Frontend Deployment
```yaml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run build && npm run preview"
```

## Technology Stack

- **Backend**: Node.js, Express, MySQL2
- **Frontend**: Vanilla JavaScript, Vite, Axios
- **Deployment**: Railway

## Key Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Main Express server, connection pools, APIs |
| `frontend/index.html` | Main dashboard UI |
| `frontend/styles.css` | Responsive dark theme styling |
| `frontend/src/api.js` | Axios API client |
| `frontend/src/app.js` | Application state management |

## Development Notes

- All times in logs use UTC
- Transaction IDs are UUIDs (first 8 chars shown)
- Auto-refresh interval: 3000ms (configurable)
- Connection pool limit: 10 per node
- Max data display: 50 rows per view

## Troubleshooting

### Backend won't connect
- Check `.env` credentials
- Verify database nodes are running
- Check firewall/network access

### Frontend can't reach backend
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API_URL in frontend matches backend

### Queries failing
- Check SQL syntax
- Verify table names
- Check user permissions on database

## Future Considerations

- Add WebSocket for real-time updates
- Implement distributed transaction ID generation
- Add multi-version concurrency control (MVCC)
- Implement cascade replication
- Add conflict resolution strategies
- Implement quorum-based reads/writes
- Add performance monitoring dashboard
