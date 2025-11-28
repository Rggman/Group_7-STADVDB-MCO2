# System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        WEB BROWSER                              │
│                   (http://localhost:3000)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              FRONTEND (Vite + Vanilla JS)                │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Dashboard UI                                       │  │  │
│  │  │  ├─ Node Status Panel (online/offline indicators)  │  │  │
│  │  │  ├─ Query Execution Form                           │  │  │
│  │  │  ├─ Transaction Logs (last 10)                     │  │  │
│  │  │  ├─ Replication Queue                              │  │  │
│  │  │  ├─ Test Case Buttons                              │  │  │
│  │  │  └─ Node Control Buttons (Kill/Recover/View)       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                          ↓                                  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  API Client (src/api.js)                            │  │  │
│  │  │  └─ Axios HTTP requests                             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                          ↓                                  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  App State Manager (src/app.js)                    │  │  │
│  │  │  ├─ Transaction state                               │  │  │
│  │  │  ├─ Node status                                     │  │  │
│  │  │  ├─ Replication queue                               │  │  │
│  │  │  └─ Auto-refresh logic                              │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬──────────────────────────────────────┘
                         │
                    HTTP/REST API
              ┌─────────┼─────────┐
              │         │         │
    ┌─────────▼────┐   │    ┌────▼─────────┐
    │ Backend Port │   │    │ Backend Port │
    │    :5000     │   │    │    :5000     │
    └──────────────┘   │    └──────────────┘
                       │
           (Same backend, multiple connections)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│         EXPRESS SERVER + CONNECTION POOLS (server.js)           │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Request Handlers                                       │   │
│  │  ├─ GET /api/nodes/status                              │   │
│  │  ├─ POST /api/nodes/kill                               │   │
│  │  ├─ POST /api/nodes/recover                            │   │
│  │  ├─ POST /api/query/execute                            │   │
│  │  ├─ GET /api/data/:node                                │   │
│  │  ├─ GET /api/logs/transactions                         │   │
│  │  ├─ GET /api/replication/queue                         │   │
│  │  └─ POST /api/logs/clear                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                       ↓                                        │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Connection Pools (MySQL2)                              │   │
│  │                                                          │   │
│  │  Pool 0 ──────────────────────┐                         │   │
│  │  (10 connections)              │                        │   │
│  │                                │                        │   │
│  │  Pool 1 ──────────────────────┤ TCP Connections        │   │
│  │  (10 connections)              │ (Standard TCP/IP)      │   │
│  │                                │                        │   │
│  │  Pool 2 ──────────────────────┘                         │   │
│  │  (10 connections)                                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                       ↓                                        │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  In-Memory State Management                             │   │
│  │  ├─ nodeStatus{}                                        │   │
│  │  ├─ transactionLog[]                                    │   │
│  │  ├─ replicationQueue[]                                  │   │
│  │  └─ locks{} (ready for Phase 2)                         │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────┬────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ↓               ↓               ↓
   ┌─────────┐     ┌─────────┐     ┌─────────┐
   │ NODE 0  │     │ NODE 1  │     │ NODE 2  │
   │ MASTER  │     │FRAGMENT │     │FRAGMENT │
   │         │     │    A    │     │    B    │
   └────┬────┘     └────┬────┘     └────┬────┘
        │               │               │
   MySQL 8.0        MySQL 8.0       MySQL 8.0
   :60709           :60710          :60711
   
   Full Dataset   First Half    Second Half
   (All rows)    (ID % 2 = 0)  (ID % 2 = 1)
   
   Host: ccscloud.dlsu.edu.ph
```

## Component Details

### Frontend Components

```
index.html (350 lines)
├── Header: Title & description
├── Notification Area: Error/success messages
├── Dashboard Grid:
│   ├── LEFT SIDEBAR (280px)
│   │   ├── Node Status Cards (3)
│   │   │   └── Online/Offline indicator
│   │   │   └── Kill/Recover/View buttons
│   │   └── Control Panel
│   │       ├── Reinitialize Backend
│   │       ├── Start/Stop Auto-Refresh
│   │       └── Clear Logs
│   │
│   ├── CENTER (Main Content)
│   │   ├── Query Execution Form
│   │   │   ├── Node selector
│   │   │   ├── Isolation level selector
│   │   │   └── SQL query textarea
│   │   └── Transaction Logs Viewer
│   │       └── Last 10 transactions
│   │
│   └── RIGHT SIDEBAR (300px)
│       ├── Replication Queue
│       │   └── Retry button
│       └── Test Cases
│           ├── Case 1-3 buttons
│           └── Failure 1-4 buttons
│
└── Data Modal (popup)
    └── Table viewer for node data
```

### Backend Components

```
server.js (480 lines)
├── Configuration
│   ├── Database configs (3 nodes)
│   └── Connection pools
│
├── State Management
│   ├── nodeStatus{}
│   ├── transactionLog[]
│   ├── replicationQueue[]
│   └── pools{}
│
├── Health Check
│   └── GET /health
│
├── Node Management
│   ├── checkNodeHealth()
│   ├── GET /nodes/status
│   ├── POST /nodes/kill
│   └── POST /nodes/recover
│
├── Query Execution
│   ├── POST /query/execute
│   ├── Isolation level enforcement
│   ├── Query logging
│   └── Error handling
│
├── Data Retrieval
│   ├── GET /data/:node
│   └── First 50 rows + metadata
│
├── Logging System
│   ├── GET /logs/transactions
│   ├── POST /logs/clear
│   └── Transaction metadata storage
│
├── Replication Queue
│   ├── GET /replication/queue
│   └── Queue management (structure)
│
└── Error Handling
    └── Global error middleware
```

### API Client (src/api.js)

```
Exported Functions (25 total)

Node Management:
├── getNodeStatus()
├── killNode(node)
└── recoverNode(node)

Query Execution:
└── executeQuery(node, query, isolationLevel)

Data Access:
└── getNodeData(node, table)

Logs & History:
├── getTransactionLogs()
├── clearLogs()
└── getReplicationQueue()

System:
├── initDatabase()
└── healthCheck()
```

### App State Manager (src/app.js)

```
Global State Object:
├── nodeStatus{}
│   ├── node0: { status, lastCheck, error }
│   ├── node1: { status, lastCheck, error }
│   └── node2: { status, lastCheck, error }
│
├── transactionLogs[]
│   └── [{ txId, node, query, status, isolationLevel, ... }]
│
├── replicationQueue[]
│   └── [{ operation, node, status, ... }]
│
└── UI State
    ├── selectedNode
    ├── selectedIsolationLevel
    ├── autoRefresh (boolean)
    └── autoRefreshInterval (ms)

Key Functions:
├── initializeApp()          # Load backend connection
├── startAutoRefresh()       # Poll updates every 3s
├── stopAutoRefresh()        # Stop polling
├── refreshNodeStatus()      # Update status
├── executeQueryAction()     # Run SQL query
├── killNodeAction()         # Simulate failure
├── recoverNodeAction()      # Start recovery
├── viewNodeData()           # Fetch & display data
└── setState()               # Update UI
```

---

## Data Flow Examples

### Example 1: Execute Query

```
User clicks "Execute Query"
    │
    ├─> frontend/src/app.js: executeQueryAction()
    │       │
    │       └─> frontend/src/api.js: executeQuery()
    │               │
    │               └─> Axios POST to backend
    │                   (node, query, isolationLevel)
    │
    ├─> backend/server.js: POST /api/query/execute
    │       │
    │       ├─> Parse query
    │       │
    │       ├─> Get connection from pool
    │       │
    │       ├─> Set isolation level
    │       │
    │       ├─> Execute query on database
    │       │
    │       ├─> Log transaction with metadata
    │       │
    │       └─> Return results
    │
    └─> frontend receives response
        ├─> Parse results
        ├─> Add to transactionLog[]
        ├─> Update UI
        └─> Show success/error message
```

### Example 2: Check Node Status

```
Frontend auto-refresh timer triggers (every 3s)
    │
    ├─> frontend/src/app.js: refreshNodeStatus()
    │       │
    │       └─> frontend/src/api.js: getNodeStatus()
    │               │
    │               └─> Axios GET to backend
    │
    ├─> backend/server.js: GET /api/nodes/status
    │       │
    │       ├─> For each node (0, 1, 2):
    │       │   ├─> Get connection from pool
    │       │   ├─> Execute: SELECT 1
    │       │   ├─> Release connection
    │       │   └─> Set status: "online" or "offline"
    │       │
    │       └─> Return { node0, node1, node2 } with status
    │
    └─> frontend receives response
        ├─> Update state.nodeStatus{}
        ├─> Update UI status indicators
        └─> Green/gray indicator color change
```

### Example 3: Simulate Node Failure & Recovery

```
User clicks "Kill" on Node 0
    │
    ├─> frontend/src/app.js: killNodeAction('node0')
    │       │
    │       └─> frontend/src/api.js: killNode('node0')
    │               │
    │               └─> Axios POST to backend
    │
    ├─> backend/server.js: POST /api/nodes/kill
    │       │
    │       └─> nodeStatus['node0'].status = 'offline'
    │
    └─> frontend updates UI
        └─> Node 0 indicator turns gray/offline

User clicks "Recover"
    │
    ├─> frontend/src/app.js: recoverNodeAction('node0')
    │       │
    │       └─> frontend/src/api.js: recoverNode('node0')
    │               │
    │               └─> Axios POST to backend
    │
    ├─> backend/server.js: POST /api/nodes/recover
    │       │
    │       ├─> Call checkNodeHealth()
    │       │   ├─> Try connection to node0
    │       │   ├─> If successful: status = 'online'
    │       │   └─> If failed: status = 'offline'
    │       │
    │       └─> Return node status
    │
    └─> frontend updates UI
        └─> Node 0 indicator turns green/online
```

---

## Database Connection Details

```
MySQL Connection Pool Configuration:

Each node has:
├── Connection Pool (size: 10)
│   ├─ Connection 1
│   ├─ Connection 2
│   ├─ ... 
│   └─ Connection 10
│
├── Wait Queue (for requests > 10)
└── Connection Reuse & Recycling

Performance:
├─ No timeout (infinite wait for connection)
├─ 10 concurrent queries per node
├─ Total: 30 concurrent queries (all nodes)
└─ Pool handles connection management
```

---

## Transaction Lifecycle

```
1. User enters query + selects node + isolation level

2. Frontend sends request

3. Backend receives request
   ├─ Generate txId (UUID)
   ├─ Create log entry {txId, node, query, ...}
   └─ Set status = 'pending'

4. Backend executes query
   ├─ Get connection from pool
   ├─ Set isolation level (SET SESSION TRANSACTION ...)
   ├─ Execute query
   ├─ Release connection back to pool
   └─ Set status = 'committed'

5. Backend returns results
   ├─ Include transaction ID
   ├─ Include results
   └─ Include log entry

6. Frontend receives response
   ├─ Add to transactionLog[]
   ├─ Display in UI
   ├─ Show status: "committed" or "failed"
   └─ Auto-refresh updates display

7. Log is stored in memory
   ├─ Available via GET /logs/transactions
   ├─ Can be cleared with POST /logs/clear
   └─ Lost on server restart (for production, add DB persistence)
```

---

## Node Architecture

```
All three nodes are independent MySQL 8.0 instances:

┌─────────────────────────────────────────────────┐
│  NODE 0 (Master/Central)                         │
│  ccscloud.dlsu.edu.ph:60709                     │
│  Role: Full dataset + Master writes              │
│  Data: All rows (1, 2, 3, 4, 5, ... n)           │
│  Access: Read/Write from all operations          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  NODE 1 (Fragment A)                             │
│  ccscloud.dlsu.edu.ph:60710                     │
│  Role: Horizontal fragment                       │
│  Data: First half rows (1, 3, 5, ... odd IDs)   │
│  Access: Fragment-based write operations         │
│  Replication: Writes replicate to Node 0         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  NODE 2 (Fragment B)                             │
│  ccscloud.dlsu.edu.ph:60711                     │
│  Role: Horizontal fragment                       │
│  Data: Second half rows (2, 4, 6, ... even IDs) │
│  Access: Fragment-based write operations         │
│  Replication: Writes replicate to Node 0         │
└─────────────────────────────────────────────────┘

Fragmentation Strategy:
├─ By record ID (modulo 2)
├─ Node 1: ID % 2 = 0 (even)
├─ Node 2: ID % 2 = 1 (odd)
└─ (Configurable in Phase 3)
```

---

## How Phases Will Be Integrated

### Phase 2: Concurrency Control
```
Will add to backend/
├─ concurrency-manager.js      (lock management)
├─ conflict-detector.js         (detect read-write/write-write)
├─ isolation-levels.js          (enforce isolation)
└─ Modified: server.js          (integrate into query execution)

Will add to frontend/
└─ Visualization for conflicts/locks
```

### Phase 3: Replication
```
Will add to backend/
├─ replication-manager.js       (write propagation)
└─ Fragment awareness
    └─ Route writes to correct node

Will enhance in server.js/
├─ After each write, schedule replication
├─ Track replication status
└─ Queue failed replications
```

### Phase 4: Recovery
```
Will add to backend/
├─ wal-manager.js               (write-ahead logging)
├─ recovery-manager.js          (replay logs)
└─ Checkpoint system

Will modify server.js/
├─ Log all writes before execution
└─ On node recovery, replay logs
```

### Phase 5: Test Cases
```
Will add to backend/
├─ test-cases.js                (test runners)
└─ Each test case executor

Will enhance frontend/
├─ Test case buttons
└─ Display test results
```

---

## Summary

This architecture provides:

✅ **Scalable**: Connection pooling, stateless design
✅ **Maintainable**: Clear separation of concerns
✅ **Extensible**: Ready for Phase 2+ additions
✅ **Observable**: Comprehensive logging system
✅ **User-Friendly**: Responsive, real-time dashboard

Ready for the next phases of implementation!
