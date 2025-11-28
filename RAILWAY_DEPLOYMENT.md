# Railway Deployment Guide

This guide explains how to deploy the Distributed Database Simulator on Railway.

## Prerequisites

1. GitHub account with repository containing the project
2. Railway account (railway.app)
3. Database nodes already set up on cloud (you have these at ccscloud.dlsu.edu.ph)

## Step 1: Prepare GitHub Repository

### 1.1 Initialize Git (if not already done)

```powershell
cd c:\Users\Ganayo\Desktop\MCO2
git init
git add .
git commit -m "Initial commit: Distributed DB Simulator base setup"
```

### 1.2 Create Repository on GitHub

1. Go to github.com and create new repository
2. Name it: `distributed-db-simulator`
3. Copy the repository URL

### 1.3 Push to GitHub

```powershell
git remote add origin https://github.com/YOUR_USERNAME/distributed-db-simulator.git
git branch -M main
git push -u origin main
```

## Step 2: Create Railway Configuration Files

### 2.1 Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# Use Node.js 18 slim image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "server.js"]
```

### 2.2 Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM node:18-slim

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

### 2.3 Railway Configuration File

Create `railway.toml` in root:

```toml
[build]
builder = "dockerfile"

[[services]]
name = "backend"
dockerfile = "./backend/Dockerfile"
port = 5000

[[services]]
name = "frontend"
dockerfile = "./frontend/Dockerfile"
port = 3000
```

Or separate railway.toml for each service:

**backend/railway.toml:**
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
port = 5000
startCommand = "node server.js"
```

**frontend/railway.toml:**
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
port = 3000
```

## Step 3: Deploy on Railway

### 3.1 Connect to Railway

1. Go to railway.app
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your `distributed-db-simulator` repository

### 3.2 Deploy Backend

1. Click "Add Service"
2. Select "GitHub Repository"
3. Choose your repo
4. Configure settings:
   - **Source**: `backend/` folder
   - **Dockerfile**: `backend/Dockerfile`
   - **Port**: `5000`

5. Add environment variables:
   ```
   DB_HOST_NODE0=ccscloud.dlsu.edu.ph
   DB_PORT_NODE0=60709
   DB_USER_NODE0=root
   DB_PASSWORD_NODE0=YOUR_PASSWORD
   
   DB_HOST_NODE1=ccscloud.dlsu.edu.ph
   DB_PORT_NODE1=60710
   DB_USER_NODE1=root
   DB_PASSWORD_NODE1=YOUR_PASSWORD
   
   DB_HOST_NODE2=ccscloud.dlsu.edu.ph
   DB_PORT_NODE2=60711
   DB_USER_NODE2=root
   DB_PASSWORD_NODE2=YOUR_PASSWORD
   
   DB_NAME=distributed_db
   PORT=5000
   NODE_ENV=production
   ```

6. Deploy

### 3.3 Deploy Frontend

1. Click "Add Service"
2. Select "GitHub Repository"
3. Choose your repo
4. Configure settings:
   - **Source**: `frontend/` folder
   - **Dockerfile**: `frontend/Dockerfile`
   - **Port**: `3000`

5. Add environment variables:
   ```
   VITE_API_URL=https://backend-service-url.railway.app/api
   NODE_ENV=production
   ```
   (Replace `backend-service-url` with your actual Railway backend URL)

6. Deploy

## Step 4: Configure Custom Domains (Optional)

### Backend Domain
1. In Railway dashboard, go to Backend service
2. Settings → Domains
3. Add custom domain or use Railway-provided URL

### Frontend Domain
1. In Railway dashboard, go to Frontend service
2. Settings → Domains
3. Add custom domain or use Railway-provided URL

## Step 5: Link Services

### Connect Frontend to Backend API

1. In Frontend environment variables, update:
   ```
   VITE_API_URL=https://YOUR_BACKEND_DOMAIN/api
   ```

2. Redeploy frontend

## Monitoring & Logs

### View Logs
1. Go to Railway dashboard
2. Select service
3. Click "Logs" tab
4. Real-time logs appear

### Monitor Performance
- CPU usage
- Memory usage
- Network I/O
- Request count

## Environment Variables on Railway

| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_HOST_NODEx` | Database hostname | `ccscloud.dlsu.edu.ph` |
| `DB_PORT_NODEx` | Database port | `60709` |
| `DB_USER_NODEx` | Database user | `root` |
| `DB_PASSWORD_NODEx` | Database password | (secret) |
| `DB_NAME` | Database name | `distributed_db` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` |
| `VITE_API_URL` | Backend API URL | `https://backend.railway.app/api` |

