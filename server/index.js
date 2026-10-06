import express from 'express';
import cors from 'cors';
import { seniorsRouter } from './routes/seniors.js';
import { medicationsRouter } from './routes/medications.js';
import { emergenciesRouter } from './routes/emergencies.js';
import { notificationsRouter } from './routes/notifications.js';
import { adminRouter } from './routes/admin.js';
import { eventsHandler, getConnectedClientsCount } from './events.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite app
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// In-memory request log buffer for Backend Studio live stream
const liveRequestLogs = [];
const MAX_LOGS = 100;

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    liveRequestLogs.unshift(logEntry);
    if (liveRequestLogs.length > MAX_LOGS) liveRequestLogs.pop();
  });
  next();
});

// Root API Discovery
app.get('/', (req, res) => {
  res.json({
    name: 'CareConnect 360 REST Backend Engine',
    version: '1.0.0',
    status: 'ONLINE',
    database: 'Node 24 Native SQLite (node:sqlite WAL mode)',
    endpoints: {
      health: 'GET /api/health',
      events: 'GET /api/events (SSE Stream)',
      seniors: 'GET /api/seniors, GET /api/seniors/:id, PUT /api/seniors/:id/telemetry, POST /api/seniors/:id/fall-alert',
      medications: 'GET /api/medications, POST /api/medications, PATCH /api/medications/:id/taken, POST /api/medications/:id/remind',
      emergencies: 'GET /api/emergencies, POST /api/emergencies/trigger, PATCH /api/emergencies/:id/stage, PATCH /api/emergencies/:id/resolve',
      notifications: 'GET /api/notifications, POST /api/notifications, DELETE /api/notifications/:id',
      admin: 'GET /api/admin/overview, GET /api/admin/table/:tableName, GET /api/admin/audit-logs'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    engine: 'Node.js Express + node:sqlite',
    database: 'careconnect.db (Active)',
    activeSSEClients: getConnectedClientsCount()
  });
});

// Real-Time Server-Sent Events (SSE) Stream
app.get('/api/events', eventsHandler);

// Live logs inspector endpoint for Backend Studio
app.get('/api/admin/logs', (req, res) => {
  res.json({ success: true, count: liveRequestLogs.length, logs: liveRequestLogs });
});

// Mount modular routers
app.use('/api/seniors', seniorsRouter);
app.use('/api/medications', medicationsRouter);
app.use('/api/emergencies', emergenciesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API Route '${req.method} ${req.originalUrl}' not found.`
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('[CareConnect Server Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🚀 CareConnect 360 Express Backend is LIVE!`);
  console.log(`  📡 Port: ${PORT}`);
  console.log(`  🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  ⚡ Real-Time SSE: http://localhost:${PORT}/api/events`);
  console.log(`  🗄️ Database: Node 24 Native SQLite (WAL mode)`);
  console.log(`=======================================================`);
});

process.on('SIGTERM', () => {
  server.close(() => console.log('CareConnect backend terminated gracefully'));
});
