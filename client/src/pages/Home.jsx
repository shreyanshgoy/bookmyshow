import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Sparkles, Calendar, Play, ChevronRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const GENRES = ['All', 'Action', 'Adventure', 'Sci-Fi', 'Comedy', 'Drama', 'Mythology'];

export default function Home() {
  const { selectedCity } = useAuth();
  const [movies, setMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const [nowShowingRes, upcomingRes] = await Promise.all([
          api.get(`/movies?city=${encodeURIComponent(selectedCity)}&status=now-showing`),
          api.get('/movies?status=upcoming'),
        ]);

        setMovies(nowShowingRes.data.data);
        setUpcomingMovies(upcomingRes.data.data);
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedCity]);

  // Filter movies by genre
  const filteredNowShowing = movies.filter((movie) => {
    if (selectedGenre === 'All') return true;
    return movie.genre?.includes(selectedGenre);
  });

  const featuredMovie = movies[heroIndex] || movies[0];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner Carousel Section */}
      {featuredMovie && (
        <section className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] overflow-hidden rounded-3xl mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            
            {/* Background Backdrop Image */}
            <img
              src={featuredMovie.bannerUrl || featuredMovie.posterUrl}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center filter brightness-75 scale-100 animate-in fade-in duration-700"
            />

            {/* Gradient Mask Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d14] via-[#0a0d14]/70 to-transparent w-full md:w-3/4" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14 max-w-3xl space-y-4">
              
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-rose-600/40">
                  <Sparkles className="w-3.5 h-3.5" /> Featured Blockbuster
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-amber-400 text-xs font-bold">
                  ★ {featuredMovie.rating}/10
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-none tracking-tight">
                {featuredMovie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium">
                <span>{featuredMovie.certificate || 'UA'}</span>
                <span>•</span>
                <span>{featuredMovie.duration} mins</span>
                <span>•</span>
                <span>{featuredMovie.genre?.join(', ')}</span>
                <span>•</span>
                <span className="text-rose-400 font-semibold">{featuredMovie.language?.join(' • ')}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl">
                {featuredMovie.description}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <Link
                  to={`/movies/${featuredMovie._id}`}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <span>Book Tickets</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                {featuredMovie.trailerUrl && (
                  <a
                    href={featuredMovie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 flex items-center gap-2 transition-all"
                  >
                    <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Watch Trailer</span>
                  </a>
                )}
              </div>

            </div>

            {/* Carousel Selector Dots */}
            {movies.length > 1 && (
              <div className="absolute bottom-6 right-6 flex items-center gap-2 z-10">
                {movies.slice(0, 5).map((m, idx) => (
                  <button
                    key={m._id}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      heroIndex === idx ? 'w-8 bg-rose-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}

          </div>
        </section>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Genre Filter Pills */}
        <section className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-rose-500" /> Filter:
            </span>
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                  selectedGenre === genre
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">
            Showing in <span className="font-semibold text-white">{selectedCity}</span>
          </div>
        </section>

        {/* Now Showing Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Now Showing in {selectedCity}</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore the latest theatrical blockbusters running right now
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {filteredNowShowing.length} Movies Available
            </span>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching cinema schedules..." />
          ) : filteredNowShowing.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
              {filteredNowShowing.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <p className="text-slate-400 text-sm">
                No movies found for genre <span className="text-rose-400 font-semibold">{selectedGenre}</span> in {selectedCity}.
              </p>
              <button
                onClick={() => setSelectedGenre('All')}
                className="mt-3 px-4 py-2 rounded-lg bg-slate-800 text-xs font-bold text-white hover:bg-slate-700"
              >
                Clear Filter
              </button>
            </div>
          )}
        </section>

        {/* Upcoming Movies Section */}
        {upcomingMovies.length > 0 && (
          <section className="space-y-6 pt-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-500" />
                  <span>Upcoming Anticipated Releases</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Catch what's arriving soon to the big screen
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
              {upcomingMovies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