## Troubleshooting Railway Deployment

### Build Fails
- Check Dockerfile syntax
- Verify `package.json` exists in correct folder
- Check node_modules isn't in .gitignore (it should be)

### Container Won't Start
- Check logs for errors
- Verify environment variables are set
- Check PORT variable matches Dockerfile EXPOSE

### Frontend Can't Reach Backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Verify backend service is running

### Database Connection Fails
- Verify credentials in environment variables
- Check database is accessible from Railway
- Test connection with MySQL client separately

### Logs Show Errors
```
# Common Railway errors and fixes:

# "Cannot find module"
npm install  # Run locally and push node_modules? No!
# Solution: Ensure package-lock.json is committed

# "ENOTFOUND hostname"
# Solution: Check database hostname is correct and accessible

# "Port already in use"
# Solution: Change PORT variable or check for stuck processes
```

## Continuous Deployment

Railway automatically redeploys when you push to your GitHub branch:

```powershell
# Make changes locally
git add .
git commit -m "Add feature: ..."
git push origin main

# Railway automatically detects push and redeploys
# Watch logs in Railway dashboard
```

## Database Schema Setup on Railway

Since your databases are already external (at ccscloud.dlsu.edu.ph), you need to:

1. Create tables manually or through a setup script:

**Create `scripts/setup-db.js`:**

```javascript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST_NODE0,
  port: parseInt(process.env.DB_PORT_NODE0),
  user: process.env.DB_USER_NODE0,
  password: process.env.DB_PASSWORD_NODE0,
  database: process.env.DB_NAME
};

async function setupDatabase() {
  try {
    const connection = await mysql.createConnection(config);
    
    // Create table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS data_table (
        id INT PRIMARY KEY AUTO_INCREMENT,
        data VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Table created successfully');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

setupDatabase();
```

Run once:
```powershell
node scripts/setup-db.js
```

## Production Best Practices

1. **Secrets Management**
   - Never commit `.env` files
   - Use Railway secrets for sensitive data
   - Rotate credentials regularly

2. **Error Handling**
   - Enable detailed logging in production
   - Set up error alerts
   - Monitor failed requests

3. **Performance**
   - Use connection pooling (already implemented)
   - Enable caching where possible
   - Monitor database query performance

4. **Security**
   - Enable HTTPS (Railway does this automatically)
   - Validate all inputs
   - Implement rate limiting
   - Use strong database passwords

5. **Monitoring**
   - Set up alerts for failures
   - Monitor resource usage
   - Track API response times
   - Log important events

## Rollback & Recovery

If deployment fails:

1. Go to Railway dashboard
2. Select service
3. Click "Deployments" tab
4. Select previous working deployment
5. Click "Redeploy"

## Updating Backend After Initial Deployment

After initial setup, to make updates:

```powershell
# Make code changes
git add .
git commit -m "Update: improved concurrency control"

# Push to GitHub
git push origin main

# Railway automatically redeploys
# Monitor in Railway dashboard
```

## Cost Optimization

Railway pricing:
- First $5/month free
- Then $0.50/CPU hour + $0.50/GB RAM hour
- Database connections: $1.50 each

To minimize costs:
- Use smaller container sizes during development
- Scale up only when needed
- Use Railway's own databases if considering internal DBs
- Monitor resource usage

## Next Steps After Deployment

1. Test backend API endpoints with Postman or curl
2. Verify frontend connects to backend
3. Run test cases to verify functionality
4. Monitor logs for issues
5. Set up CI/CD for automatic deployments

## Support & Resources

- Railway Docs: https://railway.app/docs
- Node.js on Railway: https://railway.app/docs/guides/nodejs
- Docker Documentation: https://docs.docker.com

---

**Your deployment URL will look like:**
- Backend: `https://distributed-db-backend-prod.railway.app`
- Frontend: `https://distributed-db-frontend-prod.railway.app`

Update frontend's `VITE_API_URL` to match your backend URL!
