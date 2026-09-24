import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

export default function MovieCard({ movie }) {
  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="group flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-rose-950/20 transition-all duration-300">
      
      {/* Poster Image with overlay */}
      <Link to={`/movies/${movie._id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950 block">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-white shadow-lg">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold">{movie.rating}</span>
          <span className="text-[10px] text-slate-400">/10</span>
          {movie.votes && (
            <span className="text-[10px] text-slate-400 font-normal">
              ({movie.votes > 1000 ? `${(movie.votes / 1000).toFixed(1)}k` : movie.votes})
            </span>
          )}
        </div>

        {/* Certificate Badge */}
        {movie.certificate && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wider text-slate-300">
            {movie.certificate}
          </div>
        )}

        {movie.isUpcoming && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-rose-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-lg">
            Upcoming
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/movies/${movie._id}`}>
            <h3 className="font-bold text-base text-white group-hover:text-rose-400 transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            {movie.genre?.join(', ')}
          </p>

          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
              {movie.language?.join(' • ')}
            </span>
            {movie.duration && (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                {formatDuration(movie.duration)}
              </span>
            )}
          </div>
        </div>

        {/* Book Button */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <Link
            to={`/movies/${movie._id}`}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 group-hover:bg-rose-600 text-slate-200 group-hover:text-white font-semibold text-xs flex items-center justify-center transition-all duration-200 shadow-sm group-hover:shadow-lg group-hover:shadow-rose-600/30"
          >
            {movie.isUpcoming ? 'View Details' : 'Book Tickets'}
          </Link>
        </div>

      </div>

    </div>
  );
}
