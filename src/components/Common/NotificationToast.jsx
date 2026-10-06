import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, CheckCircle, Info, X, Users, Trash2 } from 'lucide-react';

export const NotificationToast = () => {
  const { notifications, dismissNotification, clearNotifications } = useApp();

  if (!notifications || notifications.length === 0) return null;

  // Show top 3 recent notifications
  const recent = notifications.slice(0, 3);

  // Helper to format receiver labels
  const getReceiverPills = (notif) => {
    if (Array.isArray(notif.receivers) && notif.receivers.length > 0) {
      return notif.receivers;
    }
    if (notif.role === 'all') {
      return ['Senior 👴', 'Family 👨‍👩‍👧', 'Caregiver 👩‍⚕️', 'Volunteer 🤝'];
    }
    if (notif.role === 'senior') return ['Senior 👴'];
    if (notif.role === 'family') return ['Family 👨‍👩‍👧'];
    if (notif.role === 'caregiver') return ['Caregiver 👩‍⚕️', 'Volunteer 🤝'];
    if (notif.role === 'admin') return ['Admin 🛡️'];
    return [notif.role || 'All Responders'];
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0">
      
      {/* Batch Header when multiple notifications exist */}
      {notifications.length > 1 && (
        <div className="pointer-events-auto flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 shadow-lg text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{notifications.length} Active System Notifications</span>
          </div>
          <button
            onClick={clearNotifications}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 px-2 py-0.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Dismiss all notifications"
          >
            <Trash2 className="w-3 h-3" />
            <span>Dismiss All</span>
          </button>
        </div>
      )}

      {/* Stacked Notification Cards */}
      {recent.map((notif) => {
        const receiverList = getReceiverPills(notif);

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-2xl border flex flex-col gap-2 transform transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              notif.type === 'danger'
                ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-400/40'
                : notif.type === 'warning'
                ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300/40'
                : notif.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400/40'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {/* Top Row: Icon, Title & Explicit Close Button */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className="mt-0.5 shrink-0">
                  {notif.type === 'danger' && <AlertTriangle className="w-5 h-5 text-white animate-bounce" />}
                  {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-white" />}
                  {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-white" />}
                  {notif.type === 'info' && <Info className="w-5 h-5 text-indigo-300" />}
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="font-black text-xs sm:text-sm leading-tight truncate">
                    {notif.title}
                  </h5>
                  <p className="text-[11px] sm:text-xs text-white/90 font-medium line-clamp-2 mt-0.5 leading-snug">
                    {notif.message}
                  </p>
                </div>
              </div>

              {/* Close Button Mandated by User */}
              <button
                onClick={() => dismissNotification(notif.id)}
                className="p-1 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition cursor-pointer shrink-0 border border-white/20 active:scale-95"
                title="Close this notification"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Row: Timestamp & Target Receivers Badges */}
            <div className="pt-1.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
              {/* Receivers Tags */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="font-black text-white/75 flex items-center gap-0.5 uppercase tracking-wider">
                  <Users className="w-3 h-3" /> To:
                </span>
                {receiverList.map((rec, i) => (
                  <span
                    key={i}
                    className="font-bold px-1.5 py-0.5 rounded-md bg-black/30 text-white border border-white/20"
                  >
                    {rec}
                  </span>
                ))}
              </div>

              <span className="text-white/70 font-mono shrink-0 ml-auto">
                {notif.time}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
