import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, MapPin, Search,
  Activity, CloudRain, ChevronRight, Phone,
  ArrowRight, Shield, CheckCircle2, RefreshCw,
  Mic, Volume2, Award, Sparkles, ChevronDown, Clock, BarChart3, Star, Check, Zap, Play, FileCheck, ThumbsUp
} from 'lucide-react';
import { getComplaints } from '../api/complaints.api';
import { getPublicSummary } from '../api/analytics.api';
import { getWeatherAQI } from '../api/weather.api';
import { MUMBAI_WARDS, CATEGORIES } from '../utils/mockData';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon, SeverityBadge, StatusBadge } from '../components/complaints/ComplaintComponents';
import { Card } from '../components/common/Card';
import { formatRelative, classNames } from '../utils/formatters';
import { sound } from '../utils/soundEffects';
import { HeroSlider } from '../components/common/HeroSlider';
import { WaterTelemetrySection } from '../components/common/WaterTelemetrySection';
import { Reveal, CountUp } from '../components/common/Motion';
import { useTheme } from '../context/ThemeContext';

export const LandingPage = () => {
  const { language, t, translateCategory } = useLanguage();
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState([]);
  const [cityStats, setCityStats] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Interactive Simulator state
  const [simLang, setSimLang] = useState(language || 'en');
  const [isSimulating, setIsSimulating] = useState(false);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [complaintsRes, statsRes, weatherRes] = await Promise.all([
          getComplaints(selectedWard ? { ward: Number(selectedWard) } : {}),
          getPublicSummary(),
          getWeatherAQI(19.076, 72.877)
        ]);
        setComplaints(complaintsRes.data || []);
        setCityStats(statsRes.data || null);
        setWeatherData(weatherRes.data || null);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedWard]);

  // Keep simulator language in sync when user toggles global language
  useEffect(() => {
    if (language === 'mr' || language === 'hi' || language === 'en') {
      setSimLang(language);
    }
  }, [language]);

  // Pre-warm Web Speech Synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      };
    }
  }, []);

  const handleSimulate = () => {
    sound.play('click');
    setIsSimulating(true);

    // 1. Unmistakable two-tone emergency radio dispatch chime & squelch
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        
        // Two-tone walkie-talkie chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.setValueAtTime(1200, now + 0.07);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);

        // Radio squelch static burst
        const bufferSize = Math.floor(ctx.sampleRate * 0.12);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.10;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2200;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.12, now + 0.04);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now + 0.04);
        noise.stop(now + 0.18);
      }
    } catch (e) {
      console.warn('Audio tone error', e);
    }

    // 2. High-reliability Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      } catch {}

      const voices = window.speechSynthesis.getVoices() || [];
      const langMap = {
        mr: 'mr-IN',
        hi: 'hi-IN',
        en: 'en-IN',
      };
      const targetLang = langMap[simLang] || 'en-IN';

      // Find best available voice
      let voice = voices.find((v) => v.lang === targetLang || v.lang.startsWith(targetLang.slice(0, 2)));

      // If Marathi or Hindi voice is not installed on Windows, use English voice with translated dispatch text so speech is always audible!
      let textToSpeak = currentScenario.audioText;
      let speechLang = targetLang;
      if (!voice && simLang !== 'en') {
        textToSpeak = currentScenario.englishFallback || currentScenario.audioText;
        speechLang = 'en-US';
        voice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      window._kaiserUtterance = utterance; // Prevent Chrome V8 garbage-collection audio drop bug

      utterance.lang = speechLang;
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSimulating(true);
      };

      utterance.onend = () => {
        setIsSimulating(false);
        sound.play('pop');
        window._kaiserUtterance = null;
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis error:', err);
        setIsSimulating(false);
        sound.play('pop');
        window._kaiserUtterance = null;
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis.speak failed:', err);
      }

      // Safety timeout in case speech synthesis stalls
      const maxMs = Math.max(3800, textToSpeak.length * 90);
      setTimeout(() => {
        setIsSimulating((prev) => {
          if (prev) {
            sound.play('pop');
            return false;
          }
          return false;
        });
        window._kaiserUtterance = null;
      }, maxMs);
    } else {
      setTimeout(() => {
        setIsSimulating(false);
        sound.play('pop');
      }, 2400);
    }
  };

  const SIM_SCENARIOS = {
    mr: {
      langLabel: 'मराठी (Marathi)',
      audioText: 'अंधेरी पूर्व स्टेशनजवळ वेस्टर्न एक्सप्रेस हायवेवर मोठा खड्डा पडला आहे, गाड्या घसरून अपघात होण्याचा धोका आहे.',
      englishFallback: 'Severe pothole detected near Western Express Highway, Andheri East station. Hazardous road condition reported.',
      category: 'खड्डा (Pothole)',
      confidence: '98.4%',
      severity: 88,
      urgency: 'अति तातडीची (High)',
      ward: 'Ward 12 (K/E Andheri East)',
      engineer: 'Assistant Engineer (Roads & Traffic)',
      sla: '24 तास',
    },
    hi: {
      langLabel: 'हिन्दी (Hindi)',
      audioText: 'दादर कबूतरखाना के पास कचरे का बड़ा ढेर लगा हुआ है और बदबू आ रही है, तुरंत सफाई करवाएं।',
      englishFallback: 'Heavy garbage overflow and waste dumping reported near Dadar Kabutarkhana. Immediate municipal sanitation sweep required.',
      category: 'कचरा व गंदगी (Garbage Dump)',
      confidence: '96.2%',
      severity: 74,
      urgency: 'मध्यम तातडी (Medium)',
      ward: 'Ward 8 (G/N Dadar West)',
      engineer: 'Assistant Engineer (Solid Waste Management)',
      sla: '24 घंटे',
    },
    en: {
      langLabel: 'English (Mumbai)',
      audioText: 'Severe waterlogging and open manhole cover observed near Bandra Talao, SV Road traffic completely stalled.',
      englishFallback: 'Severe waterlogging and open manhole cover observed near Bandra Talao, SV Road traffic completely stalled.',
      category: 'Drainage & Open Manhole',
      confidence: '99.1%',
      severity: 94,
      urgency: 'CRITICAL (Immediate Action)',
      ward: 'Ward 11 (H/W Bandra West)',
      engineer: 'Executive Engineer (Stormwater Drains)',
      sla: '12 Hours (Emergency Protocol)',
    },
  };

  const currentScenario = SIM_SCENARIOS[simLang] || SIM_SCENARIOS[language] || SIM_SCENARIOS.en;

  const TOP_WARDS = [
    { rank: 1, name: 'H/W Ward', area: 'Bandra (West), Khar, Carter Road', resolvedRate: 96.4, avgHours: 14.2, activeOfficers: 42, score: 98 },
    { rank: 2, name: 'K/E Ward', area: 'Andheri (East), MIDC, Jogeshwari', resolvedRate: 93.8, avgHours: 17.6, activeOfficers: 68, score: 95 },
    { rank: 3, name: 'G/N Ward', area: 'Dadar (West), Dharavi, Mahim', resolvedRate: 92.1, avgHours: 18.4, activeOfficers: 55, score: 93 },
    { rank: 4, name: 'G/S Ward', area: 'Worli, Lower Parel, Prabhadevi', resolvedRate: 91.5, avgHours: 19.1, activeOfficers: 48, score: 91 },
    { rank: 5, name: 'L Ward', area: 'Kurla (West), Sakinaka, Chandivali', resolvedRate: 89.2, avgHours: 22.8, activeOfficers: 61, score: 88 },
  ];

  const FAQ_ITEMS = [
    {
      q: language === 'mr' ? 'खड्ड्यांची किंवा रस्त्यांची तक्रार नोंदवल्यावर किती वेळात कारवाई होते?' : language === 'hi' ? 'सड़क के गड्ढों की शिकायत पर बीएमसी कितनी देर में कार्रवाई करती है?' : 'How fast does BMC respond to high-severity road hazards?',
      a: language === 'mr' ? 'गंभीर खड्ड्यांसाठी २४ तासांचा अधिकृत SLA लागू आहे. तक्रार दाखल होताच प्रभाग अभियंत्याकडे काम सोपवले जाते आणि २४ तासांत दुरुस्तीचा फोटो अपलोड करावा लागतो.' : language === 'hi' ? 'गंभीर गड्ढों के लिए 24 घंटे की आधिकारिक SLA लागू होती है। समय सीमा पूरी होने पर वरिष्ठ अधिकारियों को स्वतः अलर्ट जाता है।' : 'High-severity potholes carry a strict 24-hour SLA turnaround. Tickets are instantly auto-assigned to the ward engineer desk with automated escalation if unaddressed.'
    },
    {
      q: language === 'mr' ? 'मी मराठी किंवा हिंदीमध्ये बोलून तक्रार नोंदवू शकतो का?' : language === 'hi' ? 'क्या मैं हिंदी या मराठी में बोलकर शिकायत दर्ज करा सकता हूं?' : 'Can I report grievances using voice notes in Marathi or Hindi?',
      a: language === 'mr' ? 'होय! कैसर AI मराठी, हिंदी आणि इंग्रजी बोलीभाषा समजते. तुम्ही फक्त माइकवर बोलून तक्रार सांगू शकता; AI आपोआप तपशील, ठिकाण आणि वर्ग ओळखते.' : language === 'hi' ? 'हाँ! कैसर AI बहुभाषी वॉयस ट्रांसक्रिप्शन का समर्थन करता है। आप हिंदी, मराठी या अंग्रेजी में बोलकर शिकायत दर्ज कर सकते हैं।' : 'Yes! Kaiser AI features on-device multilingual audio transcription supporting Marathi, Hindi, and English with auto-intent classification.'
    },
    {
      q: language === 'mr' ? 'काम पूर्ण झाल्यावर मला कसे कळेल आणि पुरावा मिळेल का?' : language === 'hi' ? 'काम पूरा होने पर क्या मुझे समाधान का फोटो और सबूत मिलेगा?' : 'How do before-and-after photo verification audits work?',
      a: language === 'mr' ? 'प्रत्येक तक्रार बंद करताना प्रभाग अभियंत्याला दुरुस्तीनंतरचा जिओ-टॅग केलेला फोटो अपलोड करणे बंधनकारक असते, जो तुमच्या डॅशबोर्डवर थेट दिसतो.' : language === 'hi' ? 'वार्ड इंजीनियर को समाधान का जियो-टैग्ड फोटो अपलोड करना अनिवार्य होता है, जिसे आप अपने पोर्टल पर तुरंत देख सकते हैं।' : 'Every closed grievance requires photographic before-and-after verification with geolocation stamping before the ticket can be officially signed off.'
    },
    {
      q: language === 'mr' ? 'नागरिक रिवॉर्ड पॉइंट्स आणि डिजिटल सर्टिफिकेट कसे मिळवायचे?' : language === 'hi' ? 'नागरिक रिवॉर्ड पॉइंट्स और डिजिटल सर्टिफिकेट कैसे प्राप्त करें?' : 'How do civic points and digital municipal certificates work?',
      a: language === 'mr' ? 'प्रत्येक पडताळणी झालेल्या तक्रारीवर ५० ते १०० गुण मिळतात. प्रभाग स्तरावर अव्वल कामगिरी करणाऱ्या नागरिकांना मनपा आयुक्तांची स्वाक्षरी असलेले डिजिटल प्रमाणपत्र मिळते.' : language === 'hi' ? 'सत्यापित शिकायतों पर पॉइंट्स मिलते हैं। वार्ड स्तर पर टॉप योगदानकर्ताओं को डिजिटल नागरिक सम्मान पत्र प्रदान किया जाता है।' : 'Citizens earn civic points for verified complaints and community upvotes. Top contributors earn municipal certificates of appreciation and climb the civic leaderboard.'
    },
    {
      q: language === 'mr' ? 'पावसाळ्यात पूर किंवा जलमय रस्त्यांची माहिती कशी मिळते?' : language === 'hi' ? 'मानसून में जलभराव और बाढ़ अलर्ट की जानकारी कैसे मिलती है?' : 'How does the monsoon flood warning system work?',
      a: language === 'mr' ? 'कैसर AI सांताक्रूझ डॉपलर रडार आणि हिंदमाता, कुर्ला, सायनमधील सेन्सर्सशी जोडलेले आहे. भरती आणि मुसळधार पावसाच्या वेळी नागरिकांना थेट अलर्ट पाठवले जातात.' : language === 'hi' ? 'कैसर AI मौसम विभाग के डॉपलर रडार और जमीनी जलभराव सेंसरों से जुड़ा है, जो भारी बारिश में तुरंत चेतावनी जारी करता है।' : 'The platform continuously monitors IMD Santacruz Doppler feeds and municipal flood telemetry sensors across low-lying zones (Hindmata, Kurla, Sion).'
    },
  ];

  const filteredComplaints = complaints.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        String(item.ward).includes(q)
      );
    }
    return true;
  });

  return (
    <div
      className={classNames(
        'pb-20 overflow-hidden relative transition-colors duration-300',
        isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-slate-50 text-neutral-900'
      )}
    >

      {/* ── SECTION 1: Full-Bleed Animated Hero Section (Edge-to-Edge) ── */}
      <HeroSlider stats={cityStats} weather={weatherData} />

      {/* ── SECTION 2: Ward Marquee Stream (Transition Ribbon) ── */}
      <div
        className={classNames(
          'overflow-hidden border-y py-3 shadow-md -mt-12 sm:-mt-16 relative z-20 backdrop-blur-md transition-colors',
          isDark
            ? 'border-emerald-500/20 bg-neutral-900/95 text-emerald-300'
            : 'border-emerald-200 bg-white/95 text-emerald-800'
        )}
        aria-hidden
      >
        <div className="flex w-max gap-3.5" style={{ animation: 'marqueeX 45s linear infinite' }}>
          {[...MUMBAI_WARDS, ...MUMBAI_WARDS].map((w, i) => (
            <span
              key={i}
              className={classNames(
                'flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap shadow-xs transition-colors',
                isDark
                  ? 'bg-neutral-800/90 border-emerald-500/30 text-emerald-300'
                  : 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
              )}
            >
              <MapPin size={12} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} /> Ward {w.name} · {w.area}
            </span>
          ))}
        </div>
      </div>

      {/* ── SECTION 3: Weather Intelligence Bar ── */}
      {weatherData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-7 sm:my-9">
          <div
            className={classNames(
              'rounded-3xl px-5 py-3 sm:py-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl backdrop-blur-xl border transition-colors',
              isDark
                ? 'bg-gradient-to-r from-neutral-900/90 via-neutral-900/95 to-neutral-900/90 border-emerald-500/25'
                : 'bg-white/95 border-neutral-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
            )}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={classNames(
                  'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-colors',
                  isDark
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.25)]'
                    : 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-sm'
                )}
              >
                <CloudRain size={20} />
              </div>
              <div
                className={classNames(
                  'flex flex-wrap items-center gap-x-2.5 gap-y-1',
                  isDark ? 'text-neutral-200' : 'text-neutral-700'
                )}
              >
                <span className={classNames('font-bold tracking-wide', isDark ? 'text-white' : 'text-neutral-900')}>
                  {t('weather.telemetryTitle', 'BMC IMD Telemetry:')}
                </span>
                <span className={classNames('font-semibold', isDark ? 'text-emerald-300' : 'text-emerald-700')}>
                  {t('weather.aqi', 'Air Quality Index')} {weatherData.aqi} ({weatherData.aqiCategory})
                </span>
                <span className={isDark ? 'text-neutral-500 hidden sm:inline' : 'text-neutral-300 hidden sm:inline'}>·</span>
                <span className={classNames('font-mono', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                  {weatherData.temperature}°C {weatherData.condition}
                </span>
                <span className={isDark ? 'text-neutral-500 hidden sm:inline' : 'text-neutral-300 hidden sm:inline'}>·</span>
                <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>{t('weather.radarActive', 'Santacruz Doppler Radar Active')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className={classNames(
                  'text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-colors',
                  isDark
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                )}
              >
                {t('weather.radarLive', 'SANTACRUZ RADAR LIVE')}
              </span>
              <Link
                to="/app/map"
                className={classNames(
                  'font-bold text-xs flex items-center gap-1 hover:underline',
                  isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'
                )}
              >
                {t('weather.openMap', 'Open Map')} <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 3.5: BMC Water & Flood Command Telemetry (Dedicated High-Tech Water UI) ── */}
      <div className="mt-2 sm:mt-2.5">
        <WaterTelemetrySection />
      </div>

      {/* ── SECTION 4: Zero-Touch Triage Architecture & Interactive Simulation ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 lg:mt-16">
        <Reveal className="text-center max-w-2xl mx-auto px-4 mb-10 sm:mb-12 lg:mb-14">
          <p className={classNames(
            "text-xs font-mono font-bold tracking-[.3em] uppercase flex items-center justify-center gap-2",
            isDark ? "text-emerald-400" : "text-emerald-700"
          )}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
            {t('triage.eyebrow', 'Zero-Touch Triage Architecture')}
          </p>
          <h2 className={classNames(
            "font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-2",
            isDark ? "text-white" : "text-neutral-900"
          )}>
            {t('triage.title', 'From photo to dispatch in seconds')}
          </h2>
          <p className={classNames(
            "text-sm sm:text-base mt-2.5 leading-relaxed",
            isDark ? "text-neutral-400" : "text-neutral-600"
          )}>
            {t('triage.subtitle', 'Watch how Kaiser AI transforms raw citizen reports into prioritized, geolocated municipal work orders.')}
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Feature Walkthrough */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="space-y-3.5">
              <div className={classNames(
                "p-4 sm:p-5 rounded-2xl border transition-all duration-300 group flex items-start gap-4",
                isDark
                  ? "bg-neutral-900/80 backdrop-blur-md border-neutral-800 shadow-xl hover:border-emerald-500/60 hover:shadow-[0_8px_30px_rgba(52,211,153,0.12)]"
                  : "bg-white border-neutral-200 shadow-soft hover:border-emerald-500 hover:shadow-soft-lg"
              )}>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-neutral-950 transition-all duration-300">
                  <Activity size={22} />
                </div>
                <div>
                  <h3 className={classNames("text-sm sm:text-base font-bold flex items-center gap-2", isDark ? "text-white" : "text-neutral-900")}>
                    {t('triage.step1Title', '1. Multimodal Edge Capture & Telemetry')}
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">{t('triage.instant', 'INSTANT')}</span>
                  </h3>
                  <p className={classNames("text-xs sm:text-sm mt-1.5 leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
                    {t('triage.step1Desc', 'Citizens submit photos, voice notes in Marathi, Hindi, or English. Precise GPS coordinates and timestamp are bound instantaneously.')}
                  </p>
                </div>
              </div>

              <div className={classNames(
                "p-4 sm:p-5 rounded-2xl border transition-all duration-300 group flex items-start gap-4",
                isDark
                  ? "bg-neutral-900/80 backdrop-blur-md border-neutral-800 shadow-xl hover:border-emerald-500/60 hover:shadow-[0_8px_30px_rgba(52,211,153,0.12)]"
                  : "bg-white border-neutral-200 shadow-soft hover:border-emerald-500 hover:shadow-soft-lg"
              )}>
                <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-neutral-950 transition-all duration-300">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className={classNames("text-sm sm:text-base font-bold flex items-center gap-2", isDark ? "text-white" : "text-neutral-900")}>
                    {t('triage.step2Title', '2. OpenAI CLIP Zero-Shot Defect & Severity Scoring')}
                    <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full">{t('triage.conf', '98.4% CONF')}</span>
                  </h3>
                  <p className={classNames("text-xs sm:text-sm mt-1.5 leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
                    {t('triage.step2Desc', 'Our neural network inspects road fissures, open manholes, and illegal dump sites, generating a calibrated 0–100 urgency score.')}
                  </p>
                </div>
              </div>

              <div className={classNames(
                "p-4 sm:p-5 rounded-2xl border transition-all duration-300 group flex items-start gap-4",
                isDark
                  ? "bg-neutral-900/80 backdrop-blur-md border-neutral-800 shadow-xl hover:border-emerald-500/60 hover:shadow-[0_8px_30px_rgba(52,211,153,0.12)]"
                  : "bg-white border-neutral-200 shadow-soft hover:border-emerald-500 hover:shadow-soft-lg"
              )}>
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all duration-300">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className={classNames("text-sm sm:text-base font-bold flex items-center gap-2", isDark ? "text-white" : "text-neutral-900")}>
                    {t('triage.step3Title', '3. Ward Engineer Dispatch & Automated SLA Tracking')}
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">{t('triage.sla24h', 'SLA 24H')}</span>
                  </h3>
                  <p className={classNames("text-xs sm:text-sm mt-1.5 leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
                    {t('triage.step3Desc', 'Direct routing to the designated BMC ward desk with live SLA countdowns, auto-escalation triggers, and public resolution audits.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="pt-2 grid grid-cols-3 gap-3.5">
              <div className={classNames(
                "p-4 rounded-2xl border shadow-md hover:-translate-y-1 transition-all duration-300",
                isDark
                  ? "bg-neutral-900/90 backdrop-blur-sm border-neutral-800 hover:border-emerald-500/50"
                  : "bg-white border-neutral-200 hover:border-emerald-500 shadow-soft"
              )}>
                <div className={classNames("text-xl sm:text-2xl font-black font-mono", isDark ? "text-white" : "text-neutral-950")}>
                  <CountUp to={cityStats?.totalComplaints || 14827} />
                </div>
                <div className={classNames("text-[11px] font-semibold mt-0.5", isDark ? "text-neutral-400" : "text-neutral-500")}>{t('hero.statReported', 'Issues Reported')}</div>
              </div>
              <div className={classNames(
                "p-4 rounded-2xl border shadow-md hover:-translate-y-1 transition-all duration-300",
                isDark
                  ? "bg-neutral-900/90 backdrop-blur-sm border-neutral-800 hover:border-emerald-500/50"
                  : "bg-white border-neutral-200 hover:border-emerald-500 shadow-soft"
              )}>
                <div className="text-xl sm:text-2xl font-black text-emerald-500 font-mono">
                  <CountUp to={Number(cityStats?.resolvedRate) || 91.4} decimals={1} suffix="%" />
                </div>
                <div className={classNames("text-[11px] font-semibold mt-0.5", isDark ? "text-neutral-400" : "text-neutral-500")}>{t('hero.statResolved', 'Resolution Rate')}</div>
              </div>
              <div className={classNames(
                "p-4 rounded-2xl border shadow-md hover:-translate-y-1 transition-all duration-300",
                isDark
                  ? "bg-neutral-900/90 backdrop-blur-sm border-neutral-800 hover:border-sky-500/50"
                  : "bg-white border-neutral-200 hover:border-sky-500 shadow-soft"
              )}>
                <div className="text-xl sm:text-2xl font-black text-sky-500 font-mono">
                  <CountUp to={cityStats?.avgResolutionDays ? cityStats.avgResolutionDays * 24 : 18.4} decimals={1} suffix="h" />
                </div>
                <div className={classNames("text-[11px] font-semibold mt-0.5", isDark ? "text-neutral-400" : "text-neutral-500")}>{t('hero.statTime', 'Avg Resolution SLA')}</div>
              </div>
            </div>
          </div>

          {/* Right Hero Interactive AI Terminal Preview */}
          <div className="lg:col-span-5">
            <div className={classNames(
              "rounded-3xl p-6 border shadow-2xl relative overflow-hidden group transition-all",
              isDark
                ? "bg-neutral-900/95 backdrop-blur-xl border-neutral-800"
                : "bg-white border-neutral-200 shadow-soft-xl"
            )}>
              {/* Header Status Bar */}
              <div className={classNames("flex items-center justify-between pb-4 border-b", isDark ? "border-neutral-800" : "border-neutral-200")}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Activity className="animate-pulse" size={17} />
                  </div>
                  <div>
                    <span className={classNames("text-xs font-bold", isDark ? "text-white" : "text-neutral-950")}>{t('triage.engineTitle', 'AI Triage & CV Engine')}</span>
                    <div className={classNames("text-[10px] font-mono", isDark ? "text-neutral-400" : "text-neutral-500")}>OpenAI CLIP + ViT Engine v3.2</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-400/40 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                  {t('triage.modelOnline', 'LIVE MODEL ONLINE')}
                </span>
              </div>

              {/* Holographic Simulation Box */}
              <div className="mt-4 space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 h-48 group-hover:border-neutral-700 transition-colors">
                  <img
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
                    alt="Road inspection"
                    className="w-full h-full object-cover opacity-80"
                  />
                  {/* Scanning Laser Beam */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_14px_#34d399] animate-laser-scan pointer-events-none" />

                  {/* Detected Bounding Box HUD */}
                  <div className="absolute top-10 left-12 right-14 bottom-10 border-2 border-emerald-400/90 rounded-lg pointer-events-none shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                    <span className="absolute -top-3 left-2 bg-emerald-400 text-neutral-950 font-mono text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                      {t('triage.potholeDetected', 'POTHOLE · 98.4%')}
                    </span>
                    <span className="absolute -bottom-3 right-2 bg-rose-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      {t('triage.severityScore', 'SEVERITY 85/100')}
                    </span>
                  </div>

                  {/* Telemetry pill */}
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-neutral-300 font-mono text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
                    <MapPin size={11} className="text-emerald-400" />
                    <span>GPS: 19.1136° N, 72.8697° E</span>
                  </div>
                </div>

                {/* Smart Dispatch Routing Ticket */}
                <div className={classNames(
                  "rounded-2xl p-4 border text-xs space-y-2.5 transition-colors",
                  isDark ? "bg-neutral-950/90 border-neutral-800" : "bg-slate-50 border-neutral-200"
                )}>
                  <div className={classNames("flex items-center justify-between font-mono text-[11px]", isDark ? "text-neutral-400" : "text-neutral-500")}>
                    <span>{t('triage.dispatchTarget', 'DISPATCH TARGET')}</span>
                    <span className="text-emerald-500 font-bold">{t('triage.autoAssigned', 'AUTO-ASSIGNED')}</span>
                  </div>
                  <div className={classNames("flex items-center gap-2 font-bold", isDark ? "text-white" : "text-neutral-900")}>
                    <Shield size={15} className="text-emerald-500" />
                    <span>{t('triage.engineerRoads', 'K/E Ward Assistant Engineer (Roads)')}</span>
                  </div>
                  <div className={classNames("flex items-center justify-between text-[11px] pt-2 border-t", isDark ? "text-neutral-400 border-neutral-800" : "text-neutral-500 border-neutral-200")}>
                    <span>{t('triage.slaTurnaround', 'SLA Turnaround:')} <strong className={isDark ? "text-white" : "text-neutral-900"}>{t('triage.24Hours', '24 Hours')}</strong></span>
                    <span>{t('triage.wardAndheri', 'Ward #8 · Andheri East')}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Test Action */}
              <div className={classNames("mt-4 pt-3.5 border-t flex items-center justify-between text-xs", isDark ? "border-neutral-800" : "border-neutral-200")}>
                <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>{t('triage.voicePhotoTriage', 'Multilingual Voice & Photo Triage')}</span>
                <Link to="/app/report" className="text-emerald-500 hover:text-emerald-600 font-bold flex items-center gap-1 hover:underline">
                  {t('triage.launchReport', 'Launch Interactive Report')} <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: NEW! Interactive Multilingual Voice & AI Triage Simulator ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className={classNames(
          "rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all",
          isDark
            ? "bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-emerald-500/20"
            : "bg-white border border-emerald-500/30 shadow-soft-xl"
        )}>
          {/* Background Ambient Glow */}
          <div className={classNames(
            "absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none",
            isDark ? "bg-emerald-500/10" : "bg-emerald-500/5"
          )} />

          <div className={classNames("flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b", isDark ? "border-neutral-800" : "border-neutral-200")}>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                {t('simulator.eyebrow', 'TRY IT LIVE IN THE BROWSER')}
              </div>
              <h2 className={classNames("font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight", isDark ? "text-white" : "text-neutral-950")}>
                {t('simulator.title', 'Multilingual AI Voice & Vision Simulator')}
              </h2>
              <p className={classNames("text-xs sm:text-sm mt-1 max-w-xl", isDark ? "text-neutral-400" : "text-neutral-600")}>
                {t('simulator.subtitle', 'Test how Kaiser AI extracts civic defects from conversational Marathi, Hindi, and English.')}
              </p>
            </div>

            {/* Language Selector Pills */}
            <div className={classNames("flex items-center gap-2 p-1.5 rounded-2xl border shrink-0", isDark ? "bg-neutral-950/80 border-neutral-800" : "bg-slate-100 border-neutral-200")}>
              {['mr', 'hi', 'en'].map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    sound.play('click');
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    setIsSimulating(false);
                    setSimLang(l);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${simLang === l
                      ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_14px_rgba(52,211,153,0.4)]'
                      : isDark ? 'text-neutral-400 hover:text-white hover:bg-white/5' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                    }`}
                >
                  {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिन्दी' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Console */}
          <div className="grid lg:grid-cols-12 gap-8 pt-8 items-center">
            {/* Audio Wave Intake Preview */}
            <div className="lg:col-span-6 space-y-5">
              <div className={classNames("rounded-2xl p-5 border space-y-4", isDark ? "bg-neutral-950 border-neutral-800" : "bg-slate-50 border-neutral-200")}>
                <div className={classNames("flex items-center justify-between text-xs font-mono", isDark ? "text-neutral-400" : "text-neutral-500")}>
                  <span className="flex items-center gap-2">
                    <Mic size={15} className="text-emerald-500" />
                    {t('simulator.audioIntake', 'SIMULATED AUDIO INTAKE')}
                  </span>
                  <span className="text-emerald-500 font-bold">{currentScenario.langLabel}</span>
                </div>

                {/* Animated Sound Waveform */}
                <div className={classNames("flex items-center justify-center gap-1.5 h-16 rounded-xl px-4 border", isDark ? "bg-neutral-900/60 border-white/5" : "bg-white border-neutral-200 shadow-inner")}>
                  {[24, 48, 36, 60, 44, 28, 52, 64, 40, 56, 32, 48, 62, 38, 26].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-300 ${isSimulating
                          ? 'bg-emerald-500 animate-wave-bar'
                          : 'bg-emerald-500/40'
                        }`}
                      style={{
                        height: isSimulating ? `${(h * 0.8)}%` : `${h * 0.4}%`,
                        animationDelay: `${i * 70}ms`,
                      }}
                    />
                  ))}
                </div>

                {/* Speech Transcript */}
                <div className={classNames("p-3.5 rounded-xl border text-xs font-medium italic leading-relaxed", isDark ? "bg-neutral-900 border-neutral-800 text-neutral-200" : "bg-white border-neutral-200 text-neutral-800 shadow-xs")}>
                  "{currentScenario.audioText}"
                </div>

                {/* Simulation Trigger Button */}
                <button
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] cursor-pointer"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      {t('simulator.analyzing', 'Analyzing Audio & Extracting Intent...')}
                    </>
                  ) : (
                    <>
                      <Play size={15} />
                      {t('simulator.simulateBtn', 'Simulate Speech-to-Dispatch Triage')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Neural Extraction Output Card */}
            <div className="lg:col-span-6 space-y-4">
              <div className={classNames("rounded-2xl p-6 border space-y-4 shadow-xl", isDark ? "bg-neutral-950 border-emerald-500/30" : "bg-slate-50 border-emerald-500/40")}>
                <div className={classNames("flex items-center justify-between pb-3 border-b text-xs font-mono", isDark ? "border-neutral-800" : "border-neutral-200")}>
                  <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>{t('simulator.result', 'AI EXTRACTION RESULT')}</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                    <Zap size={14} /> {t('simulator.confidence', 'CONFIDENCE:')} {currentScenario.confidence}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={classNames("p-3 rounded-xl border", isDark ? "bg-neutral-900/90 border-neutral-800" : "bg-white border-neutral-200 shadow-xs")}>
                    <span className="text-neutral-500 text-[10px] font-mono uppercase block">{t('simulator.detectedCategory', 'DETECTED CATEGORY')}</span>
                    <span className={classNames("font-bold text-sm mt-0.5 block", isDark ? "text-white" : "text-neutral-900")}>{currentScenario.category}</span>
                  </div>
                  <div className={classNames("p-3 rounded-xl border", isDark ? "bg-neutral-900/90 border-neutral-800" : "bg-white border-neutral-200 shadow-xs")}>
                    <span className="text-neutral-500 text-[10px] font-mono uppercase block">{t('simulator.calibratedSeverity', 'CALIBRATED SEVERITY')}</span>
                    <span className="font-bold text-rose-500 text-sm mt-0.5 block">{currentScenario.severity}/100 ({currentScenario.urgency})</span>
                  </div>
                  <div className={classNames("p-3 rounded-xl border", isDark ? "bg-neutral-900/90 border-neutral-800" : "bg-white border-neutral-200 shadow-xs")}>
                    <span className="text-neutral-500 text-[10px] font-mono uppercase block">{t('simulator.routedWard', 'ROUTED MUNICIPAL WARD')}</span>
                    <span className="font-bold text-sky-500 text-xs mt-0.5 block">{currentScenario.ward}</span>
                  </div>
                  <div className={classNames("p-3 rounded-xl border", isDark ? "bg-neutral-900/90 border-neutral-800" : "bg-white border-neutral-200 shadow-xs")}>
                    <span className="text-neutral-500 text-[10px] font-mono uppercase block">{t('simulator.slaGuarantee', 'SLA GUARANTEE')}</span>
                    <span className="font-bold text-emerald-500 text-xs mt-0.5 block">{currentScenario.sla} {t('simulator.turnaround', 'Turnaround')}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>{t('simulator.readyToReport', 'Ready to report a real Mumbai issue?')}</span>
                  <Link
                    to="/app/report"
                    className="text-emerald-500 hover:text-emerald-600 font-bold flex items-center gap-1 hover:underline"
                  >
                    {t('simulator.openReport', 'Open Live Report Form')} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: NEW! Mumbai 24 Wards Performance Matrix & SLA Leaderboard ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase mb-2">
              <BarChart3 size={15} />
              {t('wardRadar.eyebrow', 'MUNICIPAL PERFORMANCE MATRIX')}
            </div>
            <h2 className={classNames("font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight", isDark ? "text-white" : "text-neutral-950")}>
              {t('wardRadar.title', 'Mumbai 24 Wards Live Performance Matrix')}
            </h2>
            <p className={classNames("text-xs sm:text-sm mt-1 max-w-xl", isDark ? "text-neutral-400" : "text-neutral-600")}>
              {t('wardRadar.subtitle', 'Real-time turnaround rankings, active engineers on ground, and SLA compliance per ward.')}
            </p>
          </div>
          <Link
            to="/app/map"
            className={classNames(
              "px-5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all self-start md:self-auto shrink-0",
              isDark ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10" : "border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            )}
          >
            <MapPin size={15} />
            <span>{t('wardRadar.openMap', 'Open 24 Wards GIS Map')}</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {TOP_WARDS.map((w) => (
            <div
              key={w.name}
              onClick={() => {
                sound.play('click');
                setSelectedWard(w.rank === 1 ? '11' : w.rank === 2 ? '12' : w.rank === 3 ? '8' : w.rank === 4 ? '9' : '14');
              }}
              className={classNames(
                "p-5 rounded-2xl border transition-all duration-300 cursor-pointer group space-y-4",
                isDark
                  ? "bg-neutral-900/80 backdrop-blur-md border-neutral-800 hover:border-emerald-500/50 hover:shadow-[0_8px_24px_rgba(52,211,153,0.12)]"
                  : "bg-white border-neutral-200 hover:border-emerald-500 shadow-soft hover:shadow-soft-lg"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono font-bold text-xs flex items-center justify-center">
                    #{w.rank}
                  </span>
                  <div>
                    <h3 className={classNames("font-bold text-sm group-hover:text-emerald-500 transition-colors", isDark ? "text-white" : "text-neutral-900")}>
                      {w.name}
                    </h3>
                    <p className={classNames("text-[11px] line-clamp-1", isDark ? "text-neutral-400" : "text-neutral-500")}>{w.area}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  {w.resolvedRate}% SLA
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className={classNames("w-full h-1.5 rounded-full overflow-hidden", isDark ? "bg-neutral-800" : "bg-neutral-200")}>
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                    style={{ width: `${w.resolvedRate}%` }}
                  />
                </div>
                <div className={classNames("flex items-center justify-between text-[11px] font-mono", isDark ? "text-neutral-400" : "text-neutral-500")}>
                  <span>{t('wardRadar.avgSla', 'Avg SLA:')} <strong className={isDark ? "text-white" : "text-neutral-900"}>{w.avgHours}h</strong></span>
                  <span>{w.activeOfficers} {t('wardRadar.fieldEngineers', 'Field Engineers')}</span>
                </div>
              </div>
            </div>
          ))}

          {/* All Wards summary tile */}
          <div className={classNames(
            "p-5 rounded-2xl border flex flex-col justify-between space-y-4",
            isDark
              ? "bg-gradient-to-br from-emerald-950/40 via-neutral-900/90 to-neutral-900 border-emerald-500/30"
              : "bg-gradient-to-br from-emerald-50 via-white to-slate-50 border-emerald-300 shadow-soft"
          )}>
            <div>
              <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs font-bold uppercase">
                <Shield size={16} />
                <span>{t('wardRadar.allCovered', 'ALL 24 BMC WARDS COVERED')}</span>
              </div>
              <h3 className={classNames("font-bold text-base mt-2", isDark ? "text-white" : "text-neutral-950")}>
                {t('wardRadar.citywideEngine', 'Citywide Automated Dispatch Engine')}
              </h3>
              <p className={classNames("text-xs mt-1 leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
                {t('wardRadar.citywideDesc', 'From Colaba (A Ward) to Dahisar (R/N Ward), every municipal zone is live on Kaiser AI with 24/7 automated engineer dispatch.')}
              </p>
            </div>
            <Link
              to="/app/map"
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(52,211,153,0.3)] cursor-pointer"
            >
              <span>{t('wardRadar.exploreGis', 'Explore Ward GIS Telemetry')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: Live Ward Complaints Feed ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#4ade80]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">
                {t('feed.badge', 'MUNICIPAL TELEMETRY STREAM')}
              </span>
            </div>
            <h2 className={classNames("text-2xl sm:text-3xl font-extrabold tracking-tight", isDark ? "text-white" : "text-neutral-950")}>
              {t('hero.liveTickerTitle', 'Live Mumbai Ward Issue Ticker')}
            </h2>
            <p className={classNames("text-xs sm:text-sm", isDark ? "text-neutral-400" : "text-neutral-600")}>
              {t('hero.liveTickerSubtitle', 'Real-time civic grievances submitted across Mumbai municipal wards.')}
            </p>
          </div>

          {/* Search & Ward Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className={classNames("absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-neutral-500" : "text-neutral-400")} size={15} />
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder', 'Search issues or ward...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={classNames(
                  "pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm transition-colors",
                  isDark
                    ? "bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500"
                    : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400"
                )}
              />
            </div>
            <select
              value={selectedWard}
              onChange={(e) => {
                sound.play('click');
                setSelectedWard(e.target.value);
              }}
              className={classNames(
                "py-2 px-3 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm cursor-pointer transition-colors",
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-neutral-200"
                  : "bg-white border-neutral-300 text-neutral-800"
              )}
            >
              <option value="">{t('hero.allWards', `All Mumbai Wards (${MUMBAI_WARDS.length})`)}</option>
              {MUMBAI_WARDS.map((w) => (
                <option key={w.id} value={w.id}>
                  Ward {w.name} ({w.area})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
          <button
            onClick={() => {
              sound.play('click');
              setSelectedCategory('ALL');
            }}
            className={classNames(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              selectedCategory === 'ALL'
                ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_14px_rgba(52,211,153,0.35)]'
                : isDark
                  ? 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 shadow-xs'
            )}
          >
            {t('feed.allCategories', 'All Categories')}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.play('click');
                setSelectedCategory(cat);
              }}
              className={classNames(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
                selectedCategory === cat
                  ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_14px_rgba(52,211,153,0.35)]'
                  : isDark
                    ? 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 shadow-xs'
              )}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="py-16 text-center text-neutral-400 flex flex-col items-center gap-3">
            <RefreshCw className="animate-spin text-emerald-500" size={28} />
            <p className="text-xs font-medium">{t('feed.syncing', 'Synchronizing ward grievances...')}</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className={classNames(
            "rounded-3xl border p-12 text-center space-y-3 transition-colors",
            isDark ? "bg-neutral-900 border-neutral-800 text-neutral-400" : "bg-white border-neutral-200 text-neutral-600 shadow-soft"
          )}>
            <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
            <h3 className={classNames("font-bold text-base", isDark ? "text-white" : "text-neutral-900")}>{t('feed.noIssues', 'No active issues found')}</h3>
            <p className={classNames("text-xs max-w-sm mx-auto", isDark ? "text-neutral-400" : "text-neutral-500")}>
              {t('feed.noIssuesDesc', 'No civic tickets matched your filter criteria. Try choosing a different ward or category.')}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredComplaints.slice(0, 9).map((item, idx) => (
              <Reveal key={item.id} delay={(idx % 3) * 90}>
                <Link to={`/app/complaint/${item.id}`} className="group block h-full">
                  <div className={classNames(
                    "p-5 h-full rounded-2xl flex flex-col justify-between border transition-all duration-200 shadow-md group-hover:-translate-y-0.5",
                    isDark
                      ? "bg-neutral-900/90 border-neutral-800/90 group-hover:border-emerald-500/60 group-hover:shadow-[0_8px_24px_rgba(52,211,153,0.15)]"
                      : "bg-white border-neutral-200 group-hover:border-emerald-500 shadow-soft group-hover:shadow-soft-lg"
                  )}>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CategoryIcon category={item.category} size="sm" />
                          <span className={classNames("text-xs font-bold uppercase tracking-wide", isDark ? "text-neutral-200" : "text-neutral-700")}>
                            {translateCategory(item.category)}
                          </span>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <h3 className={classNames("font-bold text-sm line-clamp-1 group-hover:text-emerald-500 transition-colors", isDark ? "text-white" : "text-neutral-900")}>
                        {item.title}
                      </h3>
                      <p className={classNames("text-xs mt-1.5 line-clamp-2 leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
                        {item.description}
                      </p>
                    </div>

                    <div className={classNames("pt-4 mt-4 border-t space-y-2.5", isDark ? "border-neutral-800/80" : "border-neutral-100")}>
                      <div className={classNames("flex items-center justify-between text-xs", isDark ? "text-neutral-400" : "text-neutral-600")}>
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin size={13} className="text-emerald-500" />
                          Ward #{item.ward}
                        </span>
                        <SeverityBadge level={item.severity} />
                      </div>
                      <div className={classNames("flex items-center justify-between text-[11px] font-mono", isDark ? "text-neutral-500" : "text-neutral-400")}>
                        <span>#{item.id}</span>
                        <span>{formatRelative(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ── SECTION 8: NEW! Civic Gamification & Rewards Showcase ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className={classNames(
          "grid lg:grid-cols-12 gap-8 items-center rounded-3xl border p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all",
          isDark
            ? "bg-neutral-900/90 border-neutral-800"
            : "bg-white border-neutral-200 shadow-soft-xl"
        )}>
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs font-bold uppercase tracking-wider">
              <Award size={15} />
              <span>{t('rewards.badge', 'CITIZEN INCENTIVES & GAMIFICATION')}</span>
            </div>
            <h2 className={classNames("font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight", isDark ? "text-white" : "text-neutral-950")}>
              {t('rewards.title', 'Rewarding Citizens Who Make Mumbai Better')}
            </h2>
            <p className={classNames("text-xs sm:text-sm leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
              {t('rewards.desc', 'Every verified civic report earns you civic reward credits. Top contributors gain municipal badges, climb ward leaderboards, and receive verified digital certificates signed by municipal commissioners.')}
            </p>

            <div className="grid sm:grid-cols-3 gap-3.5 pt-2">
              <div className={classNames("p-4 rounded-xl border text-center space-y-1", isDark ? "bg-neutral-950 border-neutral-800" : "bg-slate-50 border-neutral-200 shadow-xs")}>
                <span className="text-emerald-500 font-mono font-bold text-lg">+50 PTS</span>
                <span className={classNames("text-xs font-medium block", isDark ? "text-neutral-300" : "text-neutral-800")}>{t('rewards.verifiedReport', 'Verified Report')}</span>
                <span className={classNames("text-[10px] block", isDark ? "text-neutral-500" : "text-neutral-400")}>{t('rewards.photoLocationValidated', 'Photo & location validated')}</span>
              </div>
              <div className={classNames("p-4 rounded-xl border text-center space-y-1", isDark ? "bg-neutral-950 border-neutral-800" : "bg-slate-50 border-neutral-200 shadow-xs")}>
                <span className="text-sky-500 font-mono font-bold text-lg">+100 PTS</span>
                <span className={classNames("text-xs font-medium block", isDark ? "text-neutral-300" : "text-neutral-800")}>{t('rewards.criticalHazard', 'Critical Hazard')}</span>
                <span className={classNames("text-[10px] block", isDark ? "text-neutral-500" : "text-neutral-400")}>{t('rewards.hazardDesc', 'Open manhole / Live wire')}</span>
              </div>
              <div className={classNames("p-4 rounded-xl border text-center space-y-1", isDark ? "bg-neutral-950 border-neutral-800" : "bg-slate-50 border-neutral-200 shadow-xs")}>
                <span className="text-amber-500 font-mono font-bold text-lg">TOP 10</span>
                <span className={classNames("text-xs font-medium block", isDark ? "text-neutral-300" : "text-neutral-800")}>{t('rewards.wardCert', 'Ward Certificate')}</span>
                <span className={classNames("text-[10px] block", isDark ? "text-neutral-500" : "text-neutral-400")}>{t('rewards.bmcRecognition', 'Official BMC recognition')}</span>
              </div>
            </div>
          </div>

          {/* Certificate Preview Card */}
          <div className="lg:col-span-5">
            <div className={classNames(
              "rounded-2xl p-6 border-2 border-amber-500/30 shadow-2xl relative space-y-4",
              isDark ? "bg-gradient-to-br from-amber-500/10 via-neutral-950 to-neutral-950" : "bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40"
            )}>
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Award className="text-amber-500" size={20} />
                  <span className="font-serif tracking-widest text-xs font-bold text-amber-600 dark:text-amber-300 uppercase">{t('rewards.meritTitle', 'MUNICIPAL CIVIC MERIT')}</span>
                </div>
                <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400/80">BMC-2026-A482</span>
              </div>

              <div className="text-center py-2 space-y-1.5">
                <span className={classNames("text-[11px] uppercase tracking-widest block font-mono", isDark ? "text-neutral-400" : "text-neutral-500")}>{t('rewards.presentedTo', 'PRESENTED TO')}</span>
                <h4 className={classNames("font-serif text-lg sm:text-xl font-bold", isDark ? "text-amber-100" : "text-neutral-900")}>Priya Nair (Ward 8 G/N)</h4>
                <p className={classNames("text-[11px] max-w-xs mx-auto", isDark ? "text-neutral-400" : "text-neutral-600")}>
                  {t('rewards.certBio', 'For outstanding civic vigilance and contributing to the timely resolution of 34 verified community hazards.')}
                </p>
              </div>

              <div className={classNames("pt-3 border-t border-amber-500/20 flex items-center justify-between text-[10px] font-mono", isDark ? "text-neutral-400" : "text-neutral-500")}>
                <span>{t('rewards.seal', 'SEAL OF BMC COMMISSIONER')}</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <Check size={12} /> {t('rewards.verifiedHash', 'VERIFIED HASH')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: NEW! Frequently Asked Questions (Interactive Accordion) ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto px-4 mb-10">
          <p className="text-xs font-mono font-bold tracking-[.3em] text-emerald-500 uppercase flex items-center justify-center gap-2">
            <HelpCircleIcon />
            {t('faq.eyebrow', 'QUESTIONS & ANSWERS')}
          </p>
          <h2 className={classNames("font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-2", isDark ? "text-white" : "text-neutral-950")}>
            {t('faq.title', 'Frequently Asked Questions')}
          </h2>
        </Reveal>

        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={classNames(
                  "rounded-2xl border transition-all duration-300 overflow-hidden",
                  isDark ? "bg-neutral-900/80 border-neutral-800" : "bg-white border-neutral-200 shadow-soft"
                )}
              >
                <button
                  onClick={() => {
                    sound.play('click');
                    setOpenFaq(isOpen ? null : idx);
                  }}
                  className={classNames(
                    "w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors",
                    isDark ? "hover:bg-neutral-800/40" : "hover:bg-slate-50"
                  )}
                >
                  <span className={classNames("font-bold text-sm sm:text-base", isDark ? "text-white" : "text-neutral-900")}>
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-emerald-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className={classNames(
                    "px-5 pb-5 text-xs sm:text-sm leading-relaxed border-t pt-3 animate-fade-in",
                    isDark ? "text-neutral-300 border-neutral-800/60" : "text-neutral-600 border-neutral-100 bg-slate-50/50"
                  )}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 10: Emergency Response Helpline Protocol ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-10 border border-neutral-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              {t('emergency.protocol', '24/7 BMC RAPID RESPONSE PROTOCOL')}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('hero.emergencyTitle', 'Mumbai Municipal Disaster & Emergency Cell')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              {t('hero.emergencyDesc', 'For high-water flooding, building subsidence, mains burst, or live wire emergencies requiring immediate on-ground rescue dispatch.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 w-full lg:w-auto">
            {/* 1. BMC Disaster 1916 */}
            <a
              href="tel:1916"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-95 border border-red-500/50"
            >
              <div className="flex items-center gap-2">
                <Phone size={15} className="shrink-0" />
                <span>{t('hero.callDisaster', 'BMC Disaster 1916')}</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded">24x7</span>
            </a>

            {/* 2. Medical / Ambulance 108 */}
            <a
              href="tel:108"
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 hover:border-neutral-600 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Phone size={15} className="shrink-0 text-emerald-400" />
                <span>{t('emergency.medical108', 'Ambulance 108')}</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">EMS</span>
            </a>

            {/* 3. Mumbai Police 100 */}
            <a
              href="tel:100"
              className="bg-sky-950/90 hover:bg-sky-900 text-sky-100 border border-sky-800/80 hover:border-sky-600 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Phone size={15} className="shrink-0 text-sky-400" />
                <span>{t('emergency.police100', 'Mumbai Police 100')}</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded">POLICE</span>
            </a>

            {/* 4. Power & Grid Fire 1912 */}
            <a
              href="tel:1912"
              className="bg-amber-950/90 hover:bg-amber-900 text-amber-100 border border-amber-800/80 hover:border-amber-600 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Phone size={15} className="shrink-0 text-amber-400" />
                <span>{t('emergency.grid1912', 'Power & Grid Fire 1912')}</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">GRID</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

const HelpCircleIcon = () => (
  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
