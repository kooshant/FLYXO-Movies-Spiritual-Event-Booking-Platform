import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTime({ days: 0, hours: 0, mins: 0, secs: 0 });
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hrs', value: time.hours },
    { label: 'Min', value: time.mins },
    { label: 'Sec', value: time.secs },
  ];

  return (
    <div className="flex gap-3">
      {units.map((u) => (
        <div key={u.label} className="text-center glass-card px-4 py-3 min-w-[60px]">
          <div className="text-2xl font-display font-bold text-flyxo-primary">
            {String(u.value).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500">{u.label}</div>
        </div>
      ))}
    </div>
  );
}
