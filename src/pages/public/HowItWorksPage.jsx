// ─── Sovereign Civic Adaptive How It Works Page (Light & Dark) ───────────────────
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, Cpu, CheckCircle2, Shield, ArrowRight,
  Sparkles, Clock, MapPin, Zap, Check, ChevronRight,
  AlertTriangle, Droplets, Trash2, Lightbulb, HelpCircle, ChevronDown, Flame, Layers
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { classNames } from '../../utils/formatters';

export const HowItWorksPage = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState('pothole');
  const [openFaq, setOpenFaq] = useState(null);

  const steps = [
    {
      num: '01',
      step: 'STEP 1 · CAPTURE & PIN',
      title: t('howItWorks.step1Title', 'Citizen Submission & GPS Telemetry'),
      desc: t('howItWorks.step1Desc', 'Snap a high-resolution photo or record a voice note in English, Marathi, or Hindi. Kaiser AI instantly captures sub-meter GPS coordinates on OpenStreetMap and auto-detects your Mumbai municipal ward polygon.'),
      bullets: [
        'Automatic 24-ward boundary detection (e.g. Ward K/E, Andheri East)',
        'Voice grievance transcription in Marathi, Hindi & English',
        'Offline caching mode: report without active 5G connectivity',
      ],
      icon: Camera,
      accent: 'emerald',
      gradient: 'from-emerald-500/20 to-teal-500/5',
      border: 'border-emerald-500/30',
      badge: 'text-emerald-400 bg-emerald-500/15 border-emerald-400/30',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    },
    {
      num: '02',
      step: 'STEP 2 · NEURAL PIPELINE',
      title: t('howItWorks.step2Title', 'OpenAI CLIP Vision & Severity Scoring'),
      desc: t('howItWorks.step2Desc', 'Our multimodal OpenAI CLIP zero-shot vision and ViT authenticity models classify municipal issues, filter non-civic spam or AI deepfakes, and score urgency from 1 to 100 based on hazard size, flood risk, and road traffic hierarchy.'),
      bullets: [
        'OpenAI CLIP zero-shot classification for potholes, garbage dumps, open drains, and streetlights with 94%+ precision',
        'Deep learning ViT synthetic AI image verification to block fake and spam complaints',
        'Dynamic SLA calculation: high-hazard complaints get accelerated 12h-24h turnaround clocks',
      ],
      icon: Cpu,
      accent: 'teal',
      gradient: 'from-teal-500/20 to-sky-500/5',
      border: 'border-teal-500/30',
      badge: 'text-teal-300 bg-teal-500/15 border-teal-400/30',
      iconBg: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    },
    {
      num: '03',
      step: 'STEP 3 · DISPATCH & SLA',
      title: t('howItWorks.step3Title', 'Direct Ward Engineer Assignment'),
      desc: t('howItWorks.step3Desc', 'The ticket routes straight to the mobile portal of the designated Junior Engineer (Roads, Stormwater Drains, or Solid Waste Management) for that municipal ward, completely bypassing clerical delays.'),
      bullets: [
        'Real-time SLA countdown clock visible to citizen and executive engineer',
        'Contractor road repair crew logging with GPS route verification',
        'Auto-escalation to Ward Assistant Commissioner if unattended at 75% SLA',
      ],
      icon: Shield,
      accent: 'sky',
      gradient: 'from-sky-500/20 to-blue-500/5',
      border: 'border-sky-500/30',
      badge: 'text-sky-300 bg-sky-500/15 border-sky-400/30',
      iconBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    },
    {
      num: '04',
      step: 'STEP 4 · AUDIT & CLOSE',
      title: t('howItWorks.step4Title', 'Photo-Verified Resolution & Citizen Sign-off'),
      desc: t('howItWorks.step4Desc', 'A work order cannot be closed with paperwork alone. The ward engineer must upload an after-repair photo from the exact GPS coordinates. The citizen gets notified to review and rate the fix.'),
      bullets: [
        'Side-by-side photographic before/after proof visible on public feed',
        'Citizen 48-hour satisfaction window with one-click re-open button',
        'Verified resolution points awarded to citizen for municipal certificates',
      ],
      icon: CheckCircle2,
      accent: 'purple',
      gradient: 'from-purple-500/20 to-emerald-500/5',
      border: 'border-purple-500/30',
      badge: 'text-purple-300 bg-purple-500/15 border-purple-400/30',
      iconBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    },
  ];

  const DEFECT_MATRIX = [
    {
      id: 'pothole',
      name: 'Pothole & Road Cavity',
      icon: AlertTriangle,
      color: 'amber',
      sla: '24 Hours',
      badgeClass: 'text-amber-500 bg-amber-500/15 border-amber-500/30',
      dept: 'BMC Roads & Traffic Department (AE Roads)',
      aiModel: 'OpenAI CLIP Zero-Shot Surface Texture & Depth Estimator',
      crewEquipment: 'Cold-mix asphalt, vibratory plate compactor, infrared thermal binder',
      auditRequirement: 'Sub-meter before/after photographic overlay verification from identical coordinates',
      description: 'Automated severity scoring factors traffic volume, arterial highway hierarchy, and proximity to schools/hospitals to prevent accidents and vehicular damage.',
    },
    {
      id: 'waterlogging',
      name: 'Waterlogging & Flood Risk',
      icon: Droplets,
      color: 'sky',
      sla: '12 Hours (Monsoon Emergency)',
      badgeClass: 'text-sky-500 bg-sky-500/15 border-sky-500/30',
      dept: 'Stormwater Drains (SWD) Department',
      aiModel: 'Multimodal Flood Boundary Segmentation & Ultrasonic Sump Telemetry',
      crewEquipment: 'Submersible dewatering pumps (1,800 L/s), suction jetting trucks, culvert screens',
      auditRequirement: 'Water recession confirmation & drain desilting completion log',
      description: 'Monsoon-critical flashpoints trigger instant alerts to local dewatering pump stations and emergency flood mitigation teams across all 24 wards.',
    },
    {
      id: 'garbage',
      name: 'Garbage Dump & Waste Overflow',
      icon: Trash2,
      color: 'emerald',
      sla: '24 Hours',
      badgeClass: 'text-emerald-500 bg-emerald-500/15 border-emerald-500/30',
      dept: 'Solid Waste Management (SWM) Department',
      aiModel: 'ViT Waste Volume Estimation & Debris Perimeter Classifier',
      crewEquipment: 'Hydraulic compactor trucks, mechanical street sweepers, disinfectant spray',
      auditRequirement: 'Cleared ground photo & weighbridge transfer slip confirmation',
      description: 'Detects illegal commercial dumping and public bin overflows, dispatching designated compaction vehicles with GPS route tracking.',
    },
    {
      id: 'streetlight',
      name: 'Broken / Dark Streetlights',
      icon: Lightbulb,
      color: 'yellow',
      sla: '48 Hours',
      badgeClass: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
      dept: 'Municipal Electrical & Infrastructure Division',
      aiModel: 'Lux Luminance Defect Analysis & GIS Pole ID Triangulation',
      crewEquipment: 'Hydraulic bucket hoist truck, replacement LED luminaires, circuit breakers',
      auditRequirement: 'Night illumination photographic proof & feeder circuit continuity test',
      description: 'Eliminates dangerous dark spots along pedestrian corridors, arterial roads, and school zones to safeguard citizens at night.',
    },
    {
      id: 'drainage',
      name: 'Open Manholes & Broken Drains',
      icon: Shield,
      color: 'rose',
      sla: '6 Hours (Life-Safety Priority)',
      badgeClass: 'text-rose-500 bg-rose-500/15 border-rose-500/30',
      dept: 'Drainage Engineering & Central Disaster Response Cell',
      aiModel: 'High-Contrast Hole Geometry & Uncovered Sump Edge Detector',
      crewEquipment: 'Heavy-duty ductile iron covers, reflective hazard barriers, safety cordons',
      auditRequirement: 'Immediate hazard cordon within 60 mins + locked lid photo audit',
      description: 'Highest hazard classification in Mumbai. Automatically bypasses standard triage and triggers immediate life-safety dispatch.',
    },
  ];

  const currentDefect = DEFECT_MATRIX.find((d) => d.id === selectedCat) || DEFECT_MATRIX[0];

  const COMPARISONS = [
    {
      stage: '1. Issue Submission',
      traditional: 'Physical ward office visit, paper complaint forms, or long tele-queue delays.',
      kaiser: 'Instant 60-second mobile submission with sub-meter GPS auto-ward polygon detection.',
    },
    {
      stage: '2. Triage & Defect Classification',
      traditional: 'Subjective manual clerk sorting taking 3 to 7 business days to log.',
      kaiser: 'Sub-second OpenAI CLIP Zero-Shot vision classifying defect and 1-100 severity in <2 seconds.',
    },
    {
      stage: '3. Engineering Dispatch',
      traditional: 'Physical registry books hand-delivered to ward officers with zero tracking.',
      kaiser: 'Direct automated mobile routing to designated Ward Junior Engineer with live GPS ticket assignment.',
    },
    {
      stage: '4. Resolution Turnaround (SLA)',
      traditional: '15 to 45 days average turnaround with frequent jurisdiction buck-passing.',
      kaiser: 'Strict 6h to 48h dynamic SLA countdown with auto-escalation to Ward Assistant Commissioner.',
    },
    {
      stage: '5. Verification & Accountability',
      traditional: 'Closed on paper without photographic proof or citizen inspection.',
      kaiser: 'Mandatory before/after photographic audit with 48-hour citizen sign-off & one-click re-open.',
    },
  ];

  const FAQS = [
    {
      q: 'How does Kaiser AI ensure photos are authentic and not downloaded from the internet?',
      a: 'Our Vision Transformer (ViT) pipeline inspects image metadata, EXIF geotags, and synthetic image artifacts, immediately blocking non-civic photos, duplicates, and internet images before tickets are created.',
    },
    {
      q: 'Can I report civic grievances in Marathi or Hindi?',
      a: 'Yes! Citizens can record voice notes or type descriptions in Marathi, Hindi, or English. Kaiser AI multilingual NLP automatically extracts defect categories, severity, and location landmarks.',
    },
    {
      q: 'What happens if a ward engineer fails to resolve an issue within the SLA?',
      a: 'If a ticket reaches 75% of its SLA timer without on-ground movement, an automated amber alert is sent. At 100%, it auto-escalates directly to the Ward Assistant Commissioner and is flagged in red on the public city dashboard.',
    },
    {
      q: 'Do I get notified when my issue is resolved?',
      a: 'Yes, instantly via browser notification, SMS, or dashboard alert with side-by-side photographic proof of the completed repair. You then have 48 hours to confirm satisfaction or request a re-inspection with one click.',
    },
  ];

  return (
    <div className={classNames('w-full min-h-screen select-none pb-24 transition-colors duration-300', isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-slate-50 text-neutral-900')}>
      
      {/* ── Page Hero Header ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className={classNames('inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-widest uppercase', isDark ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800')}>
            <Sparkles size={14} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
            {t('howItWorks.badge', 'STEP-BY-STEP CIVIC PIPELINE')}
          </div>

          <h1 className={classNames('font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight', isDark ? 'text-white' : 'text-neutral-900')}>
            How Kaiser AI Resolves{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
              Mumbai's Grievances
            </span>
          </h1>

          <p className={classNames('text-base sm:text-lg leading-relaxed', isDark ? 'text-white/75' : 'text-neutral-600')}>
            Our sovereign AI pipeline connects citizen photos straight to ward junior engineers with sub-second automated triage and zero bureaucratic delay.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto font-mono text-xs">
            <div className={classNames('p-3 rounded-2xl border backdrop-blur-md transition-colors', isDark ? 'bg-neutral-900/80 border-white/10' : 'bg-white border-neutral-200/80 shadow-soft-sm')}>
              <span className="block text-xl font-bold text-emerald-500">94.2%</span>
              <span className={classNames('text-[11px]', isDark ? 'text-white/50' : 'text-neutral-500')}>AI Precision</span>
            </div>
            <div className={classNames('p-3 rounded-2xl border backdrop-blur-md transition-colors', isDark ? 'bg-neutral-900/80 border-white/10' : 'bg-white border-neutral-200/80 shadow-soft-sm')}>
              <span className="block text-xl font-bold text-teal-500">&lt;24h</span>
              <span className={classNames('text-[11px]', isDark ? 'text-white/50' : 'text-neutral-500')}>Average SLA</span>
            </div>
            <div className={classNames('p-3 rounded-2xl border backdrop-blur-md transition-colors', isDark ? 'bg-neutral-900/80 border-white/10' : 'bg-white border-neutral-200/80 shadow-soft-sm')}>
              <span className="block text-xl font-bold text-sky-500">24 Wards</span>
              <span className={classNames('text-[11px]', isDark ? 'text-white/50' : 'text-neutral-500')}>GIS Mapped</span>
            </div>
            <div className={classNames('p-3 rounded-2xl border backdrop-blur-md transition-colors', isDark ? 'bg-neutral-900/80 border-white/10' : 'bg-white border-neutral-200/80 shadow-soft-sm')}>
              <span className="block text-xl font-bold text-amber-500">100%</span>
              <span className={classNames('text-[11px]', isDark ? 'text-white/50' : 'text-neutral-500')}>Photo Audited</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stepper Pipeline Section ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const isEven = idx % 2 === 1;

          return (
            <div
              key={item.num}
              className={classNames(
                'rounded-3xl p-6 sm:p-8 border backdrop-blur-xl shadow-2xl relative overflow-hidden group transition-all',
                isDark
                  ? `bg-neutral-900/70 ${item.border} hover:bg-neutral-900/85`
                  : 'bg-white border-neutral-200 hover:border-emerald-300 shadow-soft-lg'
              )}
            >
              {/* Background gradient flare */}
              <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${item.gradient} rounded-full blur-3xl pointer-events-none`} />

              <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
                {/* Visual Icon Box */}
                <div className={classNames('md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl border text-center space-y-3', isEven ? 'md:order-2' : '', isDark ? 'bg-neutral-950/70 border-white/10' : 'bg-neutral-50 border-neutral-200')}>
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-lg ${item.iconBg}`}>
                    <Icon size={32} />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border tracking-widest ${item.badge}`}>
                    {item.step}
                  </span>
                  <span className={classNames('font-mono text-3xl font-extrabold', isDark ? 'text-white/90' : 'text-neutral-900')}>
                    {item.num}
                  </span>
                </div>

                {/* Content Box */}
                <div className={`md:col-span-8 space-y-4 ${isEven ? 'md:order-1' : ''}`}>
                  <h3 className={classNames('font-display text-2xl sm:text-3xl font-bold tracking-tight', isDark ? 'text-white' : 'text-neutral-900')}>
                    {item.title}
                  </h3>
                  <p className={classNames('text-sm sm:text-base leading-relaxed', isDark ? 'text-white/75' : 'text-neutral-600')}>
                    {item.desc}
                  </p>
                  <ul className={classNames('space-y-2 text-xs sm:text-sm', isDark ? 'text-white/60' : 'text-neutral-700')}>
                    {item.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-2.5">
                        <Check size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── SECTION: Interactive Defect Triage & SLA Matrix (Replaces Hotline Strip) ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className={classNames(
          'rounded-3xl p-6 sm:p-10 border backdrop-blur-2xl relative overflow-hidden transition-all',
          isDark
            ? 'bg-gradient-to-b from-neutral-900/90 to-neutral-950 border-emerald-500/25 shadow-2xl'
            : 'bg-white border-neutral-200 shadow-soft-xl'
        )}>
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <div className={classNames(
              'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border',
              isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
            )}>
              <Layers size={13} />
              <span>AUTOMATED MUNICIPAL DISPATCH ARCHITECTURE</span>
            </div>
            <h2 className={classNames('font-display text-2xl sm:text-3xl font-extrabold tracking-tight', isDark ? 'text-white' : 'text-neutral-900')}>
              How Kaiser AI Triages Mumbai's 5 Core Civic Defects
            </h2>
            <p className={classNames('text-xs sm:text-sm leading-relaxed', isDark ? 'text-white/70' : 'text-neutral-600')}>
              Click each civic hazard category to inspect the underlying neural vision model, responsible municipal ward department, equipment dispatch, and verified SLA countdown.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {DEFECT_MATRIX.map((cat) => {
              const Icon = cat.icon;
              const active = cat.id === selectedCat;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.play('click');
                    setSelectedCat(cat.id);
                  }}
                  className={classNames(
                    'flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95',
                    active
                      ? isDark
                        ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]'
                      : isDark
                        ? 'bg-neutral-800/80 hover:bg-neutral-800 text-white/80 hover:text-white border border-white/10'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 border border-neutral-200'
                  )}
                >
                  <Icon size={14} className={active ? 'text-neutral-950' : 'text-neutral-400'} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Category Detail Panel */}
          <div className={classNames(
            'rounded-2xl p-6 sm:p-8 border transition-all animate-fade-in relative overflow-hidden',
            isDark ? 'bg-neutral-950/80 border-white/10' : 'bg-slate-50/80 border-neutral-200'
          )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className={classNames('w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm', isDark ? 'bg-neutral-900 border-white/15' : 'bg-white border-neutral-200')}>
                  <currentDefect.icon size={24} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                </div>
                <div>
                  <h3 className={classNames('font-display text-lg sm:text-xl font-bold', isDark ? 'text-white' : 'text-neutral-900')}>
                    {currentDefect.name}
                  </h3>
                  <span className={classNames('text-xs font-mono font-medium', isDark ? 'text-white/60' : 'text-neutral-500')}>
                    Municipal Ward Department: <strong className={isDark ? 'text-white' : 'text-neutral-800'}>{currentDefect.dept}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={classNames('text-[11px] font-mono font-bold px-3 py-1.5 rounded-full border shadow-xs tracking-wider uppercase', currentDefect.badgeClass)}>
                  Target SLA: {currentDefect.sla}
                </span>
              </div>
            </div>

            <p className={classNames('text-xs sm:text-sm leading-relaxed mt-4', isDark ? 'text-white/80' : 'text-neutral-700')}>
              {currentDefect.description}
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-neutral-200 dark:border-white/10 text-xs">
              <div className={classNames('p-3.5 rounded-xl border', isDark ? 'bg-neutral-900/60 border-white/10' : 'bg-white border-neutral-200')}>
                <span className={classNames('block font-mono text-[10px] uppercase font-bold tracking-wider mb-1', isDark ? 'text-white/50' : 'text-neutral-500')}>
                  Neural Vision Model
                </span>
                <span className={classNames('font-medium leading-snug block', isDark ? 'text-white/90' : 'text-neutral-900')}>
                  {currentDefect.aiModel}
                </span>
              </div>

              <div className={classNames('p-3.5 rounded-xl border', isDark ? 'bg-neutral-900/60 border-white/10' : 'bg-white border-neutral-200')}>
                <span className={classNames('block font-mono text-[10px] uppercase font-bold tracking-wider mb-1', isDark ? 'text-white/50' : 'text-neutral-500')}>
                  Dispatched Crew Gear
                </span>
                <span className={classNames('font-medium leading-snug block', isDark ? 'text-white/90' : 'text-neutral-900')}>
                  {currentDefect.crewEquipment}
                </span>
              </div>

              <div className={classNames('p-3.5 rounded-xl border', isDark ? 'bg-neutral-900/60 border-white/10' : 'bg-white border-neutral-200')}>
                <span className={classNames('block font-mono text-[10px] uppercase font-bold tracking-wider mb-1', isDark ? 'text-white/50' : 'text-neutral-500')}>
                  Mandatory Audit Proof
                </span>
                <span className={classNames('font-medium leading-snug block', isDark ? 'text-white/90' : 'text-neutral-900')}>
                  {currentDefect.auditRequirement}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: Traditional BMC vs. Kaiser AI Comparison Matrix ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className={classNames(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border',
            isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
          )}>
            <Clock size={13} />
            <span>MUNICIPAL TRANSFORMATION BENCHMARK</span>
          </div>
          <h2 className={classNames('font-display text-2xl sm:text-3xl font-extrabold tracking-tight', isDark ? 'text-white' : 'text-neutral-900')}>
            Traditional BMC Grievance System vs. Kaiser AI
          </h2>
          <p className={classNames('text-xs sm:text-sm leading-relaxed', isDark ? 'text-white/70' : 'text-neutral-600')}>
            How our automated sovereign pipeline eliminates bureaucratic friction, jurisdiction dead-ends, and unverified paperwork closures.
          </p>
        </div>

        <div className={classNames(
          'rounded-3xl border overflow-hidden shadow-2xl backdrop-blur-xl',
          isDark ? 'bg-neutral-900/80 border-white/10' : 'bg-white border-neutral-200'
        )}>
          <div className="grid grid-cols-12 text-xs font-mono font-bold uppercase tracking-wider p-4 border-b border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-950/70">
            <div className="col-span-3 text-neutral-500 dark:text-neutral-400">Pipeline Stage</div>
            <div className="col-span-4 text-rose-600 dark:text-rose-400">Legacy Municipal System</div>
            <div className="col-span-5 text-emerald-600 dark:text-emerald-400">Kaiser AI Sovereign Pipeline</div>
          </div>

          <div className="divide-y divide-neutral-200 dark:divide-white/10 text-xs sm:text-sm">
            {COMPARISONS.map((row, i) => (
              <div key={i} className="grid grid-cols-12 p-4 sm:p-5 items-start gap-3 hover:bg-neutral-500/5 transition-colors">
                <div className={classNames('col-span-3 font-semibold text-xs font-mono', isDark ? 'text-white/80' : 'text-neutral-900')}>
                  {row.stage}
                </div>
                <div className={classNames('col-span-4 text-xs leading-relaxed', isDark ? 'text-rose-300/80' : 'text-rose-700')}>
                  {row.traditional}
                </div>
                <div className={classNames('col-span-5 text-xs font-medium leading-relaxed flex items-start gap-2', isDark ? 'text-emerald-300' : 'text-emerald-800')}>
                  <Check size={14} className="shrink-0 mt-0.5 text-emerald-500" />
                  <span>{row.kaiser}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: Frequently Asked Questions ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className={classNames(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border',
            isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
          )}>
            <HelpCircle size={13} />
            <span>COMMONLY ASKED QUESTIONS</span>
          </div>
          <h2 className={classNames('font-display text-2xl sm:text-3xl font-extrabold tracking-tight', isDark ? 'text-white' : 'text-neutral-900')}>
            Frequently Asked Questions
          </h2>
          <p className={classNames('text-xs sm:text-sm leading-relaxed', isDark ? 'text-white/70' : 'text-neutral-600')}>
            Everything you need to know about our municipal AI validation, ward SLA countdowns, and resolution proof.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={classNames(
                  'rounded-2xl border transition-all overflow-hidden',
                  isDark
                    ? isOpen ? 'bg-neutral-900/90 border-emerald-500/40 shadow-lg' : 'bg-neutral-900/50 border-white/10 hover:border-white/20'
                    : isOpen ? 'bg-white border-emerald-500/40 shadow-md' : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs'
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    setOpenFaq(isOpen ? null : idx);
                  }}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <span className={classNames('font-bold text-sm sm:text-base', isDark ? 'text-white' : 'text-neutral-900')}>
                    {faq.q}
                  </span>
                  <ChevronDown size={18} className={classNames('shrink-0 text-emerald-500 transition-transform duration-200', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className={classNames('px-4 sm:px-5 pb-5 text-xs sm:text-sm leading-relaxed border-t border-neutral-200 dark:border-white/10 pt-3', isDark ? 'text-white/70' : 'text-neutral-600')}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Ready to Report CTA ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className={classNames('rounded-3xl p-8 sm:p-12 border text-center space-y-6 backdrop-blur-2xl relative overflow-hidden transition-colors', isDark ? 'bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900 border-emerald-500/30 shadow-[0_0_50px_rgba(52,211,153,0.15)]' : 'bg-white border-neutral-200 shadow-soft-xl')}>
          
          <div className="absolute top-0 right-1/4 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <h2 className={classNames('font-display text-2xl sm:text-4xl font-extrabold', isDark ? 'text-white' : 'text-neutral-900')}>
            Have a civic issue you want fixed today?
          </h2>
          <p className={classNames('text-sm sm:text-base max-w-xl mx-auto', isDark ? 'text-white/70' : 'text-neutral-600')}>
            It takes under 60 seconds to upload a photo and mobilize your local ward engineering crew.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/app/report"
              onClick={() => sound.play('click')}
              className="glow-btn px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs tracking-widest uppercase flex items-center gap-2 hover:scale-105 active:scale-95 shadow-[0_0_24px_rgba(52,211,153,0.4)] transition-all cursor-pointer"
            >
              <span>Report Civic Issue Now</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/app/map"
              onClick={() => sound.play('click')}
              className={classNames('px-8 py-4 rounded-full border font-bold text-xs tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer', isDark ? 'border-white/20 hover:bg-white/10 text-white' : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800')}
            >
              <span>Explore Live Ward Map</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
