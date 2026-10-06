// Voice Assistance Utility using Web Speech API
// Provides multi-language read-aloud (Text-to-Speech) and voice command capture

const langLocaleMap = {
  en: 'en-US',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  kn: 'kn-IN'
};

export const speakText = (text, lang = 'en') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text || text.trim() === '') return;

  const targetLocale = langLocaleMap[lang] || 'en-US';
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9; // Slightly slower, clear and comfortable for elderly listeners
  utterance.pitch = 1.0;
  utterance.lang = targetLocale;

  // Try to pick a natural voice matching language if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    v => v.lang.toLowerCase().replace('_', '-').startsWith(targetLocale.toLowerCase().slice(0, 2))
  );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  } else {
    // English fallback voice
    const fallbackVoice = voices.find(
      v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (fallbackVoice) utterance.voice = fallbackVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Check if Speech Recognition is supported
export const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

// Create a simple Speech Recognition listener
export const createSpeechRecognizer = ({ lang = 'en', onResult, onError, onEnd }) => {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = langLocaleMap[lang] || 'en-US';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
};
