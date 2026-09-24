import React from 'react';
import { Lock } from 'lucide-react';

export default function SeatMap({
  screen,
  pricing,
  seatMap,
  selectedSeats,
  onSeatClick,
  currentUserId,
}) {
  const layout = screen?.seatLayout || {
    rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    columns: 12,
    aisles: [3, 9],
    tiers: [
      { name: 'Recliner', rows: ['A'] },
      { name: 'Premium', rows: ['B', 'C', 'D'] },
      { name: 'Gold', rows: ['E', 'F', 'G'] },
      { name: 'Silver', rows: ['H'] },
    ],
  };

  // Find tier by row letter
  const getTierForRow = (rowLetter) => {
    for (const t of layout.tiers || []) {
      if (t.rows.includes(rowLetter)) return t.name;
    }
    return 'Gold';
  };

  const getTierPrice = (tierName) => {
    return pricing?.[tierName] || 200;
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-6">
      
      {/* Curved Projection Screen */}
      <div className="w-full max-w-2xl flex flex-col items-center mb-10">
        <div className="cinema-screen-curve w-full"></div>
        <div className="mt-2 text-center">
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-sky-400/80">
            Cinema Screen This Way
          </span>
        </div>
      </div>

      {/* Seat Matrix */}
      <div className="w-full overflow-x-auto pb-6 flex justify-center">
        <div className="min-w-[640px] px-4 space-y-6">
          
          {(layout.tiers || []).map((tier) => {
            const tierRows = layout.rows.filter((r) => tier.rows.includes(r));
            if (tierRows.length === 0) return null;

            const tierPrice = getTierPrice(tier.name);

            return (
              <div key={tier.name} className="space-y-2">
                
                {/* Tier Header with Price */}
                <div className="flex items-center gap-3 border-b border-slate-800/80 pb-1">
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                    {tier.name}
                  </span>
                  <span className="text-xs font-semibold text-rose-400">
                    ₹{tierPrice}
                  </span>
                  <div className="flex-1 border-t border-dashed border-slate-800"></div>
                </div>

                {/* Rows for this Tier */}
                <div className="space-y-2">
                  {tierRows.map((rowLetter) => (
                    <div key={rowLetter} className="flex items-center justify-center gap-2">
                      
                      {/* Left Row Indicator */}
                      <span className="w-5 text-xs font-bold text-slate-500 text-center">
                        {rowLetter}
                      </span>

                      {/* Columns with Aisle Gaps */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: layout.columns }, (_, i) => i + 1).map((colNum) => {
                          const seatNumber = `${rowLetter}${colNum}`;
                          const seatStatusInfo = seatMap[seatNumber];
                          const isBooked = seatStatusInfo?.status === 'booked';
                          const isLocked = seatStatusInfo?.status === 'locked';
                          const isLockedByMe = isLocked && (seatStatusInfo?.lockedBy === currentUserId || seatStatusInfo?.isMine);
                          const isLockedByOther = isLocked && !isLockedByMe;
                          const isSelectedByMe = selectedSeats.some((s) => s.seatNumber === seatNumber);

                          const hasAisleAfter = (layout.aisles || []).includes(colNum);

                          return (
                            <React.Fragment key={seatNumber}>
                              <button
                                disabled={isBooked || isLockedByOther}
                                onClick={() =>
                                  onSeatClick({
                                    seatNumber,
                                    tier: tier.name,
                                    price: tierPrice,
                                    isCurrentlySelected: isSelectedByMe || isLockedByMe,
                                  })
                                }
                                title={
                                  isBooked
                                    ? `Seat ${seatNumber} is booked`
                                    : isLockedByOther
                                    ? `Seat ${seatNumber} is held by another user`
                                    : `Seat ${seatNumber} - ₹${tierPrice} (${tier.name})`
                                }
                                className={`seat-btn w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                                  // 1. Booked (Grayed out permanently)
                                  isBooked
                                    ? 'bg-slate-800/40 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-50'
                                    // 2. Locked by another user (Orange with lock)
                                    : isLockedByOther
                                    ? 'bg-amber-950/60 text-amber-500 border border-amber-600/50 cursor-not-allowed animate-pulse'
                                    // 3. Selected by me or locked by me (Crimson Glow)
                                    : isSelectedByMe || isLockedByMe
                                    ? 'bg-rose-600 text-white border border-rose-400 shadow-glow-crimson scale-105 font-extrabold'
                                    // 4. Available (Color-coded by tier with hover)
                                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-rose-500 hover:text-white hover:bg-slate-800'
                                }`}
                              >
                                {isLockedByOther ? (
                                  <Lock className="w-3 h-3" />
                                ) : (
                                  <span>{colNum}</span>
                                )}
                              </button>

                              {/* Aisle Spacer */}
                              {hasAisleAfter && <div className="w-4 sm:w-6" />}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Right Row Indicator */}
                      <span className="w-5 text-xs font-bold text-slate-500 text-center">
                        {rowLetter}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* Live Seat Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-6 px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-900 border border-slate-700"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-rose-600 border border-rose-400 shadow-sm"></div>
          <span className="text-rose-400 font-semibold">Your Selection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-950/60 border border-amber-600/50 flex items-center justify-center text-amber-500">
            <Lock className="w-2.5 h-2.5" />
          </div>
          <span>Held by Other</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-800/40 border border-slate-800 opacity-50"></div>
          <span className="text-slate-500">Sold / Booked</span>
        </div>
      </div>

    </div>
  );
}
