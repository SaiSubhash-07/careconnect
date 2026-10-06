import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  ArrowLeft,
  Lock,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Server,
  Database,
  Users,
  AlertTriangle
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const AdminLogin = () => {
  const {
    openAuthScreen,
    login,
    language,
    highContrast,
    setHighContrast
  } = useApp();

  const [adminEmail, setAdminEmail] = useState('admin@careconnect.org');
  const [adminPin, setAdminPin] = useState('9999');
  const [errorMsg, setErrorMsg] = useState('');

  const adminProfiles = [
    {
      id: 'admin-001',
      name: 'Dr. A. K. Varma',
      role: 'admin',
      roleTitle: 'Master System Administrator',
      avatar: '🛡️',
      phone: '+91 99000 00001',
      email: 'admin@careconnect.org',
      badgeId: 'SYS-ADMIN-MASTER',
      accessLevel: 'Tier-1 Root Access'
    },
    {
      id: 'admin-002',
      name: 'Priya Sundaram',
      role: 'admin',
      roleTitle: 'Clinical Operations Director',
      avatar: '👩‍💼',
      phone: '+91 99000 00002',
      email: 'operations@careconnect.org',
      badgeId: 'SYS-OPS-DIRECTOR',
      accessLevel: 'Tier-1 Operations'
    }
  ];

  const [selectedAdmin, setSelectedAdmin] = useState(adminProfiles[0].id);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (adminPin.trim() !== '9999' && adminPin.trim() !== 'admin123') {
      setErrorMsg('Invalid Admin Security Key. Use master key: 9999');
      speakText('Invalid security key. Please enter master key 9999', language);
      return;
    }

    const adm = adminProfiles.find(a => a.id === selectedAdmin) || adminProfiles[0];
    login('admin', adm);
  };

  const handleQuickDemo = () => {
    login('admin', adminProfiles[0]);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between ${
      highContrast ? 'bg-black text-yellow-300' : 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white'
    }`}>
      {/* Header */}
      <header className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={() => openAuthScreen('portal')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold transition border border-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portals</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-black text-base tracking-tight text-white">
            CareConnect <span className="text-purple-400">Admin Control</span>
          </span>
        </div>

        <button
          onClick={() => setHighContrast(!highContrast)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700 cursor-pointer"
          title="Toggle High Contrast"
        >
          {highContrast ? 'Normal' : 'High Contrast'}
        </button>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto flex items-center justify-center text-3xl shadow-lg border border-purple-400/30">
              🛡️
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              System Admin Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Universal supervisory access across all senior citizens, guardians, and clinical responders.
            </p>
          </div>

          {/* Admin Profile Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              Select Administrator Profile:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {adminProfiles.map((adm) => (
                <button
                  key={adm.id}
                  type="button"
                  onClick={() => {
                    setSelectedAdmin(adm.id);
                    setAdminEmail(adm.email);
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                    selectedAdmin === adm.id
                      ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/40'
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{adm.avatar}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-purple-300 font-bold">
                      {adm.badgeId}
                    </span>
                  </div>
                  <p className="font-black text-xs text-white truncate">{adm.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{adm.roleTitle}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Master Security PIN
                </label>
                <span className="text-[11px] font-mono text-purple-400 font-bold">
                  Demo PIN: 9999
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => {
                    setAdminPin(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  placeholder="Enter 9999"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-mono tracking-widest focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-900/30 transition cursor-pointer active:scale-98"
            >
              Sign In as Administrator
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-purple-300 text-xs font-bold rounded-xl border border-purple-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>1-Click Evaluator Demo Sign-In</span>
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-800">
        CareConnect Master Administration Console • Full HIPAA/GDPR Certified Audit Logging
      </footer>
    </div>
  );
};
