import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, Plus, Trash2, X, Clock, MapPin, Film } from 'lucide-react';

export default function ManageShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    movieId: '',
    theaterId: '',
    screenId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '06:30 PM',
    format: '2D',
    language: 'English',
    pricing: {
      Silver: 160,
      Gold: 220,
      Premium: 320,
      Recliner: 500,
    },
  });

  const fetchData = async () => {
    try {
      const [showsRes, moviesRes, theatersRes] = await Promise.all([
        api.get('/shows'),
        api.get('/movies'),
        api.get('/theaters'),
      ]);
      setShows(showsRes.data.data);
      setMovies(moviesRes.data.data);
      setTheaters(theatersRes.data.data);
    } catch (err) {
      console.error('Failed to load shows data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When theater is selected in modal, load its screens
  const handleTheaterChange = async (tId) => {
    setForm((prev) => ({ ...prev, theaterId: tId, screenId: '' }));
    try {
      const res = await api.get(`/theaters/${tId}/screens`);
      setScreens(res.data.data);
      if (res.data.data.length > 0) {
        setForm((prev) => ({ ...prev, screenId: res.data.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load screens:', err);
    }
  };

  const handleOpenModal = () => {
    setForm({
      movieId: movies[0]?._id || '',
      theaterId: theaters[0]?._id || '',
      screenId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '06:30 PM',
      format: '2D',
      language: 'English',
      pricing: {
        Silver: 160,
        Gold: 220,
        Premium: 320,
        Recliner: 500,
      },
    });

    if (theaters[0]?._id) {
      handleTheaterChange(theaters[0]._id);
    }
    setModalOpen(true);
  };

  const handleSaveShow = async (e) => {
    e.preventDefault();
    if (!form.screenId) {
      alert('Please select or create a screen first.');
      return;
    }

    try {
      await api.post('/shows', form);
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule show.');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled show?')) return;
    try {
      await api.delete(`/shows/${id}`);
      await fetchData();
    } catch (err) {
      alert('Failed to delete show');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading showtimes..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-7 h-7 text-rose-500" />
            <span>Showtime Scheduling Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Schedule movie shows across theaters, screens, and set tier pricing
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Show</span>
        </button>
      </div>

      {/* Shows Table */}
      <div className="overflow-x-auto rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Movie</th>
              <th className="py-3.5 px-4">Theater & Screen</th>
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Format</th>
              <th className="py-3.5 px-4">Pricing (G / P / R)</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {shows.map((show) => (
              <tr key={show._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-white">
                  {show.movieId?.title || 'Unknown Title'}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-200">{show.theaterId?.name}</div>
                  <div className="text-[11px] text-slate-400">{show.theaterId?.city} • {show.screenId?.screenNumber}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-white font-bold">{show.date}</div>
                  <div className="text-[11px] text-rose-400 font-semibold">{show.startTime}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                    {show.format || '2D'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300 font-mono">
                  ₹{show.pricing?.Gold || 220} / ₹{show.pricing?.Premium || 320} / ₹{show.pricing?.Recliner || 500}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDeleteShow(show._id)}
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

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <h2 className="text-lg font-bold text-white">Schedule Movie Showtime</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShow} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Movie</label>
                <select
                  value={form.movieId}
                  onChange={(e) => setForm({ ...form, movieId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.certificate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Select Theater</label>
                  <select
                    value={form.theaterId}
                    onChange={(e) => handleTheaterChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  >
                    {theaters.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Auditorium Screen</label>
                  <select
                    value={form.screenId}
                    onChange={(e) => setForm({ ...form, screenId: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  >
                    {screens.length > 0 ? (
                      screens.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.screenNumber} ({s.screenType})
                        </option>
                      ))
                    ) : (
                      <option value="">No screens found</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    placeholder="e.g. 06:45 PM"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Format</label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="4DX">4DX</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Language</label>
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              {/* Tier Pricing */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block font-semibold text-slate-300">
                  Seat Tier Pricing (₹)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Silver</span>
                    <input
                      type="number"
                      value={form.pricing.Silver}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pricing: { ...form.pricing, Silver: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Gold</span>
                    <input
                      type="number"
                      value={form.pricing.Gold}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pricing: { ...form.pricing, Gold: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Premium</span>
                    <input
                      type="number"
                      value={form.pricing.Premium}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pricing: { ...form.pricing, Premium: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Recliner</span>
                    <input
                      type="number"
                      value={form.pricing.Recliner}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pricing: { ...form.pricing, Recliner: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                </div>
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
                  Schedule Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
