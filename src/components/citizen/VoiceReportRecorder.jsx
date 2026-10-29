import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Languages,
  Check,
  RotateCcw,
  AlertCircle,
  FileText,
  Play,
  Square,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../../utils/soundEffects';
import toast from 'react-hot-toast';

export const VOICE_LANGUAGES = [
  {
    code: 'en-IN',
    langKey: 'en',
    label: 'English',
    nativeLabel: 'English (India)',
    badge: 'EN',
    accentColor: 'from-blue-600 to-indigo-600',
    sample: 'Dangerous open manhole and heavy road pothole near the highway causing severe traffic and safety risk.',
    sampleTitle: 'Open Manhole and Deep Road Pothole Hazard',
  },
  {
    code: 'hi-IN',
    langKey: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    badge: 'HI',
    accentColor: 'from-amber-600 to-orange-600',
    sample: 'सड़क पर बहुत गहरा गड्ढा हो गया है और सीवर का गंदा पानी बह रहा है, दुर्घटना होने की पूरी आशंका है।',
    sampleTitle: 'सड़क पर गहरा गड्ढा और सीवर पानी रिसाव की शिकायत',
  },
  {
    code: 'mr-IN',
    langKey: 'mr',
    label: 'Marathi',
    nativeLabel: 'मराठी',
    badge: 'MR',
    accentColor: 'from-rose-600 to-red-600',
    sample: 'रस्त्यावर खूप मोठा आणि धोकादायक खड्डा पडला आहे, गटाराचे पाणी साचले असून तात्काळ दुरुस्तीची गरज आहे.',
    sampleTitle: 'रस्त्यावरील मोठा खड्डा व गटाराच्या सांडपाण्याची तक्रार',
  },
];

