'use client';

import { useEffect, useRef, useState } from 'react';

const metrics = [
  { emoji: '👥', number: 500,  suffix: '+',   label: 'Aktif Satıcı',           duration: 1500 },
  { emoji: '📈', number: 40,   suffix: '%',   label: 'Ortalama Kâr Artışı',    duration: 1500 },
  { emoji: '⚡', number: 2,    suffix: ' dk', label: 'Ortalama Analiz Süresi', duration: 800  },
  { emoji: '🎯', number: 8,    suffix: '+',   label: 'Hesaplanan Gider Kalemi', duration: 800  },
];

function CountUp({ target, suffix, duration }: { target: number; suffix: string; duration: number }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setValue(Math.round((target / steps) * step));
      if (step >= steps) {
        setValue(target);
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}{suffix}
    </span>
  );
}

export function SuccessMetrics() {
  return (
    <section className="py-16 px-4 bg-primary/10 rounded-3xl mx-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="flex flex-col items-center text-center gap-3 py-6"
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-4xl md:text-5xl font-bold text-primary leading-none">
                <CountUp target={m.number} suffix={m.suffix} duration={m.duration} />
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
