import { Router } from 'express';
import { db } from '../db.js';
import { broadcastEvent } from '../events.js';

export const medicationsRouter = Router();

// GET all medications or filter by seniorId
medicationsRouter.get('/', (req, res) => {
  try {
    const { seniorId } = req.query;
    let query = 'SELECT * FROM medications';
    let params = [];
    if (seniorId) {
      query += ' WHERE seniorId = ?';
      params.push(seniorId);
    }
    query += ' ORDER BY id DESC';

    const meds = db.prepare(query).all(...params);
    res.json({ success: true, count: meds.length, data: meds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST caregiver prescribes a new medication
medicationsRouter.post('/', (req, res) => {
  try {
    const {
      seniorId,
      name,
      dosage,
      time,
      instructions,
      category,
      prescribedBy = 'Nurse Sunita Devi (Caregiver)',
      icon = '💊'
    } = req.body;

    if (!seniorId || !name) {
      return res.status(400).json({ success: false, error: 'seniorId and name are required' });
    }

    const id = `med-${Date.now()}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO medications (id, seniorId, name, dosage, time, status, instructions, category, prescribedBy, icon, createdAt)
      VALUES (?, ?, ?, ?, ?, 'due', ?, ?, ?, ?, ?)
    `).run(id, seniorId, name, dosage || '1 Tablet', time || '09:00 AM', instructions || 'Take with water after food', category || 'General Health', prescribedBy, icon, createdAt);

    const senior = db.prepare('SELECT name FROM seniors WHERE id = ?').get(seniorId);

    db.prepare('INSERT INTO audit_logs (action, targetUser, details, timestamp) VALUES (?, ?, ?, ?)').run(
      'MEDICATION_PRESCRIBED',
      senior?.name || seniorId,
      `New prescription '${name} (${dosage})' added by ${prescribedBy}`,
      createdAt
    );

    const payload = {
      id,
      seniorId,
      seniorName: senior?.name || 'Senior',
      name,
      dosage,
      time,
      status: 'due',
      instructions,
      category,
      prescribedBy,
      icon,
      createdAt
    };

    broadcastEvent('NEW_MEDICATION', payload);

    res.status(201).json({ success: true, message: 'Medication prescribed successfully', data: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH mark medication as taken
medicationsRouter.patch('/:id/taken', (req, res) => {
  try {
    const medId = req.params.id;
    const takenAt = req.body.takenAt || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const med = db.prepare('SELECT * FROM medications WHERE id = ?').get(medId);
    if (!med) return res.status(404).json({ success: false, error: 'Medication not found' });

    db.prepare('UPDATE medications SET status = ?, takenAt = ? WHERE id = ?').run('taken', takenAt, medId);

    const senior = db.prepare('SELECT name FROM seniors WHERE id = ?').get(med.seniorId);

    db.prepare('INSERT INTO audit_logs (action, targetUser, details, timestamp) VALUES (?, ?, ?, ?)').run(
      'MEDICINE_TAKEN',
      senior?.name || med.seniorId,
      `Medication '${med.name}' marked as taken at ${takenAt}`,
      new Date().toISOString()
    );

    const payload = { ...med, status: 'taken', takenAt };
    broadcastEvent('MEDICATION_TAKEN', payload);

    res.json({ success: true, message: 'Medication marked as taken', data: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH flag medication as missed (Simulate / Alert Missed Dose)
medicationsRouter.patch('/:id/missed', (req, res) => {
  try {
    const medId = req.params.id;
    const med = db.prepare('SELECT * FROM medications WHERE id = ?').get(medId);
    if (!med) return res.status(404).json({ success: false, error: 'Medication not found' });

    db.prepare('UPDATE medications SET status = ? WHERE id = ?').run('missed', medId);

    const senior = db.prepare('SELECT name FROM seniors WHERE id = ?').get(med.seniorId);

    db.prepare('INSERT INTO audit_logs (action, targetUser, details, timestamp) VALUES (?, ?, ?, ?)').run(
      'MEDICINE_MISSED',
      senior?.name || med.seniorId,
      `Medication '${med.name}' flagged as missed. Caregiver alert triggered.`,
      new Date().toISOString()
    );

    const payload = { ...med, status: 'missed' };
    broadcastEvent('MEDICATION_MISSED', payload);

    res.json({ success: true, message: 'Medication flagged as missed', data: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST caregiver sends urgent reminder to senior for tablet
medicationsRouter.post('/:id/remind', (req, res) => {
  try {
    const medId = req.params.id;
    const { caregiverName = 'Nurse Sunita Devi' } = req.body;

    const med = db.prepare('SELECT * FROM medications WHERE id = ?').get(medId);
    if (!med) return res.status(404).json({ success: false, error: 'Medication not found' });

    const senior = db.prepare('SELECT name FROM seniors WHERE id = ?').get(med.seniorId);
    const sentAt = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    db.prepare('INSERT INTO audit_logs (action, targetUser, details, timestamp) VALUES (?, ?, ?, ?)').run(
      'CAREGIVER_REMINDER_SENT',
      senior?.name || med.seniorId,
      `${caregiverName} sent urgent reminder for ${med.name} at ${sentAt}`,
      new Date().toISOString()
    );

    const payload = {
      med,
      seniorId: med.seniorId,
      seniorName: senior?.name || 'Senior',
      caregiverName,
      sentAt,
      timestamp: new Date().toISOString()
    };

    broadcastEvent('CAREGIVER_REMINDER', payload);

    res.json({ success: true, message: 'Urgent tablet reminder dispatched to senior', data: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
