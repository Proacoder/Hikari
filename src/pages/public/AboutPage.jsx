// ─── Sovereign Civic Adaptive About Page (Light & Dark) ─────────────────────────
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Award, Building2, CheckCircle2,
  Cpu, Zap, ChevronDown, AlertTriangle, ArrowRight,
  Sparkles, FileCheck2, Compass, Layers, Lock, Code, Check
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { classNames } from '../../utils/formatters';

export const AboutPage = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [activePillar, setActivePillar] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { label: t('about.wardsCovered', 'Administrative Wards'), value: '24', subtext: t('about.wardsSubtext', 'Colaba to Dahisar & Mulund') },
    { label: t('about.accuracy', 'AI Classification Accuracy'), value: '94.2%', subtext: t('about.accuracySubtext', 'Trained on 60,000+ urban images') },
    { label: t('about.sla', 'Average Emergency SLA'), value: '<24h', subtext: t('about.slaSubtext', 'Monsoon hazards & open manholes') },
    { label: t('about.triaged', 'Civic Grievances Triaged'), value: '14,800+', subtext: t('about.triagedSubtext', 'Sub-meter GPS pinpointed') },
  ];

  const pillars = [
    {
      id: 'vision',
      icon: Cpu,
      title: 'OpenAI CLIP Vision & Authenticity Inspection',
      tag: 'Multimodal AI & ViT Engine',
      description: 'OpenAI CLIP zero-shot multimodal vision and ViT synthetic image detectors identify potholes, garbage overflow, water mains, and exposed electrical hazards while rejecting spam, indoor photos, and AI deepfakes.',
      bullets: [
        'OpenAI CLIP zero-shot semantic visual classification across 5 municipal defect domains',
        'Swin/ViT deepfake detector rejecting AI-generated fake grievance uploads',
        'Smart spam filter blocking selfies, memes, indoor rooms, and non-civic photos'
      ],
      badgeColor: 'emerald'
    },
    {
      id: 'geospatial',
      icon: Compass,
      title: 'Sub-Meter Geospatial Ward Routing',
      tag: 'OpenStreetMap GIS',
      description: 'No more confusing administrative jurisdictions. Kaiser AI matches exact citizen GPS coordinates against official BMC 24-ward polygon boundaries in real time.',
      bullets: [
        'Automatic routing to designated Junior Engineer (Roads, SWD, or SWM)',
        'Zero vendor lock-in utilizing open Leaflet and OpenStreetMap GIS',
        'Ward-level heatmaps highlighting recurring infrastructure hotspots'
      ],
      badgeColor: 'sky'
    },
    {
      id: 'priority',
      icon: Zap,
      title: 'Dynamic Monsoon & Risk Matrix',
      tag: 'Algorithmic Triage',
      description: 'Not all potholes are created equal. Kaiser AI computes an algorithmic risk score (1 to 100) taking proximity to schools, hospitals, arterial highways, and IMD rainfall into account.',
      bullets: [
        'Priority elevation for Western & Eastern Express Highway bottlenecks',
        'Real-time IMD radar rainfall integration during Mumbai monsoons',
        'Escalation triggers when high-severity hazards approach SLA breach'
      ],
      badgeColor: 'amber'
    },
    {
      id: 'verification',
      icon: FileCheck2,
      title: 'Tamper-Proof Photo Resolution Audit',
      tag: 'Verifiable Proof',
      description: 'Ending the era of paper closures. Ward officers must upload timestamped, geolocated photographic proof of the completed repair before a ticket can be closed.',
      bullets: [
        'Side-by-side before and after resolution comparison on citizen feed',
        '48-hour citizen validation window with one-click re-open if unsatisfied',
        'Audit-grade performance metrics feeding into ward officer leaderboards'
      ],
      badgeColor: 'teal'
    }
  ];

  const comparisons = [
    {
      metric: 'Reporting Channel',
      traditional: 'Paper registers, clogged telephone helplines, or Twitter mentions lost in noise',
      kaiser: 'Instant mobile PWA with sub-meter GPS pin, photo capture, and voice notes in Marathi/Hindi/English'
    },
    {
      metric: 'Triage & Categorization',
      traditional: 'Manual sorting by clerk taking 2 to 5 days before reaching the engineering division',
      kaiser: 'Sub-second AI neural categorization and automated dispatch to the assigned ward engineer'
    },
    {
      metric: 'Priority Allocation',
      traditional: 'First-come, first-served or influencer-driven escalation regardless of danger level',
      kaiser: 'Algorithmic 1-100 severity scoring factoring pedestrian footfall, hospital routes, and monsoon risk'
    },
    {
      metric: 'Resolution Transparency',
      traditional: 'Opaque "Closed" status without verifiable proof or citizen notification',
      kaiser: 'Mandatory geolocated after-repair photo proof with citizen satisfaction ratings'
    }
  ];

  const team = [
    {
      name: 'Ayush Barve',
      role: 'Chief AI Architect & Principal Systems Lead',
      domain: 'Vision-Language Transformers, Autonomous NLP & Scalable Backend',
      bio: 'Pioneered the core intelligence framework and high-performance backend infrastructure powering Kaiser AI. Architected the complete 3-tier deep learning intelligence suite: zero-shot OpenAI CLIP multimodal hazard recognition with sub-second spam rejection, high-throughput Swin/ViT deepfake authenticity verification, and Sentence-BERT + DBSCAN semantic deduplication clustering. Engineered the ultra-low latency, concurrent FastAPI microservices backbone with strict ACID database integrity, automated SLA escalation algorithms, and production-grade municipal resilience.',
      initials: 'AB',
      badge: 'Lead AI Architect'
    },
    {
      name: 'Dharmik Desai',
      role: 'Frontend Architect & Geospatial Systems Lead',
      domain: 'Interactive GIS & Multilingual Voice UX',
      bio: 'Spearheaded the sovereign frontend architecture and interactive GIS telemetry engine powering Kaiser AI across desktop and field devices. Designed the high-performance Leaflet 24-ward geospatial command map with sub-meter point-in-polygon ward routing, dynamic incident clustering, and real-time civic heatmaps. Engineered the accessible Web Speech audio grievance pipeline with real-time waveform visualization supporting conversational Marathi, Hindi, and English. Implemented the responsive theme architecture, tactile micro-interactions, spotlight command palette (Ctrl+K), and mobile-first field ergonomics to ensure inclusive civic access for all Mumbai residents.',
      initials: 'DD',
      badge: 'Geospatial & UI Lead'
    },
    {
      name: 'Harsh Mane',
      role: 'Cloud API & Systems Integration Lead',
      domain: 'Municipal APIs & Multi-Portal Architecture',
      bio: 'Architected the robust cloud integration fabric, external telemetry services, and multi-tier municipal portal ecosystem powering Kaiser AI. Integrated the NVIDIA NIM civic LLM assistant, real-time Open-Meteo weather telemetry, Santacruz IMD radar streaming, and automated AQI monitoring pipelines. Engineered the role-based multi-portal architecture spanning Citizen, Ward Officer, and Municipal HQ command interfaces with strict DPDP Act 2023 privacy redaction, cryptographic JWT session security, and automated webhook dispatch. Curated foundational geospatial datasets and response SLA benchmarks across all 24 BMC administrative zones to synchronize municipal workflows.',
      initials: 'HM',
      badge: 'Integration Lead'
    }
  ];

  const faqs = [
    {
      q: 'How does Kaiser AI automatically determine my municipal ward?',
      a: 'When you take a photo or place a pin on our map, Kaiser AI executes an instant point-in-polygon spatial calculation using GIS boundary coordinates for all 24 BMC administrative wards (A Ward to T Ward). This guarantees your ticket immediately lands in the inbox of the correct Assistant Commissioner and field Junior Engineer.'
    },
    {
      q: 'Is my personal information and phone number made public?',
      a: 'Never. In full compliance with India’s Digital Personal Data Protection (DPDP) Act 2023, all citizen phone numbers, email addresses, and exact user identifiers are strictly redacted on the public grievance feed and map. Only verified ward officers and BMC administrative heads have authenticated access to contact you for repair coordination.'
    },
    {
      q: 'What prevents an officer from uploading a fake photo to mark an issue resolved?',
      a: 'Kaiser AI enforces multi-factor verification: the closing photo must match the original incident coordinates within a 35-meter geofenced radius and have matching EXIF timestamp metadata. Furthermore, the reporting citizen receives an instant notification with the resolution photo and retains the power to re-open the complaint within 48 hours if the repair is substandard.'
    },
    {
      q: 'How are duplicate complaints handled when multiple neighbors report the same pothole?',
      a: 'Our spatial clustering algorithm scans for complaints within a 25-meter radius belonging to the same category. Duplicate reports are automatically linked to the primary ticket, combining citizen upvotes into a severity multiplier rather than creating duplicate work orders for field crews.'
    },
    {
      q: 'Can Advanced Locality Managements (ALMs) and Housing Societies track ward issues?',
      a: 'Yes! Kaiser AI provides dedicated society and ALM dashboards allowing Resident Welfare Associations to monitor pending, assigned, and completed works across their specific neighborhood, fostering constructive civic-municipal partnership.'
    }
  ];

  return (
    <div className={classNames(
      "w-full min-h-screen select-none space-y-20 pb-24 transition-colors duration-200",
      isDark ? "bg-neutral-950 text-neutral-100" : "bg-slate-50 text-neutral-900"
    )}>
      
      {/* ── Hero Section ── */}
      <section className={classNames(
        "relative overflow-hidden pt-12 pb-16 border-b transition-colors",
        isDark ? "border-white/10" : "border-neutral-200"
      )}>
        <div className={classNames(
          "absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none",
          isDark ? "bg-emerald-500/15" : "bg-emerald-500/10"
        )} />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className={classNames(
              "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase transition-colors",
              isDark ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300" : "bg-emerald-50 border border-emerald-300 text-emerald-800"
            )}>
              <Sparkles size={14} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
              <span>{t('about.heroBadge', 'CIVIC-TECH INNOVATION • BMC SMART CITY INITIATIVE')}</span>
            </div>

            <h1 className={classNames(
              "font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight",
              isDark ? "text-white" : "text-neutral-950"
            )}>
              {t('about.heroTitle1', 'Building a')}{' '}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
                {t('about.heroTitle2', 'Cleaner, Smarter & Resilient')}
              </span>{' '}
              {t('about.heroTitle3', 'Mumbai')}
            </h1>

            <p className={classNames(
              "text-base sm:text-lg leading-relaxed font-normal",
              isDark ? "text-white/75" : "text-neutral-600"
            )}>
              {t('about.heroDesc', 'Kaiser AI is an intelligent civic response platform engineered for Mumbai’s 20+ million citizens and 24 municipal wards. We eliminate bureaucratic delays with automated computer vision triage, sub-meter GPS mapping, and tamper-proof photo resolution audit trails.')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                to="/app/report"
                onClick={() => sound.play('click')}
                className="glow-btn px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs tracking-widest uppercase shadow-[0_0_24px_rgba(52,211,153,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{t('about.reportBtn', 'Report a Civic Hazard')}</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                onClick={() => sound.play('click')}
                className={classNames(
                  "px-8 py-3.5 rounded-full font-bold text-xs tracking-widest uppercase transition-all cursor-pointer border",
                  isDark
                    ? "border-white/20 hover:bg-white/10 text-white"
                    : "border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 shadow-sm"
                )}
              >
                {t('about.helpdeskBtn', 'Ward Directory & Helpdesk')}
              </Link>
            </div>
          </div>

          {/* Key Metrics Counter Bar */}
          <div className={classNames(
            "grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t",
            isDark ? "border-white/10" : "border-neutral-200"
          )}>
            {stats.map((s, idx) => (
              <div
                key={idx}
                className={classNames(
                  "p-5 rounded-3xl border text-center transition-all",
                  isDark
                    ? "bg-neutral-900/80 backdrop-blur-xl border-white/10 shadow-xl"
                    : "bg-white border-neutral-200 shadow-soft"
                )}
              >
                <div className={classNames(
                  "text-2xl sm:text-3xl font-extrabold font-mono",
                  isDark ? "text-white" : "text-neutral-950"
                )}>
                  {s.value}
                </div>
                <div className={classNames(
                  "text-xs font-bold mt-1 uppercase tracking-wider",
                  isDark ? "text-emerald-400" : "text-emerald-600"
                )}>
                  {s.label}
                </div>
                <div className={classNames(
                  "text-[11px] mt-0.5",
                  isDark ? "text-white/50" : "text-neutral-500"
                )}>
                  {s.subtext}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem & Mission Grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-500">URBAN INFRASTRUCTURE CHALLENGE</span>
          <h2 className={classNames(
            "font-display text-2xl sm:text-4xl font-extrabold tracking-tight",
            isDark ? "text-white" : "text-neutral-950"
          )}>
            Why Mumbai Needed an AI-Powered Civic Backbone
          </h2>
          <p className={classNames(
            "text-sm leading-relaxed",
            isDark ? "text-white/70" : "text-neutral-600"
          )}>
            In one of the densest megacities on Earth, monsoon flash flooding and road deterioration demand faster civic intervention than paper bureaucracy can deliver.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Reality Card */}
          <div className={classNames(
            "rounded-3xl p-8 space-y-5 border-l-4 border-l-amber-500 transition-all",
            isDark
              ? "bg-neutral-900/70 border border-white/10 backdrop-blur-xl shadow-2xl"
              : "bg-white border border-amber-200/80 shadow-soft-lg"
          )}>
            <div className={classNames(
              "w-12 h-12 rounded-2xl border flex items-center justify-center",
              isDark ? "bg-amber-500/20 text-amber-400 border-amber-400/30" : "bg-amber-50 text-amber-600 border-amber-200"
            )}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <span className={classNames("text-xs font-mono font-bold uppercase tracking-wider", isDark ? "text-amber-400" : "text-amber-600")}>The Megacity Reality</span>
              <h3 className={classNames("text-xl sm:text-2xl font-bold mt-1", isDark ? "text-white" : "text-neutral-950")}>40,000+ Monsoon Hazards & Lost Complaints</h3>
            </div>
            <p className={classNames("text-sm leading-relaxed", isDark ? "text-white/70" : "text-neutral-600")}>
              Every monsoon, heavy downpours batter Mumbai's road networks, resulting in thousands of dangerous potholes, overflowing storm drains, and open manholes across 24 disjointed administrative wards.
            </p>
            <div className={classNames("space-y-3 pt-3 text-xs border-t", isDark ? "text-white/60 border-white/10" : "text-neutral-600 border-neutral-200")}>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong className={isDark ? "text-white" : "text-neutral-900"}>Bureaucratic Bottlenecks:</strong> Telephone complaints lack visual proof and GPS coordinates, leaving field engineers guessing exact street locations.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong className={isDark ? "text-white" : "text-neutral-900"}>No Priority Ranking:</strong> A 2-foot trench outside a hospital was queued identically to a minor cosmetic hairline crack.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong className={isDark ? "text-white" : "text-neutral-900"}>Zero Accountability:</strong> Complaints were routinely marked 'resolved' on paperwork with zero photographic audit for citizens.</span>
              </div>
            </div>
          </div>

          {/* Solution Card */}
          <div className={classNames(
            "rounded-3xl p-8 space-y-5 border-l-4 border-l-emerald-500 transition-all",
            isDark
              ? "bg-neutral-900/70 border border-white/10 backdrop-blur-xl shadow-2xl"
              : "bg-white border border-emerald-200/80 shadow-soft-lg"
          )}>
            <div className={classNames(
              "w-12 h-12 rounded-2xl border flex items-center justify-center",
              isDark ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30" : "bg-emerald-50 text-emerald-600 border-emerald-200"
            )}>
              <Shield size={24} />
            </div>
            <div>
              <span className={classNames("text-xs font-mono font-bold uppercase tracking-wider", isDark ? "text-emerald-400" : "text-emerald-700")}>Our Solution</span>
              <h3 className={classNames("text-xl sm:text-2xl font-bold mt-1", isDark ? "text-white" : "text-neutral-950")}>Radical Civic Transparency via Computer Vision</h3>
            </div>
            <p className={classNames("text-sm leading-relaxed", isDark ? "text-white/70" : "text-neutral-600")}>
              Kaiser AI transforms passive complaints into actionable, verified work orders. By coupling computer vision with sub-meter GIS mapping, we deliver immediate clarity for both citizen and ward engineer.
            </p>
            <div className={classNames("space-y-3 pt-3 text-xs border-t", isDark ? "text-white/60 border-white/10" : "text-neutral-600 border-neutral-200")}>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className={isDark ? "text-emerald-400 shrink-0 mt-0.5" : "text-emerald-600 shrink-0 mt-0.5"} />
                <span><strong className={isDark ? "text-white" : "text-neutral-900"}>Instant Sub-Meter Triage:</strong> Citizens photograph hazards; the AI detects category and routes to the exact ward within 500ms.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className={isDark ? "text-emerald-400 shrink-0 mt-0.5" : "text-emerald-600 shrink-0 mt-0.5"} />
                <span><strong className={isDark ? "text-white" : "text-neutral-900"}>Monsoon-Aware Scoring:</strong> Algorithmic severity ranks high-risk flashpoints to allocate emergency crews before tragedy strikes.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className={isDark ? "text-emerald-400 shrink-0 mt-0.5" : "text-emerald-600 shrink-0 mt-0.5"} />
                <span><strong className={isDark ? "text-white" : "text-neutral-900"}>Proof-of-Work Closing:</strong> Repairs require verifiable before-and-after photo verification certified by citizen feedback.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Technology Pillars ── */}
      <section className={classNames(
        "border-y py-16 transition-colors",
        isDark ? "bg-neutral-900/50 border-white/10" : "bg-white/80 border-neutral-200 shadow-inner"
      )}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className={classNames(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border",
              isDark ? "bg-neutral-800 text-teal-300 border-neutral-700" : "bg-teal-50 text-teal-800 border-teal-200"
            )}>
              <Cpu size={13} />
              <span>TECHNOLOGY ARCHITECTURE</span>
            </div>
            <h2 className={classNames("font-display text-2xl sm:text-4xl font-extrabold tracking-tight", isDark ? "text-white" : "text-neutral-950")}>
              The Engine Powering Smart City Governance
            </h2>
            <p className={classNames("text-sm", isDark ? "text-white/70" : "text-neutral-600")}>
              Click through our four core engineering subsystems designed to withstand real-world municipal infrastructure scale.
            </p>
          </div>

          {/* Pillar Selector Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isSelected = activePillar === idx;
              return (
                <button
                  key={pillar.id}
                  onClick={() => { sound.play('pop'); setActivePillar(idx); }}
                  className={classNames(
                    "p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between",
                    isSelected
                      ? isDark
                        ? 'bg-neutral-900 border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.25)] text-white'
                        : 'bg-white border-emerald-500 shadow-md text-neutral-950 ring-2 ring-emerald-400/20'
                      : isDark
                        ? 'bg-neutral-900/60 border-white/10 hover:bg-neutral-900/80 text-white/70'
                        : 'bg-slate-50 border-neutral-200 hover:bg-slate-100 text-neutral-700'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={classNames(
                      "w-9 h-9 rounded-xl flex items-center justify-center border",
                      isSelected
                        ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isDark ? 'bg-neutral-800 text-white/60 border-white/10' : 'bg-white text-neutral-600 border-neutral-200 shadow-xs'
                    )}>
                      <Icon size={18} />
                    </div>
                    <span className={classNames(
                      "text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                      isDark ? "bg-white/10 text-white/70" : "bg-neutral-200 text-neutral-700"
                    )}>
                      0{idx + 1}
                    </span>
                  </div>
                  <div>
                    <div className={classNames("text-xs font-mono font-bold mb-0.5", isDark ? "text-emerald-400" : "text-emerald-700")}>{pillar.tag}</div>
                    <div className={classNames("text-sm font-bold line-clamp-1", isDark ? "text-white" : "text-neutral-900")}>{pillar.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Pillar Showcase Card */}
          <div className={classNames(
            "rounded-3xl border p-6 sm:p-10 shadow-2xl backdrop-blur-2xl transition-all",
            isDark ? "bg-neutral-900/80 border-white/15" : "bg-white border-neutral-200 shadow-soft-xl"
          )}>
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className={classNames(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border",
                  isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                )}>
                  <span>{pillars[activePillar].tag}</span>
                </div>
                <h3 className={classNames("font-display text-2xl sm:text-3xl font-extrabold", isDark ? "text-white" : "text-neutral-950")}>
                  {pillars[activePillar].title}
                </h3>
                <p className={classNames("text-sm sm:text-base leading-relaxed", isDark ? "text-white/75" : "text-neutral-600")}>
                  {pillars[activePillar].description}
                </p>
                <div className="space-y-3 pt-2">
                  {pillars[activePillar].bullets.map((b, i) => (
                    <div key={i} className={classNames("flex items-start gap-2.5 text-xs sm:text-sm", isDark ? "text-white/70" : "text-neutral-600")}>
                      <CheckCircle2 size={16} className={isDark ? "text-emerald-400 shrink-0 mt-0.5" : "text-emerald-600 shrink-0 mt-0.5"} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-neutral-950 rounded-2xl border border-neutral-800 p-6 space-y-4 font-mono text-xs shadow-inner text-neutral-100">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-white/50">
                  <span className="flex items-center gap-1.5"><Layers size={13} className="text-emerald-400" /> Pipeline Telemetry</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">LIVE READY</span>
                </div>
                <div className="space-y-2 text-white/80">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Latency:</span>
                    <span className="text-emerald-400">284ms (CLIP Zero-Shot)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">GIS Accuracy:</span>
                    <span className="text-teal-300">&lt; 1.5m sub-meter coordinate</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Monsoon Matrix:</span>
                    <span className="text-sky-300">IMD Santacruz Radar Hook</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-white/40">Audit Proof:</span>
                    <span className="text-amber-300">Geofenced EXIF Hash Match</span>
                  </div>
                </div>
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-[11px] text-neutral-300">
                  <p className="text-emerald-400 font-semibold mb-1">Architecture Standard:</p>
                  Built with decoupled RESTful microservices, Leaflet GIS, and DPDP-compliant citizen data masking.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Before vs After Kaiser AI ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className={classNames("font-mono text-xs font-bold uppercase tracking-widest", isDark ? "text-emerald-400" : "text-emerald-700")}>TRANSFORMATIVE IMPACT</span>
          <h2 className={classNames("font-display text-2xl sm:text-4xl font-extrabold tracking-tight", isDark ? "text-white" : "text-neutral-950")}>
            How Kaiser AI Outperforms Traditional Helplines
          </h2>
          <p className={classNames("text-sm", isDark ? "text-white/70" : "text-neutral-600")}>
            A direct comparison between legacy municipal grievance systems and Kaiser AI's automated intelligence.
          </p>
        </div>

        <div className={classNames(
          "overflow-hidden rounded-3xl border shadow-2xl transition-all",
          isDark ? "bg-neutral-900/80 border-white/15 backdrop-blur-xl" : "bg-white border-neutral-200 shadow-soft-xl"
        )}>
          <div className={classNames(
            "grid grid-cols-12 border-b p-4 text-xs font-mono font-bold uppercase tracking-wider",
            isDark ? "bg-neutral-950/70 border-white/15 text-white/70" : "bg-slate-100 border-neutral-200 text-neutral-700"
          )}>
            <div className="col-span-3 sm:col-span-2">Metric</div>
            <div className={classNames("col-span-4 sm:col-span-5", isDark ? "text-white/40" : "text-neutral-500")}>Traditional Municipal Helpline</div>
            <div className={isDark ? "col-span-5 sm:col-span-5 text-emerald-400" : "col-span-5 sm:col-span-5 text-emerald-700"}>Kaiser AI Platform</div>
          </div>
          <div className={classNames("divide-y", isDark ? "divide-white/10" : "divide-neutral-200")}>
            {comparisons.map((row, i) => (
              <div key={i} className={classNames(
                "grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center transition-colors",
                isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
              )}>
                <div className={classNames("col-span-3 sm:col-span-2 font-bold", isDark ? "text-white" : "text-neutral-900")}>{row.metric}</div>
                <div className={classNames("col-span-4 sm:col-span-5 pr-4 leading-relaxed flex items-start gap-1.5", isDark ? "text-white/50" : "text-neutral-600")}>
                  <span className="text-rose-500 font-bold text-sm shrink-0">✕</span>
                  <span>{row.traditional}</span>
                </div>
                <div className={classNames(
                  "col-span-5 sm:col-span-5 font-medium leading-relaxed flex items-start gap-2 p-3 rounded-2xl border",
                  isDark
                    ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/25"
                    : "bg-emerald-50 text-emerald-900 border-emerald-200"
                )}>
                  <CheckCircle2 size={16} className={isDark ? "text-emerald-400 shrink-0 mt-0.5" : "text-emerald-600 shrink-0 mt-0.5"} />
                  <span>{row.kaiser}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Multidisciplinary Team ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className={classNames("font-mono text-xs font-bold uppercase tracking-widest", isDark ? "text-teal-300" : "text-teal-700")}>OUR TEAM & CONTRIBUTORS</span>
          <h2 className={classNames("font-display text-2xl sm:text-4xl font-extrabold tracking-tight", isDark ? "text-white" : "text-neutral-950")}>
            The Minds Behind Kaiser AI
          </h2>
          <p className={classNames("text-sm", isDark ? "text-white/70" : "text-neutral-600")}>
            A collaborative effort uniting computer vision research, full-stack systems engineering, and urban governance insights.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {team.map((m, idx) => (
            <div
              key={idx}
              className={classNames(
                "rounded-3xl p-6 text-center space-y-4 border shadow-xl flex flex-col justify-between transition-all group",
                isDark
                  ? "bg-neutral-900/70 border-white/10 hover:border-emerald-400/50 backdrop-blur-xl"
                  : "bg-white border-neutral-200 hover:border-emerald-500 shadow-soft-lg hover:shadow-soft-xl"
              )}
            >
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 text-neutral-950 font-black text-lg flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(52,211,153,0.4)] group-hover:scale-105 transition-transform">
                  {m.initials}
                </div>
                <div>
                  <h3 className={classNames("font-bold text-base", isDark ? "text-white" : "text-neutral-900")}>{m.name}</h3>
                  <p className={classNames("text-xs font-mono font-bold", isDark ? "text-emerald-400" : "text-emerald-600")}>{m.role}</p>
                  <p className={classNames("text-[11px] mt-0.5", isDark ? "text-white/50" : "text-neutral-500")}>{m.domain}</p>
                </div>
                <p className={classNames(
                  "text-xs leading-relaxed text-left pt-3 border-t",
                  isDark ? "text-white/70 border-white/10" : "text-neutral-600 border-neutral-200"
                )}>
                  {m.bio}
                </p>
              </div>
              <div className="pt-2">
                <span className={classNames(
                  "inline-block px-3 py-1 rounded-full text-[10px] font-mono border transition-all",
                  m.initials === 'AB'
                    ? isDark
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.2)] font-bold"
                      : "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-xs"
                    : isDark
                      ? "bg-white/5 text-white/60 border-white/10"
                      : "bg-slate-100 text-neutral-600 border-neutral-200"
                )}>
                  {m.badge || 'Engineering Core'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ Accordion ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className={classNames("font-mono text-xs font-bold uppercase tracking-widest", isDark ? "text-emerald-400" : "text-emerald-700")}>COMMON QUESTIONS</span>
          <h2 className={classNames("font-display text-2xl sm:text-3xl font-extrabold", isDark ? "text-white" : "text-neutral-950")}>
            Frequently Asked Questions
          </h2>
          <p className={classNames("text-xs sm:text-sm", isDark ? "text-white/60" : "text-neutral-600")}>
            Learn more about how Kaiser AI works with citizens, housing societies, and municipal authorities.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className={classNames(
                  "border rounded-2xl overflow-hidden transition-all",
                  isDark ? "border-white/10 bg-neutral-900/70 backdrop-blur-xl" : "border-neutral-200 bg-white shadow-soft"
                )}
              >
                <button
                  onClick={() => { sound.play('click'); setOpenFaq(isOpen ? null : index); }}
                  className={classNames(
                    "w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer transition-colors",
                    isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                  )}
                  aria-expanded={isOpen}
                >
                  <span className={classNames("font-bold text-sm sm:text-base", isDark ? "text-white" : "text-neutral-900")}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={classNames(
                      "shrink-0 transition-transform duration-200",
                      isDark ? "text-white/60" : "text-neutral-400",
                      isOpen ? 'rotate-180 text-emerald-500' : ''
                    )}
                  />
                </button>
                {isOpen && (
                  <div className={classNames(
                    "px-4 sm:px-5 pb-5 text-xs sm:text-sm leading-relaxed border-t pt-3 animate-fade-in",
                    isDark ? "text-white/70 border-white/10 bg-neutral-950/40" : "text-neutral-600 border-neutral-100 bg-slate-50/50"
                  )}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom Call-to-Action ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={classNames(
          "rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden transition-all",
          isDark
            ? "bg-neutral-900/80 border border-emerald-500/30 text-white shadow-[0_0_50px_rgba(52,211,153,0.15)] backdrop-blur-2xl"
            : "bg-gradient-to-br from-slate-900 via-neutral-900 to-emerald-950 border border-emerald-500/40 text-white shadow-soft-xl"
        )}>
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to Report a Hazard in Your Neighborhood?
            </h2>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
              Join thousands of active Mumbaikars making our roads safer and infrastructure more reliable. It takes under 60 seconds to file a verified report.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/app/report"
              onClick={() => sound.play('click')}
              className="glow-btn px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs tracking-widest uppercase flex items-center gap-2 hover:scale-105 active:scale-95 shadow-[0_0_24px_rgba(52,211,153,0.4)] transition-all cursor-pointer"
            >
              <span>Report Issue Now</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              onClick={() => sound.play('click')}
              className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 text-white font-bold text-xs tracking-widest uppercase transition-all cursor-pointer"
            >
              <span>Find My Ward Office</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
