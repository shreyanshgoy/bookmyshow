import React from 'react';
import { Film, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                Book<span className="text-rose-500">My</span>Show
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier movie ticketing destination with real-time seat locks, 4K Dolby theaters, and instant digital passes.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Popular Cities</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Mumbai Cinemas</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Delhi-NCR Theaters</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Bengaluru IMAX</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Hyderabad Multiplexes</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Cinema Experience</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">IMAX 3D with Laser</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Dolby Atmos Surround</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">VIP Recliner Lounges</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Gourmet In-Seat Dining</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Platform Guarantee</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Zero Double-Booking</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Powered by atomic database concurrency and real-time Socket.io seat locking.
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BookMyShow MERN Clone. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>using React, Express, MongoDB & Socket.io</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
