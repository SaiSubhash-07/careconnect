import React from 'react';
import { useApp } from '../context/AppContext';
import { defaultUserProfiles } from '../data/mockData';
import {
  Heart,
  Users,
  Stethoscope,
  Volume2,
  VolumeX,
  Eye,
  Type,
  RotateCcw,
  AlertTriangle,
  Mic,
  Globe,
  Clock,
  Navigation,
  LogOut,
  Database,
  Shield
} from 'lucide-react';
import { speakText } from '../utils/speech';

export const Header = ({ onOpenVoiceAssistant }) => {
  const {
    activeRole,
    setActiveRole,
    currentUser,
    setCurrentUser,
    logout,
    emergency,
    setActiveModal,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
    soundEnabled,
    setSoundEnabled,
    language,
    setLanguage,
    languages,
    t,
    formattedTime,
    formattedDate,
    liveLocation,
    fetchCurrentGPS,
    resetDemo,
    mockSeniors,
    selectedSeniorId,
    selectSenior,
    loginAsSenior,
    loginAsAdmin,
    senior,
    openDbStudio,
    isDbReady,
    openLiveMap
  } = useApp();

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xl');
    else setFontSize('normal');
  };

  const getFontSizeLabel = () => {
    if (fontSize === 'normal') return 'A';
    if (fontSize === 'large') return 'A+';
    return 'A++';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm transition-colors duration-200">
      {/* Emergency Active Global Alert Strip */}
      {emergency.isActive && (
        <div
          onClick={() => setActiveModal('emergency')}
          className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-center text-sm sm:text-base font-bold flex items-center justify-center gap-2 animate-pulse transition"
        >
          <AlertTriangle className="w-5 h-5" />
          <span>
            {t('sosActiveRibbon', { stage: emergency.stage.replace('_', ' ').toUpperCase() })}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-200">
                <Heart className="w-7 h-7 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                    Care<span className="text-rose-600">Connect</span>
                  </h1>
                  <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {t('tagline')}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 hidden sm:block">
                  {t('subtagline')}
                </p>
              </div>
            </div>

            {/* Quick Mobile Voice Button */}
            <button
              onClick={onOpenVoiceAssistant}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-sm font-semibold hover:bg-rose-100"
              title="Voice Assistant"
            >
              <Mic className="w-4 h-4 text-rose-600" />
              <span>{t('speak')}</span>
            </button>
          </div>

          {/* Role Switcher Tabs & Active Profile / Logout */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="flex items-center justify-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
              <button
                onClick={() => {
                  setActiveRole('senior');
                  if (senior) {
                    setCurrentUser({
                      id: senior.id,
                      name: senior.name,
                      preferredName: senior.preferredName,
                      role: 'senior',
                      roleTitle: 'Senior Citizen',
                      avatar: senior.avatar,
                      phone: senior.phone,
                      address: senior.address
                    });
                  } else if (defaultUserProfiles?.senior) {
                    setCurrentUser(defaultUserProfiles.senior);
                  }
                  speakText(t('seniorView'), language);
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeRole === 'senior'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="text-lg">👴</span>
                <span>{t('seniorView')}</span>
              </button>

              <button
                onClick={() => {
                  setActiveRole('family');
                  if (defaultUserProfiles?.family) setCurrentUser(defaultUserProfiles.family);
                  speakText(t('familyView'), language);
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeRole === 'family'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span>{t('familyView')}</span>
              </button>

              <button
                onClick={() => {
                  setActiveRole('caregiver');
                  if (defaultUserProfiles?.caregiver) setCurrentUser(defaultUserProfiles.caregiver);
                  speakText(t('caregiverView'), language);
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeRole === 'caregiver'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>{t('caregiverView')}</span>
              </button>

              <button
                onClick={() => {
                  loginAsAdmin();
                  speakText('Admin Command Center', language);
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeRole === 'admin'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Master System Admin Portal - Access All Users Data"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin</span>
              </button>
            </div>

            {/* In-App Senior Switcher Pill (Active when in Senior or Family view) */}
            {activeRole === 'senior' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-xs font-black text-rose-900 shadow-xs">
                <span className="text-base">{senior?.avatar || '👴'}</span>
                <span className="hidden sm:inline text-rose-700 font-extrabold">Senior:</span>
                <select
                  value={senior?.id || selectedSeniorId}
                  onChange={(e) => loginAsSenior(e.target.value)}
                  className="bg-transparent font-black text-rose-900 cursor-pointer focus:outline-none pr-1 text-xs sm:text-sm"
                  title="Switch Senior Account (PIN verification in Login Portal)"
                >
                  {mockSeniors?.map((s) => (
                    <option key={s.id} value={s.id} className="text-slate-900 font-bold bg-white">
                      {s.avatar} {s.name} ({s.age}y - PIN: {s.pin})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeRole === 'family' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-xs font-black text-blue-900 shadow-xs">
                <span className="text-base">{senior?.avatar || '👴'}</span>
                <span className="hidden sm:inline text-blue-700 font-extrabold">Caring For:</span>
                <select
                  value={senior?.id || selectedSeniorId}
                  onChange={(e) => selectSenior(e.target.value)}
                  className="bg-transparent font-black text-blue-900 cursor-pointer focus:outline-none pr-1 text-xs sm:text-sm"
                  title="Switch Monitored Senior"
                >
                  {mockSeniors?.map((s) => (
                    <option key={s.id} value={s.id} className="text-slate-900 font-bold bg-white">
                      {s.avatar} {s.name} ({s.age}y)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeRole === 'admin' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-50 border-2 border-purple-200 text-xs font-black text-purple-900 shadow-xs">
                <span className="text-base">🛡️</span>
                <span className="hidden sm:inline text-purple-700 font-extrabold">Admin Access:</span>
                <span className="text-purple-900 font-black">All Users Directory Active</span>
              </div>
            )}

            {/* Active User Avatar & Logout / Switch Portal Button */}
            <div className="flex items-center gap-1.5">
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <span className="text-base">{currentUser?.avatar || '👤'}</span>
                <div className="text-left">
                  <p className="font-black text-slate-900 leading-tight truncate max-w-[100px]">{currentUser?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 font-semibold leading-tight">{currentUser?.roleTitle || activeRole}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 text-xs font-black transition shadow-2xs"
                title="Logout and switch to role login portal"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">{t('logoutBtn')}</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>

          {/* Accessibility & Language Controls */}
          <div className="flex items-center justify-end gap-2 text-slate-700 flex-wrap">

            {/* Live Digital Clock & GPS Badge */}
            <div className="flex items-center gap-1.5">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-black shadow-xs tracking-wider"
                title={`${t('liveTime')}: ${formattedDate}`}
              >
                <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
                <span>{formattedTime}</span>
              </div>

              <button
                onClick={fetchCurrentGPS}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold transition border ${
                  liveLocation.isLiveGPS
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Click to fetch current GPS coordinates"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${liveLocation.isLiveGPS ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`} />
                <span className="hidden xl:inline">{liveLocation.isLiveGPS ? `${liveLocation.lat}°, ${liveLocation.lng}°` : t('gpsActive')}</span>
                <span className="xl:hidden">GPS</span>
              </button>

              <button
                onClick={openLiveMap}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 cursor-pointer shadow-xs"
                title="Open Live Integrated GPS Tracking Map & Safe Geofence"
              >
                <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
            
            {/* MULTI-LANGUAGE SELECTOR DROPDOWN (Telugu, Hindi, English, Tamil, Malayalam, Kannada) */}
            <div className="relative inline-flex items-center">
              <div className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-900 rounded-xl px-2.5 py-1.5 transition shadow-xs">
                <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-black cursor-pointer focus:outline-none pr-1"
                  aria-label="Select Language"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-slate-900 font-bold bg-white">
                      {lang.flag} {lang.nativeLabel} ({lang.label})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Voice Assistant Button */}
            <button
              onClick={onOpenVoiceAssistant}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-sm font-bold hover:bg-rose-100 transition"
              title="Voice Assistant"
            >
              <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>{t('voice')}</span>
            </button>

            {/* Font Size Scaler */}
            <button
              onClick={cycleFontSize}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-black border border-slate-200 transition"
              title={`Font Size: ${fontSize.toUpperCase()} (Click to change)`}
            >
              <span className="flex items-center gap-1">
                <Type className="w-3.5 h-3.5" />
                <span>{getFontSizeLabel()}</span>
              </span>
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

            {/* Audio Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-700 transition"
              title={soundEnabled ? 'Mute Sounds' : 'Enable Audio Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Database Studio Modal Trigger */}
            <button
              onClick={openDbStudio}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-xs font-bold text-indigo-700 border border-indigo-200 transition"
              title="Open CareConnect Database Studio (IndexedDB)"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xl:inline">DB Studio</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isDbReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={resetDemo}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 transition"
              title="Reset All Mock Data to Default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t('reset')}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
