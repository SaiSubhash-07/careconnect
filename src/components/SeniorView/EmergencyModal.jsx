import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertOctagon,
  Phone,
  ShieldCheck,
  Clock,
  MapPin,
  Ambulance,
  CheckCircle,
  XCircle,
  Volume2,
  Navigation,
  ArrowRight,
  UserX,
  Sparkles,
  HeartHandshake,
  X
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const EmergencyModal = () => {
  const {
    emergency,
    resolveEmergency,
    escalateToAmbulance,
    simulateCaregiverTimeout,
    simulateCaregiverAccept,
    simulateVolunteerAccept,
    setActiveModal,
    senior,
    fontSize,
    highContrast,
    language,
    t,
    formattedTime,
    liveLocation
  } = useApp();

  const [counter, setCounter] = useState(0);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveModal]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(c => c + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReadAloud = () => {
    if (emergency.stage === 'contacting') {
      speakText(
        `${t('emergencyModalTitle')}. ${senior.name}. ${t('familyNotified')}. ${t('caregiverNotified')}. ${t('waitingForResponse')}.`,
        language
      );
    } else if (emergency.stage === 'caregiver_unavailable') {
      speakText(
        `${t('caregiverUnavailable')}. ${t('findingAnotherPerson')}.`,
        language
      );
    } else if (emergency.stage === 'volunteer_dispatched') {
      speakText(
        `${t('volunteerFound', { name: emergency.assignedHelper?.name || 'Amit Patel' })}. ${t('smartExplanation')}`,
        language
      );
    } else if (emergency.stage === 'escalated_ambulance') {
      speakText(
        `${t('dial108')}. Ambulance dispatched.`,
        language
      );
    }
  };

  return (
    <div
      onClick={() => setActiveModal(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer"
      title="Click anywhere outside to close window"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transition-all my-auto border-4 cursor-default ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-red-500'
        }`}
      >
        {/* Top Emergency Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 sm:p-6 text-center relative shadow-lg">
          {/* Top-Right Dedicated Close Button */}
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/35 active:scale-95 text-white transition border border-white/30 text-xs sm:text-sm font-black shadow-md cursor-pointer"
            title="Close Emergency Window (Esc)"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 border-4 border-white/40 mb-2 animate-bounce">
            <AlertOctagon className="w-10 h-10 text-white fill-white" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase">
            {t('emergencyModalTitle')}
          </h2>
          <p className="text-red-100 font-medium text-base sm:text-lg mt-1">
            {t('emergencyModalSub')}
          </p>

          <button
            onClick={handleReadAloud}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/25 hover:bg-white/35 text-white text-sm font-bold backdrop-blur transition"
            title="Read screen aloud"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t('readStatusAloud')}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-6">

          {/* Quick Senior & Location Context Card */}
          <div
            className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              highContrast
                ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('seniorLocation')}
              </p>
              <h3 className="text-xl sm:text-2xl font-black">
                👴 {senior.name}
              </h3>
              <p className="text-sm font-semibold flex items-center gap-1 text-slate-700 mt-0.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{liveLocation.address}</span>
              </p>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                📡 GPS: {liveLocation.lat}° N, {liveLocation.lng}° E (±{liveLocation.accuracy}m)
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span>SOS Active ({counter}s)</span>
              </div>
              <div className="text-[11px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                🕐 {formattedTime}
              </div>
            </div>
          </div>

          {/* Prompt-Specific Status Flow Section */}
          <div
            className={`p-5 rounded-2xl border-2 space-y-4 ${
              highContrast
                ? 'bg-zinc-900 border-yellow-400'
                : 'bg-gradient-to-b from-slate-50 to-rose-50/40 border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>{t('responseProgress')}</span>
              </h4>
              <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                {emergency.stage === 'contacting' && 'Finding Help...'}
                {emergency.stage === 'caregiver_unavailable' && 'Caregiver Unavailable'}
                {emergency.stage === 'volunteer_dispatched' && 'Volunteer Dispatched'}
                {emergency.stage === 'escalated_ambulance' && 'Ambulance En Route'}
              </span>
            </div>

            {/* Checklist matching the prompt */}
            <div className="space-y-2.5">
              {/* Family Notified */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm sm:text-base">
                    {t('familyNotified')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t('familyNotifiedSub')}
                  </p>
                </div>
              </div>

              {/* Caregiver Notified */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                    emergency.stage === 'caregiver_unavailable'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  {emergency.stage === 'caregiver_unavailable' ? '⚠' : '✓'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm sm:text-base">
                    {emergency.stage === 'caregiver_unavailable' ? (
                      <span className="text-amber-700">{t('caregiverUnavailable')}</span>
                    ) : (
                      <span>{t('caregiverNotified')}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {emergency.stage === 'caregiver_unavailable'
                      ? t('caregiverUnavailableSub')
                      : t('caregiverNotifiedSub')}
                  </p>
                </div>
              </div>

              {/* Response / Cascade Status */}
              {emergency.stage === 'contacting' && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold animate-spin">
                    ⏳
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-amber-900 text-sm sm:text-base">
                      {t('waitingForResponse')}
                    </p>
                    <p className="text-xs text-amber-700">
                      {t('waitingForResponseSub')}
                    </p>
                  </div>
                </div>
              )}

              {/* Finding another person state */}
              {emergency.stage === 'caregiver_unavailable' && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold">
                    🔍
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 text-sm sm:text-base">
                      {t('findingAnotherPerson')}
                    </p>
                    <p className="text-xs text-blue-700">
                      {t('findingAnotherPersonSub')}
                    </p>
                  </div>
                </div>
              )}

              {/* Volunteer Found state */}
              {emergency.stage === 'volunteer_dispatched' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-emerald-950 text-base sm:text-lg">
                        {t('volunteerFound', { name: emergency.assignedHelper?.name || 'Amit Patel' })}
                      </p>
                      <span className="text-xs font-black bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full">
                        ETA: {emergency.etaMinutes} mins
                      </span>
                    </div>
                    <p className="text-xs font-bold text-emerald-800 mt-0.5">
                      {t('volunteerFoundSub', { eta: emergency.etaMinutes || 7, distance: emergency.assignedHelper?.distance || '1.2 km' })}
                    </p>
                  </div>
                </div>
              )}

              {/* 108 Ambulance Dispatched state */}
              {emergency.stage === 'escalated_ambulance' && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-50 border-2 border-red-500 shadow-sm animate-pulse">
                  <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm">
                    🚑
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-red-950 text-base sm:text-lg">
                        108 Emergency Ambulance Dispatched
                      </p>
                      <span className="text-xs font-black bg-red-600 text-white px-2.5 py-0.5 rounded-full uppercase">
                        ETA: {emergency.etaMinutes || 5} mins
                      </span>
                    </div>
                    <p className="text-xs font-bold text-red-800 mt-0.5">
                      Government Paramedic Unit en route to {senior.address} • Critical Triage Active
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Assistance Explanation Badge (Requested in prompt) */}
            {emergency.explanation && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-indigo-800">
                    {t('smartCoordination')}
                  </p>
                  <p className="text-sm font-semibold text-indigo-900 italic mt-0.5">
                    “{emergency.explanation}”
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Responder Card if assigned */}
          {emergency.assignedHelper && (
            <div className={`rounded-2xl p-4 border flex items-center justify-between ${
              emergency.stage === 'escalated_ambulance'
                ? 'bg-red-50/80 border-red-200'
                : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-2xl flex items-center justify-center shadow-xs">
                  {emergency.assignedHelper.avatar || '🚑'}
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-base sm:text-lg">
                    {emergency.assignedHelper.name}
                  </h5>
                  <p className="text-xs font-medium text-slate-600">
                    {emergency.assignedHelper.role} • 📞 {emergency.assignedHelper.phone || '108'}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${emergency.assignedHelper.phone || '108'}`}
                className={`px-4 py-2 text-white rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-sm transition ${
                  emergency.stage === 'escalated_ambulance'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Call {emergency.assignedHelper.phone || '108'}</span>
              </a>
            </div>
          )}

          {/* Quick Actions / Escalate to 108 / Resolve */}
          <div className="space-y-3 pt-2">
            {/* Direct Medical Emergency Escalate Button */}
            <button
              onClick={escalateToAmbulance}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg shadow-red-200 transition active:scale-98"
            >
              <Ambulance className="w-7 h-7 text-white" />
              <span>{t('dial108')}</span>
            </button>

            {/* Caregiver or Volunteer Instant Acceptance (Requested by User) */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block text-center">
                Instant Acceptance Simulation (Caregiver / Volunteer):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={simulateCaregiverAccept}
                  className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  title="Accept emergency as Primary Caregiver Nurse Sunita Devi"
                >
                  <HeartHandshake className="w-4 h-4 text-emerald-200" />
                  <span>👩‍⚕️ Accept as Caregiver (4m)</span>
                </button>

                <button
                  onClick={simulateVolunteerAccept}
                  className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  title="Accept emergency as Verified Volunteer Amit Patel"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-200" />
                  <span>🤝 Accept as Volunteer (7m)</span>
                </button>
              </div>
            </div>

            {/* Resolve & Close Options */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={resolveEmergency}
                className="flex-1 w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <CheckCircle className="w-5 h-5 text-white" />
                <span>{t('safeCancelBtn')}</span>
              </button>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full sm:w-auto py-3.5 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-base transition flex items-center justify-center gap-2 cursor-pointer"
                title="Close Emergency Page (or click anywhere outside on screen)"
              >
                <X className="w-4 h-4 text-slate-700" />
                <span>Close Window</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
