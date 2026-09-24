import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TicketCard from '../components/TicketCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  X, 
  CheckCircle, 
  Ban, 
  Eye 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data.data);
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Your seats will be released and refund initiated.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      setActionMsg('Booking cancelled successfully and seats released.');
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your cinema passes..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Ticket className="w-7 h-7 text-rose-500" />
            <span>My Bookings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View your upcoming show passes and booking history
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Total Bookings: <span className="font-bold text-white">{bookings.length}</span>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const show = booking.showId || {};
            const movie = show.movieId || {};
            const theater = show.theaterId || {};
            const screen = show.screenId || {};
            const isCancelled = booking.bookingStatus === 'cancelled';

            return (
              <div
                key={booking._id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
              >
                
                {/* Movie & Show Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80'}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-xl shadow-md border border-slate-700 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-white">{movie.title}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCancelled
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isCancelled ? 'CANCELLED' : 'CONFIRMED'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{theater.name}, {theater.city}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {show.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {show.startTime}
                      </span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">{screen.screenNumber || 'Audi 1'}</span>
                    </div>

                    <div className="text-xs text-slate-300 pt-1">
                      Seats: <span className="font-bold text-rose-400">{booking.seats?.map((s) => s.seatNumber).join(', ')}</span>
                      <span className="text-slate-400 ml-2">Total: <strong className="text-white">₹{booking.totalAmount}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end md:self-center w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
                  <button
                    onClick={() => setSelectedTicket(booking)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-rose-400" />
                    <span>View Pass</span>
                  </button>

                  {!isCancelled && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingId === booking._id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-400 text-xs font-semibold border border-red-800/60 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't reserved any movie tickets yet. Find your favorite film and book now!
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs shadow-lg shadow-rose-600/30"
          >
            Explore Movies
          </Link>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <TicketCard booking={selectedTicket} />
          </div>
        </div>
      )}

    </div>
  );
}
