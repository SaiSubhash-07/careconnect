import { Router } from 'express';
import { db } from '../db.js';
import { broadcastEvent } from '../events.js';
import crypto from 'node:crypto';

export const notificationsRouter = Router();

// GET /api/notifications - List all notifications with optional receiver or unread filter
notificationsRouter.get('/', (req, res) => {
  try {
    const { receiver } = req.query;
    let query = 'SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 100';
    let rows = db.prepare(query).all();

    // Parse receivers JSON array
    const notifications = rows.map(n => ({
      ...n,
      receivers: n.receivers ? JSON.parse(n.receivers) : ['All']
    }));

    if (receiver) {
      const filtered = notifications.filter(n =>
        n.receivers.includes(receiver) || n.receivers.includes('All')
      );
      return res.json({ success: true, count: filtered.length, notifications: filtered });
    }

    res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/notifications - Create a new notification & broadcast via SSE
notificationsRouter.post('/', (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      receivers = ['Caregiver', 'Family', 'Volunteer'],
      seniorId,
      seniorName
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required' });
    }

    const id = `notif-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const timestamp = new Date().toISOString();
    const receiversStr = JSON.stringify(Array.isArray(receivers) ? receivers : [receivers]);

    db.prepare(`
      INSERT INTO notifications (id, title, message, type, receivers, timestamp, isRead)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(id, title, message, type, receiversStr, timestamp);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (action, targetUser, details, timestamp)
      VALUES (?, ?, ?, ?)
    `).run('NOTIFICATION_SENT', seniorName || seniorId || 'Broadcast', `[${type.toUpperCase()}] ${title}: ${message}`, timestamp);

    const createdNotif = {
      id,
      title,
      message,
      type,
      receivers: Array.isArray(receivers) ? receivers : [receivers],
      timestamp,
      isRead: 0
    };

    // Real-time broadcast to connected clients
    broadcastEvent('notification:new', createdNotif);

    res.status(201).json({
      success: true,
      message: 'Notification sent and broadcast successfully',
      notification: createdNotif
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
notificationsRouter.patch('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    broadcastEvent('notification:read', { id });
    res.json({ success: true, message: 'Notification marked as read', id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/notifications/:id - Dismiss / remove notification by ID
notificationsRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM notifications WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    broadcastEvent('notification:dismiss', { id });
    res.json({ success: true, message: 'Notification removed successfully', id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/notifications - Clear all notifications
notificationsRouter.delete('/', (req, res) => {
  try {
    db.prepare('DELETE FROM notifications').run();
    broadcastEvent('notification:clear_all', {});
    res.json({ success: true, message: 'All notifications cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
