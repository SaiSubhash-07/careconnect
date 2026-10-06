import { Router } from 'express';
import { db } from '../db.js';

export const adminRouter = Router();

// GET /api/admin/overview - Database stats and summary
adminRouter.get('/overview', (req, res) => {
  try {
    const seniorsCount = db.prepare('SELECT COUNT(*) as count FROM seniors').get().count;
    const medsCount = db.prepare('SELECT COUNT(*) as count FROM medications').get().count;
    const emergenciesCount = db.prepare('SELECT COUNT(*) as count FROM emergencies').get().count;
    const telemetryCount = db.prepare('SELECT COUNT(*) as count FROM telemetry').get().count;
    const notificationsCount = db.prepare('SELECT COUNT(*) as count FROM notifications').get().count;
    const auditLogsCount = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;

    res.json({
      success: true,
      engine: 'Node.js SQLite (node:sqlite WAL Mode)',
      port: 5000,
      timestamp: new Date().toISOString(),
      stats: {
        seniors: seniorsCount,
        medications: medsCount,
        emergencies: emergenciesCount,
        telemetry: telemetryCount,
        notifications: notificationsCount,
        auditLogs: auditLogsCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/table/:tableName - Inspect raw rows of any table
adminRouter.get('/table/:tableName', (req, res) => {
  try {
    const allowedTables = ['seniors', 'medications', 'emergencies', 'telemetry', 'notifications', 'audit_logs'];
    const { tableName } = req.params;

    if (!allowedTables.includes(tableName)) {
      return res.status(400).json({ success: false, error: `Table '${tableName}' is not accessible or does not exist.` });
    }

    const rows = db.prepare(`SELECT * FROM ${tableName} ORDER BY 1 DESC LIMIT 100`).all();
    res.json({
      success: true,
      table: tableName,
      count: rows.length,
      rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/audit-logs - Fetch latest audit logs
adminRouter.get('/audit-logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50').all();
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
