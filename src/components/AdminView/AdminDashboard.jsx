// CareConnect Master System Admin Command Center
// Provides comprehensive administrative oversight and access across all user data:
// 1. All Senior Citizens Directory (Full health profile, vitals, prescriptions, live GPS)
// 2. All Family Guardians Directory
// 3. Clinical & Community Fleet (Nurses, Doctors, Volunteers, 108 EMS)
// 4. Emergency & Fall Incidents Incident Center
// 5. System Broadcast & Cloud Audit Controls

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockCaregivers } from '../../data/mockData';
import {
  MapPin,
  Phone,
  AlertOctagon,
  CheckCircle2,
  Send,
  Search,
  Radio,
  ExternalLink,
  Database
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const AdminDashboard = () => {
  const {
    mockSeniors,
    currentUser,
    emergency,
    helpRequests,
    addNotification,
    openLiveMap,
    openDbStudio,
    openFirebaseModal,
    isFirebaseConfigured,
    selectSenior,
    setActiveRole,
    language
  } = useApp();

  const [activeTab, setActiveTab] = useState('seniors'); // 'seniors' | 'family' | 'caregivers' | 'emergencies' | 'broadcast'
  const [searchQuery, setSearchQuery] = useState('');

  // Broadcast Notification Form State
  const [broadcastTitle, setBroadcastTitle] = useState('⚡ Clinical Service Notice');
  const [broadcastMsg, setBroadcastMsg] = useState('City weather alert: Severe heat advisory in effect. Seniors stay hydrated.');
  const [broadcastTarget, setBroadcastTarget] = useState('all'); // 'all' | 'senior' | 'family' | 'caregiver'
  const [broadcastType, setBroadcastType] = useState('info');

  // Aggregated Family Guardians across all seniors
  const allFamilyGuardians = mockSeniors.flatMap(s => 
    (s.familyContacts || []).map(f => ({
      ...f,
      seniorName: s.name,
      seniorId: s.id,
      seniorAddress: s.address
    }))
  );

  // Handle Switch into Senior view
  const handleJumpToSenior = (seniorId) => {
    selectSenior(seniorId);
    setActiveRole('senior');
    speakText('Switching to senior citizen profile view.', language);
  };

  // Handle Administrative Broadcast
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;

    addNotification(broadcastTitle, broadcastMsg, broadcastType, broadcastTarget);
    speakText('Administrative broadcast dispatched to target receivers.', language);
    setBroadcastTitle('');
    setBroadcastMsg('');
  };

  // Filtered Seniors
  const filteredSeniors = mockSeniors.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered Family
  const filteredFamily = allFamilyGuardians.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.seniorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.phone.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-600/30 border-2 border-purple-400/80 flex items-center justify-center text-3xl shadow-inner shrink-0">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-300 px-3 py-0.5 rounded-full border border-purple-400/40">
                Master Authority
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Supervision Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Master System Administrator Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Logged in as: <strong>{currentUser?.name || 'Dr. A. K. Varma'}</strong> ({currentUser?.badgeId || 'SYS-ADMIN-MASTER'}) • Tier-1 Full Data Access
            </p>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={openLiveMap}
            className="px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Telemetry Map</span>
          </button>

          <button
            onClick={openDbStudio}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <Database className="w-4 h-4 text-indigo-300" />
            <span>Database Studio</span>
          </button>

          <button
            onClick={openFirebaseModal}
            className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>🔥 Firebase</span>
            <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-300' : 'bg-amber-200'}`} />
          </button>
        </div>
      </div>

      {/* 2. System KPI Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl font-black">
            👴
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{mockSeniors.length}</span>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Registered Seniors</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-black">
            👨‍👩‍👧
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{allFamilyGuardians.length}</span>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Family Guardians</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-black">
            👩‍⚕️
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{mockCaregivers.length}</span>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Clinical Fleet</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl font-black">
            🚨
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {emergency.isActive ? '1 ACTIVE' : '0 IDLE'}
            </span>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Emergency State</p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs & Universal Search Bar */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('seniors')}
            className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'seniors'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>👴 All Seniors ({mockSeniors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'family'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>👨‍👩‍👧 Family Guardians ({allFamilyGuardians.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('caregivers')}
            className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'caregivers'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🩺 Responders & Fleet</span>
          </button>

          <button
            onClick={() => setActiveTab('emergencies')}
            className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'emergencies'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🚨 Incident Log</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'broadcast'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>📢 Broadcast Center</span>
          </button>
        </div>

        {/* Universal Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, address, phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {/* 4. Tab Content Area */}

      {/* TAB 1: ALL SENIORS DIRECTORY */}
      {activeTab === 'seniors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSeniors.map((senior) => (
              <div
                key={senior.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-rose-100 text-white flex items-center justify-center text-3xl shadow-inner border border-rose-200">
                      {senior.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-slate-900">{senior.name}</h4>
                        <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                          {senior.age} yrs • {senior.gender}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate max-w-xs">{senior.address}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-red-50 text-red-700 font-mono font-black text-xs rounded-xl border border-red-200">
                    Blood: {senior.bloodGroup}
                  </span>
                </div>

                {/* Conditions & Prescriptions pills */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
                      Clinical Diagnoses:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {senior.healthConditions?.map((cond, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold text-[11px]">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
                      Active Medications ({senior.medications?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {senior.medications?.map((m) => (
                        <span key={m.id} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-semibold text-[11px] flex items-center gap-1">
                          <span>{m.icon}</span>
                          <span>{m.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Telemetry & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="text-[11px] font-mono text-slate-500">
                    GPS: {senior.gpsCoords?.lat}° N, {senior.gpsCoords?.lng}° E
                  </div>

                  <button
                    onClick={() => handleJumpToSenior(senior.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Senior Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ALL FAMILY GUARDIANS DIRECTORY */}
      {activeTab === 'family' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h4 className="text-base font-black text-slate-900">
              Registered Family Guardians & Contacts ({allFamilyGuardians.length})
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Immediate next of kin with SOS broadcast permissions and telemetry access
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredFamily.map((fam, idx) => (
              <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-black">
                    {fam.avatar || '👨‍👩‍👧'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm sm:text-base font-black text-slate-900">{fam.name}</h5>
                      <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        {fam.relation}
                      </span>
                      {fam.isPrimary && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Linked Senior: <strong>👴 {fam.seniorName}</strong> ({fam.seniorAddress})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${fam.phone}`}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center gap-1.5 transition border border-slate-300"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{fam.phone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RESIDENTIAL RESPONDERS & CLINICAL FLEET */}
      {activeTab === 'caregivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockCaregivers.map((cg) => (
            <div
              key={cg.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-white flex items-center justify-center text-3xl shadow-inner border border-emerald-200">
                    {cg.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-black text-slate-900">{cg.name}</h4>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                        {cg.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {cg.roleTitle} • Badge: <strong className="font-mono text-slate-700">{cg.badgeId}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                    ★ {cg.rating} ({cg.completedAssists} tasks)
                  </span>
                </div>
              </div>

              {/* Skills and ETA */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
                    Specialized Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cg.skills?.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-semibold text-[11px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-slate-600 text-[11px]">
                  <span>Average Response Time: <strong>{cg.etaMinutes} mins</strong></span>
                  <span className="text-emerald-700 font-bold">● {cg.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <a
                  href={`tel:${cg.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{cg.phone}</span>
                </a>

                <span className="text-xs font-bold text-slate-500">
                  Assigned Radius: 2.5 km
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: EMERGENCY INCIDENT CENTER */}
      {activeTab === 'emergencies' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-600" />
                <span>Central Incident Dispatch Feed</span>
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time monitor of accelerometer falls, SOS triggers, and 108 ambulance handoffs
              </p>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
              emergency.isActive ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {emergency.isActive ? '🚨 Active Emergency' : '● System Safe'}
            </span>
          </div>

          {/* Current Live SOS Status */}
          {emergency.isActive ? (
            <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-black text-red-950 text-base">
                    Active Incident: {emergency.stage.replace('_', ' ').toUpperCase()}
                  </h5>
                  <p className="text-xs text-red-800 font-medium">
                    Started at: {emergency.startedAt} • Assigned Responder: {emergency.assignedHelper?.name}
                  </p>
                </div>
                <button
                  onClick={openLiveMap}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition"
                >
                  View Live GPS Radar
                </button>
              </div>

              <div className="space-y-1 pt-2 border-t border-red-200">
                {emergency.logs?.map((log) => (
                  <div key={log.id} className="text-xs flex items-center gap-2 text-red-900">
                    <span className="font-mono text-[10px] text-red-700">{log.time}</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-black text-slate-800 text-sm">All Senior Citizens Are Currently Safe</p>
              <p className="text-xs text-slate-500">No active SOS alerts or unhandled fall incidents.</p>
            </div>
          )}

          {/* Historical Help Requests */}
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              Community Assistance Requests ({helpRequests.length})
            </h5>
            <div className="space-y-2">
              {helpRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{req.title}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold text-[10px]">
                        {req.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{req.details} • For: {req.seniorName}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST CENTER */}
      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-orange-600" />
              <span>Broadcast System Notification to Receivers</span>
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Instantly push administrative alerts to targeted receivers with close options.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Receivers
              </label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="all">🌐 All Receivers (Seniors, Families, Caregivers, Volunteers)</option>
                <option value="senior">👴 Senior Citizens Only</option>
                <option value="family">👨‍👩‍👧 Family Guardians Only</option>
                <option value="caregiver">👩‍⚕️ Caregivers & Volunteers Only</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Notification Severity / Type
              </label>
              <select
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="info">ℹ️ Informational (Blue)</option>
                <option value="success">✅ Success / Operational (Green)</option>
                <option value="warning">⚠️ Warning / Precautionary (Amber)</option>
                <option value="danger">🚨 Critical / High Priority (Red)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Notification Headline
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Weather Alert, System Update"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Detailed Message Content
              </label>
              <textarea
                rows={3}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Enter alert details..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Push Alert Now</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
