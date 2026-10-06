import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Activity,
  Zap,
  Terminal,
  RefreshCw,
  CheckCircle2,
  Play,
  Copy,
  Check,
  X,
  Radio,
  Layers
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const AVAILABLE_TABLES = [
  { id: 'seniors', name: 'Seniors', icon: '👴', desc: 'Seniors profile records, health conditions, & GPS telemetry' },
  { id: 'medications', name: 'Medications', icon: '💊', desc: 'Caregiver prescriptions, dosage timings, & intake logs' },
  { id: 'emergencies', name: 'Emergencies', icon: '🚨', desc: 'SOS alerts, 108 dispatches, & escalation stages' },
  { id: 'telemetry', name: 'Telemetry', icon: '📍', desc: 'High-frequency GPS coordinate breadcrumbs' },
  { id: 'notifications', name: 'Notifications', icon: '🔔', desc: 'Targeted broadcast alerts for caregivers & volunteers' },
  { id: 'audit_logs', name: 'Audit Logs', icon: '📜', desc: 'Tamper-evident medical & emergency dispatch action history' }
];

const PRESET_ENDPOINTS = [
  {
    name: 'Check Server Health',
    method: 'GET',
    path: '/api/health',
    desc: 'Verify Express server uptime and active SSE connections',
    body: null
  },
  {
    name: 'Get All Seniors',
    method: 'GET',
    path: '/api/seniors',
    desc: 'Fetch all enrolled seniors with health profiles & latest coordinates',
    body: null
  },
  {
    name: 'Get All Medications',
    method: 'GET',
    path: '/api/medications',
    desc: 'Query all prescribed medications across seniors',
    body: null
  },
  {
    name: 'Caregiver: Add Prescription',
    method: 'POST',
    path: '/api/medications',
    desc: 'Prescribe a new medication via backend REST API',
    body: {
      seniorId: 'senior-1',
      name: 'Multivitamin Gold 500mg',
      dosage: '1 Tablet',
      time: '10:00 AM',
      instructions: 'Take with morning milk',
      category: 'Supplements',
      prescribedBy: 'Dr. Rajesh Sharma'
    }
  },
  {
    name: 'Simulate Fall Alert (3.4G)',
    method: 'POST',
    path: '/api/seniors/senior-1/fall-alert',
    desc: 'Trigger emergency fall detection and broadcast to caregiver SSE',
    body: { gForce: 3.4 }
  },
  {
    name: 'Trigger SOS Emergency',
    method: 'POST',
    path: '/api/emergencies/trigger',
    desc: 'Initiate emergency cascade (caregiver -> volunteer -> 108)',
    body: {
      seniorId: 'senior-1',
      reason: 'Sudden chest discomfort reported via panic button'
    }
  },
  {
    name: 'List Notifications',
    method: 'GET',
    path: '/api/notifications',
    desc: 'Retrieve all alerts sent to family, caregivers, or volunteers',
    body: null
  }
];

