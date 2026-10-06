import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Volume2,
  MapPin,
  Activity,
  Ambulance
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const FallDetectionModal = () => {
  const {
    fallAlert,
    cancelFallAlert,
    confirmFallEmergency,
    senior,
    highContrast,
    language
  } = useApp();

  if (!fallAlert?.isActive) return null;

  const handleReadAloud = () => {
    speakText(
      `Hard fall detected at ${senior.address}. If you are okay, tap I am okay. Emergency help will be called automatically in ${fallAlert.countdown} seconds.`,
      language
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl transition-all my-auto border-4 ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-red-600'
        }`}
      >
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 relative overflow-hidden">
          {/* Animated Siren Backdrop Glow */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none animate-ping" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl animate-bounce shrink-0">
              💥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  AI Fall Guard Alert
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-0.5">
                Hard Fall Detected!
              </h2>
            </div>
          </div>

          <button
            onClick={handleReadAloud}
            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition shadow-xs"
          >
            <Volume2 className="w-4 h-4" />
            <span>Read Warning Aloud</span>
          </button>
        </div>

        {/* Modal Body with Countdown */}
        <div className="p-6 sm:p-7 space-y-6">

          {/* 15-Second Countdown Gauge */}
          <div
            className={`p-6 rounded-3xl border-2 text-center space-y-3 ${
              highContrast
                ? 'bg-zinc-900 border-yellow-400'
                : 'bg-red-50/70 border-red-200'
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">
              Automatic Emergency SOS Dispatch In
            </p>

            {/* Giant Countdown Number */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-4 border-red-500/30 flex items-center justify-center bg-white shadow-inner">
                <span className="text-5xl sm:text-6xl font-black font-mono text-red-600 animate-pulse">
                  {fallAlert.countdown}
                </span>
              </div>
              <span className="absolute -bottom-2 text-[10px] font-black bg-red-600 text-white px-2.5 py-0.5 rounded-full uppercase">
                SECONDS
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-700 max-w-sm mx-auto pt-2">
              If you do not respond, CareConnect will automatically alert family members, registered caregivers, and dispatch a 108 ambulance to your location.
            </p>
          </div>

          {/* Impact Telemetry Card */}
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-red-500" />
                Impact Force:
              </span>
              <span className="font-mono font-black text-red-700">
                {fallAlert.impactG}G Force (Sudden Drop)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Location:
              </span>
              <span className="font-bold text-slate-800 truncate max-w-[200px]" title={senior.address}>
                {senior.address}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Time Detected:</span>
              <span className="font-mono font-bold text-slate-700">
                {fallAlert.detectedAt}
              </span>
            </div>
          </div>

          {/* Senior Action Buttons */}
          <div className="space-y-3 pt-1">
            {/* 1. I AM OKAY (False Alarm Cancel Button) */}
            <button
              onClick={cancelFallAlert}
              className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 transition active:scale-98"
            >
              <CheckCircle2 className="w-7 h-7 shrink-0" />
              <span>I'M OKAY — CANCEL</span>
            </button>

            {/* 2. YES, I FELL (Immediate Dispatch) */}
            <button
              onClick={confirmFallEmergency}
              className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-md shadow-red-200 transition active:scale-98"
            >
              <Ambulance className="w-5 h-5 shrink-0" />
              <span>YES, I FELL — SEND HELP NOW</span>
            </button>
          </div>

          <p className="text-xs text-center text-slate-500 font-medium">
            💡 Tapping <strong>I'M OKAY</strong> cancels the alert immediately and logs that you are safe.
          </p>

        </div>
      </div>
    </div>
  );
};
