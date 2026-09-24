import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Film, Calendar, Clock, MapPin, Printer, CheckCircle } from 'lucide-react';

export default function TicketCard({ booking }) {
  const printRef = useRef(null);

  if (!booking) return null;

  const show = booking.showId || {};
  const movie = show.movieId || {};
  const theater = show.theaterId || {};
  const screen = show.screenId || {};

  const handlePrint = () => {
    window.print();
  };

  const qrValue = booking.bookingId
    ? `https://bookmyshow-verify.com/ticket/${booking.bookingId}`
    : 'BMS-VERIFIED';

  return (
    <div className="flex flex-col items-center">
      
      {/* Printable Ticket Container */}
      <div
        ref={printRef}
        className="w-full max-w-xl bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden relative text-white"
      >
        {/* Top Header Banner */}
        <div className="bg-rose-600 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-white" />
            <span className="font-extrabold tracking-wider text-sm uppercase">BOOKMYSHOW CINEMA PASS</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-black/25 px-2.5 py-0.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>CONFIRMED</span>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
          
          {/* Movie Poster */}
          <div className="w-28 h-40 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border border-slate-700">
            <img
              src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80'}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Show Information */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                {movie.title}
              </h2>
              <p className="text-xs text-rose-400 font-semibold mt-0.5">
                {movie.certificate || 'UA'} • {show.format || '2D'} • {show.language || 'English'}
              </p>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span className="font-medium line-clamp-1">{theater.name}, {theater.city}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {show.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {show.startTime}
                </span>
              </div>
            </div>

            {/* Screen & Seats Badge */}
            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                <span className="text-slate-400">Auditorium: </span>
                <span className="font-bold text-white">{screen.screenNumber || 'Audi 1'}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-rose-600/20 border border-rose-500/40 text-xs">
                <span className="text-rose-300">Seats: </span>
                <span className="font-extrabold text-rose-400">
                  {booking.seats?.map((s) => s.seatNumber).join(', ')}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Perforated Divider */}
        <div className="relative flex items-center my-1">
          <div className="w-6 h-6 rounded-full bg-[#0a0d14] -ml-3 border-r border-slate-700/80"></div>
          <div className="flex-1 border-t-2 border-dashed border-slate-700/60 mx-2"></div>
          <div className="w-6 h-6 rounded-full bg-[#0a0d14] -mr-3 border-l border-slate-700/80"></div>
        </div>

        {/* Bottom Stub: QR Code & Price details */}
        <div className="p-6 md:p-8 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Booking Info */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Booking Reference</div>
            <div className="font-mono text-base font-bold text-white tracking-widest bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 inline-block">
              {booking.bookingId}
            </div>
            <div className="text-xs text-slate-400 pt-1">
              Total Amount: <span className="font-bold text-emerald-400 text-sm">₹{booking.totalAmount}</span>
              <span className="text-[10px] text-slate-500 ml-1">({booking.seats?.length} tickets incl. taxes)</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center bg-white p-2.5 rounded-2xl shadow-xl">
            <QRCodeSVG value={qrValue} size={90} level="H" />
            <span className="text-[9px] font-bold text-slate-900 mt-1 uppercase tracking-tighter">
              Scan at Entrance
            </span>
          </div>

        </div>

      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center gap-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 shadow-md transition-all"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          <span>Print / Save Ticket</span>
        </button>
      </div>

    </div>
  );
}
