import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Pill,
  Clock,
  CheckCircle2,
  BellRing,
  X,
  Volume2,
  AlertCircle,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const MedicineModal = () => {
  const {
    medications,
    markMedicineTaken,
    snoozeMedicine,
    setActiveModal,
    highContrast,
    language,
    t,
    caregiverPillReminder,
    overdueMedicationAlert,
    snoozeOverduePill
  } = useApp();

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveModal]);

  const activeMed = (caregiverPillReminder?.med)
    || (overdueMedicationAlert?.med)
    || medications.find(m => m.status === 'missed')
    || medications.find(m => m.status === 'due')
    || medications[0]
    || { id: 'med-fallback', name: 'Prescribed Medicine', dosage: '1 Tablet', time: '9:00 AM', instructions: 'Take with water' };

  const handleReadAloud = () => {
    speakText(
      `${t('medicineModalTitle')}. ${activeMed.name}. ${activeMed.status === 'missed' ? 'Missed Dose, please take now' : t('dueNow')}. ${activeMed.dosage}. ${t('instructions')}. ${t('btnTaken')}, ${t('btnRemindLater')}.`,
      language
    );
  };

  return (
    <div
      onClick={() => setActiveModal(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto cursor-pointer"
      title="Click anywhere outside to close"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl transition-all my-auto border-4 cursor-default ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-blue-500'
        }`}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 relative">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl">
              💊
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {t('medicineModalTitle')}
              </h2>
              <p className="text-blue-100 font-medium text-sm sm:text-base">
                {t('medicineModalSub')}
              </p>
            </div>
          </div>

          <button
            onClick={handleReadAloud}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{t('readReminderAloud')}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Pill Details Box */}
          <div
            className={`p-6 rounded-3xl border-2 text-center space-y-3 ${
              highContrast
                ? 'bg-zinc-900 border-yellow-400'
                : 'bg-blue-50/70 border-blue-200'
            }`}
          >
            {activeMed.status === 'missed' ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white font-black text-sm tracking-wide shadow-sm animate-pulse">
                <AlertCircle className="w-4 h-4" />
                <span>⚠️ MISSED TABLET - TAKE NOW</span>
              </div>
            ) : caregiverPillReminder ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-600 text-white font-black text-sm tracking-wide shadow-sm animate-pulse">
                <BellRing className="w-4 h-4" />
                <span>🔔 CAREGIVER URGENT REMINDER</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white font-black text-sm tracking-wide shadow-sm">
                <Clock className="w-4 h-4" />
                <span>{t('dueNow')}</span>
              </div>
            )}

            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
              {activeMed.name}
            </h3>

            <p className="text-xl font-bold text-blue-900">
              {activeMed.dosage}
            </p>

            <p className="text-base font-semibold text-slate-600 bg-white/90 py-2 px-4 rounded-xl inline-block border border-slate-200">
              ℹ️ {t('instructions')}
            </p>

            {activeMed.status === 'taken' && (
              <div className="mt-2 p-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{t('markedTakenAt', { time: activeMed.takenAt || activeMed.time })}</span>
              </div>
            )}
          </div>

          {/* Missed Medicine Safeguard Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-amber-900 leading-snug">
              {t('safeguardNotice')}
            </p>
          </div>

          {/* Action Buttons: TAKEN vs REMIND ME IN 5 MINS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => markMedicineTaken(activeMed.id)}
              className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-200 transition cursor-pointer"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>{t('btnTaken')}</span>
            </button>

            <button
              onClick={() => {
                snoozeOverduePill(activeMed.id, 5);
                setActiveModal(null);
              }}
              className="py-4 px-6 rounded-2xl bg-slate-200 hover:bg-slate-300 active:scale-98 text-slate-800 font-black text-base sm:text-lg flex items-center justify-center gap-2 border-2 border-slate-300 transition cursor-pointer"
              title="Snooze reminder for 5 minutes"
            >
              <BellRing className="w-5 h-5 text-slate-600" />
              <span>Remind in 5 Mins</span>
            </button>
          </div>

          {/* Other Daily Pills Schedule */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {t('otherMedsToday')}
            </p>
            <div className="space-y-2">
              {medications.filter(m => m.id !== activeMed.id).map(med => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{med.icon}</span>
                    <div>
                      <p className="font-bold text-slate-900">{med.name}</p>
                      <p className="text-xs text-slate-500">{med.dosage}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                    ⏰ {med.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
