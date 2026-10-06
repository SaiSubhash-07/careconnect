import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  Pill,
  Hospital,
  HeartHandshake,
  Volume2,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Heart,
  Radio,
  Navigation,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { speakText } from '../../utils/speech';
import { EmergencyModal } from './EmergencyModal';
import { MedicineModal } from './MedicineModal';
import { AppointmentModal } from './AppointmentModal';
import { HelpCategoriesModal } from './HelpCategoriesModal';

export const SeniorHome = () => {
  const {
    senior,
    triggerEmergency,
    activeModal,
    setActiveModal,
    medications,
    appointments,
    highContrast,
    fontSize,
    language,
    t,
    formattedTime,
    formattedDate,
    liveLocation,
    fetchCurrentGPS,
    triggerFallDetection,
    fallAlert,
    openLiveMap,
    broadcastLiveLocation,
    caregiverPillReminder,
    dismissCaregiverPillReminder,
    markMedicineTaken,
    overdueMedicationAlert,
    nextOverdueReminderSeconds,
    snoozeOverduePill
  } = useApp();

  const dueMed = medications.find(m => m.status === 'due');
  const missedMed = medications.find(m => m.status === 'missed');
  const nextApt = appointments[0];

  const handleReadHome = () => {
    speakText(
      `${t('greeting')}. ${t('liveTime')}: ${formattedTime}. ${liveLocation.address}. ${t('btnEmergencyTitle')}, ${t('btnMedicineTitle')}, ${t('btnDoctorTitle')}, ${t('btnHelpTitle')}.`,
      language
    );
  };

  const getFontSizeClass = () => {
    if (fontSize === 'xl') return 'text-xl sm:text-2xl';
    if (fontSize === 'large') return 'text-lg sm:text-xl';
    return 'text-base sm:text-lg';
  };

  return (
    <div className={`min-h-[85vh] p-4 sm:p-6 max-w-4xl mx-auto space-y-6 ${highContrast ? 'high-contrast' : ''}`}>

      {/* Senior Header & Greeting (Prompt: ❤️ Hello, How Can We Help You?) */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border-2 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          highContrast
            ? 'card-contrast'
            : 'bg-white border-slate-200 shadow-slate-100'
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl animate-pulse">❤️</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t('greeting')}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-slate-600 font-semibold text-sm sm:text-base">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200">
              👴 {senior.name}
            </span>
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{t('safeAtHome')}</span>
            </span>
            <span className="text-slate-500 text-xs sm:text-sm hidden sm:inline">
              • {liveLocation.address}
            </span>
          </div>
        </div>

        {/* Read Aloud Button for Senior accessibility */}
        <button
          onClick={handleReadHome}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold transition shadow-xs shrink-0 ${
            highContrast
              ? 'btn-contrast-yellow'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-base'
          }`}
          title="Click to have this entire screen read out loud"
        >
          <Volume2 className="w-5 h-5" />
          <span>{t('readScreen')}</span>
        </button>
      </div>

      {/* Live Time & Live Location Status Card */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col md:flex-row items-center justify-between gap-4 ${
          highContrast ? 'card-contrast' : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md'
        }`}
      >
        {/* Live Clock Display */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
            🕐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                {t('liveTime')}
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {formattedTime}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Live Location Telemetry & Refresh Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-white/15 pt-3 md:pt-0 md:pl-5">
          <div className="text-left md:text-right">
            <div className="flex items-center gap-1.5 md:justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                {liveLocation.isLiveGPS ? t('gpsActive') : t('liveLocation')}
              </span>
            </div>
            <p className="text-sm font-black text-white truncate max-w-xs">
              📍 {liveLocation.address}
            </p>
            <p className="text-[11px] font-mono text-slate-400">
              {liveLocation.lat}° N, {liveLocation.lng}° E • ±{liveLocation.accuracy}m
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => broadcastLiveLocation()}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              title="Broadcast your live location to family & volunteers"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />
              <span>Send Live Location</span>
            </button>

            <button
              onClick={openLiveMap}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm border border-slate-700 active:scale-95 cursor-pointer"
              title="Open full interactive live GPS map"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>Live Map</span>
            </button>

            <button
              onClick={fetchCurrentGPS}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
              title="Fetch live device GPS"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('fetchGps')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Fall Guard Sensor Monitoring Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div>
            <span className="font-black uppercase tracking-wider text-xs sm:text-sm text-amber-950">
              🛡️ AI Fall Guard Active:
            </span>
            <span className="text-xs text-amber-800 font-semibold ml-1.5 hidden sm:inline">
              Continuous device accelerometer monitoring • 15s auto-rescue countdown
            </span>
          </div>
        </div>

        <button
          onClick={() => triggerFallDetection(3.4)}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5 text-xs shrink-0"
          title="Click to simulate sudden fall impact"
        >
          <span>💥 Test Fall Sensor</span>
        </button>
      </div>

      {/* ⏰ OVERDUE TABLET TIME CROSSED (5-MIN RECURRING REMINDER) */}
      {overdueMedicationAlert && (
        <div
          className={`p-5 sm:p-6 rounded-3xl border-4 transition-all duration-300 shadow-xl animate-pulse ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white border-red-300 shadow-red-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl shadow-inner shrink-0 animate-bounce">
                ⏰
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-red-700 text-xs font-black uppercase tracking-wider">
                    ⚠️ Scheduled Tablet Time Crossed!
                  </span>
                  <span className="text-xs font-bold text-red-100 font-mono">
                    Scheduled: {overdueMedicationAlert.med.time} ({overdueMedicationAlert.minutesOverdue}m overdue)
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black mt-1">
                  Please Take: {overdueMedicationAlert.med.name} ({overdueMedicationAlert.med.dosage})
                </h3>
                <p className="text-sm font-semibold text-red-100 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{overdueMedicationAlert.med.instructions || 'Take immediately with water'}</span>
                  <span>•</span>
                  <span className="text-amber-200 font-mono font-bold bg-black/20 px-2 py-0.5 rounded-md">
                    🔔 Next Reminder in: {Math.floor(nextOverdueReminderSeconds / 60)}m {String(nextOverdueReminderSeconds % 60).padStart(2, '0')}s
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-stretch md:self-auto">
              <button
                onClick={() => markMedicineTaken(overdueMedicationAlert.med.id)}
                className="flex-1 md:flex-none px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl text-base sm:text-lg font-black shadow-lg flex items-center justify-center gap-2 transition cursor-pointer border-2 border-emerald-400"
              >
                <CheckCircle2 className="w-6 h-6 text-white" />
                <span>✅ Take Tablet Now</span>
              </button>
              <button
                onClick={() => snoozeOverduePill(overdueMedicationAlert.med.id, 5)}
                className="px-4 py-3.5 bg-black/30 hover:bg-black/40 text-white rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                title="Snooze reminder for 5 minutes"
              >
                <Clock className="w-4 h-4" />
                <span>Remind in 5 Mins</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URGENT CAREGIVER TABLET REMINDER BANNER (New Feature) */}
      {caregiverPillReminder && (
        <div
          className={`p-5 sm:p-6 rounded-3xl border-4 transition-all duration-300 shadow-xl animate-pulse ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white border-amber-300 shadow-amber-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                💊
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-orange-700 text-xs font-black uppercase tracking-wider">
                    🔔 Urgent Caregiver Reminder
                  </span>
                  <span className="text-xs font-bold text-amber-100">
                    From {caregiverPillReminder.caregiverName} ({caregiverPillReminder.sentAt})
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black mt-1">
                  Please Take Your Tablet: {caregiverPillReminder.med.name}
                </h3>
                <p className="text-sm font-semibold text-amber-100 mt-0.5">
                  Dosage: <strong>{caregiverPillReminder.med.dosage}</strong> • {caregiverPillReminder.med.instructions || 'Take with water now'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-stretch md:self-auto">
              <button
                onClick={() => markMedicineTaken(caregiverPillReminder.med.id)}
                className="flex-1 md:flex-none px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-base sm:text-lg font-black shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border-2 border-emerald-400"
              >
                <CheckCircle2 className="w-6 h-6 text-white" />
                <span>✅ Take Tablet Now</span>
              </button>
              <button
                onClick={dismissCaregiverPillReminder}
                className="px-4 py-3.5 bg-black/30 hover:bg-black/40 text-white rounded-2xl text-xs font-bold transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 LARGE SENIOR BUTTONS (Mandated by Prompt) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

        {/* 1. 🚨 EMERGENCY HELP (The most important button: Large RED button with pulsing animation) */}
        <div className="md:col-span-2">
          <button
            onClick={triggerEmergency}
            className={`w-full py-8 sm:py-10 px-6 sm:px-8 rounded-3xl flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 transition-all duration-300 transform active:scale-98 shadow-xl ${
              highContrast
                ? 'btn-emergency-contrast'
                : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-200 emergency-pulse-btn'
            }`}
          >
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 border-4 border-white/40 flex items-center justify-center text-4xl sm:text-5xl shrink-0 shadow-inner">
                🚨
              </div>
              <div className="text-center sm:text-left">
                <span className="text-xs sm:text-sm font-black tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full text-white/95">
                  {t('btnEmergencyTag')}
                </span>
                <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-1">
                  {t('btnEmergencyTitle')}
                </h3>
                <p className="text-red-100 font-semibold text-sm sm:text-lg mt-0.5">
                  {t('btnEmergencySub')}
                </p>
              </div>
            </div>

            <div className="px-5 py-2.5 rounded-2xl bg-white text-red-700 font-black text-base sm:text-lg shadow-md shrink-0 uppercase tracking-wider">
              {t('pressHere')}
            </div>
          </button>
        </div>

        {/* 2. 💊 MEDICINE REMINDER */}
        <button
          onClick={() => setActiveModal('medicine')}
          className={`p-6 sm:p-7 rounded-3xl border-3 flex items-start gap-5 text-left transition-all active:scale-98 shadow-sm hover:shadow-md ${
            highContrast
              ? 'card-contrast'
              : missedMed
              ? 'bg-rose-50/90 border-rose-400 hover:border-rose-500 ring-2 ring-rose-300 animate-pulse'
              : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/40'
          }`}
        >
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 text-3xl sm:text-4xl flex items-center justify-center shrink-0 ${
            missedMed ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-blue-100 border-blue-200'
          }`}>
            💊
          </div>
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              missedMed
                ? 'text-rose-700 bg-rose-100 border-rose-300 font-black'
                : 'text-blue-600 bg-blue-50 border-blue-200'
            }`}>
              {missedMed ? '⚠️ TABLET MISSED!' : t('btnMedicineTag')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {t('btnMedicineTitle')}
            </h3>
            <p className={`font-bold text-sm sm:text-base mt-1 ${missedMed ? 'text-rose-700 font-black' : 'text-slate-600'}`}>
              {missedMed
                ? `🚨 ${missedMed.name} (${missedMed.time}) - Not Taken!`
                : dueMed
                ? `⏰ ${dueMed.name} (${dueMed.time || '9:00 AM'})`
                : t('btnMedicineSub')}
            </p>
            <span className={`inline-block text-xs font-bold mt-2 underline ${missedMed ? 'text-rose-800 font-black' : 'text-blue-700'}`}>
              {missedMed ? '👉 Tap to Take Tablet Now' : t('btnMedicineTap')}
            </span>
          </div>
        </button>

        {/* 3. 🏥 DOCTOR APPOINTMENT */}
        <button
          onClick={() => setActiveModal('appointment')}
          className={`p-6 sm:p-7 rounded-3xl border-3 flex items-start gap-5 text-left transition-all active:scale-98 shadow-sm hover:shadow-md ${
            highContrast
              ? 'card-contrast'
              : 'bg-white border-purple-200 hover:border-purple-400 hover:bg-purple-50/40'
          }`}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-100 border-2 border-purple-200 text-3xl sm:text-4xl flex items-center justify-center shrink-0">
            🏥
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              {t('btnDoctorTag')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {t('btnDoctorTitle')}
            </h3>
            <p className="text-slate-600 font-bold text-sm sm:text-base mt-1">
              {nextApt ? `${nextApt.doctorName} - ${nextApt.time}` : t('btnDoctorSub')}
            </p>
            <span className="inline-block text-xs font-bold text-purple-700 mt-2 underline">
              {t('btnDoctorTap')}
            </span>
          </div>
        </button>

        {/* 4. 🤝 I NEED HELP */}
        <div className="md:col-span-2">
          <button
            onClick={() => setActiveModal('daily_help')}
            className={`w-full p-6 sm:p-8 rounded-3xl border-3 flex flex-col sm:flex-row items-center justify-between gap-5 text-left transition-all active:scale-98 shadow-sm hover:shadow-md ${
              highContrast
                ? 'card-contrast'
                : 'bg-white border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/40'
            }`}
          >
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-100 border-2 border-emerald-200 text-3xl sm:text-4xl flex items-center justify-center shrink-0">
                🤝
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {t('btnHelpTag')}
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
                  {t('btnHelpTitle')}
                </h3>
                <p className="text-slate-600 font-bold text-sm sm:text-base mt-1">
                  {t('btnHelpSub')}
                </p>
              </div>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black text-base sm:text-lg shadow-sm shrink-0">
              {t('btnHelpAction')}
            </div>
          </button>
        </div>

      </div>

      {/* Quick Direct Call Bar for Family Contacts */}
      <div
        className={`p-5 rounded-3xl border-2 space-y-3 ${
          highContrast ? 'card-contrast' : 'bg-slate-100 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
            <span>{t('familyQuickCall')}</span>
          </h4>
          <span className="text-xs font-semibold text-slate-500">
            {t('familyTapToCall')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {senior.familyContacts.map((contact) => (
            <a
              key={contact.id}
              href={`tel:${contact.phone}`}
              className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{contact.avatar}</span>
                <div>
                  <h5 className="font-black text-slate-900 text-sm sm:text-base">
                    {contact.name}
                  </h5>
                  <p className="text-xs font-semibold text-slate-500">
                    {contact.relation} • {contact.phone}
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Active Modals */}
      {activeModal === 'emergency' && <EmergencyModal />}
      {activeModal === 'medicine' && <MedicineModal />}
      {activeModal === 'appointment' && <AppointmentModal />}
      {activeModal === 'daily_help' && <HelpCategoriesModal />}

    </div>
  );
};
