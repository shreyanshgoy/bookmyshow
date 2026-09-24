import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon, AlertTriangle } from 'lucide-react';

export default function CountdownTimer({ initialSeconds = 600, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const isUrgent = secondsLeft < 120; // Under 2 minutes

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all ${
        isUrgent
          ? 'bg-red-950/80 border-red-500/60 text-red-400 animate-pulse shadow-lg shadow-red-950/40'
          : 'bg-slate-900 border-slate-700 text-slate-200 shadow-sm'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
      ) : (
        <TimerIcon className="w-3.5 h-3.5 text-rose-500" />
      )}
      <span>Hold Time:</span>
      <span className="font-mono text-sm tracking-wider">{formattedTime}</span>
    </div>
  );
}
