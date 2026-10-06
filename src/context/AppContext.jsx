import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audioAlerts';
import { speakText } from '../utils/speech';
import {
  initialSeniorData,
  mockSeniors,
  mockCaregivers,
  initialMedications,
  initialAppointments,
  initialHelpRequests,
  defaultUserProfiles
} from '../data/mockData';
import { translations, languages } from '../utils/translations';
import { db, DB_STORES } from '../db/careConnectDB';
import { formatUS12HourTime, isTimeCrossed, getMinutesOverdue } from '../utils/timeUtils';
import { isFirebaseConfigured } from '../firebase/firebaseConfig';
import {
  broadcastLocationToCloud,
  publishEmergencyToCloud,
  syncAllIndexedDbToCloud
} from '../firebase/firestoreService';
import { apiService } from '../services/apiService';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Role switcher: 'senior' | 'family' | 'caregiver'
  const [activeRole, setActiveRole] = useState('senior');

  // Multi-Senior State Management (Supports multiple seniors with separate logins)
  const [seniorsList, setSeniorsList] = useState(mockSeniors);
  const [selectedSeniorId, setSelectedSeniorId] = useState(mockSeniors[0].id);
  const [senior, setSenior] = useState(mockSeniors[0]);
  const [medications, setMedications] = useState(mockSeniors[0].medications || initialMedications);
  const [appointments, setAppointments] = useState(mockSeniors[0].appointments || initialAppointments);

  // Emergency State Management (One-Click SOS Cascade)
  const [emergency, setEmergency] = useState({
    isActive: false,
    stage: 'idle', // 'idle' | 'contacting' | 'caregiver_unavailable' | 'volunteer_dispatched' | 'escalated_ambulance' | 'resolved'
    startedAt: null,
    assignedHelper: null,
    etaMinutes: null,
    explanation: '',
    logs: []
  });

  // Authentication & Separate Login Pages State
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUser, setCurrentUser] = useState(defaultUserProfiles.senior);
  const [authScreen, setAuthScreen] = useState('portal'); // 'portal' | 'senior_login' | 'family_login' | 'caregiver_login'

  // Database State & Studio Inspector Modal
  const [isDbStudioOpen, setIsDbStudioOpen] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);

  // Live Tracking Map Modal State
  const [isLiveMapOpen, setIsLiveMapOpen] = useState(false);

  // Firebase Cloud Studio Modal State
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Backend Engine & Studio Modal State
  const [isBackendStudioOpen, setIsBackendStudioOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Active Senior Modal: null | 'emergency' | 'medicine' | 'appointment' | 'daily_help'
  const [activeModal, setActiveModal] = useState(null);

  // Caregiver Urgent Tablet Reminder State: null | { med, seniorId, seniorName, caregiverName, sentAt }
  const [caregiverPillReminder, setCaregiverPillReminder] = useState(null);

  // Overdue Medication & 5-Minute Recurring Reminder State
  const [overdueMedicationAlert, setOverdueMedicationAlert] = useState(null);
  const [nextOverdueReminderSeconds, setNextOverdueReminderSeconds] = useState(300);

  // Daily Help Requests
  const [helpRequests, setHelpRequests] = useState(initialHelpRequests);

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Routine Checkup Completed',
      message: 'BP check logged normal (122/80) yesterday.',
      time: 'Yesterday, 6:00 PM',
      type: 'info',
      role: 'all',
      receivers: ['Senior 👴', 'Family 👨‍👩‍👧', 'Caregiver 👩‍⚕️']
    }
  ]);

  // Accessibility States
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('large'); // 'normal', 'large', 'xl'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Multi-Language Translation State (English, Telugu, Hindi, Tamil, Malayalam, Kannada)
  const [language, setLanguage] = useState('en');

  // Translation helper function
  const t = (key, params = {}) => {
    const langDict = translations[language] || translations.en;
    let text = langDict[key] || translations.en[key] || key;
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal);
      });
    }
    return text;
  };

  // Helper to add toast notification with explicit receivers
  const addNotification = (title, message, type = 'info', targetRole = 'all', customReceivers = null) => {
    let receivers = customReceivers;
    if (!receivers) {
      if (targetRole === 'all') {
        receivers = ['Senior 👴', 'Family 👨‍👩‍👧', 'Caregiver 👩‍⚕️', 'Volunteer 🤝'];
      } else if (targetRole === 'senior') {
        receivers = ['Senior 👴'];
      } else if (targetRole === 'family') {
        receivers = ['Family 👨‍👩‍👧'];
      } else if (targetRole === 'caregiver') {
        receivers = ['Caregiver 👩‍⚕️', 'Volunteer 🤝'];
      } else if (targetRole === 'admin') {
        receivers = ['Admin 🛡️'];
      } else {
        receivers = [targetRole];
      }
    }

    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title,
      message,
      time: 'Just now',
      type,
      role: targetRole,
      receivers
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (soundEnabled) {
      if (type === 'danger') {
        sounds.playEmergencyAlarm();
      } else if (type === 'warning') {
        sounds.playWarning();
      } else if (type === 'success') {
        sounds.playSuccess();
      } else {
        sounds.playChime();
      }
    }
  };

  // Dismiss an individual notification by ID
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Dismiss / clear all active notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Initialize Database on mount & hydrate persisted records
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await db.init();
        setIsDbReady(true);

        const storedSeniors = await db.getAll(DB_STORES.SENIORS);
        if (storedSeniors && storedSeniors.length > 0) {
          setSeniorsList(storedSeniors);
          const currentSenior = storedSeniors.find(s => s.id === selectedSeniorId) || storedSeniors[0];
          setSenior(currentSenior);

          const allMeds = await db.getAll(DB_STORES.MEDICATIONS);
          const currentMeds = allMeds.filter(m => m.seniorId === currentSenior.id);
          if (currentMeds && currentMeds.length > 0) {
            setMedications(currentMeds);
          }

          const allApts = await db.getAll(DB_STORES.APPOINTMENTS);
          const currentApts = allApts.filter(a => a.seniorId === currentSenior.id);
          if (currentApts && currentApts.length > 0) {
            setAppointments(currentApts);
          }
        }

        const storedRequests = await db.getAll(DB_STORES.HELP_REQUESTS);
        if (storedRequests && storedRequests.length > 0) {
          setHelpRequests(storedRequests);
        }
      } catch (err) {
        console.warn('Database initialization warning:', err);
      }
    };
    initDatabase();
  }, []);

  // Select / switch active senior and load their unique medications, appointments & coordinates
  const selectSenior = async (seniorId) => {
    const foundSenior = (seniorsList || mockSeniors).find(s => s.id === seniorId) || mockSeniors[0];
    setSelectedSeniorId(foundSenior.id);
    setSenior(foundSenior);

    try {
      const allMeds = await db.getAll(DB_STORES.MEDICATIONS);
      const seniorMeds = allMeds.filter(m => m.seniorId === foundSenior.id);
      if (seniorMeds && seniorMeds.length > 0) {
        setMedications(seniorMeds);
      } else {
        setMedications(foundSenior.medications || initialMedications);
      }

      const allApts = await db.getAll(DB_STORES.APPOINTMENTS);
      const seniorApts = allApts.filter(a => a.seniorId === foundSenior.id);
      if (seniorApts && seniorApts.length > 0) {
        setAppointments(seniorApts);
      } else {
        setAppointments(foundSenior.appointments || initialAppointments);
      }
    } catch {
      setMedications(foundSenior.medications || initialMedications);
      setAppointments(foundSenior.appointments || initialAppointments);
    }

    setLiveLocation(prev => ({
      ...prev,
      lat: foundSenior.gpsCoords.lat,
      lng: foundSenior.gpsCoords.lng,
      address: foundSenior.address,
      lastUpdated: formatUS12HourTime(new Date(), true)
    }));
    return foundSenior;
  };

  const loginAsSenior = (seniorId) => {
    const foundSenior = selectSenior(seniorId);
    setActiveRole('senior');
    const userProfile = {
      id: foundSenior.id,
      name: foundSenior.name,
      preferredName: foundSenior.preferredName,
      role: 'senior',
      roleTitle: 'Senior Citizen',
      avatar: foundSenior.avatar,
      phone: foundSenior.phone,
      address: foundSenior.address
    };
    setCurrentUser(userProfile);
    setIsAuthenticated(true);
    setAuthScreen('portal');
    addNotification(
      `Welcome, ${foundSenior.name}!`,
      `Signed in to Senior Citizen portal. Safe at ${foundSenior.address}.`,
      'success',
      'all'
    );
    speakText(`Welcome ${foundSenior.name}. You are logged into CareConnect.`, language);
  };

  const login = (role, userProfile = null) => {
    if (role === 'senior') {
      const targetId = userProfile?.id || selectedSeniorId || 'senior-001';
      loginAsSenior(targetId);
      return;
    }
    const profile = userProfile || defaultUserProfiles[role] || defaultUserProfiles.senior;
    setActiveRole(role);
    setCurrentUser(profile);
    setIsAuthenticated(true);
    setAuthScreen('portal');
    addNotification(
      `Welcome, ${profile.name}!`,
      `Signed in to CareConnect ${profile.roleTitle || profile.role} portal.`,
      'success',
      'all'
    );
    speakText(`Welcome, ${profile.name}. Accessing ${profile.roleTitle || profile.role} portal.`, language);
  };

  const loginAsAdmin = (customAdmin = null) => {
    login('admin', customAdmin || defaultUserProfiles.admin);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthScreen('portal');
    addNotification('Logged Out', 'Returned to portal selector. Choose a role to sign in.', 'info', 'all');
    speakText('Logged out. Please choose your portal.', language);
  };

  const openAuthScreen = (screen) => {
    setAuthScreen(screen);
  };

  // Auto-cascade timer ref
  const cascadeTimerRef = useRef(null);

  // Fall Detection State & Countdown Timer Ref
  const [fallAlert, setFallAlert] = useState({
    isActive: false,
    countdown: 15,
    detectedAt: null,
    impactG: 3.2
  });
  const fallTimerRef = useRef(null);

  // Live Digital Clock State (updates every 1 second)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const formattedTime = formatUS12HourTime(currentTime, true);
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Live GPS Location Tracking State
  const [liveLocation, setLiveLocation] = useState({
    lat: 12.9716,
    lng: 77.5946,
    accuracy: 8,
    address: 'Flat 402, Green Meadows, MG Road',
    isLiveGPS: false,
    lastUpdated: formatUS12HourTime(new Date(), true),
    error: null
  });

  const fetchCurrentGPS = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setLiveLocation({
            lat: Number(latitude.toFixed(4)),
            lng: Number(longitude.toFixed(4)),
            accuracy: Math.round(accuracy),
            address: `Live GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
            isLiveGPS: true,
            lastUpdated: formatUS12HourTime(new Date(), true),
            error: null
          });
          setSenior(prev => ({
            ...prev,
            address: `Live GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
            gpsCoords: { lat: latitude, lng: longitude }
          }));
          addNotification('📍 Live GPS Connected', `Location locked: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E (±${Math.round(accuracy)}m)`, 'success', 'all');
        },
        (err) => {
          console.warn('Geolocation access:', err);
          setLiveLocation(prev => ({
            ...prev,
            error: err.message,
            isLiveGPS: false
          }));
          addNotification('📍 GPS Fallback', `Using saved home location: ${senior.address}`, 'info', 'all');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setLiveLocation({
            lat: Number(latitude.toFixed(4)),
            lng: Number(longitude.toFixed(4)),
            accuracy: Math.round(accuracy),
            address: `Live GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
            isLiveGPS: true,
            lastUpdated: formatUS12HourTime(new Date(), true),
            error: null
          });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Broadcast Senior's Live GPS to Family, Caregivers & Volunteer Network
  const broadcastLiveLocation = (customCoords = null) => {
    const coords = customCoords || { lat: liveLocation.lat, lng: liveLocation.lng };
    const nowTime = formatUS12HourTime(new Date(), true);

    if (soundEnabled) {
      sounds.playSuccess();
    }

    speakText(
      `Live GPS coordinates broadcasted to family members, nurse Sunita, and nearby volunteers. Tracking link active.`,
      language
    );

    addNotification(
      '📡 Live Location Broadcasted',
      `Senior GPS locked at ${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E. Real-time telemetry dispatched to Daughter Priya, Nurse Sunita, and Volunteer Amit.`,
      'success',
      'all'
    );

    if (isDbReady && db) {
      db.logAudit(
        'LIVE_LOCATION_BROADCAST',
        senior.name || 'Senior',
        `Broadcasted live coordinates (${coords.lat}, ${coords.lng}) to emergency responders.`
      ).catch(err => console.warn('DB log error:', err));
    }

    // Replicate live coordinates to Cloud Firestore
    broadcastLocationToCloud(senior.id, {
      lat: coords.lat,
      lng: coords.lng,
      accuracy: liveLocation.accuracy,
      address: senior.address || liveLocation.address,
      isLiveGPS: liveLocation.isLiveGPS
    }).catch(err => console.warn('Firebase telemetry sync note:', err));

    return {
      success: true,
      timestamp: nowTime,
      lat: coords.lat,
      lng: coords.lng,
      recipients: ['Family (Priya)', 'Nurse Sunita', 'Volunteer Amit', '108 Dispatch Net']
    };
  };

  const updateSeniorCoordinates = (lat, lng, address = null) => {
    setLiveLocation(prev => ({
      ...prev,
      lat: Number(lat),
      lng: Number(lng),
      address: address || `Updated GPS: ${Number(lat).toFixed(4)}° N, ${Number(lng).toFixed(4)}° E`,
      lastUpdated: formatUS12HourTime(new Date(), true)
    }));
    setSenior(prev => ({
      ...prev,
      gpsCoords: { lat: Number(lat), lng: Number(lng) },
      address: address || prev.address
    }));
  };

  // Fall Detection Handlers (Automated impact detection with 15s countdown)
  const triggerFallDetection = (impactG = 3.2) => {
    if (fallTimerRef.current) clearInterval(fallTimerRef.current);
    const nowTime = formatUS12HourTime(new Date(), true);

    setFallAlert({
      isActive: true,
      countdown: 15,
      detectedAt: nowTime,
      impactG: Number(impactG) || 3.2
    });

    if (soundEnabled) sounds.playFallAlarm();

    speakText(
      `Warning! Hard fall detected at your location. If you are okay, tap I am okay. Calling emergency help in 15 seconds.`,
      language
    );

    addNotification(
      '💥 Hard Fall Detected!',
      `Sudden impact (${impactG}G) registered at ${senior.address}. Awaiting senior response (15s).`,
      'danger',
      'all'
    );

    // Save Fall incident to Database
    db.put(DB_STORES.FALL_INCIDENTS, {
      id: 'fall-' + Date.now(),
      seniorId: senior.id,
      seniorName: senior.name,
      timestamp: nowTime,
      impactG: Number(impactG) || 3.2,
      status: 'countdown_active',
      address: senior.address
    });
    db.logAudit('FALL_DETECTED', 'Accelerometer', `Sudden impact of ${impactG}G registered for ${senior.name}`);

    fallTimerRef.current = setInterval(() => {
      setFallAlert(prev => {
        if (!prev.isActive) {
          clearInterval(fallTimerRef.current);
          return prev;
        }
        if (prev.countdown <= 1) {
          clearInterval(fallTimerRef.current);
          autoEscalateFallEmergency();
          return { ...prev, isActive: false, countdown: 0 };
        }
        if (soundEnabled && prev.countdown <= 5) {
          sounds.playFallAlarm();
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  };

  const cancelFallAlert = () => {
    if (fallTimerRef.current) clearInterval(fallTimerRef.current);
    setFallAlert({ isActive: false, countdown: 15, detectedAt: null, impactG: 3.2 });
    if (soundEnabled) sounds.playSuccess();
    addNotification(
      '🟢 Fall Alert Cancelled',
      `${senior.name} confirmed safe. False alarm registered.`,
      'info',
      'all'
    );
    speakText('Fall alert cancelled. Glad you are safe.', language);
    db.logAudit('FALL_CANCELLED', senior.name, 'Fall countdown cancelled by senior (marked safe).');
  };

  const confirmFallEmergency = () => {
    if (fallTimerRef.current) clearInterval(fallTimerRef.current);
    setFallAlert({ isActive: false, countdown: 15, detectedAt: null, impactG: 3.2 });
    triggerEmergency({ source: 'fall_confirmed' });
  };

  const autoEscalateFallEmergency = () => {
    triggerEmergency({ source: 'fall_unresponsive' });
    setTimeout(() => {
      escalateToAmbulance();
    }, 1500);
  };

  // Hardware Accelerometer Fall Detection listener for mobile devices
  useEffect(() => {
    const handleDeviceMotion = (event) => {
      if (!event.accelerationIncludingGravity) return;
      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;
      const totalAcc = Math.sqrt(x * x + y * y + z * z);
      // > 28 m/s^2 (~2.9G) indicates a sudden drop/impact
      if (totalAcc > 28 && !fallAlert.isActive && !emergency.isActive) {
        triggerFallDetection(Number((totalAcc / 9.8).toFixed(1)));
      }
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      return () => window.removeEventListener('devicemotion', handleDeviceMotion);
    }
  }, [fallAlert.isActive, emergency.isActive]);

  // Connect to Node Express Backend & subscribe to Real-Time SSE stream
  useEffect(() => {
    let isMounted = true;
    const pollBackendHealth = async () => {
      const health = await apiService.checkHealth();
      if (isMounted) {
        setIsBackendOnline(health.online);
      }
    };

    pollBackendHealth();
    const healthInterval = setInterval(pollBackendHealth, 8000);

    const unsubscribeSSE = apiService.connectSSE((event) => {
      if (!isMounted) return;
      setIsBackendOnline(true);
      if (event?.type === 'NEW_MEDICATION' && event.payload) {
        const newMed = event.payload;
        if (newMed.seniorId === selectedSeniorId) {
          setMedications(prev => {
            if (prev.some(m => m.id === newMed.id)) return prev;
            return [newMed, ...prev];
          });
        }
      } else if (event?.type === 'MEDICINE_REMINDER' && event.payload) {
        setCaregiverPillReminder({
          med: event.payload.medication,
          seniorId: event.payload.seniorId,
          seniorName: event.payload.seniorName,
          caregiverName: event.payload.caregiverName,
          sentAt: event.payload.timestamp,
          notes: event.payload.notes
        });
      } else if (event?.type === 'FALL_DETECTED' && event.payload) {
        triggerFallDetection(event.payload.gForce || 3.4);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(healthInterval);
      unsubscribeSSE();
    };
  }, [selectedSeniorId]);

  // Track last alerted time per medication to avoid repetitive audio spamming
  const lastOverdueAlertRef = useRef({});

  // Overdue Tablet Time Crossed Monitor (Checked every 10 seconds)
  useEffect(() => {
    const checkOverdueMedications = () => {
      if (!medications || medications.length === 0) return;

      // Find any medicine that is 'due' or 'missed' and whose scheduled time has crossed
      const crossedMed = medications.find(m => {
        if (m.status === 'taken') return false;
        return isTimeCrossed(m.time);
      });

      if (crossedMed) {
        const minsOverdue = getMinutesOverdue(crossedMed.time);
        const lastAlerted = lastOverdueAlertRef.current[crossedMed.id] || 0;
        const now = Date.now();

        setOverdueMedicationAlert(prev => {
          if (!prev || prev.med.id !== crossedMed.id) {
            return {
              med: crossedMed,
              minutesOverdue: minsOverdue,
              firstDetectedAt: now,
              lastAlertedAt: now
            };
          }
          return {
            ...prev,
            med: crossedMed,
            minutesOverdue: minsOverdue
          };
        });

        // Trigger alert and voice notification if not alerted in the last 5 minutes (300,000 ms)
        if (now - lastAlerted >= 300000) {
          lastOverdueAlertRef.current[crossedMed.id] = now;
          if (soundEnabled) sounds.playAlert();
          addNotification(
            '⏰ Scheduled Tablet Time Crossed!',
            `Scheduled time for ${crossedMed.name} (${crossedMed.time}) has passed. Please take your tablet now!`,
            'danger',
            ['Senior 👴', 'Caregiver 👩‍⚕️', 'Family 👨‍👩‍👧']
          );
          speakText(`Alert: Tablet time has passed for ${crossedMed.name}. Please take your tablet now. Reminding again in 5 minutes.`, language);
        }
      } else {
        setOverdueMedicationAlert(null);
      }
    };

    checkOverdueMedications();
    const overdueInterval = setInterval(checkOverdueMedications, 10000);
    return () => clearInterval(overdueInterval);
  }, [medications, soundEnabled, language]);

  // 5-Minute Recurring Countdown Timer for Overdue Medications
  useEffect(() => {
    if (!overdueMedicationAlert) {
      setNextOverdueReminderSeconds(300);
      return;
    }

    const timer = setInterval(() => {
      setNextOverdueReminderSeconds(prev => {
        if (prev <= 1) {
          // 5 minutes reached: re-fire alert sound & speech reminder
          if (soundEnabled) sounds.playAlert();
          const targetMed = overdueMedicationAlert.med;
          addNotification(
            '🔔 5-Minute Recurring Reminder: Take Tablet Now',
            `Important: ${targetMed.name} scheduled at ${targetMed.time} is still pending. Please take it now!`,
            'danger',
            ['Senior 👴', 'Caregiver 👩‍⚕️', 'Family 👨‍👩‍👧']
          );
          speakText(`Reminder: Tablet ${targetMed.name} is overdue. Please take your tablet now.`, language);
          lastOverdueAlertRef.current[targetMed.id] = Date.now();
          return 300; // Reset countdown for next 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [overdueMedicationAlert, soundEnabled, language]);

  // Snooze overdue pill reminder for 5 minutes
  const snoozeOverduePill = (medId, minutes = 5) => {
    setNextOverdueReminderSeconds(minutes * 60);
    if (soundEnabled) sounds.playChime();
    addNotification(
      '⏰ Overdue Pill Snoozed',
      `Reminder snoozed for ${minutes} minutes. Next reminder will alert at countdown completion.`,
      'info',
      ['Senior 👴']
    );
    speakText(`Reminder snoozed for ${minutes} minutes.`, language);
  };

  // Helper to append log to emergency (safe fallback)
  const addEmergencyLog = (message, type = 'info') => {
    const timeStr = formatUS12HourTime(new Date(), true);
    setEmergency(prev => ({
      ...prev,
      logs: [{ id: Date.now() + Math.random(), time: timeStr, message, type }, ...(prev?.logs || [])]
    }));
  };

  // 1. TRIGGER EMERGENCY HELP (One-Click)
  const triggerEmergency = (options = {}) => {
    if (soundEnabled) sounds.playEmergencyAlarm();

    const startTime = formatUS12HourTime(new Date(), false);
    const familyNames = senior.familyContacts?.map(f => f.name).join(' & ') || 'Family';
    const isFall = options?.source === 'fall_unresponsive' || options?.source === 'fall_confirmed';
    const initialLogs = [
      {
        id: 'log-1',
        time: startTime,
        message: isFall
          ? `💥 CRITICAL FALL: Sudden impact registered for ${senior.name} at home.`
          : `🚨 Emergency Help initiated by ${senior.name} from Home.`,
        type: 'danger'
      },
      {
        id: 'log-2',
        time: startTime,
        message: `📍 GPS Location broadcasted: ${senior.address}.`,
        type: 'info'
      },
      {
        id: 'log-3',
        time: startTime,
        message: `👨‍👩‍👧 Registered family members (${familyNames}) alerted via SOS SMS & Call.`,
        type: 'success'
      },
      {
        id: 'log-4',
        time: startTime,
        message: '🩺 Alerting Primary Registered Caregiver: Nurse Sunita Devi (0.8 km)...',
        type: 'info'
      }
    ];

    setEmergency({
      isActive: true,
      stage: 'contacting',
      startedAt: startTime,
      assignedHelper: mockCaregivers[0], // Nurse Sunita
      etaMinutes: 4,
      explanation: isFall
        ? `Fall incident detected for ${senior.name}. Rapid response dispatched.`
        : `Primary registered caregiver assigned to ${senior.name}.`,
      logs: initialLogs
    });

    // Save Emergency SOS Incident to Database
    db.put(DB_STORES.EMERGENCY_LOGS, {
      id: 'emg-' + Date.now(),
      seniorId: senior.id,
      seniorName: senior.name,
      startedAt: startTime,
      stage: 'contacting',
      isFall,
      address: senior.address,
      logs: initialLogs
    });
    db.logAudit('EMERGENCY_TRIGGERED', senior.name, `SOS initiated at ${senior.address} (Fall: ${isFall})`);

    // Publish Emergency SOS Alert to Cloud Firestore
    publishEmergencyToCloud({
      seniorId: senior.id,
      seniorName: senior.name,
      startedAt: startTime,
      stage: 'contacting',
      isFall,
      address: senior.address,
      logs: initialLogs
    }).catch(err => console.warn('Cloud emergency sync note:', err));

    setActiveModal('emergency');

    addNotification(
      isFall ? '💥 CRITICAL FALL SOS DISPATCHED!' : '🚨 EMERGENCY SOS TRIGGERED!',
      `${senior.name} triggered Emergency Help. Family & Caregiver notified immediately.`,
      'danger',
      'all'
    );

    speakText(
      isFall
        ? 'Fall detected. Emergency request sent. Contacting family and caregivers.'
        : 'Emergency request sent. Contacting your family and primary caregiver now. Please stay calm.',
      language
    );

    // Automatically accepted by caregiver or volunteer within 2.5 seconds
    if (cascadeTimerRef.current) clearTimeout(cascadeTimerRef.current);
    cascadeTimerRef.current = setTimeout(() => {
      setEmergency(curr => {
        if (curr.isActive && curr.stage === 'contacting') {
          simulateCaregiverAccept();
        }
        return curr;
      });
    }, 2500);
  };

  // 2. SIMULATE CAREGIVER TIMEOUT / UNAVAILABLE (Step 5 in prompt)
  const simulateCaregiverTimeout = () => {
    if (cascadeTimerRef.current) clearTimeout(cascadeTimerRef.current);
    if (soundEnabled) sounds.playWarning();

    const timeStr = formatUS12HourTime(new Date(), true);
    const volunteer = mockCaregivers.find(c => c.id === 'vol-1'); // Amit Patel

    setEmergency(prev => ({
      ...prev,
      stage: 'caregiver_unavailable',
      assignedHelper: volunteer,
      etaMinutes: 7,
      explanation: 'Caregiver unavailable. Finding another available person...',
      logs: [
        {
          id: Date.now() + 1,
          time: timeStr,
          message: '⚠️ Primary Caregiver Sunita Devi unavailable / did not respond.',
          type: 'warning'
        },
        {
          id: Date.now() + 2,
          time: timeStr,
          message: '⚡ Smart Assistance Engine cascading to nearest verified volunteer network...',
          type: 'info'
        },
        ...(prev?.logs || [])
      ]
    }));

    addNotification(
      '⚠️ Caregiver Unavailable',
      'Nurse Sunita unconfirmed. Smart routing automatically searching for nearby verified volunteers...',
      'warning',
      'family'
    );

    speakText('Primary caregiver is unavailable. Finding another available person near you.', language);

    // Shortly dispatch volunteer
    setTimeout(() => {
      dispatchVolunteer(volunteer);
    }, 2500);
  };

  // 3. DISPATCH VOLUNTEER (Amit Patel - 7 mins)
  const dispatchVolunteer = (volunteer = mockCaregivers[1]) => {
    const timeStr = formatUS12HourTime(new Date(), true);

    setEmergency(prev => ({
      ...prev,
      stage: 'volunteer_dispatched',
      assignedHelper: volunteer,
      etaMinutes: 7,
      explanation: 'Volunteer selected because they are available and can reach you in approximately 7 minutes.',
      logs: [
        {
          id: Date.now() + 3,
          time: timeStr,
          message: `✅ Volunteer found: ${volunteer.name} (${volunteer.role})`,
          type: 'success'
        },
        {
          id: Date.now() + 4,
          time: timeStr,
          message: `📍 Distance: ${volunteer.distance} • Estimated arrival: 7 minutes`,
          type: 'info'
        },
        {
          id: Date.now() + 5,
          time: timeStr,
          message: `💡 Reason: Volunteer selected because they are available and can reach you in approximately 7 minutes.`,
          type: 'info'
        },
        ...(prev?.logs || [])
      ]
    }));

    if (soundEnabled) sounds.playSuccess();

    addNotification(
      '✅ Helper Assigned & En Route',
      `Volunteer ${volunteer.name} accepted. Estimated arrival: 7 minutes.`,
      'success',
      'all'
    );

    speakText(`Help is on the way. Volunteer ${volunteer.name} will arrive in approximately 7 minutes.`, language);
  };

  // 4. CAREGIVER DIRECT ACCEPTANCE (Nurse Sunita)
  const simulateCaregiverAccept = () => {
    if (cascadeTimerRef.current) clearTimeout(cascadeTimerRef.current);
    if (soundEnabled) sounds.playSuccess();

    const caregiver = mockCaregivers[0];
    const timeStr = formatUS12HourTime(new Date(), true);

    setEmergency(prev => ({
      ...prev,
      stage: 'volunteer_dispatched',
      assignedHelper: caregiver,
      etaMinutes: 4,
      explanation: 'Assistance Accepted by Nurse Sunita. Estimated arrival: 4 minutes.',
      logs: [
        {
          id: Date.now(),
          time: timeStr,
          message: `✅ Assistance Accepted by Nurse Sunita Devi. On her way!`,
          type: 'success'
        },
        ...(prev?.logs || [])
      ]
    }));

    addNotification(
      '✅ Assistance Accepted',
      `Nurse Sunita is en route to ${senior.name}. ETA: 4 minutes.`,
      'success',
      'all'
    );

    speakText('Nurse Sunita has accepted your request and is coming now.', language);
  };

  // 5. ESCALATE TO 108 EMERGENCY SERVICES / AMBULANCE
  const escalateToAmbulance = () => {
    if (cascadeTimerRef.current) clearTimeout(cascadeTimerRef.current);
    if (fallTimerRef.current) clearInterval(fallTimerRef.current);
    if (soundEnabled) sounds.playEmergencyAlarm();

    const ems = mockCaregivers.find(c => c.id === 'ems-108') || {
      id: 'ems-108',
      name: '108 Emergency Medical Services',
      role: 'Govt. Ambulance & Rapid Paramedic Unit',
      type: 'ems',
      phone: '108',
      distance: '1.8 km',
      distanceMeters: 1800,
      etaMinutes: 5,
      rating: 5.0,
      status: 'dispatched',
      avatar: '🚑',
      skills: ['Critical Life Support', 'Defibrillator', 'Oxygen Support', 'Hospital Triage'],
      rationale: 'Dispatched directly to City Central Hospital Emergency Ward.'
    };
    const timeStr = formatUS12HourTime(new Date(), true);

    setEmergency(prev => {
      const currentLogs = Array.isArray(prev?.logs) ? prev.logs : [];
      return {
        isActive: true,
        stage: 'escalated_ambulance',
        startedAt: prev?.startedAt || timeStr,
        assignedHelper: ems,
        etaMinutes: 5,
        explanation: 'Directly escalated to 108 Emergency Medical Services. Ambulance dispatched with paramedic triage unit.',
        logs: [
          {
            id: Date.now() + 1,
            time: timeStr,
            message: '🚑 ESCALATED TO 108 EMERGENCY MEDICAL SERVICES.',
            type: 'danger'
          },
          {
            id: Date.now() + 2,
            time: timeStr,
            message: `📞 108 Command Center confirmed ambulance dispatch to ${senior.address}.`,
            type: 'success'
          },
          ...currentLogs
        ]
      };
    });

    // Save Ambulance Escalation to Database
    db.put(DB_STORES.EMERGENCY_LOGS, {
      id: 'emg-' + Date.now(),
      seniorId: senior.id,
      seniorName: senior.name,
      startedAt: timeStr,
      stage: 'escalated_ambulance',
      assignedHelper: ems,
      etaMinutes: 5,
      explanation: 'Directly escalated to 108 Emergency Medical Services. Ambulance dispatched with paramedic triage unit.'
    });
    db.logAudit('EMERGENCY_108_AMBULANCE', 'Command Center', `108 Ambulance Unit dispatched to ${senior.address}`);

    setActiveModal('emergency');

    addNotification(
      '🚑 108 Ambulance Dispatched',
      `Government Medical Emergency Services alerted. Ambulance en route to ${senior.address}.`,
      'danger',
      'all'
    );

    speakText('108 Emergency Medical Services contacted. An ambulance is on its way.', language);
  };

  // 6. RESOLVE EMERGENCY
  const resolveEmergency = () => {
    if (cascadeTimerRef.current) clearTimeout(cascadeTimerRef.current);
    if (soundEnabled) sounds.playSuccess();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }

    setEmergency({
      isActive: false,
      stage: 'resolved',
      startedAt: null,
      assignedHelper: null,
      etaMinutes: null,
      explanation: '',
      logs: []
    });

    db.logAudit('EMERGENCY_RESOLVED', senior.name, 'Emergency resolved and responders stood down; senior confirmed safe.');

    setActiveModal(null);

    addNotification(
      '🟢 Emergency Resolved',
      `${senior.name} marked safe. Responders stood down. Family notified.`,
      'success',
      'all'
    );

    speakText('Emergency resolved. You are safe and your family has been updated.');
  };

  // MEDICINE ACTIONS
  const markMedicineTaken = (id) => {
    const timeStr = formatUS12HourTime(new Date(), false);
    setMedications(prev =>
      prev.map(m => (m.id === id ? { ...m, status: 'taken', takenAt: timeStr } : m))
    );

    // Clear any active caregiver tablet reminder and overdue alert
    setCaregiverPillReminder(null);
    setOverdueMedicationAlert(prev => prev && prev.med.id === id ? null : prev);

    // Update in active senior profile
    setSenior(prev => prev ? ({
      ...prev,
      medications: (prev.medications || []).map(m =>
        m.id === id ? { ...m, status: 'taken', takenAt: timeStr } : m
      )
    }) : prev);

    // Save update to Database
    db.getById(DB_STORES.MEDICATIONS, id).then(med => {
      if (med) {
        db.put(DB_STORES.MEDICATIONS, { ...med, status: 'taken', takenAt: timeStr });
      }
    });
    db.logAudit('MEDICINE_TAKEN', senior.name, `Medication ID ${id} taken at ${timeStr}`);

    if (soundEnabled) sounds.playSuccess();

    const targetMed = medications.find(m => m.id === id);
    const medName = targetMed?.name || 'Prescribed Medicine';

    addNotification(
      '💊 Tablet Confirmed Taken',
      `${senior.name} took ${medName} at ${timeStr}. Caregiver and family notified.`,
      'success',
      ['Senior 👴', 'Family 👨‍👩‍👧', 'Caregiver 👩‍⚕️']
    );

    speakText(`Good job! ${medName} marked as taken.`);
    setActiveModal(null);
  };

  const snoozeMedicine = (id) => {
    setMedications(prev =>
      prev.map(m => (m.id === id ? { ...m, status: 'snoozed' } : m))
    );

    // Save update to Database
    db.getById(DB_STORES.MEDICATIONS, id).then(med => {
      if (med) {
        db.put(DB_STORES.MEDICATIONS, { ...med, status: 'snoozed' });
      }
    });
    db.logAudit('MEDICINE_SNOOZED', senior.name, `Medication ID ${id} snoozed for 15 minutes.`);

    if (soundEnabled) sounds.playChime();

    addNotification(
      '⏰ Medicine Snoozed',
      'Reminder snoozed for 15 minutes. Family will be alerted if not taken soon.',
      'warning',
      ['Senior 👴', 'Family 👨‍👩‍👧', 'Caregiver 👩‍⚕️']
    );

    speakText('Medicine reminder snoozed. We will remind you again in 15 minutes.');
    setActiveModal(null);
  };

  // CAREGIVER ADDS NEW MEDICATION / PRESCRIPTION
  const addMedication = async (targetSeniorId, newMedData) => {
    const targetId = targetSeniorId || selectedSeniorId;
    const targetSenior = mockSeniors.find(s => s.id === targetId) || senior;
    const medId = newMedData.id || `med-${Date.now()}`;

    const formattedMed = {
      id: medId,
      seniorId: targetId,
      name: newMedData.name || 'Prescribed Medicine',
      dosage: newMedData.dosage || '1 Tablet',
      time: newMedData.time || '09:00 AM',
      status: 'due',
      instructions: newMedData.instructions || 'Take with water after meal',
      category: newMedData.category || 'General Health',
      prescribedBy: newMedData.prescribedBy || 'Nurse Sunita Devi (Caregiver)',
      icon: newMedData.icon || '💊',
      createdAt: formatUS12HourTime(new Date(), true)
    };

    // If adding to the currently viewed senior, update active medications state
    if (targetId === selectedSeniorId) {
      setMedications(prev => [formattedMed, ...prev]);
    }

    // Update senior state immutably if this senior is currently active
    setSenior(prev => prev && prev.id === targetId ? ({
      ...prev,
      medications: [formattedMed, ...(prev.medications || [])]
    }) : prev);

    // Persist to IndexedDB
    try {
      await db.put(DB_STORES.MEDICATIONS, formattedMed);
      await db.logAudit(
        'MEDICATION_PRESCRIBED',
        targetSenior.name,
        `New medicine '${formattedMed.name}' prescribed by ${formattedMed.prescribedBy}`
      );
    } catch (err) {
      console.error('Failed to save medication to DB', err);
    }

    // Mirror to cloud if connected
    try {
      if (typeof publishEmergencyToCloud === 'function') {
        await publishEmergencyToCloud({
          type: 'NEW_PRESCRIPTION',
          seniorId: targetId,
          seniorName: targetSenior.name,
          medication: formattedMed,
          timestamp: new Date().toISOString()
        });
      }
    } catch {}

    // Replicate to Express + SQLite backend
    apiService.prescribeMedication(formattedMed).catch(() => {});

    if (soundEnabled) sounds.playSuccess();

    addNotification(
      '💊 New Prescription Added',
      `${formattedMed.prescribedBy} added ${formattedMed.name} (${formattedMed.dosage}) for ${targetSenior.name}. Scheduled at ${formattedMed.time}.`,
      'success',
      ['Senior 👴', 'Family 👨‍👩‍👧', 'Caregiver 👩‍⚕️']
    );

    speakText(`New prescription ${formattedMed.name} added for ${targetSenior.name}.`);
    return formattedMed;
  };

  // MARK MEDICATION AS MISSED (Simulate / Detect Senior Missed Dose)
  const markMedicineMissed = (id) => {
    const targetMed = medications.find(m => m.id === id);
    if (!targetMed) return;

    setMedications(prev =>
      prev.map(m => (m.id === id ? { ...m, status: 'missed' } : m))
    );

    setSenior(prev => prev ? ({
      ...prev,
      medications: (prev.medications || []).map(m =>
        m.id === id ? { ...m, status: 'missed' } : m
      )
    }) : prev);

    db.getById(DB_STORES.MEDICATIONS, id).then(med => {
      if (med) {
        db.put(DB_STORES.MEDICATIONS, { ...med, status: 'missed' });
      }
    });
    db.logAudit('MEDICINE_MISSED', senior.name, `Medication '${targetMed.name}' flagged as missed.`);

    if (soundEnabled) sounds.playAlert();

    addNotification(
      '⚠️ Tablet Missed Alert!',
      `${senior.name} missed scheduled dose of ${targetMed.name} (${targetMed.dosage}) scheduled at ${targetMed.time}!`,
      'danger',
      ['Senior 👴', 'Caregiver 👩‍⚕️', 'Family 👨‍👩‍👧']
    );

    speakText(`Alert: Tablet ${targetMed.name} was missed by ${senior.name}. Caregiver reminder required.`);
  };

  // CAREGIVER DISPATCHES URGENT REMINDER TO SENIOR
  const sendCaregiverMedReminder = (medId, caregiverName = 'Nurse Sunita Devi') => {
    const targetMed = medications.find(m => m.id === medId) || medications[0];
    if (!targetMed) return;

    const reminderObj = {
      med: targetMed,
      seniorId: selectedSeniorId,
      seniorName: senior.name,
      caregiverName,
      sentAt: formatUS12HourTime(new Date(), false)
    };

    setCaregiverPillReminder(reminderObj);

    if (soundEnabled) sounds.playAlert();

    addNotification(
      '🚨 Urgent Tablet Reminder from Caregiver',
      `${caregiverName}: Please take your ${targetMed.name} (${targetMed.dosage}) now! ${targetMed.instructions || 'Take with water.'}`,
      'warning',
      ['Senior 👴', 'Family 👨‍👩‍👧', 'Caregiver 👩‍⚕️']
    );

    db.logAudit(
      'CAREGIVER_REMINDER_SENT',
      senior.name,
      `${caregiverName} sent tablet reminder for ${targetMed.name} at ${reminderObj.sentAt}`
    );

    // Replicate to Express backend
    apiService.sendMedicationReminder(targetMed.id, `${caregiverName} sent urgent tablet reminder`).catch(() => {});

    speakText(
      `Important reminder from your caregiver ${caregiverName}: Please take your tablet ${targetMed.name} now!`,
      language
    );
  };

  const dismissCaregiverPillReminder = () => {
    setCaregiverPillReminder(null);
  };

  // DOCTOR APPOINTMENT ACTIONS
  const requestDoctorEscort = (aptId) => {
    const apt = appointments.find(a => a.id === aptId);
    if (!apt) return;

    setAppointments(prev =>
      prev.map(a => (a.id === aptId ? { ...a, needHelpRequested: true } : a))
    );

    // Create a new assistance request for transit
    const newReq = {
      id: 'req-' + Date.now(),
      category: 'hospital_visit',
      title: `Ride to ${apt.doctorName}`,
      seniorName: senior.name,
      address: senior.address,
      distance: '1.5 km',
      priority: 'HIGH',
      details: `Escort requested for appointment with ${apt.doctorName} at ${apt.time} (${apt.clinicName}).`,
      status: 'pending',
      assignedHelper: null,
      requestedAt: 'Just now'
    };

    setHelpRequests(prev => [newReq, ...prev]);

    if (soundEnabled) sounds.playSuccess();

    addNotification(
      '🏥 Transit Assistance Requested',
      `Escort request created for ${apt.doctorName} appointment at ${apt.time}. Finding available volunteer.`,
      'info',
      'all'
    );

    speakText('We have requested a volunteer to help you reach Dr. Sharma safely.');
    setActiveModal(null);
  };

  // SCHEDULE / BOOK NEW DOCTOR APPOINTMENT (Accessible by Family & Senior)
  const addDoctorAppointment = async (aptData) => {
    const newApt = {
      id: `apt-${Date.now()}`,
      seniorId: selectedSeniorId,
      doctorName: aptData.doctorName || 'Dr. Rajesh Sharma',
      specialty: aptData.specialty || 'General Physician & Geriatrician',
      clinicName: aptData.clinicName || 'City Central Health Clinic',
      date: aptData.date || 'Today',
      time: aptData.time || '04:00 PM',
      needHelpRequested: !!aptData.needHelpRequested,
      bookedBy: aptData.bookedBy || 'Family Member',
      createdAt: formatUS12HourTime(new Date(), true)
    };

    setAppointments(prev => [newApt, ...prev]);

    try {
      await db.put(DB_STORES.APPOINTMENTS, newApt);
      await db.logAudit(
        'APPOINTMENT_SCHEDULED',
        senior.name,
        `Doctor appointment with ${newApt.doctorName} at ${newApt.time} booked by ${newApt.bookedBy}`
      );
    } catch (err) {
      console.warn('DB appointment save error:', err);
    }

    if (soundEnabled) sounds.playSuccess();

    addNotification(
      '🏥 Doctor Appointment Scheduled',
      `${newApt.bookedBy} booked appointment with ${newApt.doctorName} (${newApt.specialty}) at ${newApt.time} for ${senior.name}.`,
      'success',
      ['Senior 👴', 'Family 👨‍👩‍👧', 'Caregiver 👩‍⚕️']
    );

    speakText(`Doctor appointment with ${newApt.doctorName} scheduled for ${newApt.time}.`, language);
    return newApt;
  };

  // DAILY HELP REQUEST
  const submitDailyHelpRequest = (category, details = '') => {
    const newReq = {
      id: 'req-' + Date.now(),
      category: category.id,
      title: category.title,
      seniorName: senior.name,
      address: senior.address,
      distance: '1.2 km',
      priority: 'NORMAL',
      details: details || `Assistance needed with ${category.title}.`,
      status: 'pending',
      assignedHelper: null,
      requestedAt: 'Just now'
    };

    setHelpRequests(prev => [newReq, ...prev]);

    // Save help request to Database
    db.put(DB_STORES.HELP_REQUESTS, newReq);
    db.logAudit('HELP_REQUEST_CREATED', senior.name, `Requested assistance for ${category.title}`);

    if (soundEnabled) sounds.playSuccess();

    addNotification(
      '🤝 Help Request Created',
      `Request for ${category.title} sent to nearby volunteers and caregivers.`,
      'info',
      'all'
    );

    speakText(`Your request for ${category.title} has been submitted. A volunteer will be connected shortly.`);
    setActiveModal(null);
  };

  // CAREGIVER PORTAL ACTIONS
  const acceptHelpRequest = (reqId, helperName = 'Amit Patel', helperRole = 'Volunteer') => {
    setHelpRequests(prev =>
      prev.map(req =>
        req.id === reqId
          ? {
              ...req,
              status: 'accepted',
              assignedHelper: {
                name: helperName,
                role: helperRole,
                phone: '+91 98222 33445',
                etaMinutes: 5
              }
            }
          : req
      )
    );

    // Update in Database
    db.getById(DB_STORES.HELP_REQUESTS, reqId).then(req => {
      if (req) {
        db.put(DB_STORES.HELP_REQUESTS, {
          ...req,
          status: 'accepted',
          assignedHelper: { name: helperName, role: helperRole, phone: '+91 98222 33445', etaMinutes: 5 }
        });
      }
    });
    db.logAudit('HELP_REQUEST_ACCEPTED', helperName, `Accepted request ${reqId} for ${senior.name}`);

    if (soundEnabled) sounds.playSuccess();

    addNotification(
      '✅ Assistance Accepted',
      `${helperName} accepted request. Estimated arrival: 5 minutes.`,
      'success',
      'all'
    );
  };

  const markHelpRequestArrived = (reqId) => {
    setHelpRequests(prev =>
      prev.map(req =>
        req.id === reqId
          ? {
              ...req,
              status: 'in_progress',
              assignedHelper: {
                ...req.assignedHelper,
                etaMinutes: 0
              }
            }
          : req
      )
    );

    if (soundEnabled) sounds.playChime();

    addNotification(
      '📍 Helper Arrived',
      'Helper has arrived at Ravi Kumar\'s residence.',
      'info',
      'all'
    );
  };

  const completeHelpRequest = (reqId) => {
    setHelpRequests(prev =>
      prev.map(req =>
        req.id === reqId
          ? {
              ...req,
              status: 'completed'
            }
          : req
      )
    );

    // Update in Database
    db.getById(DB_STORES.HELP_REQUESTS, reqId).then(req => {
      if (req) {
        db.put(DB_STORES.HELP_REQUESTS, { ...req, status: 'completed' });
      }
    });
    db.logAudit('HELP_REQUEST_COMPLETED', 'Helper', `Request ${reqId} marked completed.`);

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {
      // Ignore
    }

    if (soundEnabled) sounds.playSuccess();

    addNotification(
      '🎉 Request Completed',
      'Assistance request has been successfully completed.',
      'success',
      'all'
    );
  };

  // RESET DEMO TO INITIAL STATE
  const resetDemo = () => {
    if (cascadeTimerRef.current) clearTimeout(cascadeTimerRef.current);
    setEmergency({
      isActive: false,
      stage: 'idle',
      startedAt: null,
      assignedHelper: null,
      etaMinutes: null,
      explanation: '',
      logs: []
    });
    selectSenior('senior-001');
    setHelpRequests(initialHelpRequests);
    setActiveModal(null);
    setActiveRole('senior');
    db.resetDatabase().catch(err => console.warn('DB reset err:', err));
    addNotification('🔄 Demo Reset', 'CareConnect demo environment and database reset to default state.', 'info', 'all');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        setCurrentUser,
        authScreen,
        setAuthScreen,
        login,
        logout,
        openAuthScreen,
        activeRole,
        setActiveRole,
        mockSeniors,
        seniorsList,
        selectedSeniorId,
        selectSenior,
        loginAsSenior,
        formatUS12HourTime,
        senior,
        setSenior,
        activeModal,
        setActiveModal,
        emergency,
        triggerEmergency,
        simulateCaregiverTimeout,
        simulateCaregiverAccept,
        simulateVolunteerAccept: () => dispatchVolunteer(mockCaregivers[1]),
        escalateToAmbulance,
        resolveEmergency,
        fallAlert,
        triggerFallDetection,
        cancelFallAlert,
        confirmFallEmergency,
        medications,
        markMedicineTaken,
        snoozeMedicine,
        addMedication,
        markMedicineMissed,
        sendCaregiverMedReminder,
        caregiverPillReminder,
        dismissCaregiverPillReminder,
        appointments,
        requestDoctorEscort,
        helpRequests,
        submitDailyHelpRequest,
        acceptHelpRequest,
        markHelpRequestArrived,
        completeHelpRequest,
        notifications,
        addNotification,
        dismissNotification,
        clearNotifications,
        loginAsAdmin,
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
        currentTime,
        formattedTime,
        formattedDate,
        liveLocation,
        fetchCurrentGPS,
        resetDemo,
        db,
        isDbReady,
        isDbStudioOpen,
        setIsDbStudioOpen,
        openDbStudio: () => setIsDbStudioOpen(true),
        closeDbStudio: () => setIsDbStudioOpen(false),
        isLiveMapOpen,
        setIsLiveMapOpen,
        openLiveMap: () => setIsLiveMapOpen(true),
        closeLiveMap: () => setIsLiveMapOpen(false),
        broadcastLiveLocation,
        updateSeniorCoordinates,
        isFirebaseModalOpen,
        setIsFirebaseModalOpen,
        openFirebaseModal: () => setIsFirebaseModalOpen(true),
        closeFirebaseModal: () => setIsFirebaseModalOpen(false),
        isFirebaseConfigured,
        syncIndexedDbToFirebase: () => syncAllIndexedDbToCloud(db),
        isBackendStudioOpen,
        setIsBackendStudioOpen,
        openBackendStudio: () => setIsBackendStudioOpen(true),
        closeBackendStudio: () => setIsBackendStudioOpen(false),
        isBackendOnline,
        overdueMedicationAlert,
        setOverdueMedicationAlert,
        dismissOverdueMedicationAlert: () => setOverdueMedicationAlert(null),
        nextOverdueReminderSeconds,
        snoozeOverduePill,
        addDoctorAppointment
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
