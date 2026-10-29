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
import { formatRelative } from '../utils/formatters';
import { sound } from '../utils/soundEffects';
import { HeroSlider } from '../components/common/HeroSlider';
import { WaterTelemetrySection } from '../components/common/WaterTelemetrySection';
import { Reveal, CountUp } from '../components/common/Motion';

export const LandingPage = () => {
  const { language, t, translateCategory } = useLanguage();
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
  const [openFaq, setOpenFaq] = useState(0);

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

  const handleSimulate = () => {
    sound.play('click');
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      sound.play('pop');
    }, 1200);
  };

  const SIM_SCENARIOS = {
    mr: {
      langLabel: 'मराठी (Marathi)',
      audioText: 'अंधेरी पूर्व स्टेशनजवळ वेस्टर्न एक्सप्रेस हायवेवर मोठा खड्डा पडला आहे, गाड्या घसरून अपघात होण्याचा धोका आहे.',
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
    <div className="space-y-16 sm:space-y-24 pb-24 overflow-hidden relative bg-neutral-950 text-neutral-100">
      
      {/* ── SECTION 1: Full-Bleed Animated Hero Section (Edge-to-Edge) ── */}
      <HeroSlider stats={cityStats} weather={weatherData} />

      {/* ── SECTION 2: Ward Marquee Stream (Transition Ribbon) ── */}
      <div className="overflow-hidden border-y border-emerald-500/20 bg-neutral-900/95 backdrop-blur-md py-3.5 shadow-md -mt-16 sm:-mt-24 relative z-20" aria-hidden>
        <div className="flex w-max gap-3.5" style={{ animation: 'marqueeX 45s linear infinite' }}>
          {[...MUMBAI_WARDS, ...MUMBAI_WARDS].map((w, i) => (
            <span key={i} className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-800/90 border border-emerald-500/30 text-xs font-semibold text-emerald-300 whitespace-nowrap shadow-xs">
              <MapPin size={12} className="text-emerald-400" /> Ward {w.name} · {w.area}
            </span>
          ))}
        </div>
      </div>

      {/* ── SECTION 3: Weather Intelligence Bar ── */}
      {weatherData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-neutral-900/90 via-neutral-900/95 to-neutral-900/90 border border-emerald-500/25 rounded-3xl p-5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                <CloudRain size={20} />
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-neutral-200">
                <span className="font-bold text-white tracking-wide">Live Civic Telemetry:</span>
                <span className="text-emerald-300 font-semibold">
                  AQI {weatherData.usAqi ?? weatherData.aqi} ({weatherData.aqiCategory || 'Moderate'})
                  {weatherData.europeanAqi && <span className="text-neutral-400 font-normal"> · EAQI {weatherData.europeanAqi}</span>}
                </span>
                <span className="text-neutral-500 hidden sm:inline">·</span>
                <span className="text-neutral-200 font-mono">
                  {weatherData.temperature}°C {weatherData.condition}
                  {weatherData.apparentTemperature && <span className="text-neutral-400 font-normal"> (Feels {weatherData.apparentTemperature}°C)</span>}
                </span>
                <span className="text-neutral-500 hidden sm:inline">·</span>
                <span className="text-neutral-400">{weatherData.source || 'Open-Meteo Live Telemetry'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.2)]">
                LIVE TELEMETRY
              </span>
              <Link to="/app/map" className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:underline">
                Open Map <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 3.5: BMC Water & Flood Command Telemetry (Dedicated High-Tech Water UI) ── */}
      <WaterTelemetrySection />

      {/* ── SECTION 4: Zero-Touch Triage Architecture & Interactive Simulation ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto px-4 mb-10">
          <p className="text-xs font-mono font-bold tracking-[.3em] text-emerald-400 uppercase flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
            {t('triage.eyebrow', 'Zero-Touch Triage Architecture')}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mt-2">
            {t('triage.title', 'From photo to dispatch in seconds')}
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-2.5 leading-relaxed">
            {t('triage.subtitle', 'Watch how Kaiser AI transforms raw citizen reports into prioritized, geolocated municipal work orders.')}
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Feature Walkthrough */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="space-y-3.5">
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 backdrop-blur-md border border-neutral-800 shadow-xl hover:border-emerald-500/60 hover:shadow-[0_8px_30px_rgba(52,211,153,0.12)] transition-all duration-300 group flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-neutral-950 transition-all duration-300">
                  <Activity size={22} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    {t('triage.step1Title', '1. Multimodal Edge Capture & Telemetry')}
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">INSTANT</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
                    {t('triage.step1Desc', 'Citizens submit photos, voice notes in Marathi, Hindi, or English. Precise GPS coordinates and timestamp are bound instantaneously.')}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 backdrop-blur-md border border-neutral-800 shadow-xl hover:border-emerald-500/60 hover:shadow-[0_8px_30px_rgba(52,211,153,0.12)] transition-all duration-300 group flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-neutral-950 transition-all duration-300">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    {t('triage.step2Title', '2. YOLOv8 Visual Defect & Severity Scoring')}
                    <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full">98.4% CONF</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
                    {t('triage.step2Desc', 'Our neural network inspects road fissures, open manholes, and illegal dump sites, generating a calibrated 0–100 urgency score.')}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 backdrop-blur-md border border-neutral-800 shadow-xl hover:border-emerald-500/60 hover:shadow-[0_8px_30px_rgba(52,211,153,0.12)] transition-all duration-300 group flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all duration-300">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    {t('triage.step3Title', '3. Ward Engineer Dispatch & Automated SLA Tracking')}
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">SLA 24H</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
                    {t('triage.step3Desc', 'Direct routing to the designated BMC ward desk with live SLA countdowns, auto-escalation triggers, and public resolution audits.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="pt-2 grid grid-cols-3 gap-3.5">
              <div className="bg-neutral-900/90 backdrop-blur-sm p-4 rounded-2xl border border-neutral-800 shadow-md hover:-translate-y-1 hover:border-emerald-500/50 transition-all duration-300">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  <CountUp to={cityStats?.totalComplaints || 14827} />
                </div>
                <div className="text-[11px] text-neutral-400 font-semibold mt-0.5">{t('hero.statReported', 'Issues Reported')}</div>
              </div>
              <div className="bg-neutral-900/90 backdrop-blur-sm p-4 rounded-2xl border border-neutral-800 shadow-md hover:-translate-y-1 hover:border-emerald-500/50 transition-all duration-300">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  <CountUp to={Number(cityStats?.resolvedRate) || 91.4} decimals={1} suffix="%" />
                </div>
                <div className="text-[11px] text-neutral-400 font-semibold mt-0.5">{t('hero.statResolved', 'Resolution Rate')}</div>
              </div>
              <div className="bg-neutral-900/90 backdrop-blur-sm p-4 rounded-2xl border border-neutral-800 shadow-md hover:-translate-y-1 hover:border-sky-500/50 transition-all duration-300">
                <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
                  <CountUp to={cityStats?.avgResolutionDays ? cityStats.avgResolutionDays * 24 : 18.4} decimals={1} suffix="h" />
                </div>
                <div className="text-[11px] text-neutral-400 font-semibold mt-0.5">{t('hero.statTime', 'Avg Resolution SLA')}</div>
              </div>
            </div>
          </div>

          {/* Right Hero Interactive AI Terminal Preview */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-900/95 backdrop-blur-xl rounded-3xl p-6 border border-neutral-800 shadow-2xl relative overflow-hidden group">
              {/* Header Status Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Activity className="animate-pulse" size={17} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">AI Triage & CV Engine</span>
                    <div className="text-[10px] text-neutral-400 font-mono">YOLOv8-Municipal v3.2</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                  LIVE MODEL ONLINE
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
                      POTHOLE · 98.4%
                    </span>
                    <span className="absolute -bottom-3 right-2 bg-rose-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      SEVERITY 85/100
                    </span>
                  </div>

                  {/* Telemetry pill */}
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-neutral-300 font-mono text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
                    <MapPin size={11} className="text-emerald-400" />
                    <span>GPS: 19.1136° N, 72.8697° E</span>
                  </div>
                </div>

                {/* Smart Dispatch Routing Ticket */}
                <div className="bg-neutral-950/90 rounded-2xl p-4 border border-neutral-800 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px]">
                    <span>DISPATCH TARGET</span>
                    <span className="text-emerald-400 font-bold">AUTO-ASSIGNED</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Shield size={15} className="text-emerald-400" />
                    <span>K/E Ward Assistant Engineer (Roads)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
                    <span>SLA Turnaround: <strong className="text-white">24 Hours</strong></span>
                    <span>Ward #8 · Andheri East</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Test Action */}
              <div className="mt-4 pt-3.5 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Multilingual Voice & Photo Triage</span>
                <Link to="/app/report" className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline">
                  Launch Interactive Report <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: NEW! Interactive Multilingual Voice & AI Triage Simulator ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-emerald-500/20 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-neutral-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                {t('simulator.eyebrow', 'TRY IT LIVE IN THE BROWSER')}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {t('simulator.title', 'Multilingual AI Voice & Vision Simulator')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                {t('simulator.subtitle', 'Test how Kaiser AI extracts civic defects from conversational Marathi, Hindi, and English.')}
              </p>
            </div>

            {/* Language Selector Pills */}
            <div className="flex items-center gap-2 bg-neutral-950/80 p-1.5 rounded-2xl border border-neutral-800 shrink-0">
              {['mr', 'hi', 'en'].map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    sound.play('click');
                    setSimLang(l);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    simLang === l
                      ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_14px_rgba(52,211,153,0.4)]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
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
              <div className="rounded-2xl bg-neutral-950 p-5 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span className="flex items-center gap-2">
                    <Mic size={15} className="text-emerald-400" />
                    SIMULATED AUDIO INTAKE
                  </span>
                  <span className="text-emerald-400 font-bold">{currentScenario.langLabel}</span>
                </div>

                {/* Animated Sound Waveform */}
                <div className="flex items-center justify-center gap-1.5 h-16 bg-neutral-900/60 rounded-xl px-4 border border-white/5">
                  {[24, 48, 36, 60, 44, 28, 52, 64, 40, 56, 32, 48, 62, 38, 26].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-300 ${
                        isSimulating
                          ? 'bg-emerald-400 animate-wave-bar'
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
                <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 text-xs font-medium text-neutral-200 italic leading-relaxed">
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
                      Analyzing Audio & Extracting Intent...
                    </>
                  ) : (
                    <>
                      <Play size={15} />
                      Simulate Speech-to-Dispatch Triage
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Neural Extraction Output Card */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl bg-neutral-950 p-6 border border-emerald-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs font-mono">
                  <span className="text-neutral-400">AI EXTRACTION RESULT</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Zap size={14} /> CONFIDENCE: {currentScenario.confidence}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] font-mono uppercase block">DETECTED CATEGORY</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{currentScenario.category}</span>
                  </div>
                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] font-mono uppercase block">CALIBRATED SEVERITY</span>
                    <span className="font-bold text-rose-400 text-sm mt-0.5 block">{currentScenario.severity}/100 ({currentScenario.urgency})</span>
                  </div>
                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] font-mono uppercase block">ROUTED MUNICIPAL WARD</span>
                    <span className="font-bold text-sky-400 text-xs mt-0.5 block">{currentScenario.ward}</span>
                  </div>
                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] font-mono uppercase block">SLA GUARANTEE</span>
                    <span className="font-bold text-emerald-400 text-xs mt-0.5 block">{currentScenario.sla} Turnaround</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Ready to report a real Mumbai issue?</span>
                  <Link
                    to="/app/report"
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
                  >
                    Open Live Report Form <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: NEW! Mumbai 24 Wards Performance Matrix & SLA Leaderboard ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase mb-2">
              <BarChart3 size={15} />
              {t('wardRadar.eyebrow', 'MUNICIPAL PERFORMANCE MATRIX')}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {t('wardRadar.title', 'Mumbai 24 Wards Live Performance Matrix')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              {t('wardRadar.subtitle', 'Real-time turnaround rankings, active engineers on ground, and SLA compliance per ward.')}
            </p>
          </div>
          <Link
            to="/app/map"
            className="px-5 py-2.5 rounded-xl border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs font-bold flex items-center gap-2 transition-all self-start md:self-auto shrink-0"
          >
            <MapPin size={15} />
            <span>Open 24 Wards GIS Map</span>
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
              className="p-5 rounded-2xl bg-neutral-900/80 backdrop-blur-md border border-neutral-800 hover:border-emerald-500/50 hover:shadow-[0_8px_24px_rgba(52,211,153,0.12)] transition-all duration-300 cursor-pointer group space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                    #{w.rank}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                      {w.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">{w.area}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  {w.resolvedRate}% SLA
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                    style={{ width: `${w.resolvedRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>Avg SLA: <strong className="text-white">{w.avgHours}h</strong></span>
                  <span>{w.activeOfficers} Field Engineers</span>
                </div>
              </div>
            </div>
          ))}

          {/* All Wards summary tile */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-neutral-900/90 to-neutral-900 border border-emerald-500/30 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                <Shield size={16} />
                <span>ALL 24 BMC WARDS COVERED</span>
              </div>
              <h3 className="font-bold text-white text-base mt-2">
                Citywide Automated Dispatch Engine
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                From Colaba (A Ward) to Dahisar (R/N Ward), every municipal zone is live on Kaiser AI with 24/7 automated engineer dispatch.
              </p>
            </div>
            <Link
              to="/app/map"
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(52,211,153,0.3)]"
            >
              <span>Explore Ward GIS Telemetry</span>
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
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                MUNICIPAL TELEMETRY STREAM
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('hero.liveTickerTitle', 'Live Mumbai Ward Issue Ticker')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t('hero.liveTickerSubtitle', 'Real-time civic grievances submitted across Mumbai municipal wards.')}
            </p>
          </div>

          {/* Search & Ward Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder', 'Search issues or ward...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm"
              />
            </div>
            <select
              value={selectedWard}
              onChange={(e) => {
                sound.play('click');
                setSelectedWard(e.target.value);
              }}
              className="py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-semibold text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm cursor-pointer"
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_14px_rgba(52,211,153,0.35)]'
                : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.play('click');
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_14px_rgba(52,211,153,0.35)]'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="py-16 text-center text-neutral-400 flex flex-col items-center gap-3">
            <RefreshCw className="animate-spin text-emerald-400" size={28} />
            <p className="text-xs font-medium">Synchronizing ward grievances...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-12 text-center text-neutral-400 space-y-3">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
            <h3 className="font-bold text-white text-base">No active issues found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No civic tickets matched your filter criteria. Try choosing a different ward or category.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredComplaints.slice(0, 9).map((item, idx) => (
              <Reveal key={item.id} delay={(idx % 3) * 90}>
              <Link to={`/app/complaint/${item.id}`} className="group block h-full">
                <div className="p-5 h-full rounded-2xl flex flex-col justify-between bg-neutral-900/90 border border-neutral-800/90 group-hover:border-emerald-500/60 transition-all duration-200 shadow-md group-hover:shadow-[0_8px_24px_rgba(52,211,153,0.15)] group-hover:-translate-y-0.5">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={item.category} size="sm" />
                        <span className="text-xs font-bold text-neutral-200 uppercase tracking-wide">
                          {translateCategory(item.category)}
                        </span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin size={13} className="text-emerald-400" />
                        Ward #{item.ward}
                      </span>
                      <SeverityBadge level={item.severity} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
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
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-center rounded-3xl bg-neutral-900/90 border border-neutral-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Award size={15} />
              <span>CITIZEN INCENTIVES & GAMIFICATION</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Rewarding Citizens Who Make Mumbai Better
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Every verified civic report earns you civic reward credits. Top contributors gain municipal badges, climb ward leaderboards, and receive verified digital certificates signed by municipal commissioners.
            </p>

            <div className="grid sm:grid-cols-3 gap-3.5 pt-2">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center space-y-1">
                <span className="text-emerald-400 font-mono font-bold text-lg">+50 PTS</span>
                <span className="text-xs text-neutral-300 font-medium block">Verified Report</span>
                <span className="text-[10px] text-neutral-500 block">Photo & location validated</span>
              </div>
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center space-y-1">
                <span className="text-sky-400 font-mono font-bold text-lg">+100 PTS</span>
                <span className="text-xs text-neutral-300 font-medium block">Critical Hazard</span>
                <span className="text-[10px] text-neutral-500 block">Open manhole / Live wire</span>
              </div>
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center space-y-1">
                <span className="text-amber-400 font-mono font-bold text-lg">TOP 10</span>
                <span className="text-xs text-neutral-300 font-medium block">Ward Certificate</span>
                <span className="text-[10px] text-neutral-500 block">Official BMC recognition</span>
              </div>
            </div>
          </div>

          {/* Certificate Preview Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-neutral-950 to-neutral-950 p-6 border-2 border-amber-500/30 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Award className="text-amber-400" size={20} />
                  <span className="font-serif tracking-widest text-xs font-bold text-amber-300 uppercase">MUNICIPAL CIVIC MERIT</span>
                </div>
                <span className="font-mono text-[10px] text-amber-400/80">BMC-2026-A482</span>
              </div>

              <div className="text-center py-2 space-y-1.5">
                <span className="text-[11px] text-neutral-400 uppercase tracking-widest block font-mono">PRESENTED TO</span>
                <h4 className="font-serif text-lg sm:text-xl font-bold text-amber-100">Priya Nair (Ward 8 G/N)</h4>
                <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                  For outstanding civic vigilance and contributing to the timely resolution of 34 verified community hazards.
                </p>
              </div>

              <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                <span>SEAL OF BMC COMMISSIONER</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check size={12} /> VERIFIED HASH
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: NEW! Frequently Asked Questions (Interactive Accordion) ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto px-4 mb-10">
          <p className="text-xs font-mono font-bold tracking-[.3em] text-emerald-400 uppercase flex items-center justify-center gap-2">
            <HelpCircleIcon />
            {t('faq.eyebrow', 'QUESTIONS & ANSWERS')}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-2">
            {t('faq.title', 'Frequently Asked Questions')}
          </h2>
        </Reveal>

        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-neutral-900/80 border border-neutral-800 transition-all duration-300 overflow-hidden"
              >
                <button
                  onClick={() => {
                    sound.play('click');
                    setOpenFaq(isOpen ? null : idx);
                  }}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-800/40 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-white">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-emerald-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3 animate-fade-in">
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
              24/7 BMC RAPID RESPONSE PROTOCOL
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('hero.emergencyTitle', 'Mumbai Municipal Disaster & Emergency Cell')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              {t('hero.emergencyDesc', 'For high-water flooding, building subsidence, mains burst, or live wire emergencies requiring immediate on-ground rescue dispatch.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="tel:1916"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Phone size={16} />
              <span>{t('hero.callDisaster', 'Dial BMC Disaster 1916')}</span>
            </a>
            <a
              href="tel:108"
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 px-5 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer active:scale-95"
            >
              Medical / Ambulance 108
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
