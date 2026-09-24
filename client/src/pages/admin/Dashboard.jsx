import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  DollarSign, 
  Ticket, 
  Film, 
  Building2, 
  TrendingUp, 
  Users, 
  Calendar, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/stats');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating cinema revenue & booking analytics..." />;
  }

  const stats = data?.stats || {};
  const movieStats = data?.movieStats || [];
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Management Console</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Cinema Analytics & Operations
          </h1>
        </div>

        {/* Quick Nav Pill Links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/movies"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Movies
          </Link>
          <Link
            to="/admin/theaters"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Theaters
          </Link>
          <Link
            to="/admin/shows"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Shows
          </Link>
          <Link
            to="/admin/users"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Users
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">₹{stats.totalRevenue?.toLocaleString() || 0}</div>
          <p className="text-[11px] text-emerald-400 font-medium">Verified Paid Bookings</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats.totalBookings || 0}</div>
          <p className="text-[11px] text-slate-400 font-medium">{stats.totalTicketsSold || 0} Tickets Issued</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Movies</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats.totalMovies || 0}</div>
          <p className="text-[11px] text-slate-400 font-medium">{stats.totalShows || 0} Active Showtimes</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cinema Theaters</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats.totalTheaters || 0}</div>
          <p className="text-[11px] text-slate-400 font-medium">Across Top Metro Cities</p>
        </div>

      </div>

      {/* Top Movies & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top Grossing Movies */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <span>Top Performing Movies</span>
          </h2>

          <div className="space-y-4 pt-2">
            {movieStats.length > 0 ? (
              movieStats.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.title}</span>
                    <span className="font-bold text-emerald-400">₹{item.revenue}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(15, (item.revenue / (stats.totalRevenue || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No revenue data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Live Recent Bookings Feed */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-emerald-400" />
              <span>Recent Transactions Feed</span>
            </h2>
            <span className="text-[11px] text-slate-400">Latest 10</span>
          </div>

          <div className="space-y-3 pt-2">
            {recentBookings.length > 0 ? (
              recentBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{b.showId?.movieId?.title || 'Movie'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({b.userId?.name || 'Customer'})</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ID: <span className="font-mono text-slate-300">{b.bookingId}</span> • {b.seats?.length} Seats ({b.seats?.map((s) => s.seatNumber).join(', ')})
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-emerald-400">₹{b.totalAmount}</div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No transactions recorded yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
