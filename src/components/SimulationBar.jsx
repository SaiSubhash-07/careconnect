import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sliders,
  AlertOctagon,
  Clock,
  UserX,
  UserCheck,
  Ambulance,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Database,
  Navigation,
  Shield,
  Server
} from 'lucide-react';

export const SimulationBar = () => {
  const {
    emergency,
    triggerEmergency,
    simulateCaregiverTimeout,
    simulateCaregiverAccept,
    simulateVolunteerAccept,
    escalateToAmbulance,
    resolveEmergency,
    logout,
    activeRole,
    loginAsAdmin,
    fallAlert,
    triggerFallDetection,
    openDbStudio,
    isDbReady,
    openLiveMap,
    openFirebaseModal,
    isFirebaseConfigured,
    openBackendStudio,
    isBackendOnline,
    medications,
    markMedicineMissed,
    sendCaregiverMedReminder
  } = useApp();

  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border-b border-slate-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-indigo-500 text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
              Hackathon Demo Simulator Bar
            </span>
            <span className="hidden sm:inline-block text-[11px] text-slate-400">
              (Simulate response flows, fall detection & auto-escalations)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-200 border border-slate-600">
              SOS Status: <strong className={fallAlert?.isActive ? 'text-amber-400 uppercase font-black animate-pulse' : emergency.isActive ? 'text-red-400 uppercase' : 'text-emerald-400'}>
                {fallAlert?.isActive ? `⚠️ FALL DETECTED (${fallAlert.countdown}s)` : emergency.isActive ? emergency.stage.replace('_', ' ') : 'Idle (Safe)'}
              </strong>
            </span>

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <span>{expanded ? 'Hide Controls' : 'Show Controls'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="pt-2 pb-1 flex flex-wrap items-center gap-2 border-t border-slate-700/60 mt-2">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Triggers:</span>

            {/* 🗄️ Database Studio & Live Inspector Modal Trigger */}
            <button
              onClick={openDbStudio}
              className="px-2.5 py-1 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition shadow-sm border border-indigo-400/40 cursor-pointer"
              title="Open CareConnect Database Studio & Live Inspector"
            >
              <Database className="w-3.5 h-3.5 text-indigo-200" />
              <span>🗄️ Database Studio</span>
              <span className={`w-2 h-2 rounded-full ${isDbReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* 🗺️ Live GPS Tracking & Geofence Map Trigger */}
            <button
              onClick={openLiveMap}
              className="px-2.5 py-1 bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-800 hover:from-blue-600 hover:to-sky-600 text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition shadow-sm border border-blue-400/40 cursor-pointer"
              title="Open Integrated Live GPS Tracking Map & Geofence Network"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-200" />
              <span>🗺️ Live Map</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>

            {/* 🔥 Firebase Cloud Infrastructure & Real-Time Sync Trigger */}
            <button
              onClick={openFirebaseModal}
              className="px-2.5 py-1 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition shadow-sm border border-amber-400/40 cursor-pointer"
              title="Open Firebase Cloud Infrastructure & Real-Time Sync Studio"
            >
              <span>🔥 Firebase Cloud</span>
              <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400 animate-ping' : 'bg-amber-300'}`} />
            </button>

            {/* 🖥️ Node.js Express + SQLite Backend Server Studio */}
            <button
              onClick={openBackendStudio}
              className="px-2.5 py-1 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition shadow-sm border border-emerald-400/40 cursor-pointer"
              title="Open CareConnect Express + SQLite Backend Studio & API Engine"
            >
              <Server className="w-3.5 h-3.5 text-emerald-200" />
              <span>🖥️ Backend Server</span>
              <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            </button>

            {/* 🛡️ Master Admin Command Portal (Access All Users Data) */}
            <button
              onClick={loginAsAdmin}
              className="px-2.5 py-1 bg-gradient-to-r from-purple-700 via-violet-700 to-fuchsia-800 hover:from-purple-600 hover:to-violet-600 text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition shadow-sm border border-purple-400/40 cursor-pointer"
              title="Open Master System Admin Portal (Access All Users Data)"
            >
              <Shield className="w-3.5 h-3.5 text-purple-200" />
              <span>🛡️ Admin Portal</span>
              {activeRole === 'admin' && <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />}
            </button>

            {/* Simulate Fall Detection (New Feature) */}
            <button
              onClick={() => triggerFallDetection(3.4)}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition shadow-sm animate-pulse"
              title="Simulate sudden senior fall impact (15s automatic countdown)"
            >
              <span>💥 Simulate Fall</span>
            </button>

            {/* Simulate Missed Tablet & Caregiver Reminder (New Feature) */}
            <button
              onClick={() => {
                const targetMed = medications[0];
                if (targetMed) {
                  markMedicineMissed(targetMed.id);
                  sendCaregiverMedReminder(targetMed.id, 'Nurse Sunita Devi');
                }
              }}
              className="px-2.5 py-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Simulate senior missing a tablet and caregiver sending urgent reminder"
            >
              <span>💊 Missed Tablet & Remind</span>
            </button>

            {/* Trigger Emergency */}
            <button
              onClick={() => triggerEmergency()}
              disabled={emergency.isActive && emergency.stage !== 'idle'}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Click to trigger Senior SOS flow"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>1. Trigger SOS</span>
            </button>

            {/* Simulate Caregiver Timeout / Unavailable */}
            <button
              onClick={simulateCaregiverTimeout}
              disabled={!emergency.isActive || emergency.stage === 'volunteer_dispatched' || emergency.stage === 'escalated_ambulance'}
              className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Simulate Caregiver unresponsiveness -> Cascades to Volunteer Amit"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>2. Caregiver Unavailable (Cascade)</span>
            </button>

            {/* Volunteer Dispatched / Accept */}
            <button
              onClick={simulateVolunteerAccept}
              disabled={!emergency.isActive}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Simulate Volunteer Amit Patel acceptance with 7m ETA"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>3. Volunteer Dispatched (7m)</span>
            </button>

            {/* Escalate to 108 Ambulance (Enabled anytime for testing) */}
            <button
              onClick={escalateToAmbulance}
              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Escalate directly to 108 Emergency Medical Services Ambulance"
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>4. Escalate 108 Ambulance</span>
            </button>

            {/* Caregiver Accepts directly */}
            <button
              onClick={simulateCaregiverAccept}
              disabled={!emergency.isActive}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Simulate Nurse Sunita accepting directly"
            >
              <span>👩‍⚕️ Nurse Accepts (4m)</span>
            </button>

            {/* Test Login Pages */}
            <button
              onClick={logout}
              className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Open Separate Role Login Pages for Senior, Family & Caregiver"
            >
              <span>🚪 Role Login Pages</span>
            </button>

            {/* Resolve Emergency */}
            <button
              onClick={resolveEmergency}
              disabled={!emergency.isActive}
              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm ml-auto"
              title="Mark situation safe and complete"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolve & Safe</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
