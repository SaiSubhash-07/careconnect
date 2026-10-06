import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { SimulationBar } from './components/SimulationBar';
import { SeniorHome } from './components/SeniorView/SeniorHome';
import { FamilyDashboard } from './components/FamilyView/FamilyDashboard';
import { CaregiverDashboard } from './components/CaregiverView/CaregiverDashboard';
import { VoiceAssistant } from './components/VoiceAssistant';
import { NotificationToast } from './components/Common/NotificationToast';
import { RoleSelectLogin } from './components/Auth/RoleSelectLogin';
import { SeniorLogin } from './components/Auth/SeniorLogin';
import { FamilyLogin } from './components/Auth/FamilyLogin';
import { CaregiverLogin } from './components/Auth/CaregiverLogin';
import { AdminLogin } from './components/Auth/AdminLogin';
import { AdminDashboard } from './components/AdminView/AdminDashboard';
import { FallDetectionModal } from './components/SeniorView/FallDetectionModal';
import { DatabaseStudioModal } from './components/Database/DatabaseStudioModal';
import { LiveMapModal } from './components/Map/LiveMapModal';
import { FirebaseModal } from './components/Firebase/FirebaseModal';
import BackendStudioModal from './components/Backend/BackendStudioModal';
import { Heart, Sparkles, Shield, PhoneCall, Activity } from 'lucide-react';

const MainLayout = () => {
  const {
    activeRole,
    highContrast,
    fontSize,
    isAuthenticated,
    authScreen,
    isDbStudioOpen,
    closeDbStudio,
    isLiveMapOpen,
    closeLiveMap,
    isFirebaseModalOpen,
    closeFirebaseModal,
    isBackendStudioOpen,
    closeBackendStudio
  } = useApp();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Dynamic root font scaling class
  const getScaleClass = () => {
    if (fontSize === 'xl') return 'text-[115%]';
    if (fontSize === 'large') return 'text-[105%]';
    return 'text-[100%]';
  };

  // Render dedicated Role Login Pages when not authenticated
  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex flex-col transition-colors duration-200 ${getScaleClass()} ${
          highContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-900'
        }`}
      >
        {authScreen === 'senior_login' && <SeniorLogin />}
        {authScreen === 'family_login' && <FamilyLogin />}
        {authScreen === 'caregiver_login' && <CaregiverLogin />}
        {authScreen === 'admin_login' && <AdminLogin />}
        {(!authScreen || authScreen === 'portal') && <RoleSelectLogin />}
        <NotificationToast />
        <DatabaseStudioModal isOpen={isDbStudioOpen} onClose={closeDbStudio} />
        <LiveMapModal isOpen={isLiveMapOpen} onClose={closeLiveMap} />
        <FirebaseModal isOpen={isFirebaseModalOpen} onClose={closeFirebaseModal} />
        <BackendStudioModal isOpen={isBackendStudioOpen} onClose={closeBackendStudio} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${getScaleClass()} ${
        highContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Header & Role Switcher */}
      <Header onOpenVoiceAssistant={() => setIsVoiceOpen(true)} />

      {/* 2. Hackathon Demo Simulator Bar (Allows rapid judging & step testing) */}
      <SimulationBar />

      {/* 3. Main Role-Based Screen View */}
      <main className="flex-1 pb-16">
        {activeRole === 'senior' && <SeniorHome />}
        {activeRole === 'family' && <FamilyDashboard />}
        {activeRole === 'caregiver' && <CaregiverDashboard />}
        {activeRole === 'admin' && <AdminDashboard />}
      </main>

      {/* 4. Voice Assistant Interactive Modal */}
      <VoiceAssistant isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />

      {/* 5. Notification Toast Feed, Fall Detection Modal & Database Studio */}
      <NotificationToast />
      <FallDetectionModal />
      <DatabaseStudioModal isOpen={isDbStudioOpen} onClose={closeDbStudio} />
      <LiveMapModal isOpen={isLiveMapOpen} onClose={closeLiveMap} />
      <FirebaseModal isOpen={isFirebaseModalOpen} onClose={closeFirebaseModal} />
      <BackendStudioModal isOpen={isBackendStudioOpen} onClose={closeBackendStudio} />

      {/* 6. Footer communicating the core prompt philosophy */}
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
          CareConnect — Senior Citizen Healthcare & Emergency Support Platform • Designed for High Accessibility & Rapid Community Response
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
