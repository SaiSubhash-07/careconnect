import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockCaregivers } from '../../data/mockData';
import {
  AlertOctagon,
  Phone,
  Navigation,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Sparkles,
  Shield,
  User,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Plus,
  BellRing
} from 'lucide-react';
import { speakText } from '../../utils/speech';
import { LiveTrackingMap } from '../Map/LiveTrackingMap';
import { AddMedicationModal } from './AddMedicationModal';

export const CaregiverDashboard = () => {
  const {
    senior,
    emergency,
    helpRequests,
    simulateCaregiverAccept,
    simulateCaregiverTimeout,
    simulateVolunteerAccept,
    resolveEmergency,
    acceptHelpRequest,
    markHelpRequestArrived,
    completeHelpRequest,
    language,
    t,
    openLiveMap,
    broadcastLiveLocation,
    mockSeniors,
    selectedSeniorId,
    selectSenior,
    medications,
    addMedication,
    markMedicineMissed,
    sendCaregiverMedReminder,
    caregiverPillReminder,
    dismissCaregiverPillReminder
  } = useApp();

  const [isAddMedOpen, setIsAddMedOpen] = useState(false);

  // Switch between Nurse Sunita (Caregiver) and Amit Patel (Volunteer)
  const [selectedResponder, setSelectedResponder] = useState('cg-1'); // 'cg-1' (Sunita) or 'vol-1' (Amit)

  const currentProfile = mockCaregivers.find(c => c.id === selectedResponder) || mockCaregivers[0];

  const handleAcceptEmergency = () => {
    if (selectedResponder === 'cg-1') {
      simulateCaregiverAccept();
    } else {
      simulateVolunteerAccept();
    }
  };

  const handleUnavailableEmergency = () => {
    simulateCaregiverTimeout();
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

      {/* Responder Profile Bar & Switcher */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-3xl flex items-center justify-center shadow-xs">
            {currentProfile.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentProfile.name}
              </h2>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {currentProfile.type.toUpperCase()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
              {currentProfile.role} • 📍 Current Radius: {currentProfile.distance}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentProfile.skills.map((skill, i) => (
                <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Responder Switcher & Map Trigger */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold flex gap-1 grow sm:grow-0">
            <button
              onClick={() => setSelectedResponder('cg-1')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-xl transition ${
                selectedResponder === 'cg-1'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👩‍⚕️ Nurse Sunita (Caregiver)
            </button>
            <button
              onClick={() => setSelectedResponder('vol-1')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-xl transition ${
                selectedResponder === 'vol-1'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🤝 Amit Patel (Volunteer)
            </button>
          </div>

          <button
            onClick={openLiveMap}
            className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm border border-slate-700 cursor-pointer shrink-0"
            title="Open Live GPS Map & Geofence Monitor"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>🗺️ Live Map</span>
          </button>
        </div>
      </div>

      {/* CLINICAL MEDICATION MANAGEMENT & TABLET TRACKER (New Feature) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-black shadow-inner">
              💊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Clinical Medication Management
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Rx Console
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Prescribe medicines, track daily pill adherence, and send urgent tablet reminders
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Monitored Senior Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-300 text-xs font-black text-slate-900">
              <span>{senior?.avatar || '👴'}</span>
              <span className="text-slate-500 font-bold hidden sm:inline">Senior:</span>
              <select
                value={senior?.id || selectedSeniorId}
                onChange={(e) => selectSenior(e.target.value)}
                className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer pr-1"
                title="Select Senior to view their tablets"
              >
                {mockSeniors?.map((s) => (
                  <option key={s.id} value={s.id} className="text-slate-900 bg-white font-bold">
                    {s.avatar} {s.name} ({s.age}y)
                  </option>
                ))}
              </select>
            </div>

            {/* + Add New Medication Button */}
            <button
              onClick={() => setIsAddMedOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              title="Prescribe and add new medication for senior citizen"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Medication</span>
            </button>
          </div>
        </div>

        {/* Adherence Counters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xl font-black text-slate-900">{medications.length}</span>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Prescribed</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xl font-black text-emerald-700">
              {medications.filter(m => m.status === 'taken').length}
            </span>
            <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">✓ Taken Today</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-xl font-black text-amber-700">
              {medications.filter(m => m.status === 'due').length}
            </span>
            <p className="text-[11px] text-amber-800 font-bold uppercase tracking-wider">⏰ Due Now</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-xl font-black text-rose-700">
              {medications.filter(m => m.status === 'missed').length}
            </span>
            <p className="text-[11px] text-rose-800 font-bold uppercase tracking-wider">⚠️ Missed / Overdue</p>
          </div>
        </div>

        {/* Active Caregiver Pill Reminder Banner */}
        {caregiverPillReminder && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-amber-900 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2 text-xs">
              <BellRing className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-black text-amber-950">
                  🔔 Urgent Reminder Sent by {caregiverPillReminder.caregiverName} at {caregiverPillReminder.sentAt}
                </p>
                <p className="font-semibold text-amber-900">
                  Target: <strong>{caregiverPillReminder.seniorName}</strong> • Tablet: <strong>{caregiverPillReminder.med.name}</strong> ({caregiverPillReminder.med.dosage})
                </p>
              </div>
            </div>
            <button
              onClick={dismissCaregiverPillReminder}
              className="px-3 py-1 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs transition cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tablets Roster */}
        <div className="space-y-3">
          {medications.map((med) => {
            const isTaken = med.status === 'taken';
            const isMissed = med.status === 'missed';
            const isSnoozed = med.status === 'snoozed';

            return (
              <div
                key={med.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isMissed
                    ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/40'
                    : isTaken
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    isMissed ? 'bg-rose-100 text-rose-700' : isTaken ? 'bg-emerald-100' : 'bg-blue-100'
                  }`}>
                    {med.icon || '💊'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-base leading-tight">
                        {med.name}
                      </h4>
                      <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {med.dosage}
                      </span>
                      {med.category && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md hidden md:inline">
                          {med.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      ⏰ Scheduled: <strong>{med.time}</strong> • {med.instructions || 'Take with water'}
                    </p>
                    {med.prescribedBy && (
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Rx: {med.prescribedBy}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      isTaken
                        ? 'bg-emerald-100 text-emerald-800'
                        : isMissed
                        ? 'bg-red-600 text-white animate-pulse'
                        : isSnoozed
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isTaken
                      ? `✓ Taken (${med.takenAt || 'Logged'})`
                      : isMissed
                      ? '⚠️ Missed / Not Taken!'
                      : isSnoozed
                      ? '⏰ Snoozed (15m)'
                      : '⏰ Due Now'}
                  </span>

                  {/* Actions */}
                  {!isTaken && (
                    <div className="flex items-center gap-1.5">
                      {/* Remind Senior Button */}
                      <button
                        onClick={() => sendCaregiverMedReminder(med.id, currentProfile.name)}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                        title="Send high-priority audio & toast reminder to senior"
                      >
                        <BellRing className="w-3.5 h-3.5 text-yellow-200 animate-bounce" />
                        <span>Remind Senior</span>
                      </button>

                      {/* Simulate Missed Tablet Button (for demo & testing) */}
                      {!isMissed && (
                        <button
                          onClick={() => markMedicineMissed(med.id)}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-bold rounded-xl text-xs transition cursor-pointer"
                          title="Simulate senior missing this scheduled dose"
                        >
                          <span>⚠️ Flag Missed</span>
                        </button>
                      )}

                      {/* Call Senior Link */}
                      <a
                        href={`tel:${senior?.phone || '9876543210'}`}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-300"
                        title={`Call ${senior?.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {isTaken && (
                    <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-100/70 px-2.5 py-1 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Safe & Completed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EMERGENCY SOS SECTION (Prompt Implementation) */}
      {emergency.isActive && (
        <div className="bg-white rounded-3xl overflow-hidden border-4 border-red-500 shadow-xl space-y-0">
          <div className="bg-red-600 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl animate-bounce">
                🚨
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  🚨 New Help Request (EMERGENCY)
                </h3>
                <p className="text-xs sm:text-sm text-red-100 font-medium">
                  One-Click Emergency Assistance Activated
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white text-red-700 font-black rounded-full text-xs uppercase tracking-wider">
              PRIORITY: HIGH
            </span>
          </div>

          <div className="p-6 space-y-5">
            {/* Senior info & distance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-red-50/50 border border-red-200 text-sm">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Senior</p>
                <p className="text-lg font-black text-slate-900">👴 {senior.name}</p>
                <p className="text-xs text-slate-600">Age: {senior.age} • Blood: {senior.bloodGroup}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Need</p>
                <p className="text-base font-bold text-red-700">Emergency Assistance</p>
                <p className="text-xs text-slate-600">{senior.address}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Distance & ETA</p>
                <p className="text-base font-bold text-slate-900">📍 {currentProfile.distance}</p>
                <p className="text-xs text-emerald-700 font-bold">~{currentProfile.etaMinutes} minutes arrival</p>
              </div>
            </div>

            {/* If NOT yet accepted by current profile: Show [ACCEPT] vs [UNAVAILABLE] */}
            {emergency.stage === 'contacting' || emergency.stage === 'caregiver_unavailable' ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAcceptEmergency}
                    className="flex-1 py-5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 transition active:scale-98"
                  >
                    <CheckCircle className="w-7 h-7" />
                    <span>{t('btnAccept')}</span>
                  </button>

                  <button
                    onClick={handleUnavailableEmergency}
                    className="flex-1 py-5 px-6 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xl flex items-center justify-center gap-3 border-2 border-slate-300 transition active:scale-98"
                  >
                    <XCircle className="w-7 h-7 text-red-600" />
                    <span>{t('btnUnavailable')}</span>
                  </button>
                </div>

                <p className="text-xs text-center text-slate-500 font-medium">
                  💡 Clicking <strong>{t('btnUnavailable')}</strong> will automatically trigger the smart cascade to another nearby volunteer or medical service.
                </p>
              </div>
            ) : (
              /* If Accepted: Show Status and prompt buttons: * Call Senior * Navigate * Mark Arrived * Complete Request */
              <div className="space-y-4 pt-2 border-t border-slate-200">
                {emergency.stage === 'escalated_ambulance' ? (
                  <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-500 flex items-center justify-between animate-pulse">
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-red-950 flex items-center gap-2">
                        <span>🚑 108 Ambulance Unit Dispatched</span>
                      </h4>
                      <p className="text-sm font-bold text-red-800 mt-0.5">
                        ETA: {emergency.etaMinutes || 5} minutes • Emergency Paramedics En Route to {senior.name}
                      </p>
                    </div>
                    <span className="text-xs font-black bg-red-600 text-white px-3 py-1 rounded-full uppercase">
                      CRITICAL 108 ALERT
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between">
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-emerald-950 flex items-center gap-2">
                        <span>{t('assistanceAccepted')}</span>
                      </h4>
                      <p className="text-sm font-bold text-emerald-800 mt-0.5">
                        ETA: {emergency.etaMinutes || 5} minutes • En Route to {senior.name}
                      </p>
                    </div>
                    <span className="text-xs font-black bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full uppercase">
                      ACTIVE MISSION
                    </span>
                  </div>
                )}

                {/* Embedded Live Route Map */}
                <div className="rounded-2xl overflow-hidden border border-emerald-300 shadow-sm">
                  <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>Live Responder Route to {senior.name} (500m Safe Geofence Active)</span>
                    </span>
                    <button
                      onClick={openLiveMap}
                      className="text-[11px] underline text-emerald-300 hover:text-white cursor-pointer"
                    >
                      Open Full Map ↗
                    </button>
                  </div>
                  <LiveTrackingMap height="h-56" showControls={false} />
                </div>

                {/* 4 Action Buttons Mandated by Prompt */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <a
                    href={`tel:${senior.phone}`}
                    className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm flex flex-col items-center justify-center gap-1.5 transition border border-slate-300"
                  >
                    <Phone className="w-5 h-5 text-emerald-600" />
                    <span>{t('btnCallSenior')}</span>
                  </a>

                  <button
                    onClick={() => {
                      speakText(`Starting navigation route to ${senior.address}. Live GPS tracking active.`, language);
                      openLiveMap();
                    }}
                    className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm flex flex-col items-center justify-center gap-1.5 transition border border-slate-300 cursor-pointer active:scale-95"
                  >
                    <Navigation className="w-5 h-5 text-blue-600" />
                    <span>{t('btnNavigate')}</span>
                  </button>

                  <button
                    onClick={() => {
                      speakText(`Marked as arrived at ${senior.name} residence.`, language);
                      alert('Status updated: You have marked yourself as Arrived!');
                    }}
                    className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm flex flex-col items-center justify-center gap-1.5 transition border border-slate-300"
                  >
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span>{t('btnMarkArrived')}</span>
                  </button>

                  <button
                    onClick={resolveEmergency}
                    className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex flex-col items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{t('btnCompleteRequest')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Routine Assistance Requests Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              🤝
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Community Assistance Requests
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Daily errands, grocery, clinic visits and companionship
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {helpRequests.length} Total
          </span>
        </div>

        <div className="space-y-4">
          {helpRequests.map((req) => {
            const isAccepted = req.status === 'accepted';
            const isInProgress = req.status === 'in_progress';
            const isCompleted = req.status === 'completed';

            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {req.category === 'grocery' ? '🛒' : req.category === 'hospital_visit' ? '🏥' : '🤝'}
                    </span>
                    <div>
                      <h4 className="font-black text-slate-900 text-base sm:text-lg">
                        {req.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Senior: <strong>{req.seniorName}</strong> • 📍 {req.address} ({req.distance})
                      </p>
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-black uppercase ${
                      isCompleted
                        ? 'bg-slate-200 text-slate-700'
                        : isAccepted || isInProgress
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                  {req.details}
                </p>

                {/* Actions depending on state */}
                {!isAccepted && !isInProgress && !isCompleted && (
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => acceptHelpRequest(req.id, currentProfile.name, currentProfile.role)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>[ ACCEPT ASSISTANCE ]</span>
                    </button>
                    <button
                      onClick={() => alert('Assistance declined. Smart dispatcher rerouting...')}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      [ UNAVAILABLE ]
                    </button>
                  </div>
                )}

                {(isAccepted || isInProgress) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={`tel:${senior.phone}`}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1 border border-slate-300"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Senior</span>
                    </a>

                    {!isInProgress && (
                      <button
                        onClick={() => markHelpRequestArrived(req.id)}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Mark Arrived</span>
                      </button>
                    )}

                    <button
                      onClick={() => completeHelpRequest(req.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete Request</span>
                    </button>
                  </div>
                )}

                {isCompleted && (
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Task completed and senior confirmed safe.</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Prescribed Medication Modal */}
      <AddMedicationModal
        isOpen={isAddMedOpen}
        onClose={() => setIsAddMedOpen(false)}
        defaultSeniorId={senior?.id}
      />

    </div>
  );
};
