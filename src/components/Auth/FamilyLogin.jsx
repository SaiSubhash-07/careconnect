import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  ArrowLeft,
  Volume2,
  Eye,
  ShieldCheck,
  Phone,
  Lock,
  Sparkles,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const FamilyLogin = () => {
  const {
    openAuthScreen,
    login,
    language,
    t,
    highContrast,
    setHighContrast,
    senior
  } = useApp();

  const [selectedProfile, setSelectedProfile] = useState('fam-1'); // fam-1 (Ananya) or fam-2 (Rohan)
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [password, setPassword] = useState('••••••••');

  const familyMembers = [
    {
      id: 'fam-1',
      name: 'Ananya Kumar',
      relation: 'Daughter',
      roleTitle: 'Primary Guardian',
      phone: '+91 98765 43210',
      avatar: '👩',
      status: 'Verified Primary Contact'
    },
    {
      id: 'fam-2',
      name: 'Rohan Kumar',
      relation: 'Son',
      roleTitle: 'Secondary Guardian',
      phone: '+91 98765 11223',
      avatar: '👨',
      status: 'Verified Family Member'
    }
  ];

  const handleProfileSelect = (fam) => {
    setSelectedProfile(fam.id);
    setPhoneNumber(fam.phone);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const fam = familyMembers.find(f => f.id === selectedProfile) || familyMembers[0];
    login('family', {
      ...fam,
      role: 'family'
    });
  };

  const handleReadAloud = () => {
    speakText(
      `${t('loginAsFamily')}. ${t('loginAsFamilyDesc')}. Linked to ${senior.name}. Choose your profile or sign in.`,
      language
    );
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 ${highContrast ? 'bg-black text-yellow-300' : 'bg-gradient-to-b from-blue-50/50 via-slate-50 to-indigo-50/30 text-slate-900'}`}>
      
      {/* Top Navigation */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-2 pt-2">
        <button
          onClick={() => openAuthScreen('portal')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-black text-sm shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToPortals')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReadAloud}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-2xl border border-blue-300 text-sm font-bold transition"
            title="Read screen aloud"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span>{t('readScreen')}</span>
          </button>

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

      {/* Main Family Login Container */}
      <div className="max-w-2xl mx-auto w-full my-auto py-6 space-y-6">
        
        {/* Title & Linked Senior Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-100 border-2 border-blue-200 text-3xl shadow-sm">
            👨‍👩‍👧
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('loginAsFamily')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-semibold max-w-md mx-auto">
            {t('loginAsFamilyDesc')}
          </p>

          {/* Linked Senior Profile Card */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-blue-200 shadow-xs text-xs sm:text-sm font-bold text-slate-700 mt-2">
            <span className="text-xl">👴</span>
            <span>Linked to: <strong className="text-blue-700">{senior.name}</strong> ({senior.address})</span>
          </div>
        </div>

        {/* Quick Profile Cards Selection */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 text-center">
            Select Your Family Member Profile
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {familyMembers.map((fam) => (
              <button
                key={fam.id}
                type="button"
                onClick={() => handleProfileSelect(fam)}
                className={`p-4 rounded-3xl border-3 text-left transition-all flex items-center justify-between ${
                  selectedProfile === fam.id
                    ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                    {fam.avatar}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      {fam.name}
                    </h4>
                    <p className="text-xs font-bold text-blue-700">
                      {fam.relation} • {fam.roleTitle}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {fam.phone}
                    </p>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                  selectedProfile === fam.id
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}>
                  {selectedProfile === fam.id ? '✓' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form Box */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5">
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                Registered Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white text-sm font-bold text-slate-900 outline-none transition"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                {t('enterPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white text-sm font-bold text-slate-900 outline-none transition"
                  placeholder="Enter password or OTP"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition active:scale-98"
          >
            <span>Sign In to Family Hub</span>
            <span>→</span>
          </button>

          {/* Quick Demo Button */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-black text-blue-700 hover:text-blue-800 flex items-center justify-center gap-1.5 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>1-Click Hackathon Evaluator Sign-In</span>
            </button>
          </div>
        </form>

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 font-medium py-2">
        CareConnect Family Hub • Real-time Health Telemetry & Emergency Notification Link
      </div>

    </div>
  );
};
