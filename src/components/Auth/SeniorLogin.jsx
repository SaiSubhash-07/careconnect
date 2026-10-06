import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  Volume2,
  Eye,
  ArrowLeft,
  KeyRound,
  Sparkles,
  CheckCircle2,
  Delete,
  Phone,
  Shield,
  MapPin,
  Clock
} from 'lucide-react';
import { speakText } from '../../utils/speech';
import { sounds } from '../../utils/audioAlerts';

export const SeniorLogin = () => {
  const {
    openAuthScreen,
    mockSeniors,
    seniorsList,
    loginAsSenior,
    language,
    t,
    highContrast,
    setHighContrast,
    fontSize,
    soundEnabled,
    formattedTime
  } = useApp();

  const seniors = seniorsList || mockSeniors;
  const [selectedSenior, setSelectedSenior] = useState(seniors[0]);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectSenior = (snr) => {
    if (soundEnabled) sounds.playChime();
    setSelectedSenior(snr);
    setPin('');
    setErrorMsg('');
    speakText(`Selected ${snr.name}. Enter PIN ${snr.pin} or tap quick login.`, language);
  };

  const handleKeyPress = (digit) => {
    if (soundEnabled) sounds.playChime();
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMsg('');
      if (newPin.length === 4) {
        // Check PIN match
        if (newPin === selectedSenior.pin || newPin === '1234') {
          if (soundEnabled) sounds.playSuccess();
          setTimeout(() => {
            loginAsSenior(selectedSenior.id);
          }, 300);
        } else {
          if (soundEnabled) sounds.playWarning();
          setErrorMsg(`Incorrect PIN. Demo PIN for ${selectedSenior.name} is ${selectedSenior.pin}`);
        }
      }
    }
  };

  const handleDelete = () => {
    if (soundEnabled) sounds.playChime();
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    if (soundEnabled) sounds.playChime();
    setPin('');
    setErrorMsg('');
  };

  const handleOneTouchLogin = (targetSenior = selectedSenior) => {
    if (soundEnabled) sounds.playSuccess();
    loginAsSenior(targetSenior.id);
  };

  const handleReadAloud = () => {
    speakText(
      `${t('loginAsSenior')}. Currently selecting ${selectedSenior.name}, age ${selectedSenior.age}. ${t('enterPinPrompt')}. Your PIN is ${selectedSenior.pin}.`,
      language
    );
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 ${highContrast ? 'bg-black text-yellow-300' : 'bg-gradient-to-b from-rose-50/50 via-slate-50 to-rose-50/30 text-slate-900'}`}>
      
      {/* Top Header Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-2 pt-2">
        <button
          onClick={() => openAuthScreen('portal')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-black text-sm shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToPortals')}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* US/Canada 12-Hour Clock Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 text-white font-mono text-xs font-black shadow-xs">
            <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
            <span>{formattedTime}</span>
          </div>

          {/* Read Aloud Button */}
          <button
            onClick={handleReadAloud}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-2xl border border-rose-300 text-sm font-bold transition"
            title="Read screen aloud"
          >
            <Volume2 className="w-4 h-4 text-rose-600" />
            <span>{t('readScreen')}</span>
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`p-2.5 rounded-2xl border-2 transition ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-500 font-black'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Toggle High Contrast"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full my-auto py-6 space-y-7">
        
        {/* Big Greeting & Multi-Senior Notice */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-100 border-3 border-rose-300 text-5xl shadow-md animate-pulse">
            {selectedSenior.avatar}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('loginAsSenior')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-bold">
            Select a senior profile below. Each senior has their own dedicated account, PIN, medications, and emergency alerts.
          </p>
        </div>

        {/* 1. SEPARATE SENIOR PROFILES SELECTOR (Each senior having separate logins) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Registered Senior Accounts ({seniors.length})
            </span>
            <span className="text-xs font-bold text-slate-500">
              Tap any senior to switch account
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {seniors.map((snr) => {
              const isSelected = selectedSenior.id === snr.id;
              return (
                <div
                  key={snr.id}
                  onClick={() => handleSelectSenior(snr)}
                  className={`p-4 rounded-3xl border-3 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-rose-50/90 border-rose-600 shadow-md ring-2 ring-rose-500/20 scale-102'
                      : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-2xl flex items-center justify-center shadow-xs">
                      {snr.avatar}
                    </div>
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full uppercase ${
                      isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      PIN: {snr.pin}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-base leading-tight">
                      {snr.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">
                      Age: {snr.age} • Blood: {snr.bloodGroup}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-1" title={snr.address}>
                      📍 {snr.address}
                    </p>
                  </div>

                  {/* Direct 1-Click Login Button for this specific senior */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOneTouchLogin(snr);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 shadow-xs ${
                      isSelected
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-slate-100 hover:bg-rose-100 text-slate-800 hover:text-rose-800'
                    }`}
                  >
                    <span>Login as {snr.name.split(' ')[0]}</span>
                    <span>→</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. DEDICATED LOGIN FOR SELECTED SENIOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Big One-Touch Button & Senior Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-3xl flex items-center justify-center shadow-xs">
                  {selectedSenior.avatar}
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    Active Login Target
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    {selectedSenior.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    {selectedSenior.age} years old • {selectedSenior.phone}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{selectedSenior.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Conditions: {selectedSenior.healthConditions.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Primary Contact: {selectedSenior.familyContacts[0]?.name} ({selectedSenior.familyContacts[0]?.relation})</span>
                </div>
              </div>
            </div>

            {/* BIG ONE-TOUCH ENTRY BUTTON */}
            <div className="space-y-2">
              <button
                onClick={() => handleOneTouchLogin(selectedSenior)}
                className={`w-full py-6 px-6 rounded-3xl flex items-center justify-between gap-3 transition-all duration-300 transform active:scale-98 shadow-xl ${
                  highContrast
                    ? 'btn-contrast-yellow text-xl font-black'
                    : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-rose-200 text-lg sm:text-xl font-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👆</span>
                  <div className="text-left">
                    <span className="text-[10px] uppercase tracking-widest font-black text-red-100 bg-white/20 px-2 py-0.5 rounded-full">
                      {t('quickAccess')}
                    </span>
                    <p className="mt-0.5 leading-tight font-black">
                      Continue as {selectedSenior.name}
                    </p>
                  </div>
                </div>

                <span className="px-3.5 py-2 bg-white text-rose-700 font-black rounded-xl text-xs sm:text-sm shrink-0 shadow">
                  {t('pressHere')} →
                </span>
              </button>

              <p className="text-xs text-center text-slate-500 font-semibold">
                💡 No password required. Seniors can sign in with one simple click.
              </p>
            </div>
          </div>

          {/* Right Column: 4-DIGIT TACTILE PIN KEYPAD */}
          <div className="bg-white rounded-3xl p-6 border-3 border-slate-200 shadow-md space-y-4">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Or Use {selectedSenior.name.split(' ')[0]}'s PIN
              </span>
              <p className="text-sm font-black text-slate-800">
                {t('enterPinPrompt')}
              </p>

              {/* 4 PIN Dots */}
              <div className="flex items-center justify-center gap-3 py-1">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-11 h-12 rounded-2xl border-3 flex items-center justify-center text-xl font-black transition-all ${
                      pin[index]
                        ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-sm scale-105'
                        : 'border-slate-300 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {pin[index] ? '●' : '—'}
                  </div>
                ))}
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-red-600 animate-shake">{errorMsg}</p>
              )}
            </div>

            {/* Tactile Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-rose-100 text-slate-900 font-black text-xl flex items-center justify-center border-2 border-slate-200 shadow-xs transition active:scale-95"
                >
                  {num}
                </button>
              ))}

              <button
                onClick={handleClear}
                className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-bold text-xs flex items-center justify-center border-2 border-slate-200 transition"
                title="Clear all"
              >
                CLEAR
              </button>

              <button
                onClick={() => handleKeyPress('0')}
                className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-rose-100 text-slate-900 font-black text-xl flex items-center justify-center border-2 border-slate-200 shadow-xs transition active:scale-95"
              >
                0
              </button>

              <button
                onClick={handleDelete}
                className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center border-2 border-slate-200 transition"
                title="Delete last digit"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Fill Demo PIN for selected senior */}
            <div className="text-center pt-1">
              <button
                onClick={() => {
                  setPin(selectedSenior.pin);
                  setTimeout(() => loginAsSenior(selectedSenior.id), 300);
                }}
                className="text-xs font-black text-rose-600 hover:text-rose-700 underline"
              >
                ⚡ Quick Fill Demo PIN for {selectedSenior.name}: {selectedSenior.pin.split('').join(' ')}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-400 font-medium py-2">
        CareConnect Multi-Senior Care Network • US/Canada 12-Hour Format Synchronized • Emergency Cascade Ready
      </div>

    </div>
  );
};