export const VoiceReportRecorder = ({
  onApplyTranscript,
  existingDescription = '',
  hasExistingTitle = false,
  className = '',
}) => {
  const { t, language } = useLanguage();

  // Match default voice language with site language or default to en-IN
  const getInitialLang = () => {
    if (language === 'mr') return 'mr-IN';
    if (language === 'hi') return 'hi-IN';
    return 'en-IN';
  };

  const [selectedLang, setSelectedLang] = useState(getInitialLang);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionError, setPermissionError] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [appendMode, setAppendMode] = useState(Boolean(existingDescription));

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // Sync with language changes from parent context
  useEffect(() => {
    if (!isRecording && !transcript) {
      if (language === 'mr') setSelectedLang('mr-IN');
      else if (language === 'hi') setSelectedLang('hi-IN');
      else setSelectedLang('en-IN');
    }
  }, [language, isRecording, transcript]);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimerSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const activeLangConfig =
    VOICE_LANGUAGES.find((l) => l.code === selectedLang) || VOICE_LANGUAGES[0];

  // Derive smart title based on language and recognized keywords
  const generateTitleFromTranscript = (text, langCode) => {
    const clean = text.trim();
    if (!clean) return '';

    // Check defect terms in Marathi
    if (langCode.startsWith('mr')) {
      if (/खड्ड/i.test(clean)) return 'रस्त्यावरील धोकादायक खड्ड्याची तक्रार';
      if (/गटार|गटर|मॅनहोल/i.test(clean)) return 'उघडे मॅनहोल व सांडपाणी गटाराची समस्या';
      if (/कचरा|घाण/i.test(clean)) return 'कचरा व्यवस्थापन व अस्वच्छतेची तक्रार';
      if (/लाईट|दिवा|वीज/i.test(clean)) return 'पथदिवा बंद व वीज समस्येबाबत तक्रार';
      if (/पाणी|पाईप/i.test(clean)) return 'पिण्याच्या पाण्याची पाईप गळती तक्रार';
      return clean.slice(0, 45) + (clean.length > 45 ? '...' : '');
    }

    // Check defect terms in Hindi
    if (langCode.startsWith('hi')) {
      if (/गड्ढ/i.test(clean)) return 'सड़क पर खतरनाक गड्ढे की शिकायत';
      if (/गटर|नाली|मैनहोल|सीवर/i.test(clean)) return 'खुला मैनहोल व जलभराव की शिकायत';
      if (/कचरा|कूड़ा|गंदगी/i.test(clean)) return 'कचरे के ढेर व सफाई की समस्या';
      if (/लाइट|बत्ती|बिजली/i.test(clean)) return 'स्ट्रीट लाइट बंद होने की शिकायत';
      if (/पानी|पाइप/i.test(clean)) return 'पेयजल पाइपलाइन रिसाव की शिकायत';
      return clean.slice(0, 45) + (clean.length > 45 ? '...' : '');
    }

    // English
    if (/pothole|crater|road/i.test(clean)) return 'Dangerous Road Pothole Defect';
    if (/manhole|drain|sewer|waterlog/i.test(clean)) return 'Hazardous Open Drainage / Manhole';
    if (/garbage|waste|trash|dump/i.test(clean)) return 'Unattended Solid Waste & Garbage Dump';
    if (/light|pole|electric|wire/i.test(clean)) return 'Faulty Streetlight & Electrical Hazard';
    if (/water|pipe|leak/i.test(clean)) return 'Drinking Water Pipeline Burst & Leakage';

    // Fallback: first 5-8 words
    const words = clean.split(/\s+/).slice(0, 7).join(' ');
    return words ? `${words}...` : 'Civic Grievance Report';
  };

  // Start speech recognition
  const startRecording = useCallback(() => {
    setPermissionError(null);
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      toast.error(
        t(
          'voice.notSupported',
          'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
        )
      );
      return;
    }

    try {
      sound.play('click');
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setInterimText('');
        toast.success(
          `${t('voice.listening', 'Listening')} (${activeLangConfig.nativeLabel})...`,
          { id: 'voice-recording-status' }
        );
      };

      recognition.onresult = (event) => {
        let accumulatedFinal = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            accumulatedFinal += res[0].transcript + ' ';
          } else {
            currentInterim += res[0].transcript;
          }
        }

        if (accumulatedFinal) {
          setTranscript((prev) => (prev ? `${prev.trim()} ${accumulatedFinal}` : accumulatedFinal).trim());
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          setPermissionError(
            t(
              'voice.micDenied',
              'Microphone permission denied. Please allow microphone access in your browser settings.'
            )
          );
          setIsRecording(false);
        } else if (event.error === 'no-speech') {
          // Keep recording; silence is normal
        } else {
          toast.error(`Voice error: ${event.error}`, { id: 'voice-err' });
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText('');
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
      toast.error('Unable to access microphone. Please check permissions.');
    }
  }, [selectedLang, activeLangConfig, t]);

  // Stop recording
  const stopRecording = useCallback(() => {
    sound.play('pop');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsRecording(false);
    setInterimText('');
    toast.dismiss('voice-recording-status');
  }, []);

  // Apply to form
  const handleApplyToForm = (customText) => {
    const textToApply = (customText || transcript || interimText).trim();
    if (!textToApply) {
      toast.error('No voice text recorded yet.');
      return;
    }

    sound.play('success');
    const autoTitle = generateTitleFromTranscript(textToApply, selectedLang);

    if (onApplyTranscript) {
      onApplyTranscript({
        description: textToApply,
        autoTitle: hasExistingTitle ? null : autoTitle,
        langCode: selectedLang,
        append: appendMode,
      });
    }

    toast.success(
      t(
        'voice.successApplied',
        'Voice grievance captured and applied! AI triage updated.'
      )
    );
  };

  // Text-To-Speech Playback
  const handleToggleAudioPlayback = () => {
    const text = transcript.trim();
    if (!text) {
      toast.error('No transcript available to play.');
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    utterance.rate = 0.95;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang === selectedLang || v.lang.startsWith(selectedLang.slice(0, 2)));
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Quick preset sample click
  const handleUseSample = (lang) => {
    sound.play('click');
    setSelectedLang(lang.code);
    setTranscript(lang.sample);
    setInterimText('');

    toast.success(`Loaded ${lang.nativeLabel} sample voice grievance.`);
  };

  // Clear
  const handleClear = () => {
    sound.play('click');
    if (isRecording) stopRecording();
    if (isPlayingAudio && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
    setTranscript('');
    setInterimText('');
  };

  // Format timer MM:SS
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/60 p-4 sm:p-5 shadow-soft transition-all duration-300 ${className}`}
    >
      {/* ── Header & Language Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Mic size={18} className={isRecording ? 'animate-pulse text-red-200' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                {t('voice.title', 'Voice Grievance Report')}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800 uppercase tracking-wide">
                AI Speech
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {t(
                'voice.subtitle',
                'Speak in English, Hindi, or Marathi — auto-fills description and triggers AI triage.'
              )}
            </p>
          </div>
        </div>

        {/* Language Selection Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white/90 p-1 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-neutral-400 px-1.5 flex items-center gap-1">
            <Languages size={12} />
          </span>
          {VOICE_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  sound.play('click');
                  if (isRecording) {
                    stopRecording();
                  }
                  setSelectedLang(lang.code);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
                title={`Speak in ${lang.nativeLabel}`}
              >
                <span>{lang.nativeLabel}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Microphone Alert or Permission Error ── */}
      {permissionError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <div className="space-y-1">
            <p className="font-semibold">{permissionError}</p>
            <p className="text-[11px] text-red-600/90">
              You can still click the sample voice buttons below to test the automated triage and Marathi/Hindi NLP intake.
            </p>
          </div>
        </div>
      )}

      {!isSupported && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <HelpCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-semibold">
              {t(
                'voice.notSupported',
                'Live speech recognition is not supported in this browser.'
              )}
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Google Chrome, Microsoft Edge, and Safari have built-in Web Speech API support. You can also test with the one-click presets below.
            </p>
          </div>
        </div>
      )}

      {/* ── Recording Controls & Visualizer ── */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3.5 bg-white/95 rounded-xl border border-neutral-200/70 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Main Record Trigger Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative flex items-center justify-center w-12 h-12 rounded-2xl font-bold text-white transition-all shadow-md active:scale-95 ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30 ring-4 ring-rose-200 animate-pulse'
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/30'
            }`}
            title={isRecording ? 'Click to stop recording' : 'Click to start voice recording'}
          >
            {isRecording ? <Square size={20} className="fill-current" /> : <Mic size={22} />}
          </button>

          {/* Status Label & Timer */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-800">
                {isRecording
                  ? `${t('voice.listening', 'Listening')}...`
                  : transcript
                  ? 'Voice Captured'
                  : t('voice.start', 'Record Voice Report')}
              </span>
              {isRecording && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-700 animate-pulse">
                  {formatTimer(timerSeconds)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {isRecording
                ? `Speaking in ${activeLangConfig.nativeLabel} · Tap stop when done`
                : `Active dialect: ${activeLangConfig.nativeLabel} (${activeLangConfig.code})`}
            </p>
          </div>
        </div>

        {/* Audio Waveform Equalizer (Animated when listening) */}
        {isRecording && (
          <div className="flex items-center gap-1 self-center h-6 px-3 bg-rose-50 border border-rose-100 rounded-lg">
            <span className="w-1 bg-rose-500 rounded-full animate-bounce h-4"></span>
            <span className="w-1 bg-rose-600 rounded-full animate-bounce h-6 [animation-delay:0.15s]"></span>
            <span className="w-1 bg-rose-400 rounded-full animate-bounce h-3 [animation-delay:0.3s]"></span>
            <span className="w-1 bg-rose-700 rounded-full animate-bounce h-5 [animation-delay:0.1s]"></span>
            <span className="w-1 bg-rose-500 rounded-full animate-bounce h-2 [animation-delay:0.25s]"></span>
            <span className="text-[10px] font-bold text-rose-700 ml-1.5 uppercase tracking-wider">
              Audio Active
            </span>
          </div>
        )}

        {/* Quick Actions (if transcript available and not recording) */}
        {!isRecording && transcript && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
            {typeof window !== 'undefined' && 'speechSynthesis' in window && (
              <button
                type="button"
                onClick={handleToggleAudioPlayback}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                title="Listen to recognized speech"
              >
                {isPlayingAudio ? <VolumeX size={13} className="text-rose-600" /> : <Volume2 size={13} />}
                {isPlayingAudio ? t('voice.stopAudio', 'Stop Audio') : t('voice.listen', 'Listen')}
              </button>
            )}

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Clear transcription"
            >
              <RotateCcw size={12} />
              {t('voice.clear', 'Clear')}
            </button>

            <button
              type="button"
              onClick={() => handleApplyToForm()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
            >
              <Check size={14} />
              {t('voice.useAsDesc', 'Apply to Description')}
            </button>
          </div>
        )}
      </div>

      {/* ── Live Transcript Box ── */}
      {(transcript || interimText || isRecording) && (
        <div className="mt-3 p-3.5 bg-white rounded-xl border border-indigo-100/90 shadow-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
            <span className="flex items-center gap-1.5">
              <FileText size={12} className="text-brand-600" />
              Recognized Speech ({activeLangConfig.nativeLabel})
            </span>
            <div className="flex items-center gap-2">
              {existingDescription && (
                <label className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appendMode}
                    onChange={(e) => setAppendMode(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Append to existing text</span>
                </label>
              )}
            </div>
          </div>

          <div className="text-xs text-neutral-800 leading-relaxed font-sans min-h-[42px] max-h-36 overflow-y-auto p-2 bg-neutral-50/70 rounded-lg border border-neutral-100">
            {transcript ? (
              <span className="font-medium text-neutral-900">{transcript}</span>
            ) : null}
            {interimText ? (
              <span className="text-indigo-600 italic ml-1 opacity-80">
                {interimText}
              </span>
            ) : null}
            {isRecording && !transcript && !interimText && (
              <span className="text-neutral-400 italic">
                {t('voice.listening', 'Listening')}... {activeLangConfig.label === 'Marathi' ? 'मराठीत बोला...' : activeLangConfig.label === 'Hindi' ? 'कृपया बोलें...' : 'Speak now...'}
              </span>
            )}
          </div>

          {/* Quick Apply button inside transcript card */}
          {transcript && !isRecording && (
            <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-500">
              <span className="truncate max-w-[260px] sm:max-w-md">
                Suggested Title: <strong>{generateTitleFromTranscript(transcript, selectedLang)}</strong>
              </span>
              <button
                type="button"
                onClick={() => handleApplyToForm()}
                className="font-bold text-brand-700 hover:text-brand-800 hover:underline inline-flex items-center gap-1"
              >
                <Sparkles size={12} />
                Insert & Run AI Triage →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── One-Click Demo Sample Presets (For instant testing) ── */}
      <div className="mt-3 pt-3 border-t border-indigo-100/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
          <Sparkles size={12} className="text-amber-500" />
          {t('voice.samplePill', 'Try Sample Voice Note')}:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {VOICE_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleUseSample(lang)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white hover:bg-indigo-50 border border-neutral-200 text-neutral-700 hover:text-indigo-800 transition-colors flex items-center gap-1 shadow-2xs"
            >
              <span>{lang.nativeLabel}</span>
              <span className="text-neutral-400 text-[10px]">({lang.badge})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

