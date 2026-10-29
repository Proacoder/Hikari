// ─── Motion primitives: scroll reveal + animated counter (no extra deps) ───
import { useEffect, useRef, useState } from 'react';

export const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
};

export const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} style={{ '--d': `${delay}ms` }} className={`reveal ${inView ? 'in' : ''} ${className}`}>
      {children}
    </Tag>
  );
};

export const CountUp = ({ to, decimals = 0, suffix = '', duration = 1600 }) => {
  const [ref, inView] = useInView(0.3);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf; const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  const n = Number(val.toFixed(decimals));
  return <span ref={ref}>{n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
};
