import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Stethoscope,
  ArrowLeft,
  Volume2,
  Eye,
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const CaregiverLogin = () => {
  const {
    openAuthScreen,
    login,
    language,
    t,
    highContrast,
    setHighContrast
  } = useApp();

  const [selectedCaregiver, setSelectedCaregiver] = useState('cg-1'); // cg-1 (Sunita) or vol-1 (Amit)
  const [badgeId, setBadgeId] = useState('RN-KA-88421');
  const [pin, setPin] = useState('••••');

  const caregivers = [
    {
      id: 'cg-1',
      name: 'Nurse Sunita Devi',
      role: 'caregiver',
      type: 'caregiver',
      roleTitle: 'Registered Geriatric Nurse',
      badgeId: 'RN-KA-88421',
      phone: '+91 98111 22334',
      avatar: '👩‍⚕️',
      skills: 'BP Monitoring, First Aid, Elder Care'
    },
    {
      id: 'vol-1',
      name: 'Amit Patel',
      role: 'caregiver',
      type: 'volunteer',
      roleTitle: 'Community First Responder',
      badgeId: 'VOL-BLR-094',
      phone: '+91 98222 33445',
      avatar: '🤝',
      skills: 'Red Cross First Aid, Quick Transit'
    }
  ];

  const handleSelect = (cg) => {
    setSelectedCaregiver(cg.id);
    setBadgeId(cg.badgeId);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const cg = caregivers.find(c => c.id === selectedCaregiver) || caregivers[0];
    login('caregiver', cg);
  };

  const handleReadAloud = () => {
    speakText(
      `${t('loginAsCaregiver')}. ${t('loginAsCaregiverDesc')}. Please choose your credentials to continue.`,
      language
    );
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 ${highContrast ? 'bg-black text-yellow-300' : 'bg-gradient-to-b from-emerald-50/50 via-slate-50 to-teal-50/30 text-slate-900'}`}>
      
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
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-2xl border border-emerald-300 text-sm font-bold transition"
            title="Read screen aloud"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
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

      {/* Main Caregiver Login Box */}
      <div className="max-w-2xl mx-auto w-full my-auto py-6 space-y-6">
        
        {/* Title & Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-100 border-2 border-emerald-200 text-3xl shadow-sm">
            🩺
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('loginAsCaregiver')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-semibold max-w-md mx-auto">
            {t('loginAsCaregiverDesc')}
          </p>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wide">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('verifiedProvider')}</span>
          </div>
        </div>

        {/* Profile Selection */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 text-center">
            Select Verified Provider Credentials
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {caregivers.map((cg) => (
              <button
                key={cg.id}
                type="button"
                onClick={() => handleSelect(cg)}
                className={`p-4 rounded-3xl border-3 text-left transition-all flex items-center justify-between ${
                  selectedCaregiver === cg.id
                    ? 'bg-emerald-50/80 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl">
                    {cg.avatar}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      {cg.name}
                    </h4>
                    <p className="text-xs font-bold text-emerald-700">
                      {cg.roleTitle}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Badge: {cg.badgeId}
                    </p>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                  selectedCaregiver === cg.id
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}>
                  {selectedCaregiver === cg.id ? '✓' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5">
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                {t('enterCaregiverBadge')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 focus:bg-white text-sm font-bold text-slate-900 outline-none transition"
                  placeholder="RN-KA-88421"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                Provider Access PIN / OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 focus:bg-white text-sm font-bold text-slate-900 outline-none transition"
                  placeholder="••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition active:scale-98"
          >
            <span>Sign In to Care Provider Network</span>
            <span>→</span>
          </button>

          {/* Quick Demo Button */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1.5 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Click Hackathon Evaluator Sign-In</span>
            </button>
          </div>
        </form>

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 font-medium py-2">
        CareConnect Responder Network • Connected to 108 Emergency Medical Services
      </div>

    </div>
  );
};
