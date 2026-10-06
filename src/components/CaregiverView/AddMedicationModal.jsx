import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Pill,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  Shield,
  HeartPulse,
  AlertCircle
} from 'lucide-react';

const CLINICAL_PRESETS = [
  {
    name: 'Telmisartan 40mg',
    dosage: '1 Tablet',
    time: '08:00 AM',
    category: 'Blood Pressure / Hypertension',
    instructions: 'Take with warm water after breakfast',
    icon: '🫀'
  },
  {
    name: 'Metformin 500mg',
    dosage: '1 Tablet',
    time: '01:00 PM',
    category: 'Type-2 Diabetes Management',
    instructions: 'Take immediately after lunch',
    icon: '🩸'
  },
  {
    name: 'Atorvastatin 20mg',
    dosage: '1 Tablet',
    time: '08:30 PM',
    category: 'Cardiovascular & Cholesterol',
    instructions: 'Take after light dinner with water',
    icon: '💊'
  },
  {
    name: 'Shelcal 500 (Calcium + D3)',
    dosage: '1 Tablet',
    time: '10:00 AM',
    category: 'Bone Health & Osteoporosis',
    instructions: 'Take with a glass of warm milk or water',
    icon: '🦴'
  },
  {
    name: 'Pantocid 40mg',
    dosage: '1 Tablet',
    time: '07:30 AM',
    category: 'Gastro / Antacid',
    instructions: 'Take on empty stomach 30 mins before breakfast',
    icon: '💧'
  },
  {
    name: 'Donepezil 5mg',
    dosage: '1 Tablet',
    time: '09:30 PM',
    category: 'Memory & Cognitive Support',
    instructions: 'Take just before bedtime with water',
    icon: '🧠'
  }
];

export const AddMedicationModal = ({ isOpen, onClose, defaultSeniorId }) => {
  const { mockSeniors, addMedication, highContrast, senior } = useApp();

  const [selectedSeniorId, setSelectedSeniorId] = useState(defaultSeniorId || senior?.id || mockSeniors[0]?.id);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [time, setTime] = useState('08:30 AM');
  const [category, setCategory] = useState('Blood Pressure / Hypertension');
  const [instructions, setInstructions] = useState('Take with water after meal');
  const [prescribedBy, setPrescribedBy] = useState('Nurse Sunita Devi (Caregiver)');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset, idx) => {
    setSelectedPreset(idx);
    setName(preset.name);
    setDosage(preset.dosage);
    setTime(preset.time);
    setCategory(preset.category);
    setInstructions(preset.instructions);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a medication name or pick a clinical preset.');
      return;
    }

    await addMedication(selectedSeniorId, {
      name: name.trim(),
      dosage: dosage.trim() || '1 Tablet',
      time: time.trim() || '08:30 AM',
      category: category.trim(),
      instructions: instructions.trim() || 'Take with water after food',
      prescribedBy: prescribedBy.trim() || 'Nurse Sunita Devi',
      icon: CLINICAL_PRESETS[selectedPreset]?.icon || '💊'
    });

    onClose();
  };

  const currentSeniorObj = mockSeniors.find(s => s.id === selectedSeniorId) || senior;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl transition-all my-auto border-4 ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-emerald-500'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl shadow-inner">
              💊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Clinical Caregiver Console
                </span>
                <span className="text-xs text-emerald-200 font-semibold">
                  Rx Prescription Entry
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5">
                Add Prescribed Medication
              </h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100 mt-2 font-medium">
            Prescribe new tablets, set scheduled timings, and automate senior reminders.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Senior Citizen Selector */}
          <div>
            <label className="block font-black text-slate-700 mb-1">
              Select Senior Citizen:
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-100 border border-slate-300">
              <span className="text-xl">{currentSeniorObj?.avatar || '👴'}</span>
              <select
                value={selectedSeniorId}
                onChange={(e) => setSelectedSeniorId(e.target.value)}
                className="bg-transparent font-black text-slate-900 focus:outline-none flex-1 cursor-pointer"
              >
                {mockSeniors.map((s) => (
                  <option key={s.id} value={s.id} className="text-slate-900 bg-white font-bold">
                    {s.avatar} {s.name} ({s.age}y - {s.gender}) • Blood: {s.bloodGroup}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Clinical 1-Click Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-black text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>1-Click Clinical Presets (Quick Tap):</span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">Tap to auto-fill</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CLINICAL_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(preset, idx)}
                  className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                    selectedPreset === idx
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="text-base shrink-0">{preset.icon}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate leading-tight">{preset.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{preset.time}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Medicine Name & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Medication / Drug Name:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. Amlodipine 5mg"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Dosage & Unit:
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 Tablet / 1 Capsule"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Schedule Time & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Scheduled Timing:
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 08:30 AM / 08:00 PM"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Clinical Health Category:
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Blood Pressure / Diabetes"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Meal Timing Instructions */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Instructions & Meal Timing:
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Take with warm water after dinner"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Prescribed By */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Prescribing Caregiver / Doctor:
            </label>
            <input
              type="text"
              value={prescribedBy}
              onChange={(e) => setPrescribedBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-200 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Prescribe & Add Tablet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
