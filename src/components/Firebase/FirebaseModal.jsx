// CareConnect Firebase Cloud Studio & Real-time Sync Modal
// Allows inspecting Cloud Firestore connectivity, running latency tests, 
// dual-layer syncing with IndexedDB, and configuring live project credentials.

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  isFirebaseConfigured,
  getActiveFirebaseConfig,
  saveCustomFirebaseConfig,
  resetFirebaseConfig
} from '../../firebase/firebaseConfig';
import {
  testCloudConnection,
  syncAllIndexedDbToCloud,
  CLOUD_COLLECTIONS
} from '../../firebase/firestoreService';
import {
  CheckCircle2,
  RefreshCw,
  Shield,
  X,
  Server,
  Database,
  Key,
  Radio
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const FirebaseModal = ({ isOpen, onClose }) => {
  const { db, language, senior, liveLocation, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState('status'); // 'status' | 'sync' | 'config'
  const [connectionTest, setConnectionTest] = useState(null);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncReport, setSyncReport] = useState(null);

  // In-app Config Form State
  const activeCfg = getActiveFirebaseConfig();
  const [apiKey, setApiKey] = useState(activeCfg.apiKey || '');
  const [projectId, setProjectId] = useState(activeCfg.projectId || '');
  const [authDomain, setAuthDomain] = useState(activeCfg.authDomain || '');
  const [appId, setAppId] = useState(activeCfg.appId || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestConnection = React.useCallback(async () => {
    setTesting(true);
    try {
      const res = await testCloudConnection();
      setConnectionTest(res);
    } catch (e) {
      setConnectionTest({ success: false, message: e.message, latencyMs: 0 });
    } finally {
      setTesting(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      handleTestConnection();
    }
  }, [isOpen, handleTestConnection]);

  const handleSyncToCloud = async () => {
    setSyncing(true);
    try {
      const result = await syncAllIndexedDbToCloud(db);
      setSyncReport(result);
      if (result.success) {
        addNotification(
          '🔥 Cloud Firestore Synced',
          `Successfully replicated ${result.totalRecords} local IndexedDB records to Cloud Firestore.`,
          'success',
          'all'
        );
        speakText('Cloud synchronization complete. All records up to date.', language);
      }
    } catch (err) {
      console.error('Cloud sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const newConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      appId: appId.trim() || '1:123456789:web:abcdef',
      storageBucket: `${projectId.trim()}.appspot.com`
    };

    saveCustomFirebaseConfig(newConfig);
    setSaveSuccess(true);
    speakText('Firebase credentials saved. Reloading cloud connection.', language);
    setTimeout(() => {
      setSaveSuccess(false);
      window.location.reload();
    }, 1200);
  };

  const handleResetConfig = () => {
    resetFirebaseConfig();
    speakText('Firebase configuration reset to defaults.', language);
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white p-5 sm:p-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner border border-white/20">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Firebase Cloud Infrastructure
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                  isFirebaseConfigured ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'
                }`}>
                  {isFirebaseConfigured ? '🟢 Live Cloud' : '🟡 Simulator Mode'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-orange-100 font-medium mt-0.5">
                Cloud Firestore Real-Time Replication, Auth & GPS Telemetry Sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'status'
                ? 'border-orange-600 text-orange-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Connection & Health</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'sync'
                ? 'border-orange-600 text-orange-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>IndexedDB ↔ Cloud Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-orange-600 text-orange-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Credentials & Project</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: CONNECTION & HEALTH */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isFirebaseConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    isFirebaseConfigured ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                  }`}>
                    {isFirebaseConfigured ? '⚡' : '🛡️'}
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base">
                      {isFirebaseConfigured ? 'Live Firebase Cloud Connected' : 'Firebase Simulator Mode (Zero-Config Active)'}
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">
                      {isFirebaseConfigured
                        ? `Connected to Project: ${activeCfg.projectId}`
                        : 'Running fully offline with simulated in-memory cloud events. Paste your Firebase keys in the Credentials tab to connect live!'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-amber-300' : ''}`} />
                  <span>{testing ? 'Testing Ping...' : 'Test Connection'}</span>
                </button>
              </div>

              {/* Latency / Ping Result Card */}
              {connectionTest && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <p className="text-xs font-black text-slate-200">{connectionTest.message}</p>
                      <p className="text-[11px] font-mono text-slate-400">Mode: {connectionTest.mode} • Verified at {new Date().toLocaleTimeString('en-US', { hour12: true })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-emerald-400">
                      {connectionTest.latencyMs}ms
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Roundtrip Latency</p>
                  </div>
                </div>
              )}

              {/* Real-time Collections Grid */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                  Cloud Firestore Registered Collections
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(CLOUD_COLLECTIONS).map(([key, colName]) => (
                    <div
                      key={key}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-300 transition shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-black text-slate-800">
                          /{colName}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">Real-time Stream</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telemetry Preview */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold">
                    <Radio className="w-5 h-5 text-indigo-700 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-indigo-950 uppercase">Active Telemetry Stream</h5>
                    <p className="text-xs font-mono text-indigo-800 mt-0.5">
                      Senior: {senior?.name} • Lat: {liveLocation?.lat}° N, Lng: {liveLocation?.lng}° E
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black bg-indigo-200 text-indigo-900 px-3 py-1 rounded-full uppercase">
                  ACTIVE
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: INDEXEDDB <-> CLOUD SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-slate-700 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base sm:text-lg font-black">
                      Two-Way Cloud & Local Replication
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Syncs all 7 local IndexedDB stores (<code className="text-amber-300 font-mono">CareConnectDB_v1</code>) directly with Cloud Firestore.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-2xl">
                    🔄
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSyncToCloud}
                    disabled={syncing}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncing ? 'Replicating Data to Cloud...' : 'Start Full Cloud Sync Now'}</span>
                  </button>
                </div>
              </div>

              {/* Sync Report */}
              {syncReport && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Sync Successful ({syncReport.totalRecords} Records Synced)</span>
                    </h5>
                    <span className="text-xs font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                      {syncReport.mode}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {Object.entries(syncReport.syncedStores).map(([store, count]) => (
                      <div key={store} className="bg-white p-2 rounded-xl border border-emerald-200">
                        <p className="text-slate-500 font-mono text-[11px] truncate">{store}</p>
                        <p className="font-black text-slate-900 text-sm">{count} docs</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CREDENTIALS & CONFIG */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-orange-600" />
                  <span>Configure Live Firebase Credentials</span>
                </p>
                <p>
                  You can paste your Firebase Web App credentials below. They will be saved securely to your local browser storage and take effect immediately.
                </p>
              </div>

              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Credentials saved successfully! Reloading connection...</span>
                </div>
              )}

              <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Firebase API Key *</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Project ID *</label>
                    <input
                      type="text"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="careconnect-demo-1234"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">App ID</label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="1:123456789:web:abcdef"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Auth Domain</label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="your-project.firebaseapp.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleResetConfig}
                    className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition cursor-pointer"
                  >
                    Reset to Default
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    Save & Reconnect
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>Mode: <strong>{isFirebaseConfigured ? 'Production Cloud' : 'Developer Simulator'}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
