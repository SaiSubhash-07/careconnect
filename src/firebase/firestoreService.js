// CareConnect Cloud Firestore Service
// Provides real-time two-way synchronization between browser IndexedDB and Cloud Firestore

import {
  firestore,
  isFirebaseConfigured
} from './firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

export const CLOUD_COLLECTIONS = {
  SENIORS: 'seniors',
  EMERGENCY_ALERTS: 'emergency_alerts',
  MEDICATIONS: 'medications',
  APPOINTMENTS: 'appointments',
  FALL_INCIDENTS: 'fall_incidents',
  HELP_REQUESTS: 'help_requests',
  LIVE_TELEMETRY: 'live_telemetry',
  AUDIT_LOGS: 'audit_logs'
};

// In-memory simulator cache for demo/offline fallback mode
const simulatedCloudDb = {
  seniors: {},
  emergency_alerts: {},
  live_telemetry: {},
  fall_incidents: {},
  audit_logs: {}
};

// 1. Test Cloud Firestore Connection with round-trip latency
export const testCloudConnection = async () => {
  const startTime = Date.now();

  if (!isFirebaseConfigured || !firestore) {
    // Simulator mode fallback
    await new Promise(resolve => setTimeout(resolve, 80));
    return {
      success: true,
      mode: 'simulator',
      latencyMs: Date.now() - startTime,
      message: 'Running in Local Simulator Mode (No live Firebase project connected)'
    };
  }

  try {
    const testDocRef = doc(firestore, '_system_health', 'ping_check');
    await setDoc(testDocRef, {
      lastPing: serverTimestamp(),
      clientTime: new Date().toISOString(),
      agent: 'CareConnect-WebPWA'
    });
    const snapshot = await getDoc(testDocRef);
    const latency = Date.now() - startTime;

    return {
      success: snapshot.exists(),
      mode: 'live_cloud',
      latencyMs: latency,
      message: `Connected to Cloud Firestore (Latency: ${latency}ms)`
    };
  } catch (err) {
    console.warn('Firebase connection test error:', err);
    return {
      success: false,
      mode: 'error',
      latencyMs: Date.now() - startTime,
      message: `Cloud connection failed: ${err.message}`
    };
  }
};

// 2. Broadcast Live GPS Location to Cloud
export const broadcastLocationToCloud = async (seniorId, locationData) => {
  const payload = {
    seniorId,
    lat: locationData.lat,
    lng: locationData.lng,
    accuracy: locationData.accuracy || 10,
    address: locationData.address || '',
    isLiveGPS: !!locationData.isLiveGPS,
    updatedAt: new Date().toISOString(),
    cloudTimestamp: isFirebaseConfigured ? serverTimestamp() : Date.now()
  };

  if (!isFirebaseConfigured || !firestore) {
    simulatedCloudDb.live_telemetry[seniorId] = payload;
    return { success: true, mode: 'simulator', payload };
  }

  try {
    const docRef = doc(firestore, CLOUD_COLLECTIONS.LIVE_TELEMETRY, String(seniorId));
    await setDoc(docRef, payload, { merge: true });
    return { success: true, mode: 'cloud', payload };
  } catch (err) {
    console.warn('Error broadcasting location to cloud:', err);
    return { success: false, error: err.message };
  }
};

// 3. Publish Emergency SOS Alert to Cloud
export const publishEmergencyToCloud = async (emergencyData) => {
  const payload = {
    ...emergencyData,
    status: 'ACTIVE_EMERGENCY',
    createdAt: new Date().toISOString(),
    cloudTimestamp: isFirebaseConfigured ? serverTimestamp() : Date.now()
  };

  if (!isFirebaseConfigured || !firestore) {
    const fakeId = 'cloud-emg-' + Date.now();
    simulatedCloudDb.emergency_alerts[fakeId] = payload;
    return { success: true, id: fakeId, mode: 'simulator' };
  }

  try {
    const colRef = collection(firestore, CLOUD_COLLECTIONS.EMERGENCY_ALERTS);
    const docRef = await addDoc(colRef, payload);
    return { success: true, id: docRef.id, mode: 'cloud' };
  } catch (err) {
    console.warn('Error publishing emergency to cloud:', err);
    return { success: false, error: err.message };
  }
};