export default function BackendStudioModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, tables, tester, sse, logs
  const [serverHealth, setServerHealth] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [selectedTable, setSelectedTable] = useState('seniors');
  const [tableData, setTableData] = useState(null);
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  // Live SSE stream state
  const [sseEvents, setSseEvents] = useState([]);
  const [sseConnected, setSseConnected] = useState(false);

  // Tester state
  const [selectedEndpoint, setSelectedEndpoint] = useState(PRESET_ENDPOINTS[0]);
  const [customBody, setCustomBody] = useState(JSON.stringify(PRESET_ENDPOINTS[0].body, null, 2) || '');
  const [apiResponse, setApiResponse] = useState(null);
  const [isExecutingApi, setIsExecutingApi] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Server request logs
  const [serverLogs, setServerLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Poll health when modal is open
  const checkHealth = async () => {
    setIsCheckingHealth(true);
    const result = await apiService.checkHealth();
    setServerHealth(result);
    setIsCheckingHealth(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    checkHealth();
    const interval = setInterval(checkHealth, 5000);

    // Subscribe to real-time SSE
    const unsubscribeSSE = apiService.connectSSE((event) => {
      setSseConnected(true);
      setSseEvents(prev => [
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          data: event
        },
        ...prev.slice(0, 49) // Keep last 50 events
      ]);
    });

    return () => {
      clearInterval(interval);
      unsubscribeSSE();
    };
  }, [isOpen]);

  // Load selected table data
  useEffect(() => {
    if (!isOpen || activeTab !== 'tables') return;

    let isMounted = true;
    const fetchTable = async () => {
      setIsLoadingTable(true);
      const res = await apiService.getAdminTable(selectedTable);
      if (isMounted) {
        setTableData(res);
        setIsLoadingTable(false);
      }
    };

    fetchTable();
    return () => { isMounted = false; };
  }, [isOpen, activeTab, selectedTable]);

  // Load server logs
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    const res = await apiService.getAdminLogs();
    if (res?.logs) {
      setServerLogs(res.logs);
    }
    setIsLoadingLogs(false);
  };

  useEffect(() => {
    if (!isOpen || activeTab !== 'logs') return;
    fetchLogs();
    const logInterval = setInterval(fetchLogs, 3000);
    return () => clearInterval(logInterval);
  }, [isOpen, activeTab]);

  // Execute API tester
  const handleExecuteApi = async () => {
    setIsExecutingApi(true);
    setApiResponse(null);
    const start = performance.now();

    try {
      let body = null;
      if (selectedEndpoint.method !== 'GET' && customBody) {
        try {
          body = JSON.parse(customBody);
        } catch {
          setApiResponse({
            status: 400,
            duration: '0ms',
            data: { error: 'Invalid JSON body format' }
          });
          setIsExecutingApi(false);
          return;
        }
      }

      const res = await fetch(`http://localhost:5000${selectedEndpoint.path}`, {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });

      const duration = `${(performance.now() - start).toFixed(1)}ms`;
      const data = await res.json();

      setApiResponse({
        status: res.status,
        statusText: res.statusText,
        duration,
        data
      });

      // Also refresh table if we mutated data
      if (selectedEndpoint.method !== 'GET') {
        fetchLogs();
        if (activeTab === 'tables') {
          const tableRes = await apiService.getAdminTable(selectedTable);
          setTableData(tableRes);
        }
      }
    } catch (err) {
      const duration = `${(performance.now() - start).toFixed(1)}ms`;
      setApiResponse({
        status: 'FETCH_ERROR',
        duration,
        data: { error: err.message, suggestion: 'Ensure backend is running with "npm run server"' }
      });
    } finally {
      setIsExecutingApi(false);
    }
  };

  const handleCopyResponse = () => {
    if (!apiResponse) return;
    navigator.clipboard.writeText(JSON.stringify(apiResponse.data, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  if (!isOpen) return null;

  const isOnline = serverHealth?.online;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[90vh] max-h-[820px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">CareConnect Backend Studio & Engine</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono">
                  Port 5000
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Node 24 Native SQLite (WAL Mode) • Express REST Core • Server-Sent Events (SSE)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Health status badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              {isOnline ? 'Express Server Online' : 'Server Offline'}
            </div>

            <button
              onClick={checkHealth}
              disabled={isCheckingHealth}
              title="Ping Backend"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isCheckingHealth ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-2 bg-slate-950/50 border-b border-slate-800 shrink-0 overflow-x-auto text-sm">
          {[
            { id: 'overview', label: 'Architecture Overview', icon: Layers },
            { id: 'tables', label: 'SQLite Tables', icon: Database },
            { id: 'tester', label: 'Live API Tester', icon: Play },
            { id: 'sse', label: 'Real-Time SSE Stream', icon: Radio },
            { id: 'logs', label: 'Request Logs', icon: Terminal }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-900/60">
          
          {/* 1. ARCHITECTURE OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  Dual-Engine Architecture: Node.js 24 + Browser Resilience
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  CareConnect 360 runs a production-grade <strong>Express REST API</strong> powered by Node.js 24's native high-performance <strong><code className="text-emerald-400">node:sqlite</code></strong> database engine in WAL (Write-Ahead Logging) mode. It combines instantaneous Server-Sent Events (SSE) push streaming with automatic browser-side IndexedDB fallback for fail-safe senior care even if network connections drop.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-xs text-slate-400 font-mono">SERVER STATUS</span>
                    <p className={`text-base font-bold mt-1 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isOnline ? 'ACTIVE (Port 5000)' : 'OFFLINE'}
                    </p>
                    <span className="text-xs text-slate-500">http://localhost:5000</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-xs text-slate-400 font-mono">DATABASE ENGINE</span>
                    <p className="text-base font-bold text-blue-400 mt-1">Node 24 Native SQLite</p>
                    <span className="text-xs text-slate-500">server/careconnect.db (WAL)</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-xs text-slate-400 font-mono">REAL-TIME PROTOCOL</span>
                    <p className="text-base font-bold text-amber-400 mt-1">Server-Sent Events (SSE)</p>
                    <span className="text-xs text-slate-500">/api/events (Live Stream)</span>
                  </div>
                </div>
              </div>

              {/* Endpoint Catalog */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5">
                <h4 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Mounted REST API Endpoints
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                    <span><strong className="text-blue-400">GET</strong> /api/health</span>
                    <span className="text-slate-500">Liveness & Uptime</span>
                  </div>
                  <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                    <span><strong className="text-amber-400">GET</strong> /api/events</span>
                    <span className="text-slate-500">Real-Time SSE Stream</span>
                  </div>
                  <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                    <span><strong className="text-blue-400">GET</strong> /api/seniors</span>
                    <span className="text-slate-500">Seniors + Medical Info</span>
                  </div>
                  <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                    <span><strong className="text-emerald-400">POST</strong> /api/seniors/:id/fall-alert</span>
                    <span className="text-slate-500">Accelerometer Alert</span>
                  </div>
                  <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                    <span><strong className="text-blue-400">GET</strong> /api/medications</span>
                    <span className="text-slate-500">List Prescriptions</span>
                  </div>
                  <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                    <span><strong className="text-emerald-400">POST</strong> /api/medications</span>
                    <span className="text-slate-500">Caregiver Add Medicine</span>
                  </div>
                  <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                    <span><strong className="text-amber-400">POST</strong> /api/emergencies/trigger</span>
                    <span className="text-slate-500">SOS Trigger & 108</span>
                  </div>
                  <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                    <span><strong className="text-rose-400">DELETE</strong> /api/notifications/:id</span>
                    <span className="text-slate-500">Dismiss Notification</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SQLITE TABLES TAB */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TABLES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTable(t.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      selectedTable === t.id
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>

              {/* Table Viewer Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 text-xs">
                  <div className="text-slate-300 font-mono">
                    Table: <strong className="text-blue-400">{selectedTable}</strong> • {tableData?.count ?? 0} Rows
                  </div>
                  <button
                    onClick={async () => {
                      setIsLoadingTable(true);
                      const res = await apiService.getAdminTable(selectedTable);
                      setTableData(res);
                      setIsLoadingTable(false);
                    }}
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTable ? 'animate-spin text-blue-400' : ''}`} />
                    Refresh
                  </button>
                </div>

                {isLoadingTable ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Querying SQLite table...
                  </div>
                ) : tableData?.rows?.length > 0 ? (
                  <div className="overflow-x-auto max-h-[420px]">
                    <table className="w-full text-left text-xs border-collapse font-mono">
                      <thead className="sticky top-0 bg-slate-900 border-b border-slate-700 text-slate-400">
                        <tr>
                          {Object.keys(tableData.rows[0]).map(col => (
                            <th key={col} className="p-2.5 font-semibold text-slate-300 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {tableData.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            {Object.values(row).map((val, cIdx) => (
                              <td key={cIdx} className="p-2.5 text-slate-300 whitespace-nowrap max-w-[280px] truncate">
                                {typeof val === 'object' && val !== null
                                  ? JSON.stringify(val)
                                  : String(val ?? 'NULL')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 text-sm">
                    No rows currently present in this SQLite table.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. LIVE API TESTER TAB */}
          {activeTab === 'tester' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
              {/* Presets List */}
              <div className="lg:col-span-4 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Select Endpoint Preset
                </span>
                {PRESET_ENDPOINTS.map((preset, idx) => {
                  const isSelected = selectedEndpoint.name === preset.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedEndpoint(preset);
                        setCustomBody(preset.body ? JSON.stringify(preset.body, null, 2) : '');
                        setApiResponse(null);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500/80 shadow-md'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                          preset.method === 'GET' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          preset.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {preset.method}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate">{preset.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{preset.path}</p>
                    </div>
                  );
                })}
              </div>

              {/* Execution Console */}
              <div className="lg:col-span-8 flex flex-col space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                      selectedEndpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                      selectedEndpoint.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {selectedEndpoint.method}
                    </span>
                    <input
                      type="text"
                      readOnly
                      value={`http://localhost:5000${selectedEndpoint.path}`}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200"
                    />
                    <button
                      onClick={handleExecuteApi}
                      disabled={isExecutingApi}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                    >
                      <Play className={`w-3.5 h-3.5 ${isExecutingApi ? 'animate-spin' : ''}`} />
                      Send Request
                    </button>
                  </div>

                  {/* Body Editor for POST/PATCH */}
                  {selectedEndpoint.method !== 'GET' && (
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 mb-1 block">Request Body (JSON):</span>
                      <textarea
                        value={customBody}
                        onChange={(e) => setCustomBody(e.target.value)}
                        rows={5}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* API Response Display */}
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col min-h-[220px]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-mono text-slate-400 flex items-center gap-2">
                      Response Output
                      {apiResponse && (
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                          apiResponse.status === 200 || apiResponse.status === 201
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          Status: {apiResponse.status} • {apiResponse.duration}
                        </span>
                      )}
                    </span>
                    {apiResponse && (
                      <button
                        onClick={handleCopyResponse}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                      >
                        {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedResponse ? 'Copied!' : 'Copy JSON'}
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto mt-2 font-mono text-xs max-h-[260px]">
                    {isExecutingApi ? (
                      <div className="text-center py-10 text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                        Executing HTTP request against Express backend...
                      </div>
                    ) : apiResponse ? (
                      <pre className="text-slate-200 p-2 bg-slate-900/60 rounded-lg overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(apiResponse.data, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        Click "Send Request" above to test this endpoint live against the Express server.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. SSE REAL-TIME STREAM TAB */}
          {activeTab === 'sse' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">EventSource Real-Time Push Stream</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        sseConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {sseConnected ? 'STREAM ACTIVE' : 'CONNECTING...'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Listening to <code className="text-amber-400 font-mono">http://localhost:5000/api/events</code></p>
                  </div>
                </div>
                <button
                  onClick={() => setSseEvents([])}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg"
                >
                  Clear Events
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-[460px] overflow-y-auto font-mono text-xs space-y-2">
                {sseEvents.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <Radio className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    Listening for real-time broadcasts... Trigger an SOS, Fall Alert, or Prescription to see events push live!
                  </div>
                ) : (
                  sseEvents.map((evt) => (
                    <div key={evt.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="text-amber-400 font-bold flex items-center gap-1.5">
                          <Zap className="w-3 h-3" />
                          {evt.data?.type || 'EVENT'}
                        </span>
                        <span>{evt.time}</span>
                      </div>
                      <pre className="text-emerald-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(evt.data?.payload || evt.data, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 5. REQUEST LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs text-slate-400 font-mono">
                  Live HTTP Request Inspector • {serverLogs.length} recent requests
                </span>
                <button
                  onClick={fetchLogs}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin text-blue-400' : ''}`} />
                  Refresh Logs
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-[480px] overflow-y-auto font-mono text-xs space-y-1.5">
                {serverLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    No requests recorded yet. Make API calls to see real-time HTTP traces.
                  </div>
                ) : (
                  serverLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800/80 hover:bg-slate-900">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                          log.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' :
                          log.method === 'PATCH' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {log.method}
                        </span>
                        <span className="text-slate-200">{log.url}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span className={`font-semibold ${
                          log.status >= 200 && log.status < 300 ? 'text-emerald-400' :
                          log.status >= 400 ? 'text-rose-400' : 'text-slate-300'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-slate-500">{log.duration}</span>
                        <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>SQLite Database: <code className="text-slate-300">server/careconnect.db</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
}
