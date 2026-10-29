// ─── Sovereign Civic Dark Cyber About Page ──────────────────────────────────
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Award, Building2, CheckCircle2,
  Cpu, Zap, ChevronDown, AlertTriangle, ArrowRight,
  Sparkles, FileCheck2, Compass, Layers, Lock, Code, Check
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export const AboutPage = () => {
  const [activePillar, setActivePillar] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { label: 'Administrative Wards', value: '24', subtext: 'Colaba to Dahisar & Mulund' },
    { label: 'AI Classification Accuracy', value: '94.2%', subtext: 'Trained on 60,000+ urban images' },
    { label: 'Average Emergency SLA', value: '<24h', subtext: 'Monsoon hazards & open manholes' },
    { label: 'Civic Grievances Triaged', value: '14,800+', subtext: 'Sub-meter GPS pinpointed' },
  ];

  const pillars = [
    {
      id: 'vision',
      icon: Cpu,
      title: 'Computer Vision & Hazard Detection',
      tag: 'Neural Pipeline',
      description: 'Our proprietary deep learning models detect potholes, overflowing municipal bins, waterlogged junctions, and exposed utility cables with over 94% precision.',
      bullets: [
        'Automated severity index calculation (depth, surface area, debris spread)',
        'Monsoon water-logging depth estimation and drainage blockage flags',
        'Automatic noise and duplicate image grouping with community upvotes'
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
      name: 'Harsh Mane',
      role: 'DevOps & Systems Engineer',
      domain: 'Computer Vision & Deep Learning',
      bio: 'Architected the YOLOv8 image classification pipeline trained on Mumbai municipal road datasets.',
      initials: 'HM'
    },
    {
      name: 'Ayush Barve',
      role: 'ML & Data Engineer',
      domain: 'Citizen Ergonomics & Accessibility',
      bio: 'Crafted the accessible multilingual citizen workflow, officer triage dashboard, and Leaflet interactive map.',
      initials: 'AB'
    },
    {
      name: 'Dharmik Desai',
      role: 'Full-Stack Systems Architect',
      domain: 'Cloud Services & Geospatial GIS',
      bio: 'Engineered the 24-ward polygon reverse-geocoding engine, REST APIs, and resilient data synchronization.',
      initials: 'DD'
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
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 select-none space-y-20 pb-24">
      
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase">
              <Sparkles size={14} className="text-emerald-400" />
              <span>CIVIC-TECH INNOVATION • BMC SMART CITY INITIATIVE</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Building a{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                Cleaner, Smarter & Resilient
              </span>{' '}
              Mumbai
            </h1>

            <p className="text-base sm:text-lg text-white/75 leading-relaxed font-normal">
              Kaiser AI is an intelligent civic response platform engineered for Mumbai’s 20+ million citizens and 24 municipal wards. We eliminate bureaucratic delays with automated computer vision triage, sub-meter GPS mapping, and tamper-proof photo resolution audit trails.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                to="/app/report"
                onClick={() => sound.play('click')}
                className="glow-btn px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs tracking-widest uppercase shadow-[0_0_24px_rgba(52,211,153,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Report a Civic Hazard</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                onClick={() => sound.play('click')}
                className="px-8 py-3.5 rounded-full border border-white/20 hover:bg-white/10 text-white font-bold text-xs tracking-widest uppercase transition-all cursor-pointer"
              >
                Ward Directory & Helpdesk
              </Link>
            </div>
          </div>

          {/* Key Metrics Counter Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/10">
            {stats.map((s, idx) => (
              <div key={idx} className="bg-neutral-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {s.value}
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-1 uppercase tracking-wider">{s.label}</div>
                <div className="text-[11px] text-white/50 mt-0.5">{s.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem & Mission Grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">URBAN INFRASTRUCTURE CHALLENGE</span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Mumbai Needed an AI-Powered Civic Backbone
          </h2>
          <p className="text-sm text-white/70 leading-relaxed">
            In one of the densest megacities on Earth, monsoon flash flooding and road deterioration demand faster civic intervention than paper bureaucracy can deliver.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Reality Card */}
          <div className="rounded-3xl p-8 space-y-5 border-l-4 border-l-amber-500 bg-neutral-900/70 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">The Megacity Reality</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">40,000+ Monsoon Hazards & Lost Complaints</h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Every monsoon, heavy downpours batter Mumbai's road networks, resulting in thousands of dangerous potholes, overflowing storm drains, and open manholes across 24 disjointed administrative wards.
            </p>
            <div className="space-y-3 pt-3 text-xs text-white/60 border-t border-white/10">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span><strong className="text-white">Bureaucratic Bottlenecks:</strong> Telephone complaints lack visual proof and GPS coordinates, leaving field engineers guessing exact street locations.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span><strong className="text-white">No Priority Ranking:</strong> A 2-foot trench outside a hospital was queued identically to a minor cosmetic hairline crack.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span><strong className="text-white">Zero Accountability:</strong> Complaints were routinely marked 'resolved' on paperwork with zero photographic audit for citizens.</span>
              </div>
            </div>
          </div>

          {/* Solution Card */}
          <div className="rounded-3xl p-8 space-y-5 border-l-4 border-l-emerald-500 bg-neutral-900/70 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Our Solution</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">Radical Civic Transparency via Computer Vision</h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Kaiser AI transforms passive complaints into actionable, verified work orders. By coupling computer vision with sub-meter GIS mapping, we deliver immediate clarity for both citizen and ward engineer.
            </p>
            <div className="space-y-3 pt-3 text-xs text-white/60 border-t border-white/10">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Instant Sub-Meter Triage:</strong> Citizens photograph hazards; the AI detects category and routes to the exact ward within 500ms.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Monsoon-Aware Scoring:</strong> Algorithmic severity ranks high-risk flashpoints to allocate emergency crews before tragedy strikes.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Proof-of-Work Closing:</strong> Repairs require verifiable before-and-after photo verification certified by citizen feedback.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Technology Pillars ── */}
      <section className="bg-neutral-900/50 border-y border-white/10 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-teal-300 text-xs font-mono">
              <Cpu size={13} />
              <span>TECHNOLOGY ARCHITECTURE</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              The Engine Powering Smart City Governance
            </h2>
            <p className="text-sm text-white/70">
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
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-neutral-900 border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.25)] text-white'
                      : 'bg-neutral-900/60 border-white/10 hover:bg-neutral-900/80 text-white/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-neutral-800 text-white/60 border-white/10'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/70">
                      0{idx + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-400 font-mono font-bold mb-0.5">{pillar.tag}</div>
                    <div className="text-sm font-bold text-white line-clamp-1">{pillar.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Pillar Showcase Card */}
          <div className="bg-neutral-900/80 rounded-3xl border border-white/15 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs font-mono">
                  <span>{pillars[activePillar].tag}</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                  {pillars[activePillar].title}
                </h3>
                <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                  {pillars[activePillar].description}
                </p>
                <div className="space-y-3 pt-2">
                  {pillars[activePillar].bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/70">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-neutral-950/80 rounded-2xl border border-white/10 p-6 space-y-4 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white/50">
                  <span className="flex items-center gap-1.5"><Layers size={13} className="text-emerald-400" /> Pipeline Telemetry</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">LIVE READY</span>
                </div>
                <div className="space-y-2 text-white/80">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Latency:</span>
                    <span className="text-emerald-400">284ms (Edge inference)</span>
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
                <div className="p-3 bg-neutral-900 rounded-xl border border-white/10 text-[11px] text-white/60">
                  <p className="text-emerald-300 font-semibold mb-1">Architecture Standard:</p>
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
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">TRANSFORMATIVE IMPACT</span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Kaiser AI Outperforms Traditional Helplines
          </h2>
          <p className="text-sm text-white/70">
            A direct comparison between legacy municipal grievance systems and Kaiser AI's automated intelligence.
          </p>
        </div>

        <div className="overflow-hidden bg-neutral-900/80 rounded-3xl border border-white/15 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-12 bg-neutral-950/70 border-b border-white/15 p-4 text-xs font-mono font-bold text-white/70 uppercase tracking-wider">
            <div className="col-span-3 sm:col-span-2">Metric</div>
            <div className="col-span-4 sm:col-span-5 text-white/40">Traditional Municipal Helpline</div>
            <div className="col-span-5 sm:col-span-5 text-emerald-400">Kaiser AI Platform</div>
          </div>
          <div className="divide-y divide-white/10">
            {comparisons.map((row, i) => (
              <div key={i} className="grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center hover:bg-white/5 transition-colors">
                <div className="col-span-3 sm:col-span-2 font-bold text-white">{row.metric}</div>
                <div className="col-span-4 sm:col-span-5 text-white/50 pr-4 leading-relaxed flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold text-sm shrink-0">✕</span>
                  <span>{row.traditional}</span>
                </div>
                <div className="col-span-5 sm:col-span-5 text-emerald-200 font-medium leading-relaxed flex items-start gap-2 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-400/25">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
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
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-teal-300">OUR TEAM & CONTRIBUTORS</span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Minds Behind Kaiser AI
          </h2>
          <p className="text-sm text-white/70">
            A collaborative effort uniting computer vision research, full-stack systems engineering, and urban governance insights.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {team.map((m, idx) => (
            <div key={idx} className="rounded-3xl p-6 text-center space-y-4 bg-neutral-900/70 border border-white/10 hover:border-emerald-400/50 shadow-2xl backdrop-blur-xl flex flex-col justify-between transition-all group">
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 text-neutral-950 font-black text-lg flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(52,211,153,0.4)] group-hover:scale-105 transition-transform">
                  {m.initials}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{m.name}</h3>
                  <p className="text-xs font-mono font-bold text-emerald-400">{m.role}</p>
                  <p className="text-[11px] text-white/50 mt-0.5">{m.domain}</p>
                </div>
                <p className="text-xs text-white/70 leading-relaxed text-left pt-3 border-t border-white/10">
                  {m.bio}
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 bg-white/5 text-white/60 border border-white/10 rounded-full text-[10px] font-mono">
                  Engineering Core
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ Accordion ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">COMMON QUESTIONS</span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-white/60">
            Learn more about how Kaiser AI works with citizens, housing societies, and municipal authorities.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-white/10 rounded-2xl overflow-hidden bg-neutral-900/70 backdrop-blur-xl transition-all"
              >
                <button
                  onClick={() => { sound.play('click'); setOpenFaq(isOpen ? null : index); }}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-white/60 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/10 pt-3 bg-neutral-950/40 animate-fade-in">
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
        <div className="bg-neutral-900/80 border border-emerald-500/30 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-[0_0_50px_rgba(52,211,153,0.15)] backdrop-blur-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
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
