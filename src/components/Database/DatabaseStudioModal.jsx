import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { db, DB_STORES } from '../../db/careConnectDB';
import {
  Database,
  Search,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  X,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Users,
  Pill,
  Hospital,
  AlertOctagon,
  Activity,
  HeartHandshake,
  FileText,
  Eye,
  Code
} from 'lucide-react';

export const DatabaseStudioModal = ({ isOpen, onClose }) => {
  const { addNotification, openFirebaseModal, isFirebaseConfigured } = useApp();
  const [activeStore, setActiveStore] = useState(DB_STORES.SENIORS);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'json'
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const fileInputRef = useRef(null);

  const storeMeta = [
    { key: DB_STORES.SENIORS, label: 'Seniors', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { key: DB_STORES.MEDICATIONS, label: 'Medications', icon: Pill, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { key: DB_STORES.APPOINTMENTS, label: 'Appointments', icon: Hospital, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { key: DB_STORES.EMERGENCY_LOGS, label: 'Emergency Logs', icon: AlertOctagon, color: 'text-red-600 bg-red-50 border-red-200' },
    { key: DB_STORES.FALL_INCIDENTS, label: 'Fall Incidents', icon: Activity, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { key: DB_STORES.HELP_REQUESTS, label: 'Help Requests', icon: HeartHandshake, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { key: DB_STORES.AUDIT_LOGS, label: 'Audit Logs', icon: FileText, color: 'text-slate-600 bg-slate-50 border-slate-200' }
  ];

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [tableData, storeStats] = await Promise.all([
        db.getAll(activeStore),
        db.getStats()
      ]);
      setRecords(tableData || []);
      setStats(storeStats || {});
    } catch (err) {
      console.error('Failed to load database store:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeStore]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      const unsubscribe = db.subscribe(() => {
        loadData();
      });
      return () => unsubscribe();
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  const showStatus = (msg, type = 'success') => {
    setStatusMessage({ msg, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleExport = async () => {
    try {
      const backup = await db.exportDatabase();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `careconnect_db_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showStatus('Database exported successfully as JSON!');
      addNotification('Database Exported', 'JSON snapshot downloaded to your device.', 'success', 'all');
    } catch (err) {
      showStatus('Failed to export database: ' + err.message, 'error');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result);
        await db.importDatabase(json);
        await loadData();
        showStatus('Database successfully restored from JSON!');
        addNotification('Database Restored', 'All tables populated from imported backup.', 'success', 'all');
      } catch (err) {
        showStatus('Failed to restore database: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReSeed = async () => {
    if (window.confirm('Reset all tables to clean hackathon demo data?')) {
      setIsLoading(true);
      await db.resetDatabase();
      await loadData();
      showStatus('Database re-seeded with clean demo data!');
      addNotification('Database Seeded', 'Clean profiles and schedules initialized.', 'info', 'all');
    }
  };

  const handleWipe = async () => {
    if (window.confirm('Are you sure you want to wipe all records in this database?')) {
      setIsLoading(true);
      for (const store of Object.values(DB_STORES)) {
        await db.clear(store);
      }
      await db.logAudit('DATABASE_WIPE', 'Evaluator', 'All tables wiped manually.');
      await loadData();
      showStatus('Database wiped clean.', 'warning');
      addNotification('Database Wiped', 'All stores cleared for testing.', 'warning', 'all');
    }
  };

  const filteredRecords = records.filter(item => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return JSON.stringify(item).toLowerCase().includes(query);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  CareConnect Database Studio
                </h3>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  IndexedDB Active
                </span>
                <button
                  onClick={() => {
                    onClose();
                    openFirebaseModal();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition cursor-pointer"
                  title="Click to open Firebase Cloud Firestore Studio"
                >
                  <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span>🔥 Cloud: {isFirebaseConfigured ? 'Live' : 'Simulator'} ↗</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Browser-Native Persistent Storage Engine • DB: <strong className="text-slate-300 font-mono">CareConnectDB_v1</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close Database Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div className={`py-2 px-4 text-xs font-bold flex items-center justify-between transition ${
            statusMessage.type === 'error'
              ? 'bg-rose-900/80 text-rose-200 border-b border-rose-700'
              : statusMessage.type === 'warning'
              ? 'bg-amber-900/80 text-amber-200 border-b border-amber-700'
              : 'bg-emerald-900/80 text-emerald-200 border-b border-emerald-700'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusMessage.msg}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Store Selection Tabs */}
        <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          {storeMeta.map(({ key, label, icon: Icon }) => {
            const count = stats[key] ?? 0;
            const isActive = activeStore === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveStore(key);
                  setSearchQuery('');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                  isActive ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Studio Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search in ${activeStore}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-400 text-xs border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Database Operations & View Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex rounded-xl bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Card / Table View"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Records</span>
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  viewMode === 'json' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Raw JSON View"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Raw JSON</span>
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={loadData}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              title="Export database to JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            {/* Import JSON */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              title="Import database from JSON file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>

            {/* Re-Seed Defaults */}
            <button
              onClick={handleReSeed}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Reset to clean hackathon demo data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Seed Defaults</span>
            </button>

            {/* Firebase Cloud Sync */}
            <button
              onClick={() => {
                onClose();
                openFirebaseModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Open Firebase Cloud Firestore Sync & Management"
            >
              <span>🔥 Cloud Sync</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConfigured ? 'bg-emerald-300' : 'bg-amber-200'}`} />
            </button>

            {/* Wipe DB */}
            <button
              onClick={handleWipe}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-rose-400 border border-rose-500/30 transition"
              title="Wipe all tables"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Records Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/50 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
              <p className="text-sm font-semibold">Reading from IndexedDB...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
              <div className="p-4 rounded-3xl bg-slate-800/80 mb-3 border border-slate-700">
                <Database className="w-10 h-10 text-slate-500" />
              </div>
              <h4 className="text-base font-bold text-slate-200">No records found in {activeStore}</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {searchQuery ? 'Try adjusting your search query filter.' : 'This table is currently empty.'}
              </p>
              <button
                onClick={handleReSeed}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition"
              >
                Seed Default Hackathon Data
              </button>
            </div>
          ) : viewMode === 'json' ? (
            /* Raw JSON View */
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 overflow-x-auto">
              <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(filteredRecords, null, 2)}
              </pre>
            </div>
          ) : (
            /* Card / Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredRecords.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-indigo-500/50 transition shadow-sm space-y-2.5 group"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-mono text-xs font-black text-indigo-300">
                        {item.id || `Record #${idx + 1}`}
                      </span>
                    </div>
                    {item.status && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.status === 'due'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : item.status === 'taken' || item.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>

                  {/* Dynamic Field Display */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    {Object.entries(item).map(([k, v]) => {
                      if (k === 'id' || k === 'status') return null;
                      let displayVal = v;
                      if (typeof v === 'object' && v !== null) {
                        displayVal = JSON.stringify(v);
                      }
                      return (
                        <div key={k} className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {k}
                          </span>
                          <span className="font-medium text-slate-200 truncate" title={String(displayVal)}>
                            {String(displayVal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <span>IndexedDB Table: <strong className="text-slate-200">{activeStore}</strong> ({filteredRecords.length} records shown)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};
