import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Star, 
  Clock, 
  Calendar, 
  MapPin, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  X,
  Volume2
} from 'lucide-react';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCity } = useAuth();

  const [movie, setMovie] = useState(null);
  const [groupedTheaters, setGroupedTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  // Date selection (default to today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Available dates for quick filtering (3 days)
  const dateOptions = [0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return { dateStr, dayName, formattedDate };
  });

  useEffect(() => {
    const fetchMovieAndShows = async () => {
      setLoading(true);
      try {
        const [movieRes, showsRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/shows?movieId=${id}&city=${encodeURIComponent(selectedCity)}&date=${selectedDate}`),
        ]);

        setMovie(movieRes.data.data);
        setGroupedTheaters(showsRes.data.grouped || []);
      } catch (err) {
        console.error('Failed to load movie details or shows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShows();
  }, [id, selectedCity, selectedDate]);

  if (loading) {
    return <LoadingSpinner message="Loading movie details & theater showtimes..." />;
  }

  if (!movie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Format trailer embed URL if valid YouTube URL
  let embedUrl = '';
  if (movie.trailerUrl) {
    const ytMatch = movie.trailerUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      embedUrl = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1`;
    }
  }

  return (
    <div className="space-y-12 pb-20">
      
      {/* Movie Hero Banner Backdrop */}
      <section className="relative w-full bg-slate-950 border-b border-slate-800 overflow-hidden">
        
        {/* Background Backdrop image with high blur */}
        <div className="absolute inset-0 opacity-20 filter blur-2xl scale-110 pointer-events-none">
          <img src={movie.bannerUrl || movie.posterUrl} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
            
            {/* Poster Card */}
            <div className="w-56 sm:w-64 md:w-72 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 relative group">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {movie.trailerUrl && (
                <button
                  onClick={() => setTrailerModalOpen(true)}
                  className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-white font-semibold text-xs"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/50">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                  <span>Watch Trailer</span>
                </button>
              )}
            </div>

            {/* Info Column */}
            <div className="flex-1 space-y-5 text-center md:text-left">
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                    {movie.certificate || 'UA'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-600/20 border border-rose-500/40 text-xs font-bold text-rose-400">
                    {movie.language?.join(', ')}
                  </span>
                  {movie.isUpcoming && (
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-400">
                      Coming Soon
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                  {movie.title}
                </h1>

                {/* Rating & Votes */}
                <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-white shadow-sm">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-extrabold">{movie.rating}</span>
                    <span className="text-xs text-slate-400">/10</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    ({movie.votes ? `${movie.votes.toLocaleString()} Votes` : '100+ Votes'})
                  </span>
                </div>
              </div>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </span>
                <span>•</span>
                <span>{movie.genre?.join(', ')}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Released: {new Date(movie.releaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Synopsis */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {movie.description}
              </p>

              {/* Cast & Crew Pill Avatars */}
              {movie.casts && movie.casts.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Top Cast & Crew
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    {movie.casts.map((actor, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          {actor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{actor.name}</div>
                          <div className="text-[10px] text-slate-400">{actor.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Trailer Button */}
              {movie.trailerUrl && (
                <div className="pt-2">
                  <button
                    onClick={() => setTrailerModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 shadow-md transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>Watch Official Trailer</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* Theaters & Showtimes Selector Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Date Selector Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Select Date & Theaters in {selectedCity}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time seat locking active on all shows
            </p>
          </div>

          {/* 3-Day Filter Bar */}
          <div className="flex items-center gap-2">
            {dateOptions.map((opt) => (
              <button
                key={opt.dateStr}
                onClick={() => setSelectedDate(opt.dateStr)}
                className={`flex flex-col items-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDate === opt.dateStr
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-80">{opt.dayName}</span>
                <span className="text-sm font-extrabold">{opt.formattedDate}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theaters List */}
        {groupedTheaters.length > 0 ? (
          <div className="space-y-4">
            {groupedTheaters.map(({ theater, shows }) => (
              <div
                key={theater._id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all space-y-4"
              >
                {/* Theater Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>{theater.name}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {theater.address}
                    </p>
                  </div>

                  {/* Amenities */}
                  {theater.facilities && (
                    <div className="flex flex-wrap items-center gap-2">
                      {theater.facilities.slice(0, 3).map((facility, fIdx) => (
                        <span
                          key={fIdx}
                          className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-medium border border-slate-700"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Showtimes Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {shows.map((show) => (
                    <button
                      key={show._id}
                      onClick={() => navigate(`/shows/${show._id}/seats`)}
                      className="group flex flex-col items-center p-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-rose-600 border border-slate-700/80 hover:border-rose-500 text-slate-200 hover:text-white transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-rose-600/30"
                    >
                      <span className="text-sm font-extrabold group-hover:scale-105 transition-transform">
                        {show.startTime}
                      </span>
                      <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-400 group-hover:text-rose-100">
                        <span>{show.format || '2D'}</span>
                        <span>•</span>
                        <span>₹{show.pricing?.Gold || 220}</span>
                      </div>
                    </button>
                  ))}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <p className="text-slate-400 text-sm">
              No shows scheduled for <span className="font-semibold text-white">{movie.title}</span> on{' '}
              <span className="text-rose-400 font-semibold">{selectedDate}</span> in {selectedCity}.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try selecting a different date above or change your city in the navigation bar.
            </p>
          </div>
        )}

      </section>

      {/* Trailer Modal */}
      {trailerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>{movie.title} - Official Trailer</span>
              </span>
              <button
                onClick={() => setTrailerModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Official Trailer"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  Trailer video not available for embedding.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
