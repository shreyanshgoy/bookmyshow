import React from 'react';
import { Film } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading cinema experience...' }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
      <div className="relative w-14 h-14">
        <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-rose-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Film className="w-5 h-5 text-rose-500 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-400 tracking-wide">{message}</p>
    </div>
  );
}
