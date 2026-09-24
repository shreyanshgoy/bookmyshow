import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import SeatMap from '../components/SeatMap';
import CountdownTimer from '../components/CountdownTimer';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ChevronLeft, 
  Film, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  Radio
} from 'lucide-react';

export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinShow, leaveShow } = useSocket();

  const [show, setShow] = useState(null);
  const [seatMap, setSeatMap] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockExpiresAt, setLockExpiresAt] = useState(null);

  // 1. Initial Load of Show & Seat Map
  const loadSeatMap = useCallback(async () => {
    try {
      const res = await api.get(`/seats/show/${showId}`);
      setShow(res.data.data.show);
      setSeatMap(res.data.data.seatMap || {});

      // Restore seats already locked by this user if any
      const myExistingLocks = [];
      const currentUserId = user?.id || user?._id;
      for (const [seatNum, data] of Object.entries(res.data.data.seatMap || {})) {
        if (data.status === 'locked' && (data.isMine || (currentUserId && data.lockedBy === currentUserId))) {
          myExistingLocks.push({
            seatNumber: seatNum,
            tier: data.tier,
            price: res.data.data.show.pricing?.[data.tier] || 200,
          });
        }
      }
      setSelectedSeats(myExistingLocks);
    } catch (err) {
      console.error('Failed to load seat map:', err);
      setErrorMsg('Could not load seat map. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, [showId, user]);

  useEffect(() => {
    loadSeatMap();
  }, [loadSeatMap]);

  // 2. Real-time Socket.io Room & Events
  useEffect(() => {
    if (!socket || !showId) return;

    joinShow(showId);

    // Live Event: Seat Locked by someone
    const handleSeatLocked = (seatData) => {
      setSeatMap((prev) => ({
        ...prev,
        [seatData.seatNumber]: {
          status: 'locked',
          seatNumber: seatData.seatNumber,
          tier: seatData.tier,
          lockedBy: seatData.lockedBy,
          expiresAt: seatData.expiresAt,
          isMine: user ? seatData.lockedBy === (user.id || user._id) : false,
        },
      }));
    };

    // Live Event: Seat Released
    const handleSeatReleased = ({ seatNumber }) => {
      setSeatMap((prev) => {
        const copy = { ...prev };
        delete copy[seatNumber];
        return copy;
      });

      // If user had this seat selected, remove from selected
      setSelectedSeats((prev) => prev.filter((s) => s.seatNumber !== seatNumber));
    };

    // Live Event: Seat Permanently Booked
    const handleSeatBooked = ({ seats }) => {
      setSeatMap((prev) => {
        const copy = { ...prev };
        for (const seatNum of seats) {
          copy[seatNum] = {
            status: 'booked',
            seatNumber: seatNum,
          };
        }
        return copy;
      });
      // Remove from selected if matched
      setSelectedSeats((prev) => prev.filter((s) => !seats.includes(s.seatNumber)));
    };

    socket.on('seat:locked', handleSeatLocked);
    socket.on('seat:released', handleSeatReleased);
    socket.on('seat:booked', handleSeatBooked);

    return () => {
      leaveShow(showId);
      socket.off('seat:locked', handleSeatLocked);
      socket.off('seat:released', handleSeatReleased);
      socket.off('seat:booked', handleSeatBooked);
    };
  }, [socket, showId, joinShow, leaveShow, user]);

  // 3. Handle Seat Click (Atomic Lock / Release)
  const handleSeatClick = async ({ seatNumber, tier, price, isCurrentlySelected }) => {
    setErrorMsg('');

    // Require authentication to select/lock seats
    if (!user) {
      navigate('/login', { state: { from: `/shows/${showId}/seats` } });
      return;
    }

    if (isCurrentlySelected) {
      // Release seat
      try {
        await api.post('/seats/release', { showId, seatNumber });
        setSelectedSeats((prev) => prev.filter((s) => s.seatNumber !== seatNumber));
        setSeatMap((prev) => {
          const copy = { ...prev };
          delete copy[seatNumber];
          return copy;
        });
      } catch (err) {
        console.error('Failed to release seat:', err);
      }
    } else {
      // Max 8 tickets per booking
      if (selectedSeats.length >= 8) {
        setErrorMsg('You can select a maximum of 8 seats per booking.');
        return;
      }

      // Lock seat atomically
      try {
        const res = await api.post('/seats/lock', {
          showId,
          seatNumber,
          tier,
          price,
        });

        const newSeat = { seatNumber, tier, price };
        setSelectedSeats((prev) => [...prev, newSeat]);
        setLockExpiresAt(res.data.data.expiresAt);

        setSeatMap((prev) => ({
          ...prev,
          [seatNumber]: {
            status: 'locked',
            seatNumber,
            tier,
            lockedBy: user.id || user._id,
            expiresAt: res.data.data.expiresAt,
            isMine: true,
          },
        }));
      } catch (err) {
        const msg = err.response?.data?.message || 'Could not lock seat. Please try another.';
        setErrorMsg(msg);
      }
    }
  };

  // 4. Timer Expiry Handler
  const handleTimerExpire = () => {
    setErrorMsg('Your 10-minute seat reservation has expired. Please re-select your seats.');
    setSelectedSeats([]);
    loadSeatMap();
  };

  // 5. Navigate to Checkout
  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) return;

    // Save booking intent state into sessionStorage for seamless checkout flow
    sessionStorage.setItem(
      'bms_checkout_session',
      JSON.stringify({
        showId,
        show,
        seats: selectedSeats,
        timestamp: Date.now(),
      })
    );

    navigate('/checkout');
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to auditorium & live seat radar..." />;
  }

  if (!show) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Showtime Not Found</h2>
        <Link to="/" className="mt-4 inline-block px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm">
          Return Home
        </Link>
      </div>
    );
  }

  const subtotal = selectedSeats.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="space-y-6 pb-32">
      
      {/* Top Header Bar */}
      <div className="bg-slate-950 border-b border-slate-800 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/movies/${show.movie?._id}`)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{show.movie?.title}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-600/20 text-rose-400 font-bold border border-rose-500/30">
                  {show.format || '2D'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-slate-300 font-medium">{show.theater?.name}</span>
                <span>•</span>
                <span>{show.date} | {show.startTime}</span>
              </p>
            </div>
          </div>

          {/* Real-time Status Badge & Timer */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live Synced</span>
            </div>

            {selectedSeats.length > 0 && (
              <CountdownTimer initialSeconds={600} onExpire={handleTimerExpire} />
            )}
          </div>

        </div>
      </div>

      {/* Error alert toast if collision or issue */}
      {errorMsg && (
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-600/60 text-amber-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Interactive Seat Map */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-slate-950/80 rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-8">
          <SeatMap
            screen={show.screen}
            pricing={show.pricing}
            seatMap={seatMap}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
            currentUserId={user?.id || user?._id}
          />
        </div>
      </div>

      {/* Floating Bottom Booking Summary Bar */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Selected Seats info */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">
                  {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected
                </span>
                <span className="font-extrabold text-base text-rose-400">
                  {selectedSeats.map((s) => s.seatNumber).join(', ')}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-700 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Tickets Subtotal</span>
                <span className="font-black text-lg text-white">₹{subtotal}</span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleProceedToCheckout}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/40 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <span>Proceed to Pay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
