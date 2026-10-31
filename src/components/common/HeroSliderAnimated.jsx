// ─── Full-bleed Cinematic Hero: Image Slideshow + Water Reflection + Live Telemetry ───
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pause, Play, Activity, Waves } from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';

const INTERVAL = 7000;

// Interactive particle / constellation canvas that tracks and reacts to cursor
const NetworkCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let w, h, raf, pts = [], mouse = { x: -999, y: -999 }, visible = true;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({ length: Math.round((w * h) / 14000) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - .5) * .35,
        vy: (Math.random() - .5) * .35,
        r: Math.random() * 1.8 + .6,
      }));
    };
    const draw = () => {
      raf = requestAnimationFrame(draw); if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < 180) {
          p.x += (p.x - mouse.x) * .005;
          p.y += (p.y - mouse.y) * .005;
        }
        ctx.fillStyle = dm < 180 ? 'rgba(74, 222, 128, 0.95)' : 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 140) {
            const near = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y) < 200;
            ctx.strokeStyle = near
              ? `rgba(74, 222, 128, ${(1 - d / 140) * 0.75})`
              : `rgba(160, 210, 255, ${(1 - d / 140) * 0.22})`;
            ctx.lineWidth = near ? 0.9 : 0.6;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
    };
    const move = (e) => {
      if (!c) return;
      const r = c.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(c); resize(); draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', move);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', move);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none z-10" />;
};

