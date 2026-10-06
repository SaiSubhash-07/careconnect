import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Hospital,
  Clock,
  MapPin,
  Calendar,
  X,
  Volume2,
  Car,
  Bell,
  CheckCircle2,
  Phone,
  UserCheck
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const AppointmentModal = () => {
  const {
    appointments,
    requestDoctorEscort,
    setActiveModal,
    addNotification,
    highContrast,
    language,
    t
  } = useApp();

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveModal]);

  const activeApt = appointments[0]; // Dr. Sharma Today at 4:00 PM

  const handleReadAloud = () => {
    speakText(
      `${t('aptModalTitle')}. ${activeApt.doctorName}. ${t('todayAt')}. ${activeApt.clinicName}. ${t('btnRemindMe')}, ${t('btnNeedHelp')}.`,
      language
    );
  };

  const handleRemindMe = () => {
    addNotification(
      '⏰ Appointment Reminder Set',
      `You will receive an audio chime 1 hour before appointment with ${activeApt.doctorName}.`,
      'info',
      'senior'
    );
    speakText(`Reminder set. ${activeApt.doctorName}'s appointment at ${activeApt.time}.`, language);
    setActiveModal(null);
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
            : 'bg-white text-slate-900 border-purple-500'
        }`}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 relative">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl">
              🏥
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {t('aptModalTitle')}
              </h2>
              <p className="text-purple-100 font-medium text-sm sm:text-base">
                {t('aptModalSub')}
              </p>
            </div>
          </div>

          <button
            onClick={handleReadAloud}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{t('readAptAloud')}</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Doctor Info Card */}
          <div
            className={`p-6 rounded-3xl border-2 text-center space-y-3 ${
              highContrast
                ? 'bg-zinc-900 border-yellow-400'
                : 'bg-purple-50/70 border-purple-200'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-600 text-white font-black text-sm tracking-wide shadow-sm">
              <Clock className="w-4 h-4" />
              <span>{t('todayAt')}</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
              {activeApt.doctorName}
            </h3>

            <p className="text-lg font-bold text-purple-900">
              {activeApt.specialty}
            </p>

            <div className="space-y-1 text-slate-600 font-semibold text-sm">
              <p className="flex items-center justify-center gap-1.5">
                <Hospital className="w-4 h-4 text-purple-600" />
                <span>{activeApt.clinicName}</span>
              </p>
              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>{activeApt.address}</span>
              </p>
            </div>

            {activeApt.needHelpRequested && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center gap-2 text-sm">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>{t('transitHelpRequested')}</span>
              </div>
            )}
          </div>

          {/* Prompt Buttons: [ REMIND ME ]  [ NEED HELP ] */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleRemindMe}
              className="py-5 px-6 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-lg sm:text-xl flex items-center justify-center gap-3 border-2 border-slate-300 transition active:scale-98"
            >
              <Bell className="w-6 h-6 text-slate-600" />
              <span>{t('btnRemindMe')}</span>
            </button>

            <button
              onClick={() => requestDoctorEscort(activeApt.id)}
              className="py-5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg shadow-purple-200 transition active:scale-98"
            >
              <Car className="w-6 h-6" />
              <span>{t('btnNeedHelp')}</span>
            </button>
          </div>

          <p className="text-xs text-center text-slate-500 font-medium">
            {t('needHelpHint')}
          </p>

          {/* Clinic Phone Contact */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
            <span className="text-slate-600 font-semibold">{t('clinicReception')}</span>
            <a
              href={`tel:${activeApt.phone}`}
              className="font-bold text-purple-700 hover:underline flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{activeApt.phone}</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