// 4. Record Fall Incident to Cloud
export const recordFallInCloud = async (fallData) => {
  const payload = {
    ...fallData,
    createdAt: new Date().toISOString(),
    cloudTimestamp: isFirebaseConfigured ? serverTimestamp() : Date.now()
  };

  if (!isFirebaseConfigured || !firestore) {
    const fakeId = 'cloud-fall-' + Date.now();
    simulatedCloudDb.fall_incidents[fakeId] = payload;
    return { success: true, id: fakeId, mode: 'simulator' };
  }

  try {
    const colRef = collection(firestore, CLOUD_COLLECTIONS.FALL_INCIDENTS);
    const docRef = await addDoc(colRef, payload);
    return { success: true, id: docRef.id, mode: 'cloud' };
  } catch (err) {
    console.warn('Error recording fall to cloud:', err);
    return { success: false, error: err.message };
  }
};

// 5. Sync Senior Profile to Cloud
export const syncSeniorToCloud = async (senior) => {
  if (!senior || !senior.id) return { success: false };

  if (!isFirebaseConfigured || !firestore) {
    simulatedCloudDb.seniors[senior.id] = senior;
    return { success: true, mode: 'simulator' };
  }

  try {
    const docRef = doc(firestore, CLOUD_COLLECTIONS.SENIORS, String(senior.id));
    await setDoc(docRef, {
      ...senior,
      lastSyncedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true, mode: 'cloud' };
  } catch (err) {
    console.warn('Error syncing senior to cloud:', err);
    return { success: false, error: err.message };
  }
};

// 6. Dual-Layer Sync: Push Entire IndexedDB into Cloud Firestore
export const syncAllIndexedDbToCloud = async (indexedDbInstance) => {
  if (!indexedDbInstance) return { success: false, error: 'Database instance not available' };

  const report = {
    syncedStores: {},
    totalRecords: 0,
    startTime: new Date().toISOString(),
    mode: isFirebaseConfigured ? 'live_cloud' : 'simulator'
  };

  try {
    const fullBackup = await indexedDbInstance.exportData();
    if (!fullBackup || !fullBackup.stores) return { success: false, error: 'Failed to read IndexedDB' };

    for (const [storeName, records] of Object.entries(fullBackup.stores)) {
      if (!Array.isArray(records)) continue;

      if (isFirebaseConfigured && firestore) {
        // Upload each record to Firestore collection
        const colRef = collection(firestore, storeName);
        for (const item of records) {
          const docId = String(item.id || item.code || Date.now() + Math.random().toString(36).substr(2, 4));
          await setDoc(doc(colRef, docId), {
            ...item,
            _syncedFromIndexedDb: true,
            _syncTimestamp: new Date().toISOString()
          }, { merge: true });
        }
      }

      report.syncedStores[storeName] = records.length;
      report.totalRecords += records.length;
    }

    report.endTime = new Date().toISOString();
    report.success = true;
    return report;
  } catch (err) {
    console.error('Dual-layer sync error:', err);
    return { success: false, error: err.message };
  }
};

// 7. Real-Time Emergency SOS Cloud Listener
export const subscribeToCloudEmergencies = (callback) => {
  if (!isFirebaseConfigured || !firestore) {
    return () => {};
  }

  try {
    const colRef = collection(firestore, CLOUD_COLLECTIONS.EMERGENCY_ALERTS);
    return onSnapshot(colRef, (snapshot) => {
      const emergencies = [];
      snapshot.forEach(docSnap => {
        emergencies.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(emergencies);
    }, (err) => {
      console.warn('Firestore emergency subscription note:', err.message);
    });
  } catch (err) {
    console.warn('Could not establish emergency subscription:', err);
    return () => {};
  }
};
