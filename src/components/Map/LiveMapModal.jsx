import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LiveTrackingMap } from './LiveTrackingMap';
import {
  MapPin,
  Radio,
  Share2,
  X,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Users,
  Ambulance,
  Heart,
  Activity,
  Copy,
  ExternalLink
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const LiveMapModal = ({ isOpen, onClose }) => {
  const {
    senior,
    liveLocation,
    broadcastLiveLocation,
    emergency,
    escalateToAmbulance,
    language,
    t
  } = useApp();

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const trackingUrl = `https://careconnect.live/track/${senior.id}?lat=${liveLocation.lat}&lng=${liveLocation.lng}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      speakText('Tracking link copied to clipboard.', language);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  CareConnect Live Location & Responder Radar
                </h3>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live GPS Radar
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Transmitting real-time telemetry for <strong className="text-slate-200">{senior.name}</strong> to Family, Caregiver & 108 EMS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close Map Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Responder Network Status Bar */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Family Contact Status */}
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-xl">👩</span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Family Guardian</span>
              <span className="font-bold text-white truncate block">Ananya Kumar</span>
              <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Sync Active
              </span>
            </div>
          </div>

          {/* Primary Caregiver Status */}
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-xl">👩‍⚕️</span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Caregiver</span>
              <span className="font-bold text-white truncate block">Nurse Sunita</span>
              <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                0.8 km (ETA 4m)
              </span>
            </div>
          </div>

          {/* Volunteer Status */}
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-xl">🤝</span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Volunteer</span>
              <span className="font-bold text-white truncate block">Amit Patel</span>
              <span className="text-[9px] text-blue-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                1.2 km (ETA 7m)
              </span>
            </div>
          </div>

          {/* 108 Emergency Ambulance */}
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-xl">🚑</span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Ambulance</span>
              <span className="font-bold text-white truncate block">108 Govt. EMS</span>
              <span className={`text-[9px] font-medium flex items-center gap-1 ${
                emergency.stage === 'escalated_ambulance' ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${emergency.stage === 'escalated_ambulance' ? 'bg-rose-500' : 'bg-slate-500'}`} />
                {emergency.stage === 'escalated_ambulance' ? 'Dispatched (5m)' : 'Standby Base'}
              </span>
            </div>
          </div>
        </div>

        {/* Embedded Interactive Map */}
        <div className="flex-1 p-3 sm:p-4 bg-slate-950 overflow-hidden flex flex-col">
          <LiveTrackingMap height="h-[380px] sm:h-[440px]" showControls={true} interactive={true} />
        </div>

        {/* Modal Action Footer */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={broadcastLiveLocation}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-black flex items-center gap-2 shadow-md transition active:scale-95"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Broadcast Live GPS Position</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>{copied ? 'Copied ✓' : 'Copy GPS Link'}</span>
            </button>

            <button
              onClick={escalateToAmbulance}
              className="px-3.5 py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow transition"
              title="Directly dispatch 108 ambulance with live telemetry"
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>Escalate 108 EMS</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold transition ml-auto"
          >
            Close Map
          </button>
        </div>

      </div>
    </div>
  );
};
