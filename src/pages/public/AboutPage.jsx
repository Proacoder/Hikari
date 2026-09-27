import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Award, Building2, CheckCircle2,
  Cpu, Zap, ChevronDown, AlertTriangle, ArrowRight,
  Sparkles, FileCheck2, Compass, Layers, Lock, Code
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const AboutPage = () => {
  const [activePillar, setActivePillar] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { label: 'Administrative Wards', value: '26', subtext: 'Colaba to Dahisar & Mulund' },
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
      badgeColor: 'brand'
    },
    {
      id: 'geospatial',
      icon: Compass,
      title: 'Sub-Meter Geospatial Ward Routing',
      tag: 'OpenStreetMap GIS',
      description: 'No more confusing administrative jurisdictions. Kaiser AI matches exact citizen GPS coordinates against official BMC 26-ward polygon boundaries in real time.',
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
      badgeColor: 'emerald'
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
      role: 'Devops Engineer',
      domain: 'Computer Vision & Deep Learning',
      bio: 'Architected the YOLOv8 and CNN image classification pipeline trained on Mumbai municipal road datasets.',
      initials: 'HM'
    },

    {
      name: 'Ayush Barve',
      role: 'Ml and Data Engineer',
      domain: 'Citizen Ergonomics & Accessibility',
      bio: 'Crafted the accessible multilingual citizen workflow, officer triage dashboard, and Leaflet interactive map.',
      initials: 'AB'
    },
    {
      name: 'Dharmik Desai',
      role: 'Full-Stack Systems Architect',
      domain: 'Cloud Services & Geospatial GIS',
      bio: 'Engineered the 26-ward polygon reverse-geocoding engine, REST APIs, and resilient data synchronization.',
      initials: 'DD'
    }
  ];

  const faqs = [
    {
      q: 'How does Kaiser AI automatically determine my municipal ward?',
      a: 'When you take a photo or place a pin on our map, Kaiser AI executes an instant point-in-polygon spatial calculation using GIS boundary coordinates for all 26 BMC administrative wards (A Ward to T Ward). This guarantees your ticket immediately lands in the inbox of the correct Assistant Commissioner and field Junior Engineer.'
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
    <div className="space-y-20 pb-20">
      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-neutral-50 pt-16 pb-20 border-b border-neutral-100">
        <div className="absolute inset-0 bg-hero-pattern opacity-40 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-5 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-semibold shadow-soft-sm">
              <Sparkles size={14} className="text-brand-600 animate-spin-slow" />
              <span>Civic-Tech Innovation • BMC Smart City Initiative</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              Building a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-500">Cleaner, Smarter & More Resilient</span> Mumbai
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
              Kaiser AI is an intelligent civic response platform engineered for Mumbai’s 20+ million citizens and 26 municipal wards. We eliminate bureaucratic delays with automated computer vision triage, sub-meter GPS mapping, and tamper-proof photo resolution audit trails.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link to="/app/report">
                <Button variant="primary" size="lg" className="shadow-brand">
                  Report a Civic Hazard <ArrowRight size={16} className="ml-1.5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Ward Directory & Helpdesk
                </Button>
              </Link>
            </div>
          </div>

          {/* Key Metrics Counter Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-neutral-200/70">
            {stats.map((s, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-neutral-100 shadow-soft-sm text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs font-bold text-brand-700 mt-1 uppercase tracking-wider">{s.label}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{s.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem & Mission Grid ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="brand">Urban Infrastructure Challenge</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Why Mumbai Needed an AI-Powered Civic Backbone
          </h2>
          <p className="text-sm text-neutral-600">
            In one of the densest megacities on Earth, monsoon flash flooding and road deterioration demand faster civic intervention than paper bureaucracy can deliver.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 space-y-5 border-l-4 border-l-amber-500 shadow-soft bg-gradient-to-br from-white to-amber-50/20">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">The Megacity Reality</span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">40,000+ Monsoon Hazards & Lost Complaints</h3>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Every monsoon, heavy downpours batter Mumbai's road networks, resulting in thousands of dangerous potholes, overflowing storm drains, and open manholes across 26 disjointed administrative wards.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-neutral-600 border-t border-neutral-100">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Bureaucratic Bottlenecks:</strong> Telephone complaints lack visual proof and GPS coordinates, leaving field engineers guessing exact street locations.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>No Priority Ranking:</strong> A 2-foot trench outside a hospital was queued identically to a minor cosmetic hairline crack.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Zero Accountability:</strong> Complaints were routinely marked 'resolved' on paperwork with zero photographic audit for citizens.</span>
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-5 border-l-4 border-l-brand-600 shadow-soft bg-gradient-to-br from-white to-brand-50/20">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Our Solution</span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">Radical Civic Transparency via Computer Vision</h3>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Kaiser AI transforms passive complaints into actionable, verified work orders. By coupling computer vision with sub-meter GIS mapping, we deliver immediate clarity for both citizen and ward engineer.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-neutral-600 border-t border-neutral-100">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Instant Sub-Meter Triage:</strong> Citizens photograph hazards; the AI detects category and routes to the exact ward within 500ms.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Monsoon-Aware Scoring:</strong> Algorithmic severity ranks high-risk flashpoints to allocate emergency crews before tragedy strikes.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Proof-of-Work Closing:</strong> Repairs require verifiable before-and-after photo verification certified by citizen feedback.</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Interactive Technology Pillars ──────────────────────────────────── */}
      <section className="bg-neutral-900 text-white py-18">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-brand-400 text-xs font-semibold">
              <Cpu size={13} />
              <span>Technology Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              The Engine Powering Smart City Governance
            </h2>
            <p className="text-sm text-neutral-400">
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
                  onClick={() => setActivePillar(idx)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${isSelected
                    ? 'bg-brand-950/80 border-brand-500 shadow-brand text-white'
                    : 'bg-neutral-800/60 border-neutral-700/60 hover:bg-neutral-800 text-neutral-300'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-brand-600 text-white' : 'bg-neutral-700 text-neutral-300'
                      }`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-700/60 text-neutral-300">
                      0{idx + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-brand-400 font-semibold mb-0.5">{pillar.tag}</div>
                    <div className="text-sm font-bold text-white line-clamp-1">{pillar.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Pillar Showcase Card */}
          <div className="bg-neutral-800/80 rounded-3xl border border-neutral-700 p-6 sm:p-10 shadow-soft-lg">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/60 text-brand-400 border border-brand-700/50 text-xs font-semibold">
                  <span>{pillars[activePillar].tag}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {pillars[activePillar].title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  {pillars[activePillar].description}
                </p>
                <div className="space-y-3 pt-2">
                  {pillars[activePillar].bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                      <CheckCircle2 size={16} className="text-brand-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-neutral-900/90 rounded-2xl border border-neutral-700/80 p-6 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-neutral-400">
                  <span className="flex items-center gap-1.5"><Layers size={13} className="text-brand-400" /> Pipeline Telemetry</span>
                  <span className="text-[10px] text-brand-400 bg-brand-950 px-2 py-0.5 rounded border border-brand-800">LIVE READY</span>
                </div>
                <div className="space-y-2 text-neutral-300">
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-500">Latency:</span>
                    <span className="text-emerald-400">284ms (Edge inference)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-500">GIS Accuracy:</span>
                    <span className="text-brand-400">&lt; 1.5m sub-meter coordinate</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-500">Monsoon Matrix:</span>
                    <span className="text-sky-400">IMD Santacruz Radar Hook</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Audit Proof:</span>
                    <span className="text-amber-400">Geofenced EXIF Hash Match</span>
                  </div>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400">
                  <p className="text-brand-300 font-semibold mb-1">Architecture Standard:</p>
                  Built with decoupled RESTful microservices, Leaflet GIS, and DPDP-compliant citizen data masking.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Before vs After Kaiser AI ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="brand">Transformative Impact</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            How Kaiser AI Outperforms Traditional Helplines
          </h2>
          <p className="text-sm text-neutral-600">
            A direct comparison between legacy municipal grievance systems and Kaiser AI's automated intelligence.
          </p>
        </div>

        <div className="overflow-hidden bg-white rounded-3xl border border-neutral-200/80 shadow-soft-sm">
          <div className="grid grid-cols-12 bg-neutral-50 border-b border-neutral-200/80 p-4 text-xs font-bold text-neutral-700 uppercase tracking-wider">
            <div className="col-span-3 sm:col-span-2">Metric</div>
            <div className="col-span-4 sm:col-span-5 text-neutral-500">Traditional Municipal Helpline</div>
            <div className="col-span-5 sm:col-span-5 text-brand-700">Kaiser AI Platform</div>
          </div>
          <div className="divide-y divide-neutral-100">
            {comparisons.map((row, i) => (
              <div key={i} className="grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center hover:bg-neutral-50/50 transition-colors">
                <div className="col-span-3 sm:col-span-2 font-bold text-neutral-900">{row.metric}</div>
                <div className="col-span-4 sm:col-span-5 text-neutral-500 pr-4 leading-relaxed flex items-start gap-1.5">
                  <span className="text-red-400 font-bold text-sm shrink-0">✕</span>
                  <span>{row.traditional}</span>
                </div>
                <div className="col-span-5 sm:col-span-5 text-neutral-800 font-medium leading-relaxed flex items-start gap-1.5 bg-brand-50/40 p-2.5 rounded-xl border border-brand-100/60">
                  <CheckCircle2 size={16} className="text-brand-600 shrink-0 mt-0.5" />
                  <span>{row.kaiser}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Engineering Capstone & Academic Background ──────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-900 via-neutral-900 to-neutral-950 text-white rounded-3xl p-8 sm:p-12 shadow-soft-lg space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-800/60 text-brand-300 border border-brand-700/50 text-xs font-semibold">
              <Award size={13} />
              <span>Academic Engineering Capstone • SBMP Sem 5 / Final Year</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rooted in Rigorous Research & Practical Civic Empathy
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Kaiser AI was conceived and developed as a comprehensive engineering capstone initiative. The project examines how modern civic-tech, applied artificial intelligence, and open geospatial standards can solve deep-seated urban challenges in India's financial capital.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-2">
            <div className="p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 space-y-2">
              <div className="text-brand-400 font-bold text-sm flex items-center gap-1.5">
                <Building2 size={16} /> 26 Administrative Wards
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Full administrative mapping from Zone 1 (Colaba) to Zone 7 (Dahisar, Mulund) with localized ward engineer hierarchy and contacts.
              </p>
            </div>

            <div className="p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 space-y-2">
              <div className="text-brand-400 font-bold text-sm flex items-center gap-1.5">
                <Lock size={16} /> DPDP Act 2023 Compliant
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Privacy-by-design principles protect citizen phone numbers and identities, preventing unauthorized contact while maintaining civic accountability.
              </p>
            </div>

            <div className="p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 space-y-2">
              <div className="text-brand-400 font-bold text-sm flex items-center gap-1.5">
                <Code size={16} /> Open Standards & REST APIs
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Zero commercial GIS vendor lock-in. Powered by OpenStreetMap, Leaflet, and REST endpoints engineered for Smart City Mission integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Multidisciplinary Team ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="brand">Our Team & Contributors</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            The Minds Behind Kaiser AI
          </h2>
          <p className="text-sm text-neutral-600">
            A collaborative effort uniting computer vision research, full-stack systems engineering, and urban governance insights.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m, idx) => (
            <Card key={idx} hover className="p-6 text-center space-y-4 border border-neutral-200/80 shadow-soft-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white font-extrabold text-lg flex items-center justify-center mx-auto shadow-brand">
                  {m.initials}
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">{m.name}</h3>
                  <p className="text-xs font-semibold text-brand-700">{m.role}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{m.domain}</p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed text-left pt-2 border-t border-neutral-100">
                  {m.bio}
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-[10px] font-semibold">
                  Engineering Core
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Interactive Frequently Asked Questions ──────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="brand">Common Questions</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Learn more about how Kaiser AI works with citizens, housing societies, and municipal authorities.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-neutral-200/90 rounded-2xl overflow-hidden bg-white shadow-soft-sm transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/50"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-neutral-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-neutral-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600' : ''
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3 bg-neutral-50/30 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom Call-to-Action ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-emerald-600 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-brand-lg relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Report a Hazard in Your Neighborhood?
            </h2>
            <p className="text-sm sm:text-base text-brand-100 leading-relaxed">
              Join thousands of active Mumbaikars making our roads safer and infrastructure more reliable. It takes under 60 seconds to file a verified report.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/app/report">
              <Button size="lg" className="bg-white text-brand-800 hover:bg-neutral-50 font-bold shadow-soft">
                Report Issue Now <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
            <Link to="/contact">
              <button className="px-6 py-3 rounded-xl border border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-colors cursor-pointer">
                Find My Ward Office
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
