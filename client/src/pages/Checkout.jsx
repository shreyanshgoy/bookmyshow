import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import { 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Zap, 
  AlertCircle, 
  Lock, 
  Check, 
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

const CONVENIENCE_FEE_PER_TICKET = 30;
const GST_RATE = 0.18;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [checkoutData, setCheckoutData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for simulator
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  useEffect(() => {
    const raw = sessionStorage.getItem('bms_checkout_session');
    if (!raw) {
      navigate('/');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setCheckoutData(parsed);
    } catch (e) {
      navigate('/');
    }
  }, [navigate]);

  if (!checkoutData) {
    return null;
  }

  const { showId, show, seats } = checkoutData;
  const movie = show?.movie || show?.movieId || {};
  const theater = show?.theater || show?.theaterId || {};

  // Financial calculations
  const subtotal = seats.reduce((acc, curr) => acc + curr.price, 0);
  const rawFee = seats.length * CONVENIENCE_FEE_PER_TICKET;
  const convenienceFee = Math.round(rawFee * (1 + GST_RATE));
  const totalAmount = subtotal + convenienceFee;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setProcessing(true);

    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (simulateFailure) {
      setProcessing(false);
      setErrorMsg('Transaction was declined by payment simulator. Please try again with valid mock details.');
      return;
    }

    try {
      const res = await api.post('/bookings', {
        showId,
        seats,
        paymentMethod,
        paymentTransactionId: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      });

      const booking = res.data.data;
      sessionStorage.removeItem('bms_checkout_session');

      // Navigate to confirmed celebration page
      navigate(`/booking/confirmation/${booking._id}`, { state: { booking } });
    } catch (err) {
      setProcessing(false);
      const msg = err.response?.data?.message || 'Payment processing failed. Your seats may have expired.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to={`/shows/${showId}/seats`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Seats</span>
        </Link>
        <CountdownTimer initialSeconds={600} onExpire={() => navigate(`/shows/${showId}/seats`)} />
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
            
            <div className="flex items-start gap-4 pb-5 border-b border-slate-800">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded-xl shadow-md border border-slate-700"
              />
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-white">{movie.title}</h3>
                <p className="text-xs text-rose-400 font-semibold">
                  {show.format || '2D'} • {show.language || 'English'}
                </p>
                <p className="text-xs text-slate-400">{theater.name}</p>
                <p className="text-xs text-slate-400">{show.date} • {show.startTime}</p>
              </div>
            </div>

            {/* Selected Seats Listing */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Reserved Seats ({seats.length})
              </div>
              <div className="space-y-2">
                {seats.map((seat) => (
                  <div key={seat.seatNumber} className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold text-white">Seat {seat.seatNumber} ({seat.tier})</span>
                    <span>₹{seat.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Calculations Breakdown */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Tickets Subtotal:</span>
                <span className="text-slate-200 font-medium">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Convenience Fee & GST (18%):</span>
                <span className="text-slate-200 font-medium">₹{convenienceFee}</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-sm font-black text-white">
                <span>Total Payable:</span>
                <span className="text-lg text-emerald-400">₹{totalAmount}</span>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>
              Guaranteed Atomic Reservation. These seats are locked exclusively for you until payment completes.
            </span>
          </div>
        </div>

        {/* Right Column: Payment Gateway Simulation */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
            
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>Secure Checkout Gateway</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose your preferred simulated payment mode to confirm your booking
              </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  paymentMethod === 'CARD'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NET_BANKING')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  paymentMethod === 'NET_BANKING'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* Payment Form Details */}
            <form onSubmit={handlePayNow} className="space-y-5">
              
              {paymentMethod === 'UPI' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Instant 1-Click UPI Simulator Ready</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      VERIFIED
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NET_BANKING' && (
                <div className="space-y-3 animate-in fade-in">
                  <label className="block text-xs font-semibold text-slate-300">
                    Select Your Bank
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank, idx) => (
                      <div
                        key={bank}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                          idx === 0
                            ? 'bg-rose-600/20 border-rose-500 text-white font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{bank}</span>
                        {idx === 0 && <Check className="w-4 h-4 text-rose-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dev Simulator Toggle: Simulate Payment Failure */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Simulate Payment Failure (Tests transaction rollback & seat error handling)</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-white font-extrabold text-sm shadow-xl shadow-rose-600/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {processing ? (
                  <span>Securing Tickets & Authorizing Payment...</span>
                ) : (
                  <>
                    <span>Pay ₹{totalAmount} & Confirm Booking</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
}
