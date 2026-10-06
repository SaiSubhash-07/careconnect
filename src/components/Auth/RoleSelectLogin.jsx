import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  Users,
  Stethoscope,
  Volume2,
  Eye,
  Globe,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const RoleSelectLogin = () => {
  const {
    openAuthScreen,
    login,
    loginAsSenior,
    loginAsAdmin,
    mockSeniors,
    language,
    setLanguage,
    languages,
    t,
    highContrast,
    setHighContrast,
    formattedTime,
    formattedDate
  } = useApp();

  const handleReadAloud = () => {
    speakText(
      `${t('choosePortal')}. ${t('portalSubtitle')}. Option 1: ${t('loginAsSenior')}. Option 2: ${t('loginAsFamily')}. Option 3: ${t('loginAsCaregiver')}.`,
      language
    );
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const greetingMap = {
      en: 'Language set to English',
      te: 'భాష తెలుగుగా మార్చబడింది',
      hi: 'भाषा हिंदी चुनी गई है',
      ta: 'மொழி தமிழாக மாற்றப்பட்டது',
      ml: 'ഭാഷ മലയാളമായി മാറ്റി',
      kn: 'ಭಾಷೆ ಕನ್ನಡಕ್ಕೆ ಬದಲಾಗಿದೆ'
    };
    speakText(greetingMap[newLang] || 'Language updated', newLang);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between ${highContrast ? 'bg-black text-yellow-300' : 'bg-gradient-to-b from-slate-50 via-indigo-50/25 to-slate-100 text-slate-900'}`}>
      
      {/* Top Bar for Accessibility & Language Selection */}
      <header className="w-full bg-white/90 backdrop-blur border-b border-slate-200 py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Care<span className="text-rose-600">Connect</span>
                </h1>
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                  {t('tagline')}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 hidden sm:block">
                {t('subtagline')}
              </p>
            </div>
          </div>

          {/* Accessibility & Language Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-black shadow-xs">
              <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
              <span>{formattedTime}</span>
            </div>

            {/* Language Dropdown */}
            <div className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-900 rounded-xl px-2.5 py-1.5 transition">
              <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-black cursor-pointer focus:outline-none"
                aria-label="Select Language"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-slate-900 font-bold bg-white">
                    {lang.flag} {lang.nativeLabel} ({lang.label})
                  </option>
                ))}
              </select>
            </div>

            {/* Read Aloud Button */}
            <button
              onClick={handleReadAloud}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs font-bold hover:bg-rose-100 transition"
              title="Read aloud in current language"
            >
              <Volume2 className="w-4 h-4 text-rose-600" />
              <span>{t('readScreen')}</span>
            </button>

            {/* High Contrast Mode Toggle */}
            <button
              onClick={() => {
                setHighContrast(!highContrast);
                speakText(highContrast ? t('highContrastNormal') : t('highContrastActive'), language);
              }}
              className={`p-2 rounded-xl border transition ${
                highContrast
                  ? 'bg-amber-400 text-black border-amber-500 font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Toggle High Contrast Mode"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Role Selection Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8">
        
        {/* Title & Introduction */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-black tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Intelligent Senior Care & Assistance Network</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {t('choosePortal')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-semibold">
            {t('portalSubtitle')}
          </p>
        </div>

        {/* 3 Large Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* 1. 👴 SENIOR CITIZEN PORTAL */}
          <div className="rounded-3xl border-3 border-rose-200 bg-white hover:border-rose-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm group">
            <div className="p-6 sm:p-8 space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-rose-100 border-2 border-rose-200 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform">
                👴
              </div>

              <div>
                <span className="text-xs font-black tracking-wider uppercase text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Care Receiver
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  {t('loginAsSenior')}
                </h3>
                <p className="text-sm text-slate-600 font-semibold mt-2">
                  {t('loginAsSeniorDesc')}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2 text-rose-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>1-Click Emergency SOS with Audio Alarm</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Medicine & Doctor Appointment Reminders</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Daily Errands, Groceries & Walking Companions</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-rose-50/70 border-t border-rose-100 space-y-2.5">
              <button
                onClick={() => openAuthScreen('senior_login')}
                className="w-full py-4 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-base sm:text-lg rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition active:scale-98"
              >
                <span>Enter Senior Portal ({mockSeniors?.length || 4} Seniors)</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Individual 1-Click Senior Logins */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block text-center">
                  Quick 1-Click Senior Sign-In:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {mockSeniors?.map((snr) => (
                    <button
                      key={snr.id}
                      onClick={() => loginAsSenior(snr.id)}
                      className="py-2 px-2 bg-white hover:bg-rose-100 text-rose-900 text-[11px] font-black rounded-xl border border-rose-200 transition flex items-center justify-center gap-1 shadow-2xs truncate"
                      title={`Sign in as ${snr.name} (${snr.age} yrs)`}
                    >
                      <span>{snr.avatar}</span>
                      <span className="truncate">{snr.name.split(' ')[0]} ({snr.age})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. 👨‍👩‍👧 FAMILY MEMBER PORTAL */}
          <div className="rounded-3xl border-3 border-blue-200 bg-white hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm group">
            <div className="p-6 sm:p-8 space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform">
                👨‍👩‍👧
              </div>

              <div>
                <span className="text-xs font-black tracking-wider uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Guardian & Family
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  {t('loginAsFamily')}
                </h3>
                <p className="text-sm text-slate-600 font-semibold mt-2">
                  {t('loginAsFamilyDesc')}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2 text-blue-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
                  <span>Real-time Live GPS Location & Radar Map</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Medication Compliance & Pill Due Tracker</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Instant Emergency SMS / Call Notifications</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-blue-50/70 border-t border-blue-100 space-y-2.5">
              <button
                onClick={() => openAuthScreen('family_login')}
                className="w-full py-4 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base sm:text-lg rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition active:scale-98"
              >
                <span>Enter Family Portal</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => login('family')}
                className="w-full py-2.5 px-3 bg-white hover:bg-blue-100/50 text-blue-800 text-xs font-black rounded-xl border border-blue-300 transition flex items-center justify-center gap-1.5"
                title="1-click demo entry as Ananya Kumar"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Quick Demo: Continue as Ananya (Daughter)</span>
              </button>
            </div>
          </div>

          {/* 3. 🩺 CAREGIVER & VOLUNTEER PORTAL */}
          <div className="rounded-3xl border-3 border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm group">
            <div className="p-6 sm:p-8 space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform">
                🩺
              </div>

              <div>
                <span className="text-xs font-black tracking-wider uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Care Providers & Volunteers
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  {t('loginAsCaregiver')}
                </h3>
                <p className="text-sm text-slate-600 font-semibold mt-2">
                  {t('loginAsCaregiverDesc')}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>Smart Request Dispatch & Availability Cascade</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Turn-by-Turn Navigation & Distance ETA</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>108 Ambulance Escalation Integration</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-emerald-50/70 border-t border-emerald-100 space-y-2.5">
              <button
                onClick={() => openAuthScreen('caregiver_login')}
                className="w-full py-4 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base sm:text-lg rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition active:scale-98"
              >
                <span>Enter Care Provider Portal</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => login('caregiver')}
                className="w-full py-2.5 px-3 bg-white hover:bg-emerald-100/50 text-emerald-800 text-xs font-black rounded-xl border border-emerald-300 transition flex items-center justify-center gap-1.5"
                title="1-click demo entry as Nurse Sunita Devi"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Demo: Continue as Nurse Sunita (RN)</span>
              </button>
            </div>
          </div>

        </div>

        {/* 4. 🛡️ MASTER SYSTEM ADMIN PORTAL CARD */}
        <div className="rounded-3xl border-2 border-purple-300/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border-2 border-purple-400 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              🛡️
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-400/40">
                  Supervisory Authority
                </span>
                <span className="text-xs text-slate-400 font-mono">Tier-1 Master Access</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                System Administrator Command Center
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5 max-w-xl">
                Unified master oversight to inspect, filter, and manage data across all 4 senior citizens, all family guardians, clinical caregivers, volunteers, and emergency records.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => openAuthScreen('admin_login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-900/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Enter Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={loginAsAdmin}
              className="w-full sm:w-auto px-4 py-3.5 bg-white/10 hover:bg-white/20 text-purple-200 text-xs font-bold rounded-xl border border-purple-400/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
              title="1-click demo entry as Master Admin"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>1-Click Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Hackathon Demo Quick Access Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>CareConnect Hackathon Interactive Mode</span>
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Instant one-click access enabled for rapid evaluation of all multi-tiered roles.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[10px] font-black text-slate-400 mr-1 uppercase">Seniors:</span>
            {mockSeniors?.map((snr) => (
              <button
                key={snr.id}
                onClick={() => loginAsSenior(snr.id)}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition"
                title={`Enter as ${snr.name} (${snr.age} yrs)`}
              >
                {snr.avatar} {snr.name.split(' ')[0]}
              </button>
            ))}
            <span className="text-slate-300 mx-0.5">|</span>
            <button
              onClick={() => login('family')}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition"
            >
              👨‍👩‍👧 Family View
            </button>
            <button
              onClick={() => login('caregiver')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition"
            >
              🩺 Caregiver View
            </button>
            <button
              onClick={loginAsAdmin}
              className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 text-xs font-bold border border-purple-200 transition"
            >
              🛡️ Admin View
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2 font-black tracking-wide uppercase text-slate-700 text-xs sm:text-sm">
          <span className="text-red-600 font-extrabold">ONE CLICK</span>
          <span>→</span>
          <span className="text-indigo-600 font-extrabold">NOTIFY</span>
          <span>→</span>
          <span className="text-blue-600 font-extrabold">FIND HELP</span>
          <span>→</span>
          <span className="text-amber-600 font-extrabold">TRACK RESPONSE</span>
          <span>→</span>
          <span className="text-rose-600 font-extrabold">ESCALATE IF NEEDED</span>
        </div>
        <p className="font-semibold text-slate-500">
          CareConnect — Intelligent Senior Citizen Care & Assistance Network • PS 5 Hackathon Implementation
        </p>
      </footer>

    </div>
  );
};
