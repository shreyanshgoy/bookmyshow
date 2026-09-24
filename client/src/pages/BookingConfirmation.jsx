import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../services/api';
import TicketCard from '../components/TicketCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle2, Ticket, Home } from 'lucide-react';

export default function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#f59e0b', '#10b981', '#38bdf8', '#8b5cf6'],
    });

    if (!booking && id) {
      api
        .get(`/bookings/${id}`)
        .then((res) => {
          setBooking(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load booking:', err);
          setLoading(false);
        });
    }
  }, [id, booking]);

  if (loading) {
    return <LoadingSpinner message="Generating your verified cinema pass..." />;
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
        <Link to="/" className="mt-4 inline-block px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      
      {/* Header Celebration Title */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Your tickets have been reserved and an e-ticket confirmation has been sent to your email.
        </p>
      </div>

      {/* Ticket Pass Component */}
      <TicketCard booking={booking} />

      {/* Next Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 print:hidden">
        <Link
          to="/my-bookings"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition-all"
        >
          <Ticket className="w-4 h-4" />
          <span>Go to My Bookings</span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Explore More Movies</span>
        </Link>
      </div>

    </div>
  );
}
