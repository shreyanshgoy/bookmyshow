import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Film, Plus, Edit2, Trash2, X, Star, Check } from 'lucide-react';

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    genre: '',
    language: '',
    duration: 120,
    releaseDate: new Date().toISOString().split('T')[0],
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    rating: 8.0,
    certificate: 'UA',
    isUpcoming: false,
  });

  const fetchMovies = async () => {
    try {
      const res = await api.get('/movies');
      setMovies(res.data.data);
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openAddModal = () => {
    setEditingMovie(null);
    setForm({
      title: '',
      description: '',
      genre: 'Action, Thriller',
      language: 'English, Hindi',
      duration: 135,
      releaseDate: new Date().toISOString().split('T')[0],
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      bannerUrl: '',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      rating: 8.4,
      certificate: 'UA',
      isUpcoming: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title,
      description: movie.description,
      genre: movie.genre?.join(', ') || '',
      language: movie.language?.join(', ') || '',
      duration: movie.duration,
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl || '',
      trailerUrl: movie.trailerUrl || '',
      rating: movie.rating || 8.0,
      certificate: movie.certificate || 'UA',
      isUpcoming: movie.isUpcoming || false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        genre: form.genre.split(',').map((g) => g.trim()).filter(Boolean),
        language: form.language.split(',').map((l) => l.trim()).filter(Boolean),
        duration: Number(form.duration),
        rating: Number(form.rating),
      };

      if (editingMovie) {
        await api.put(`/movies/${editingMovie._id}`, payload);
      } else {
        await api.post('/movies', payload);
      }

      setModalOpen(false);
      await fetchMovies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save movie.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/archive this movie?')) return;
    try {
      await api.delete(`/movies/${id}`);
      await fetchMovies();
    } catch (err) {
      alert('Failed to delete movie');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading catalog..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Film className="w-7 h-7 text-rose-500" />
            <span>Movie Catalog Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add, update, or archive theatrical titles and trailers
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Movies Table */}
      <div className="overflow-x-auto rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Movie</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Genres</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {movies.map((movie) => (
              <tr key={movie._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 flex items-center gap-3">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-10 h-14 object-cover rounded-lg shadow border border-slate-700"
                  />
                  <div>
                    <div className="font-bold text-white text-sm">{movie.title}</div>
                    <div className="text-[11px] text-slate-400">{movie.certificate} • {movie.language?.join(', ')}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{movie.rating}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300 font-medium">
                  {movie.duration} mins
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {movie.genre?.join(', ')}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      movie.isUpcoming
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {movie.isUpcoming ? 'Upcoming' : 'Now Showing'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(movie)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(movie._id)}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingMovie ? 'Edit Movie Details' : 'Add New Movie Title'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Synopsis / Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Genres (comma-separated)</label>
                  <input
                    type="text"
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    required
                    placeholder="Action, Sci-Fi"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Languages (comma-separated)</label>
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    required
                    placeholder="English, Hindi"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Rating (out of 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Certificate</label>
                  <select
                    value={form.certificate}
                    onChange={(e) => setForm({ ...form, certificate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  >
                    <option value="U">U</option>
                    <option value="UA">UA</option>
                    <option value="A">A</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Poster Image URL</label>
                <input
                  type="url"
                  value={form.posterUrl}
                  onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Trailer YouTube URL</label>
                <input
                  type="url"
                  value={form.trailerUrl}
                  onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isUpcoming"
                  checked={form.isUpcoming}
                  onChange={(e) => setForm({ ...form, isUpcoming: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-rose-600"
                />
                <label htmlFor="isUpcoming" className="text-slate-300 font-medium cursor-pointer">
                  Mark as Upcoming Release (Coming Soon)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
