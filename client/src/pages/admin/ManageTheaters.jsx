import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Building2, Plus, MapPin, X, Monitor } from 'lucide-react';

export default function ManageTheaters() {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theaterModalOpen, setTheaterModalOpen] = useState(false);
  const [screenModalOpen, setScreenModalOpen] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState(null);

  // Theater form
  const [tForm, setTForm] = useState({
    name: '',
    city: 'Mumbai',
    address: '',
    facilities: 'Dolby Atmos, 4K Laser, Gourmet Food, Valet Parking',
  });

  // Screen form
  const [sForm, setSForm] = useState({
    screenNumber: 'Audi 3',
    screenType: 'Dolby Cinema',
    soundSystem: 'Dolby Atmos 7.1',
  });

  const fetchTheaters = async () => {
    try {
      const res = await api.get('/theaters');
      setTheaters(res.data.data);
    } catch (err) {
      console.error('Failed to load theaters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  const handleSaveTheater = async (e) => {
    e.preventDefault();
    try {
      await api.post('/theaters', {
        ...tForm,
        facilities: tForm.facilities.split(',').map((f) => f.trim()),
      });
      setTheaterModalOpen(false);
      await fetchTheaters();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add theater');
    }
  };

  const handleSaveScreen = async (e) => {
    e.preventDefault();
    if (!selectedTheater) return;
    try {
      await api.post(`/theaters/${selectedTheater._id}/screens`, sForm);
      setScreenModalOpen(false);
      alert('Screen created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create screen');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading theaters..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-rose-500" />
            <span>Theater & Screen Network</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage cinema venues, cities, and tiered auditorium screens
          </p>
        </div>

        <button
          onClick={() => setTheaterModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Theater</span>
        </button>
      </div>

      {/* Theaters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theaters.map((theater) => (
          <div
            key={theater._id}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-base text-white">{theater.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-rose-600/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                  {theater.city}
                </span>
              </div>

              <div className="text-xs text-slate-400 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{theater.address}</span>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                {theater.facilities?.map((f, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedTheater(theater);
                  setScreenModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>+ Add Auditorium Screen</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Theater Modal */}
      {theaterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <h2 className="text-lg font-bold text-white">Add New Theater</h2>
              <button onClick={() => setTheaterModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTheater} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Theater Name</label>
                <input
                  type="text"
                  value={tForm.name}
                  onChange={(e) => setTForm({ ...tForm, name: e.target.value })}
                  required
                  placeholder="PVR ICON: Gold Class"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">City</label>
                <select
                  value={tForm.city}
                  onChange={(e) => setTForm({ ...tForm, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi-NCR">Delhi-NCR</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Complete Address</label>
                <textarea
                  rows={2}
                  value={tForm.address}
                  onChange={(e) => setTForm({ ...tForm, address: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Facilities / Amenities (comma-separated)</label>
                <input
                  type="text"
                  value={tForm.facilities}
                  onChange={(e) => setTForm({ ...tForm, facilities: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTheaterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Save Theater
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {screenModalOpen && selectedTheater && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <h2 className="text-lg font-bold text-white">
                Add Screen to {selectedTheater.name}
              </h2>
              <button onClick={() => setScreenModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScreen} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Screen Number / Label</label>
                <input
                  type="text"
                  value={sForm.screenNumber}
                  onChange={(e) => setSForm({ ...sForm, screenNumber: e.target.value })}
                  required
                  placeholder="Audi 3"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Auditorium Screen Type</label>
                <select
                  value={sForm.screenType}
                  onChange={(e) => setSForm({ ...sForm, screenType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                >
                  <option value="Dolby Cinema">Dolby Cinema</option>
                  <option value="IMAX 3D">IMAX 3D</option>
                  <option value="4DX">4DX</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Sound System</label>
                <input
                  type="text"
                  value={sForm.soundSystem}
                  onChange={(e) => setSForm({ ...sForm, soundSystem: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Initializes standard 96-seat layout (8 rows x 12 cols) with Recliner, Premium, Gold, and Silver tiers.
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setScreenModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Create Screen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
