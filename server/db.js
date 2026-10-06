import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure server data directory exists
const dbPath = path.join(__dirname, 'careconnect.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance & concurrency
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS seniors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    preferredName TEXT,
    age INTEGER,
    gender TEXT,
    bloodGroup TEXT,
    address TEXT,
    phone TEXT,
    avatar TEXT,
    pin TEXT,
    emergencyContactName TEXT,
    emergencyContactRelation TEXT,
    emergencyContactPhone TEXT,
    healthConditions TEXT,
    gpsLat REAL,
    gpsLng REAL,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    seniorId TEXT NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'due',
    instructions TEXT,
    category TEXT,
    prescribedBy TEXT,
    icon TEXT,
    takenAt TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS emergencies (
    id TEXT PRIMARY KEY,
    seniorId TEXT NOT NULL,
    seniorName TEXT,
    stage TEXT DEFAULT 'contacting',
    startedAt TEXT,
    assignedHelperName TEXT,
    assignedHelperRole TEXT,
    etaMinutes INTEGER,
    explanation TEXT,
    status TEXT DEFAULT 'active',
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seniorId TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    accuracy REAL,
    address TEXT,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    receivers TEXT,
    timestamp TEXT NOT NULL,
    isRead INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    targetUser TEXT,
    details TEXT,
    timestamp TEXT NOT NULL
  );
`);

// Seed initial default seniors & medications if database is fresh
const checkSenior = db.prepare('SELECT COUNT(*) as count FROM seniors').get();
if (checkSenior.count === 0) {
  const insertSenior = db.prepare(`
    INSERT INTO seniors (
      id, name, preferredName, age, gender, bloodGroup, address, phone, avatar, pin,
      emergencyContactName, emergencyContactRelation, emergencyContactPhone, healthConditions, gpsLat, gpsLng, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const initialSeniors = [
    {
      id: 'senior-1',
      name: 'Ravi Kumar',
      preferredName: 'Ravi Ji',
      age: 72,
      gender: 'Male',
      bloodGroup: 'B+',
      address: 'Flat 402, Green Meadows, MG Road, Bengaluru',
      phone: '+91 98765 43210',
      avatar: '👴',
      pin: '1234',
      emergencyContactName: 'Priya Sharma',
      emergencyContactRelation: 'Daughter',
      emergencyContactPhone: '+91 98765 43211',
      healthConditions: JSON.stringify(['Hypertension', 'Mild Arthritis', 'Type-2 Diabetes']),
      gpsLat: 12.9716,
      gpsLng: 77.5946
    },
    {
      id: 'senior-2',
      name: 'Kamala Devi',
      preferredName: 'Kamala Amma',
      age: 68,
      gender: 'Female',
      bloodGroup: 'O+',
      address: 'House #14, Shanti Nagar, Near Metro Station, Bengaluru',
      phone: '+91 98765 43212',
      avatar: '👵',
      pin: '5678',
      emergencyContactName: 'Sunil Devi',
      emergencyContactRelation: 'Son',
      emergencyContactPhone: '+91 98765 43213',
      healthConditions: JSON.stringify(['Asthma', 'Osteoporosis', 'Cataract (Post-Op)']),
      gpsLat: 12.9602,
      gpsLng: 77.5986
    },
    {
      id: 'senior-3',
      name: 'Subhash Rao',
      preferredName: 'Subhash Uncle',
      age: 75,
      gender: 'Male',
      bloodGroup: 'A+',
      address: 'Villa 9, Palm Grove Residency, Indiranagar, Bengaluru',
      phone: '+91 98765 43214',
      avatar: '👴🏽',
      pin: '4321',
      emergencyContactName: 'Ananya Rao',
      emergencyContactRelation: 'Daughter-in-law',
      emergencyContactPhone: '+91 98765 43215',
      healthConditions: JSON.stringify(['Cardiac Bypass (2021)', 'High Cholesterol', 'Pacemaker Implanted']),
      gpsLat: 12.9784,
      gpsLng: 77.6408
    },
    {
      id: 'senior-4',
      name: 'Saraswathi Nair',
      preferredName: 'Saraswathi Teacher',
      age: 70,
      gender: 'Female',
      bloodGroup: 'AB+',
      address: 'Door 108, Malleshwaram 8th Cross, Bengaluru',
      phone: '+91 98765 43216',
      avatar: '👵🏽',
      pin: '8765',
      emergencyContactName: 'Madhavan Nair',
      emergencyContactRelation: 'Brother',
      emergencyContactPhone: '+91 98765 43217',
      healthConditions: JSON.stringify(['Early Stage Parkinsonism', 'Hypertension', 'Insomnia']),
      gpsLat: 13.0031,
      gpsLng: 77.5643
    }
  ];

  for (const s of initialSeniors) {
    insertSenior.run(
      s.id, s.name, s.preferredName, s.age, s.gender, s.bloodGroup, s.address, s.phone, s.avatar, s.pin,
      s.emergencyContactName, s.emergencyContactRelation, s.emergencyContactPhone, s.healthConditions, s.gpsLat, s.gpsLng, new Date().toISOString()
    );
  }

  // Seed default medications
  const insertMed = db.prepare(`
    INSERT INTO medications (id, seniorId, name, dosage, time, status, instructions, category, prescribedBy, icon, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultMeds = [
    { id: 'med-1', seniorId: 'senior-1', name: 'Telmisartan 40mg', dosage: '1 Tablet', time: '08:00 AM', status: 'due', instructions: 'Take with warm water after breakfast', category: 'Blood Pressure', prescribedBy: 'Dr. Rajesh Sharma', icon: '🫀' },
    { id: 'med-2', seniorId: 'senior-1', name: 'Metformin 500mg', dosage: '1 Tablet', time: '01:00 PM', status: 'due', instructions: 'Take with lunch', category: 'Diabetes', prescribedBy: 'Dr. Rajesh Sharma', icon: '🩸' },
    { id: 'med-3', seniorId: 'senior-1', name: 'Atorvastatin 20mg', dosage: '1 Tablet', time: '08:30 PM', status: 'due', instructions: 'Take after dinner', category: 'Cholesterol', prescribedBy: 'Nurse Sunita Devi', icon: '💊' },
    { id: 'med-4', seniorId: 'senior-2', name: 'Salbutamol Inhaler', dosage: '2 Puffs', time: '08:00 AM', status: 'due', instructions: 'Inhale before morning stroll', category: 'Respiratory', prescribedBy: 'Dr. Anita Desai', icon: '🫁' },
    { id: 'med-5', seniorId: 'senior-3', name: 'Ecosprin 75mg', dosage: '1 Tablet', time: '09:00 AM', status: 'due', instructions: 'Take with water after breakfast', category: 'Cardiology', prescribedBy: 'Dr. Rajesh Sharma', icon: '❤️' }
  ];

  for (const m of defaultMeds) {
    insertMed.run(m.id, m.seniorId, m.name, m.dosage, m.time, m.status, m.instructions, m.category, m.prescribedBy, m.icon, new Date().toISOString());
  }

  // Seed audit log
  db.prepare('INSERT INTO audit_logs (action, targetUser, details, timestamp) VALUES (?, ?, ?, ?)').run(
    'SYSTEM_INIT',
    'System',
    'CareConnect SQLite database schema and seeds initialized successfully.',
    new Date().toISOString()
  );
}

console.log('[SQLite DB] Initialized & Connected at', dbPath);
