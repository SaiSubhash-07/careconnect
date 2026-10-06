import { Router } from 'express';
import { db } from '../db.js';
import { broadcastEvent } from '../events.js';

export const seniorsRouter = Router();

// GET all seniors with their active medication counts
seniorsRouter.get('/', (req, res) => {
  try {
    const seniors = db.prepare('SELECT * FROM seniors').all();
    const result = seniors.map(s => {
      const meds = db.prepare('SELECT * FROM medications WHERE seniorId = ?').all(s.id);
      return {
        ...s,
        healthConditions: JSON.parse(s.healthConditions || '[]'),
        medications: meds,
        gpsCoords: { lat: s.gpsLat, lng: s.gpsLng }
      };
    });
    res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single senior by ID
seniorsRouter.get('/:id', (req, res) => {
  try {
    const senior = db.prepare('SELECT * FROM seniors WHERE id = ?').get(req.params.id);
    if (!senior) return res.status(404).json({ success: false, error: 'Senior citizen not found' });

    const meds = db.prepare('SELECT * FROM medications WHERE seniorId = ?').all(senior.id);
    const telemetryHistory = db.prepare('SELECT * FROM telemetry WHERE seniorId = ? ORDER BY id DESC LIMIT 20').all(senior.id);

    res.json({
      success: true,
      data: {
        ...senior,
        healthConditions: JSON.parse(senior.healthConditions || '[]'),
        medications: meds,
        telemetryHistory,
        gpsCoords: { lat: senior.gpsLat, lng: senior.gpsLng }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update live telemetry GPS coordinates
seniorsRouter.put('/:id/telemetry', (req, res) => {
  try {
    const { lat, lng, accuracy, address } = req.body;
    const seniorId = req.params.id;

    db.prepare('UPDATE seniors SET gpsLat = ?, gpsLng = ?, updatedAt = ? WHERE id = ?').run(
      lat, lng, new Date().toISOString(), seniorId
    );

    db.prepare('INSERT INTO telemetry (seniorId, lat, lng, accuracy, address, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(
      seniorId, lat, lng, accuracy || 15, address || '', new Date().toISOString()
    );

    const payload = { seniorId, lat, lng, accuracy, address, timestamp: new Date().toISOString() };
    broadcastEvent('TELEMETRY_UPDATE', payload);

    res.json({ success: true, message: 'Telemetry updated', data: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST trigger fall alert from accelerometer
seniorsRouter.post('/:id/fall-alert', (req, res) => {
  try {
    const { gForce = 3.4 } = req.body;
    const senior = db.prepare('SELECT name, phone FROM seniors WHERE id = ?').get(req.params.id);

    db.prepare('INSERT INTO audit_logs (action, targetUser, details, timestamp) VALUES (?, ?, ?, ?)').run(
      'FALL_ALERT_TRIGGERED',
      senior?.name || req.params.id,
      `High-impact fall detected (${gForce}G). Automatic rescue countdown initiated.`,
      new Date().toISOString()
    );

    const alertPayload = {
      seniorId: req.params.id,
      seniorName: senior?.name || 'Senior',
      gForce,
      timestamp: new Date().toISOString(),
      countdown: 15
    };

    broadcastEvent('FALL_DETECTED', alertPayload);
    res.json({ success: true, message: 'Fall alert broadcast initiated', data: alertPayload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
