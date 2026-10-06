// CareConnect Database Engine (IndexedDB)
// Fully browser-native, zero-dependency, persistent storage layer

import { mockSeniors, initialMedications, initialAppointments, initialHelpRequests } from '../data/mockData.js';

const DB_NAME = 'CareConnectDB_v1';
const DB_VERSION = 1;

export const DB_STORES = {
  SENIORS: 'seniors',
  MEDICATIONS: 'medications',
  APPOINTMENTS: 'appointments',
  EMERGENCY_LOGS: 'emergency_logs',
  FALL_INCIDENTS: 'fall_incidents',
  HELP_REQUESTS: 'help_requests',
  AUDIT_LOGS: 'audit_logs'
};

class CareConnectDatabase {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.listeners = new Set();
  }

  // Event Subscription for reactive UI updates
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload) {
    this.listeners.forEach(fn => {
      try {
        fn(event, payload);
      } catch (err) {
        console.error('DB Subscriber Error:', err);
      }
    });
  }

  // Open & initialize IndexedDB with object stores and indexes
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB not supported in this environment');
        this.isReady = false;
        resolve(null);
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Seniors Store
        if (!db.objectStoreNames.contains(DB_STORES.SENIORS)) {
          const store = db.createObjectStore(DB_STORES.SENIORS, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('pin', 'pin', { unique: false });
        }

        // 2. Medications Store
        if (!db.objectStoreNames.contains(DB_STORES.MEDICATIONS)) {
          const store = db.createObjectStore(DB_STORES.MEDICATIONS, { keyPath: 'id' });
          store.createIndex('seniorId', 'seniorId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }

        // 3. Appointments Store
        if (!db.objectStoreNames.contains(DB_STORES.APPOINTMENTS)) {
          const store = db.createObjectStore(DB_STORES.APPOINTMENTS, { keyPath: 'id' });
          store.createIndex('seniorId', 'seniorId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }

        // 4. Emergency Logs Store
        if (!db.objectStoreNames.contains(DB_STORES.EMERGENCY_LOGS)) {
          const store = db.createObjectStore(DB_STORES.EMERGENCY_LOGS, { keyPath: 'id' });
          store.createIndex('seniorId', 'seniorId', { unique: false });
          store.createIndex('stage', 'stage', { unique: false });
          store.createIndex('startedAt', 'startedAt', { unique: false });
        }

        // 5. Fall Incidents Store
        if (!db.objectStoreNames.contains(DB_STORES.FALL_INCIDENTS)) {
          const store = db.createObjectStore(DB_STORES.FALL_INCIDENTS, { keyPath: 'id' });
          store.createIndex('seniorId', 'seniorId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 6. Help Requests Store
        if (!db.objectStoreNames.contains(DB_STORES.HELP_REQUESTS)) {
          const store = db.createObjectStore(DB_STORES.HELP_REQUESTS, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('category', 'category', { unique: false });
        }

        // 7. Audit Logs Store
        if (!db.objectStoreNames.contains(DB_STORES.AUDIT_LOGS)) {
          const store = db.createObjectStore(DB_STORES.AUDIT_LOGS, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('action', 'action', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        this.isReady = true;

        // Auto seed default data if database was freshly created
        await this.checkAndSeedDefaults();
        this.notify('ready', { dbName: DB_NAME, version: DB_VERSION });
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Check if store has records, seed initial defaults if empty
  async checkAndSeedDefaults() {
    const seniorsCount = await this.count(DB_STORES.SENIORS);
    if (seniorsCount === 0) {
      console.log('CareConnectDB is empty. Seeding initial hackathon demo records...');
      await this.seedDefaults();
    }
  }

  async seedDefaults() {
    // 1. Seed Seniors
    for (const senior of mockSeniors) {
      await this.put(DB_STORES.SENIORS, senior);
      // Seed that senior's medications
      if (Array.isArray(senior.medications)) {
        for (const med of senior.medications) {
          await this.put(DB_STORES.MEDICATIONS, { ...med, seniorId: senior.id });
        }
      }
      // Seed that senior's appointments
      if (Array.isArray(senior.appointments)) {
        for (const apt of senior.appointments) {
          await this.put(DB_STORES.APPOINTMENTS, { ...apt, seniorId: senior.id });
        }
      }
    }

    // 2. Seed Help Requests
    for (const req of initialHelpRequests) {
      await this.put(DB_STORES.HELP_REQUESTS, req);
    }

    // 3. Seed Initial Audit Log
    await this.logAudit('DATABASE_INIT', 'System', 'CareConnectDB initialized with 4 senior profiles and full clinical schedules.');
  }

  // Low-level helper to execute a transaction
  async getStore(storeName, mode = 'readonly') {
    if (!this.db) {
      await this.init();
    }
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // Get all items in a store
  async getAll(storeName) {
    try {
      const store = await this.getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error(`Error in getAll(${storeName}):`, err);
      return [];
    }
  }

  // Get single record by ID
  async getById(storeName, id) {
    try {
      const store = await this.getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error(`Error in getById(${storeName}, ${id}):`, err);
      return null;
    }
  }

  // Put (insert or update) record
  async put(storeName, item) {
    try {
      const store = await this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => {
          this.notify('change', { store: storeName, action: 'put', item });
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error(`Error in put(${storeName}):`, err);
      return null;
    }
  }

  // Delete record by ID
  async delete(storeName, id) {
    try {
      const store = await this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
          this.notify('change', { store: storeName, action: 'delete', id });
          resolve(true);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error(`Error in delete(${storeName}, ${id}):`, err);
      return false;
    }
  }

  // Clear all records in a store
  async clear(storeName) {
    try {
      const store = await this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => {
          this.notify('change', { store: storeName, action: 'clear' });
          resolve(true);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error(`Error in clear(${storeName}):`, err);
      return false;
    }
  }

  // Count records in a store
  async count(storeName) {
    try {
      const store = await this.getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result || 0);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error(`Error in count(${storeName}):`, err);
      return 0;
    }
  }

  // Log system/clinical audit action
  async logAudit(action, actor = 'System', details = '') {
    const record = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }),
      action,
      actor,
      details
    };
    await this.put(DB_STORES.AUDIT_LOGS, record);
    return record;
  }

  // Get statistics across all stores
  async getStats() {
    const stats = {};
    for (const key of Object.values(DB_STORES)) {
      stats[key] = await this.count(key);
    }
    return stats;
  }

  // Export full database to JSON
  async exportDatabase() {
    const dump = {
      database: DB_NAME,
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      tables: {}
    };

    for (const storeName of Object.values(DB_STORES)) {
      dump.tables[storeName] = await this.getAll(storeName);
    }

    return dump;
  }

  // Import / Restore full database from JSON
  async importDatabase(jsonData) {
    if (!jsonData || !jsonData.tables) {
      throw new Error('Invalid CareConnect database JSON backup file');
    }

    for (const storeName of Object.values(DB_STORES)) {
      if (Array.isArray(jsonData.tables[storeName])) {
        await this.clear(storeName);
        for (const item of jsonData.tables[storeName]) {
          await this.put(storeName, item);
        }
      }
    }

    await this.logAudit('DATABASE_RESTORE', 'Admin', 'Database restored from JSON backup file.');
    this.notify('restored', { timestamp: new Date().toISOString() });
    return true;
  }

  // Reset database to clean mock defaults
  async resetDatabase() {
    for (const storeName of Object.values(DB_STORES)) {
      await this.clear(storeName);
    }
    await this.seedDefaults();
    await this.logAudit('DATABASE_RESET', 'Evaluator', 'Database reset to clean hackathon demo defaults.');
    this.notify('reset', { timestamp: new Date().toISOString() });
    return true;
  }
}

// Global Singleton DB Instance
export const db = new CareConnectDatabase();