// Ambient bottom gradient fade & monsoon rain telemetry animation (ocean wave animation removed)
const WaterReflectionEffect = ({ activeSlide }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-36 pointer-events-none z-10 overflow-hidden">
      {/* Bottom shadow gradient for clean transition to the next section */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

      {/* Rain effect for Slide 3 (Monsoon) */}
      {activeSlide === 2 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[12, 28, 44, 60, 75, 88].map((left, idx) => (
            <div
              key={idx}
              className="absolute top-0 w-0.5 h-16 bg-gradient-to-b from-transparent via-sky-300/60 to-transparent animate-rain-drop"
              style={{ left: `${left}%`, animationDelay: `${idx * 0.22}s`, animationDuration: '0.9s' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const STATUS_STYLES = {
  ASSIGNED: 'text-sky-300 bg-sky-500/20 border-sky-400/40 shadow-[0_0_10px_rgba(56,189,248,0.25)]',
  RESOLVED: 'text-emerald-300 bg-emerald-500/20 border-emerald-400/40 shadow-[0_0_10px_rgba(52,211,153,0.25)]',
  ESCALATED: 'text-amber-300 bg-amber-500/20 border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.25)]',
  DETECTED: 'text-rose-300 bg-rose-500/20 border-rose-400/40 shadow-[0_0_10px_rgba(251,113,133,0.25)]',
};

export const HeroSlider = ({ stats, weather }) => {
  const { t, language } = useLanguage();
  const total = stats?.totalComplaints ? stats.totalComplaints.toLocaleString() : '14,827';
  const rate = stats?.resolvedRate ? `${stats.resolvedRate}%` : '91.4%';

  const slides = [
    {
      img: '/hero/slide-1.jpg',
      eyebrow: t('hero.slide1.eyebrow', 'SOVEREIGN AI-DRIVEN CIVIC GOVERNANCE'),
      l1: t('hero.slide1.l1', 'Fix Mumbai'),
      l2: t('hero.slide1.l2', 'one report at a time.'),
      caption: t('hero.slide1.caption', 'PHOTO TO DISPATCH IN SECONDS'),
      desc: t('hero.slide1.desc', 'Snap a photo or speak in any language. Kaiser AI detects the issue, scores severity with OpenAI CLIP Zero-Shot Vision and auto-dispatches ward engineers before your chai gets cold.'),
      cta: { to: '/app/report', label: t('hero.reportBtn', 'Report Civic Issue') },
      rows: [
        ['WD-K/E-0492', 'POTHOLE · 98.4%', 'ASSIGNED'],
        ['WD-G/N-0061', 'GARBAGE DUMP · 94.1%', 'DETECTED'],
        ['WD-P/N-0305', 'OPEN DRAIN · 91.7%', 'ASSIGNED'],
        ['WD-L-0182', 'STREETLIGHT · 88.0%', 'RESOLVED'],
      ],
    },
    {
      img: '/hero/slide-2.jpg',
      eyebrow: t('hero.slide2.eyebrow', 'REAL-TIME 24 WARDS GIS TELEMETRY'),
      l1: t('hero.slide2.l1', 'Every ward.'),
      l2: t('hero.slide2.l2', 'Every issue. Live.'),
      caption: t('hero.slide2.caption', '24 BMC WARDS · INTERACTIVE MAP'),
      desc: t('hero.slide2.desc', `Watch ${total} grievances unfold live across Mumbai's 24 administrative municipal wards — what is reported, what is under active repair, and what is verified resolved near you.`),
      cta: { to: '/app/map', label: t('hero.mapBtn', 'Explore Live Map') },
      rows: [
        ['WARD K/E', '312 ACTIVE TICKETS', 'ASSIGNED'],
        ['WARD H/W', '188 ACTIVE TICKETS', 'RESOLVED'],
        ['WARD L', '241 ACTIVE TICKETS', 'ESCALATED'],
        ['WARD G/N', '164 ACTIVE TICKETS', 'ASSIGNED'],
      ],
    },
    {
      img: '/hero/slide-3.jpg',
      eyebrow: t('hero.slide3.eyebrow', 'MONSOON READINESS & FLOOD TELEMETRY'),
      l1: t('hero.slide3.l1', 'Flood alerts'),
      l2: t('hero.slide3.l2', 'before the water arrives.'),
      caption: t('hero.slide3.caption', `AQI ${weather?.aqi ?? '112'} · ${weather?.temperature != null ? weather.temperature + '°C' : '31°C'} · ALL-MUMBAI DOPPLER ACTIVE`),
      desc: t('hero.slide3.desc', 'Predictive disaster intelligence blends live IMD rainfall feeds with citizen flood reports to warn vulnerable wards early and mobilize BMC emergency response teams.'),
      cta: { to: '/app/map', label: t('hero.mapBtn', 'View Flood Sensors') },
      rows: [
        ['SENSOR-SION', 'WATER LEVEL 0.4 m', 'RESOLVED'],
        ['SENSOR-KURLA', 'WATER LEVEL 0.9 m', 'ESCALATED'],
        ['SENSOR-DADAR', 'WATER LEVEL 0.2 m', 'RESOLVED'],
        ['DRAIN-HINDMATA', 'PUMPS ONLINE (4/4)', 'ASSIGNED'],
      ],
    },
    {
      img: '/hero/slide-4.jpg',
      eyebrow: t('hero.slide4.eyebrow', 'CITIZEN INCENTIVES & CLEAN WARDS'),
      l1: t('hero.slide4.l1', 'Be the citizen'),
      l2: t('hero.slide4.l2', 'Mumbai deserves.'),
      caption: t('hero.slide4.caption', 'EARN CIVIC POINTS · GET CERTIFIED'),
      desc: t('hero.slide4.desc', 'Earn civic reward points, top the municipal leaderboard, and receive verified digital certificates signed by municipal commissioners for making your neighbourhood cleaner.'),
      cta: { to: '/register', label: t('nav.signUp', 'Join Kaiser AI') },
      rows: [
        ['CITIZEN #1 · PRIYA N.', '4,820 PTS', 'RESOLVED'],
        ['CITIZEN #2 · AARAV S.', '4,310 PTS', 'RESOLVED'],
        ['CITIZEN #3 · ROHAN K.', '3,975 PTS', 'ASSIGNED'],
        ['WARD RANK #1', 'BANDRA WEST (H/W)', 'RESOLVED'],
      ],
    },
    {
      img: '/hero/slide-5.jpg',
      eyebrow: t('hero.slide5.eyebrow', 'TIME-BOUND ACCOUNTABILITY'),
      l1: t('hero.slide5.l1', 'Real SLAs.'),
      l2: t('hero.slide5.l2', 'Real accountability.'),
      caption: t('hero.slide5.caption', `${rate} CITIZEN RESOLUTION RATE`),
      desc: t('hero.slide5.desc', 'Every civic work order carries a strict countdown SLA. Escalations are automatic, and every closed ticket requires photographic before-and-after proof before sign-off.'),
      cta: { to: '/app/report', label: t('hero.reportBtn', 'Report Civic Issue') },
      rows: [
        ['SLA 24H · ROADS', 'TURNAROUND 18.2H', 'ASSIGNED'],
        ['SLA 48H · DRAINAGE', 'INSPECTION DONE', 'RESOLVED'],
        ['SLA 72H · SANITATION', 'AUTO-ESCALATED', 'ESCALATED'],
        ['AUDIT LOG', 'VERIFIED CLOSURE', 'RESOLVED'],
      ],
    },
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const isManuallyPaused = useRef(false);
  const box = useRef(null);
  const touchX = useRef(null);

  const togglePause = () => {
    sound.play('click');
    setPaused((prev) => {
      const next = !prev;
      isManuallyPaused.current = next;
      return next;
    });
  };

  const go = useCallback((i) => {
    setIndex((i + slides.length) % slides.length);
    setCycle((c) => c + 1);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, cycle, go]);

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [index, go]);

  const onMove = (e) => {
    if (!box.current) return;
    const r = box.current.getBoundingClientRect();
    box.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
    box.current.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
  };

  return (
    <section
      ref={box}
      onMouseMove={onMove}
      onMouseEnter={() => {
        if (!isManuallyPaused.current) setPaused(true);
      }}
      onMouseLeave={() => {
        if (!isManuallyPaused.current) {
          setPaused(false);
          setCycle((c) => c + 1);
        }
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const d = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(d) > 50) go(index + (d < 0 ? 1 : -1));
      }}
      className="relative w-full min-h-[92vh] lg:min-h-screen bg-neutral-950 text-white overflow-hidden isolate flex flex-col justify-between pt-20 sm:pt-24 pb-8 select-none bg-cover bg-center"
      style={{ backgroundImage: "url('/hero/mumbai-night-skyline.jpg')" }}
      aria-roledescription="carousel"
      aria-label="Kaiser AI full background hero"
    >
      {/* ── Slide Backgrounds & Gradient Overlays ── */}
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div key={s.eyebrow} className={`slide ${active ? 'active' : ''}`} aria-hidden={!active}>
            <div className="hero-bg absolute inset-0">
              <img src={s.img} alt="" className="kb w-full h-full object-cover" />
            </div>

            {/* Flash Transition */}
            {active && (
              <div
                key={cycle}
                className="absolute inset-0 bg-white/20 pointer-events-none"
                style={{ animation: 'flash .75s ease-out forwards' }}
              />
            )}

            {/* Deep Cinematic Contrast Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/65 to-neutral-950/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-neutral-950/50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(52,211,153,0.15),transparent_55%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_65%,rgba(14,165,233,0.12),transparent_55%)] pointer-events-none" />
          </div>
        );
      })}

      {/* ── Constellation Particle Canvas ── */}
      <NetworkCanvas />

      {/* ── Animated Water Surface Reflection Effect (Matches City Images) ── */}
      <WaterReflectionEffect activeSlide={index} />

      {/* ── Main Hero Content Grid ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto flex-1 flex flex-col justify-center py-6 sm:py-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Bold Typography & CTAs (No Empty Space, Never Clipped) */}
          <div className="lg:col-span-7 space-y-6 text-left">

            {/* Dynamic Animated Content Container with Language Support */}
            <div key={`${index}-${language}`} className="animate-hero-fade-up space-y-4">

              {/* Eyebrow with Pulsing Emerald Accent Line */}
              <div className="flex items-center gap-3">
                <span className="line-grow block w-10 sm:w-14 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 shadow-[0_0_8px_#34d399]" />
                <span className="font-mono text-[11px] sm:text-xs tracking-[.3em] font-bold text-emerald-300 uppercase">
                  {slides[index].eyebrow}
                </span>
              </div>

              {/* Huge Bold Headline - Fully Visible in English, Marathi & Hindi */}
              <h1 className="font-display leading-[1.06] tracking-tight text-3xl sm:text-5xl lg:text-6xl xl:text-[4.2rem] font-extrabold text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
                <span className="block text-white">
                  {slides[index].l1}
                </span>
                <span className="block font-light text-white/95 bg-gradient-to-r from-white via-emerald-100 to-teal-300 bg-clip-text text-transparent">
                  {slides[index].l2}
                </span>
              </h1>

              {/* Accent Divider */}
              <span className="line-grow block h-0.5 w-44 sm:w-80 bg-gradient-to-r from-emerald-400 via-teal-300 to-transparent" />

              {/* Rich Subtitle Description */}
              <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-xl leading-relaxed drop-shadow-md">
                {slides[index].desc}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                to={slides[index].cta.to}
                onClick={() => sound.play('click')}
                className="glow-btn relative overflow-hidden shine group px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs tracking-[.2em] uppercase flex items-center gap-3 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all cursor-pointer"
              >
                <span>{slides[index].cta.label}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => sound.play('click')}
                className="px-8 py-4 rounded-full border border-white/30 hover:border-emerald-400/80 hover:bg-white/10 backdrop-blur text-white font-bold text-xs tracking-[.2em] uppercase transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-soft-sm"
              >
                <span>{t('nav.howItWorks', 'How It Works')}</span>
              </Link>
            </div>

            {/* Quick Municipal Feature Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-white/75">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                24 BMC Wards
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                OpenAI CLIP Vision
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                SLA Auto-Escalate
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                <Waves size={12} className="text-teal-400" />
                IMD Flood Radar
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                1916 Control Room
              </span>
            </div>
          </div>

          {/* Right Column: Floating Cyber Live Telemetry Card (Kavach Style + Scanning Laser) */}
          <div
            className="hidden lg:block lg:col-span-5"
            style={{ transform: 'translate3d(calc(var(--mx,0) * 24px), calc(var(--my,0) * 16px), 0)' }}
          >
            <div className="rounded-3xl bg-neutral-900/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-6 font-mono relative overflow-hidden group">

              {/* Laser Scanner Line Sweeping across the card */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent scanner-line pointer-events-none opacity-60" />

              {/* Top Card Ambient Glow */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between text-xs tracking-[.25em] text-white/80 pb-4 border-b border-white/15">
                <span className="flex items-center gap-2.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#4ade80]" style={{ animation: 'blink 1.2s infinite' }} />
                  LIVE TELEMETRY
                </span>
                <span className="text-emerald-400/90 text-[11px] font-bold">
                  {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                </span>
              </div>

              {/* Telemetry Ticket Rows */}
              <div className="divide-y divide-white/10 my-2">
                {slides[index].rows.map(([id, label, st], r) => (
                  <div
                    key={id}
                    onClick={() => sound.play('pop')}
                    className="row-in flex items-center justify-between py-3.5 text-xs transition-all hover:bg-white/10 px-2 rounded-xl cursor-pointer"
                    style={{ '--r': r }}
                  >
                    <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
                      {id}
                    </span>
                    <span className="text-white/70 text-[11px] truncate max-w-[150px]">{label}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border tracking-wider ${STATUS_STYLES[st] || 'text-white'}`}>
                      {st}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card Footer Telemetry HUD */}
              <div className="mt-3 pt-3.5 border-t border-white/15 flex items-center justify-between text-[10px] text-white/60">
                <span className="flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-400 animate-pulse" />
                  BMC NODE: OPTIMAL (18.4h SLA)
                </span>
                <span className="font-semibold text-emerald-400/90 font-mono">GPS 19.076° N, 72.877° E</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Vertical Dot Indicators (Right Edge, Kavach Style) with Pause/Play Above ── */}
      <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center gap-3">
        {/* Play/Pause Button positioned directly above the 5 slide indicators */}
        <button
          onClick={togglePause}
          aria-label={paused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          title={paused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          className={`w-7 h-7 mb-1 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md ${
            paused
              ? 'border-emerald-400 bg-emerald-500/25 text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.6)] scale-110'
              : 'border-white/30 bg-neutral-900/70 text-white/80 hover:text-white hover:border-emerald-400/80 hover:bg-white/15'
          }`}
        >
          {paused ? (
            <Play size={11} className="translate-x-0.5 fill-current" />
          ) : (
            <Pause size={11} className="fill-current" />
          )}
        </button>

        <span className="w-px h-6 bg-gradient-to-b from-transparent via-white/30 to-white/10" />

        {slides.map((s, i) => (
          <button
            key={s.eyebrow}
            onClick={() => { sound.play('pop'); go(i); }}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full border transition-all duration-500 cursor-pointer ${
              i === index
                ? 'w-3.5 h-3.5 bg-emerald-400 border-emerald-300 shadow-[0_0_16px_#4ade80]'
                : 'w-2.5 h-2.5 border-white/50 hover:bg-white/40'
            }`}
          />
        ))}

        <span className="w-px h-8 bg-gradient-to-t from-transparent via-white/30 to-transparent" />
      </div>
    </section>
  );
};
