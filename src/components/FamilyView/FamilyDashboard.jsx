import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Pill,
  Calendar,
  Phone,
  Clock,
  UserCheck,
  HeartHandshake,
  Navigation,
  MessageSquare,
  Activity,
  CheckCircle2,
  Sparkles,
  Radio,
  ExternalLink,
  Plus,
  X
} from 'lucide-react';
import { speakText } from '../../utils/speech';
import { LiveTrackingMap } from '../Map/LiveTrackingMap';
import { EmergencyModal } from '../SeniorView/EmergencyModal';
import { MedicineModal } from '../SeniorView/MedicineModal';
import { AppointmentModal } from '../SeniorView/AppointmentModal';

export const FamilyDashboard = () => {
  const {
    senior,
    emergency,
    medications,
    appointments,
    helpRequests,
    triggerEmergency,
    resolveEmergency,
    activeModal,
    setActiveModal,
    formattedTime,
    formattedDate,
    liveLocation,
    fetchCurrentGPS,
    language,
    t,
    openLiveMap,
    broadcastLiveLocation,
    markMedicineTaken,
    sendCaregiverMedReminder,
    requestDoctorEscort,
    addDoctorAppointment
  } = useApp();

  const [isSchedulingApt, setIsSchedulingApt] = React.useState(false);
  const [newAptDoctor, setNewAptDoctor] = React.useState('');
  const [newAptSpecialty, setNewAptSpecialty] = React.useState('Cardiology & Geriatrics');
  const [newAptTime, setNewAptTime] = React.useState('04:00 PM');
  const [newAptClinic, setNewAptClinic] = React.useState('City Central Health Clinic');

  const primaryMed = medications.find(m => m.urgent || m.status === 'due') || medications[0] || { name: 'Prescribed Medication', status: 'taken', time: '9:00 AM' };
  const nextApt = appointments[0];
  const activeRequests = helpRequests.filter(r => r.status !== 'completed');
  const primaryFamily = senior.familyContacts?.[0] || { name: 'Family Member', relation: 'Primary Guardian' };

  const handleReadFamilyStatus = () => {
    if (emergency.isActive) {
      speakText(`Alert! ${senior.name} needs emergency assistance. Status: ${emergency.stage.replace('_', ' ')}. Help is on the way.`);
    } else {
      speakText(`${senior.name} is currently Safe at Home. ${primaryMed.name} is marked as ${primaryMed.status}. Next appointment: ${nextApt ? `${nextApt.doctorName} at ${nextApt.time}` : 'None today'}.`);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">

      {/* Top Banner with Family Member Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            Family Portal • {primaryFamily.name} ({primaryFamily.relation})
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            CareConnect Family Care Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time monitoring, emergency coordination & medication adherence for {senior.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveModal('medicine')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Open Senior Medicine Cabinet to view and manage pills"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>💊 Senior Medicines</span>
          </button>

          <button
            onClick={() => setActiveModal('appointment')}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Open Senior Doctor Appointments Hub to view and manage visits"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>🏥 Doctor Appointments</span>
          </button>

          <button
            onClick={handleReadFamilyStatus}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Read Summary</span>
          </button>
          <a
            href={`tel:${senior.phone}`}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Senior</span>
          </a>
        </div>
      </div>

      {/* EMERGENCY ACTIVE ALERT BOX (If Emergency is active) */}
      {emergency.isActive ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl animate-pulse space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-400/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                🚨
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  🚨 {senior.name} Needs Help!
                </h3>
                <p className="text-red-100 text-sm font-semibold">
                  Emergency SOS Signal Activated from Home
                </p>
              </div>
            </div>

            <span className="px-4 py-1.5 bg-white text-red-700 font-black rounded-full text-xs uppercase tracking-wider self-start sm:self-auto">
              Situation: EMERGENCY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-sm font-bold">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20">
              <p className="text-xs text-red-200 font-normal uppercase">Help Status</p>
              <p className="text-lg font-black text-white">
                {emergency.stage === 'contacting' && 'Caregiver Alerted (Waiting)'}
                {emergency.stage === 'caregiver_unavailable' && 'Caregiver Unavailable → Cascading'}
                {emergency.stage === 'volunteer_dispatched' && 'Volunteer Responding'}
                {emergency.stage === 'escalated_ambulance' && '108 Ambulance Dispatched'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20">
              <p className="text-xs text-red-200 font-normal uppercase">Assigned Responder</p>
              <p className="text-lg font-black text-white">
                {emergency.assignedHelper ? emergency.assignedHelper.name : 'Finding Best Match...'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20">
              <p className="text-xs text-red-200 font-normal uppercase">Estimated Arrival</p>
              <p className="text-lg font-black text-white">
                {emergency.etaMinutes ? `⏱️ ${emergency.etaMinutes} minutes` : 'Calculating...'}
              </p>
            </div>
          </div>

          {emergency.explanation && (
            <div className="bg-white/15 backdrop-blur p-3 rounded-2xl text-xs font-semibold text-white/95 border border-white/20">
              <strong>Smart System Note:</strong> {emergency.explanation}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setActiveModal('emergency')}
              className="px-4 py-2.5 bg-white text-red-700 hover:bg-red-50 rounded-xl font-bold text-xs shadow-sm transition"
            >
              Open Live Emergency Stepper
            </button>
            <button
              onClick={resolveEmergency}
              className="px-4 py-2.5 bg-red-900/50 hover:bg-red-900 text-white rounded-xl font-bold text-xs border border-white/30 transition"
            >
              Mark Emergency Resolved
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Senior Status Summary Card (Exact Layout from Prompt) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* 1. Senior Status & Location Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-3xl flex items-center justify-center">
                👴
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {senior.name}
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  Age: {senior.age} • Blood: {senior.bloodGroup}
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1 ${
                emergency.isActive
                  ? 'bg-red-100 text-red-700'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {emergency.isActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span>🚨 In Danger</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>🟢 Safe</span>
                </>
              )}
            </span>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">📍 Location:</span>
              <span className="font-bold text-slate-800 truncate max-w-[170px] text-right" title={liveLocation.address}>
                {liveLocation.address}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">🕐 Senior Time:</span>
              <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                {formattedTime}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">🛰️ GPS Telemetry:</span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {liveLocation.lat}°, {liveLocation.lng}°
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">💊 Medicine Status:</span>
              <span
                className={`font-black px-2 py-0.5 rounded-lg text-xs ${
                  primaryMed.status === 'taken'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {primaryMed.status === 'taken' ? `✅ Taken at ${primaryMed.takenAt || primaryMed.time}` : `⚠️ ${primaryMed.time} Due`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">📅 Doctor Appointment:</span>
              <span className="font-bold text-purple-700">{nextApt ? nextApt.time : 'No Appointments Today'}</span>
            </div>
          </div>

          {/* Quick Check-in Actions */}
          <div className="pt-2">
            <a
              href={`tel:${senior.phone}`}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voice Check-in with {senior.name.split(' ')[0]}</span>
            </a>
          </div>
        </div>

        {/* 2. Medication Compliance Card (Full Family Access) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                💊
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  Senior Medications Hub
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Direct family adherence control & reminders
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('medicine')}
              className="text-xs font-black text-blue-600 hover:text-blue-700 underline bg-blue-50 px-2.5 py-1 rounded-xl transition cursor-pointer"
            >
              Full Cabinet →
            </button>
          </div>

          <div className="space-y-3">
            {medications.map((med) => (
              <div
                key={med.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-900">{med.name}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        med.status === 'taken'
                          ? 'bg-emerald-100 text-emerald-800'
                          : med.status === 'snoozed'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {med.status === 'taken' ? '✓ Taken' : med.status === 'snoozed' ? 'Snoozed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ⏰ {med.time} • {med.dosage} • {med.instructions || 'Take with water'}
                  </p>
                </div>

                {/* Family Interactive Controls */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {med.status !== 'taken' ? (
                    <>
                      <button
                        onClick={() => markMedicineTaken(med.id)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs"
                        title="Confirm taken on senior's behalf"
                      >
                        ✓ Mark Taken
                      </button>
                      <button
                        onClick={() => sendCaregiverMedReminder(med.id, `${primaryFamily.name} (${primaryFamily.relation})`)}
                        className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs"
                        title="Dispatch immediate reminder chime to senior"
                      >
                        🔔 Remind Senior
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      ✓ Confirmed Taken
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 font-medium">
            💡 Family members can directly mark tablets as taken when visiting or dispatch an immediate reminder chime to the senior's tablet screen.
          </div>
        </div>

        {/* 3. Upcoming Appointments & Transit (Full Family Access) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                🏥
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  Doctor Appointments
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Schedule visits & request transit escorts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSchedulingApt(!isSchedulingApt)}
                className="text-xs font-black text-purple-700 hover:text-purple-800 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSchedulingApt ? 'Cancel' : '+ Schedule Visit'}</span>
              </button>
              <button
                onClick={() => setActiveModal('appointment')}
                className="text-xs font-black text-purple-600 hover:text-purple-700 underline px-2 py-1 rounded-xl transition cursor-pointer"
              >
                View Hub →
              </button>
            </div>
          </div>

          {/* Inline Appointment Booking Form for Family */}
          {isSchedulingApt && (
            <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200 space-y-3 animate-in fade-in">
              <span className="text-xs font-black uppercase tracking-wider text-purple-900 block">
                Schedule New Doctor Visit for {senior.name}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doctor Name:</label>
                  <input
                    type="text"
                    value={newAptDoctor}
                    onChange={(e) => setNewAptDoctor(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full bg-white border border-purple-300 rounded-xl p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Specialty:</label>
                  <input
                    type="text"
                    value={newAptSpecialty}
                    onChange={(e) => setNewAptSpecialty(e.target.value)}
                    placeholder="e.g. Cardiology & Geriatrics"
                    className="w-full bg-white border border-purple-300 rounded-xl p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clinic / Hospital:</label>
                  <input
                    type="text"
                    value={newAptClinic}
                    onChange={(e) => setNewAptClinic(e.target.value)}
                    placeholder="e.g. City Central Health Clinic"
                    className="w-full bg-white border border-purple-300 rounded-xl p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scheduled Time:</label>
                  <input
                    type="text"
                    value={newAptTime}
                    onChange={(e) => setNewAptTime(e.target.value)}
                    placeholder="e.g. 04:00 PM"
                    className="w-full bg-white border border-purple-300 rounded-xl p-2 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsSchedulingApt(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newAptDoctor) {
                      alert('Please provide doctor name');
                      return;
                    }
                    await addDoctorAppointment({
                      doctorName: newAptDoctor,
                      specialty: newAptSpecialty,
                      clinicName: newAptClinic,
                      time: newAptTime,
                      bookedBy: `${primaryFamily.name} (${primaryFamily.relation})`
                    });
                    setNewAptDoctor('');
                    setIsSchedulingApt(false);
                  }}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black shadow transition active:scale-95 cursor-pointer"
                >
                  Confirm Appointment
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-slate-900">{apt.doctorName}</h5>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                    ⏰ {apt.time}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  {apt.specialty} • {apt.clinicName}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-purple-200/60 text-xs">
                  <span className="text-slate-500 font-medium">Volunteer Transit Escort:</span>
                  {apt.needHelpRequested ? (
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      ✅ Volunteer Escort Requested
                    </span>
                  ) : (
                    <button
                      onClick={() => requestDoctorEscort(apt.id)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-lg font-bold transition cursor-pointer shadow-xs"
                      title="Request a verified volunteer escort for senior's doctor visit"
                    >
                      🚗 Request Escort
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Active Assistance Requests & Helper Status */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              🤝
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">
                Assistance & Support Requests
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Live status of volunteer & caregiver dispatch
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {activeRequests.length} Active Request(s)
          </span>
        </div>

        {activeRequests.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm font-semibold">
            No active assistance requests at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-base">
                    {req.title}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                      req.status === 'accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : req.status === 'in_progress'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  {req.details}
                </p>

                {req.assignedHelper ? (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        Assigned: {req.assignedHelper.name} ({req.assignedHelper.role})
                      </p>
                      <p className="text-slate-500">
                        ETA: ~{req.assignedHelper.etaMinutes} mins • {req.assignedHelper.phone}
                      </p>
                    </div>
                    <a
                      href={`tel:${req.assignedHelper.phone}`}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                    >
                      Call
                    </a>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    ⏳ Matching with nearest available volunteer...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integrated Live GPS Tracking & Responder Radar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">
                Live Location & Responder Radar
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {liveLocation.address} • GPS: {liveLocation.lat}° N, {liveLocation.lng}° E (±{liveLocation.accuracy}m)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => broadcastLiveLocation()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Broadcast updated telemetry link to family & volunteers"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />
              <span>Broadcast GPS</span>
            </button>

            <button
              onClick={openLiveMap}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Open full interactive map modal"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Expand Map</span>
            </button>

            <button
              onClick={fetchCurrentGPS}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
              title="Poll current browser GPS position"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Refresh GPS</span>
            </button>
          </div>
        </div>

        {/* Live Interactive OpenStreetMap Engine */}
        <LiveTrackingMap height="h-80 sm:h-96" />
      </div>

      {/* Interactive Modals Accessible by Family Member */}
      {activeModal === 'emergency' && <EmergencyModal />}
      {activeModal === 'medicine' && <MedicineModal />}
      {activeModal === 'appointment' && <AppointmentModal />}

    </div>
  );
};
