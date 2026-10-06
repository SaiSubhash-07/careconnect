// CareConnect 360 - Frontend API Client & Real-time Integration Service
// Communicates with Express + SQLite Backend on port 5000 with seamless IndexedDB fallback

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.isBackendOnline = false;
    this.eventSource = null;
    this.sseSubscribers = new Set();
  }

  // Health check with short timeout
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);

      const res = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        this.isBackendOnline = true;
        return { online: true, data };
      }
      this.isBackendOnline = false;
      return { online: false, data: null };
    } catch {
      this.isBackendOnline = false;
      return { online: false, data: null };
    }
  }

  // SSE Stream Listener
  connectSSE(onEvent) {
    if (typeof window === 'undefined' || !window.EventSource) return () => {};

    if (onEvent) {
      this.sseSubscribers.add(onEvent);
    }

    if (!this.eventSource) {
      try {
        this.eventSource = new EventSource(`${API_BASE_URL}/events`);

        this.eventSource.onopen = () => {
          this.isBackendOnline = true;
        };

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.sseSubscribers.forEach(cb => {
              try {
                cb(data);
              } catch (e) {
                console.error('[SSE Callback Error]', e);
              }
            });
          } catch (e) {
            console.error('[SSE Parse Error]', e);
          }
        };

        this.eventSource.onerror = () => {
          // EventSource will automatically retry in background
          this.isBackendOnline = false;
        };
      } catch (err) {
        console.warn('[SSE Connection Init Error]', err);
      }
    }

    return () => {
      if (onEvent) {
        this.sseSubscribers.delete(onEvent);
      }
    };
  }

  // Seniors
  async getSeniors() {
    try {
      const res = await fetch(`${API_BASE_URL}/seniors`);
      if (!res.ok) throw new Error('Failed to fetch seniors');
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('[API Service] getSeniors fallback to local:', err.message);
      return null;
    }
  }

  async updateSeniorTelemetry(seniorId, telemetry) {
    try {
      const res = await fetch(`${API_BASE_URL}/seniors/${seniorId}/telemetry`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telemetry)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] updateSeniorTelemetry offline:', err.message);
      return null;
    }
  }

  async triggerFallAlert(seniorId, gForce = 3.4) {
    try {
      const res = await fetch(`${API_BASE_URL}/seniors/${seniorId}/fall-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gForce })
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] triggerFallAlert offline:', err.message);
      return null;
    }
  }

  // Medications
  async getMedications(seniorId) {
    try {
      const url = seniorId ? `${API_BASE_URL}/medications?seniorId=${seniorId}` : `${API_BASE_URL}/medications`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch medications');
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('[API Service] getMedications offline:', err.message);
      return null;
    }
  }

  async prescribeMedication(medData) {
    try {
      const res = await fetch(`${API_BASE_URL}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] prescribeMedication offline:', err.message);
      return null;
    }
  }

  async markMedicationTaken(medId, takenAt) {
    try {
      const res = await fetch(`${API_BASE_URL}/medications/${medId}/taken`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ takenAt })
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] markMedicationTaken offline:', err.message);
      return null;
    }
  }

  async sendMedicationReminder(medId, notes) {
    try {
      const res = await fetch(`${API_BASE_URL}/medications/${medId}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] sendMedicationReminder offline:', err.message);
      return null;
    }
  }

  // Emergencies
  async getEmergencies() {
    try {
      const res = await fetch(`${API_BASE_URL}/emergencies`);
      if (!res.ok) throw new Error('Failed to fetch emergencies');
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('[API Service] getEmergencies offline:', err.message);
      return null;
    }
  }

  async triggerEmergency(seniorId, reason) {
    try {
      const res = await fetch(`${API_BASE_URL}/emergencies/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seniorId, reason })
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] triggerEmergency offline:', err.message);
      return null;
    }
  }

  async updateEmergencyStage(emergencyId, stageData) {
    try {
      const res = await fetch(`${API_BASE_URL}/emergencies/${emergencyId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stageData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] updateEmergencyStage offline:', err.message);
      return null;
    }
  }

  async resolveEmergency(emergencyId) {
    try {
      const res = await fetch(`${API_BASE_URL}/emergencies/${emergencyId}/resolve`, {
        method: 'PATCH'
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] resolveEmergency offline:', err.message);
      return null;
    }
  }

  // Notifications
  async getNotifications(receiver) {
    try {
      const url = receiver ? `${API_BASE_URL}/notifications?receiver=${receiver}` : `${API_BASE_URL}/notifications`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const json = await res.json();
      return json.notifications || [];
    } catch (err) {
      console.warn('[API Service] getNotifications offline:', err.message);
      return null;
    }
  }

  async createNotification(notifData) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] createNotification offline:', err.message);
      return null;
    }
  }

  async dismissNotification(notifId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${notifId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] dismissNotification offline:', err.message);
      return null;
    }
  }

  // Admin / Backend Studio Inspector APIs
  async getAdminOverview() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/overview`);
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getAdminTable(tableName) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/table/${tableName}`);
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getAdminLogs() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/logs`);
      return await res.json();
    } catch (err) {
      return { success: false, logs: [] };
    }
  }
}

export const apiService = new ApiService();
