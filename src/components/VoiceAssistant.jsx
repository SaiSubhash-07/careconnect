import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, MicOff, Volume2, X, Sparkles, Check, AlertCircle } from 'lucide-react';
import { speakText, stopSpeech, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speech';

export const VoiceAssistant = ({ isOpen, onClose }) => {
  const {
    triggerEmergency,
    setActiveModal,
    medications,
    markMedicineTaken,
    senior,
    language
  } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Say something like "Emergency", "Medicine", or "Doctor"...');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    if (isOpen) {
      speakText('CareConnect Voice Assistant is listening. How can I help you today?', language);
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen, language]);

  const handleCommand = (text) => {
    const lower = text.toLowerCase();
    setTranscript(text);

    if (lower.includes('emergency') || lower.includes('danger') || lower.includes('urgent') || lower.includes('save me') || lower.includes('pain')) {
      setFeedback('🚨 Emergency command recognized. Activating SOS help cascade now!');
      speakText('Emergency detected. Triggering emergency help now.');
      setTimeout(() => {
        triggerEmergency();
        onClose();
      }, 1000);
    } else if (lower.includes('medicine') || lower.includes('pill') || lower.includes('bp') || lower.includes('tablet')) {
      setFeedback('💊 Opening your medicine reminder.');
      speakText('Opening your medicine reminders.');
      setTimeout(() => {
        setActiveModal('medicine');
        onClose();
      }, 1000);
    } else if (lower.includes('doctor') || lower.includes('hospital') || lower.includes('clinic') || lower.includes('sharma')) {
      setFeedback('🏥 Showing your upcoming doctor appointment.');
      speakText('Showing your upcoming appointment with Doctor Sharma.');
      setTimeout(() => {
        setActiveModal('appointment');
        onClose();
      }, 1000);
    } else if (lower.includes('help') || lower.includes('grocery') || lower.includes('walk') || lower.includes('food')) {
      setFeedback('🤝 Opening daily assistance options.');
      speakText('Opening daily help options.');
      setTimeout(() => {
        setActiveModal('daily_help');
        onClose();
      }, 1000);
    } else if (lower.includes('daughter') || lower.includes('ananya')) {
      setFeedback('📞 Calling your daughter Ananya Kumar...');
      speakText('Connecting call to your daughter Ananya.');
      setTimeout(() => {
        window.location.href = `tel:${senior.familyContacts[0].phone}`;
      }, 1200);
    } else {
      setFeedback(`Recognized: "${text}". Please choose from Emergency, Medicine, Doctor, or Daily Help.`);
      speakText(`I heard ${text}. You can say Emergency, Medicine, Doctor, or Daily Help.`);
    }
  };

  const startListening = () => {
    if (!supported) {
      setFeedback('Voice recognition is simulated or not supported in this browser. You can click quick actions below!');
      return;
    }

    try {
      const recognizer = createSpeechRecognizer({
        lang: language,
        onResult: (text) => {
          handleCommand(text);
          setIsListening(false);
        },
        onError: (err) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });

      if (recognizer) {
        setIsListening(true);
        recognizer.start();
      }
    } catch (e) {
      console.warn('Could not start speech recognition', e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    stopSpeech();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-rose-200 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="inline-flex p-4 rounded-full bg-rose-100 text-rose-600 mb-4 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          Voice Assistant
        </h3>
        <p className="text-slate-600 font-medium text-base sm:text-lg mb-6">
          Elderly-friendly voice control. Speak in a natural tone.
        </p>

        {/* Big Mic Target */}
        <div className="flex justify-center mb-6">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-200 scale-105'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isListening ? (
              <Mic className="w-12 h-12" />
            ) : (
              <MicOff className="w-12 h-12" />
            )}
          </button>
        </div>

        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 mb-6 text-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            {isListening ? '🎙️ Listening to your voice...' : 'Status'}
          </p>
          <p className="text-lg font-bold text-slate-800 leading-snug">
            {transcript ? `“${transcript}”` : feedback}
          </p>
        </div>

        {/* Quick Simulation Options if browser mic permission is slow */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Or tap quick voice commands:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCommand('Emergency Help')}
              className="px-3 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-sm font-bold border border-red-300"
            >
              🚨 "Emergency"
            </button>
            <button
              onClick={() => handleCommand('Medicine Reminder')}
              className="px-3 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-bold border border-blue-300"
            >
              💊 "Medicine"
            </button>
            <button
              onClick={() => handleCommand('Doctor Appointment')}
              className="px-3 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm font-bold border border-purple-300"
            >
              🏥 "Doctor"
            </button>
            <button
              onClick={() => handleCommand('Need Daily Help')}
              className="px-3 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-sm font-bold border border-emerald-300"
            >
              🤝 "Need Help"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
