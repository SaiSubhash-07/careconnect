import { Router } from 'express';
import { db } from '../db.js';
import { broadcastEvent } from '../events.js';

export const emergenciesRouter = Router();

// GET all emergencies
emergenciesRouter.get('/', (req, res) => {
  try {
    const emergencies = db.prepare('SELECT * FROM emergencies ORDER BY id DESC').all();
    res.json({ success: true, count: emergencies.length, data: emergencies });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST trigger new SOS emergency
emergenciesRouter.post('/trigger', (req, res) => {
  try {
    const { seniorId = 'senior-1', seniorName = 'Ravi Kumar', explanation = 'One-click SOS Emergency Triggered' } = req.body;
    const id = `emg-${Date.now()}`;
    const startedAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO emergencies (id, seniorId, seniorName, stage, startedAt, assignedHelperName, assignedHelperRole, etaMinutes, explanation, status, createdAt)
      VALUES (?, ?, ?, 'contacting', ?, 'Nurse Sunita Devi', 'Clinical Caregiver', 4, ?, 'active', ?)
    `).run(id, seniorId, seniorName, startedAt, explanation, startedAt);

    db.prepare('INSERT INTO audit_logs (action, targetUser, details, timestamp) VALUES (?, ?, ?, ?)').run(
      'EMERGENCY_TRIGGERED',
      seniorName,
      `SOS Emergency triggered: ${explanation}`,
      startedAt
    );

    const payload = {
      id,
      seniorId,
      seniorName,
      stage: 'contacting',
      startedAt,
      assignedHelper: { name: 'Nurse Sunita Devi', role: 'Clinical Caregiver' },
      etaMinutes: 4,
      explanation,
      status: 'active'
    };

    broadcastEvent('EMERGENCY_TRIGGERED', payload);

    res.status(201).json({ success: true, message: 'Emergency SOS activated', data: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH advance/cascade emergency stage
emergenciesRouter.patch('/:id/stage', (req, res) => {
  try {
    const { stage, assignedHelperName, assignedHelperRole, etaMinutes, explanation } = req.body;
    const emgId = req.params.id;

    db.prepare(`
      UPDATE emergencies
      SET stage = ?, assignedHelperName = ?, assignedHelperRole = ?, etaMinutes = ?, explanation = ?
      WHERE id = ?
    `).run(stage, assignedHelperName, assignedHelperRole, etaMinutes, explanation, emgId);

    const emg = db.prepare('SELECT * FROM emergencies WHERE id = ?').get(emgId);

    db.prepare('INSERT INTO audit_logs (action, targetUser, details, timestamp) VALUES (?, ?, ?, ?)').run(
      'EMERGENCY_STAGE_UPDATED',
      emg?.seniorName || 'Senior',
      `Emergency escalated to '${stage}' - ${explanation}`,
      new Date().toISOString()
    );

    const payload = { ...emg };
    broadcastEvent('EMERGENCY_STAGE_CHANGED', payload);

    res.json({ success: true, message: `Emergency escalated to ${stage}`, data: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH resolve emergency
emergenciesRouter.patch('/:id/resolve', (req, res) => {
  try {
    const emgId = req.params.id;
    db.prepare("UPDATE emergencies SET status = 'resolved', stage = 'resolved' WHERE id = ?").run(emgId);
    const emg = db.prepare('SELECT * FROM emergencies WHERE id = ?').get(emgId);

    db.prepare('INSERT INTO audit_logs (action, targetUser, details, timestamp) VALUES (?, ?, ?, ?)').run(
      'EMERGENCY_RESOLVED',
      emg?.seniorName || 'Senior',
      'Emergency marked as resolved and senior verified safe.',
      new Date().toISOString()
    );

    const payload = { ...emg, status: 'resolved', stage: 'resolved' };
    broadcastEvent('EMERGENCY_RESOLVED', payload);

    res.json({ success: true, message: 'Emergency resolved successfully', data: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
