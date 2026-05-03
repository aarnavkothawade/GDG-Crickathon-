import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Player, PlayerRole } from '../data/players';

interface PlayerPoolProps {
  players: Player[];
  selectedIds: string[];
  onTogglePlayer: (player: Player) => void;
}

export default function PlayerPool({ players, selectedIds, onTogglePlayer }: PlayerPoolProps) {
  const [filter, setFilter] = useState<PlayerRole | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const calculateCVAdjustment = (player: Player) => {
    const form = player.recentForm || [];
    if (form.length === 0) return { price: player.price, trend: 'neutral' as const };

    const avg = form.reduce((a, b) => a + b, 0) / form.length;
    let adjustment = 0;

    if (player.role === 'Batter' || player.role === 'All-rounder') {
      if (avg > 70) adjustment = 0.5;
      else if (avg > 50) adjustment = 0.2;
      else if (avg < 25) adjustment = -0.5;
    } else if (player.role === 'Bowler') {
      if (avg > 2.5) adjustment = 0.5;
      else if (avg > 1.5) adjustment = 0.2;
      else if (avg < 0.8) adjustment = -0.3;
    }

    const trend = adjustment > 0 ? 'up' : adjustment < 0 ? 'down' : 'neutral';
    return { 
      price: Number((player.price + adjustment).toFixed(1)), 
      trend 
    };
  };

  const filteredPlayers = players
    .map(p => {
      const { price: dynamicPrice, trend } = calculateCVAdjustment(p);
      // Calculate Strategic Value Points
      // Base: Rating * 10
      // Bonus: +5 for Opener status, +3 for specialized bowling, +/- for form
      const points = (p.rating * 10) + (p.isOpener ? 5 : 0) + (p.bowlingType ? 3 : 0) + (trend === 'up' ? 5 : trend === 'down' ? -5 : 0);
      return { ...p, points, dynamicPrice, trend };
    })
    .filter(p => {
      const matchesFilter = filter === 'ALL' || p.role === filter;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => b.points - a.points); // Sort by Strategic Value descending

  return (
    <aside className="w-[320px] h-full bg-white/5 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col gap-4 z-40">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH PLAYERS..." 
          className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 pl-9 text-xs focus:border-championship-gold outline-none transition-colors placeholder:text-white/20"
        />
      </div>

      <div className="flex gap-1">
        {(['ALL', 'Batter', 'Bowler', 'All-rounder'] as const).map((role) => (
          <button 
            key={role}
            onClick={() => setFilter(role)}
            className={`flex-1 py-2 text-[10px] font-bold rounded transition-all transition-colors ${
              filter === role 
                ? 'bg-stadium-red text-white' 
                : 'bg-white/5 hover:bg-white/10 text-white/60'
            }`}
          >
            {role === 'ALL' ? 'ALL' : role === 'Batter' ? 'BAT' : role === 'Bowler' ? 'BOWL' : 'AR'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
        {filteredPlayers.map((player) => {
          const isSelected = selectedIds.includes(player.id);
          
          return (
            <motion.div
              key={player.id}
              layout
              onClick={() => onTogglePlayer({ ...player, price: player.dynamicPrice })}
              className={`p-3 rounded flex items-center justify-between group transition-all cursor-pointer border ${
                isSelected 
                  ? 'bg-white/10 border-championship-gold/30 ring-1 ring-championship-gold/20' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full overflow-hidden border ${
                  isSelected ? 'border-championship-gold' : 'border-white/10'
                } bg-white/10 flex items-center justify-center`}>
                   {player.image ? (
                     <img src={player.image} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   ) : (
                     <span className="text-sm font-black text-white/40">{player.name[0]}</span>
                   )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-championship-gold transition-colors">{player.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[9px] text-white/40 uppercase font-black tracking-tight">{player.role}</p>
                    {player.isOpener && <span className="px-1 py-0.5 bg-championship-gold/10 text-championship-gold text-[8px] font-black rounded uppercase">Opener</span>}
                    {player.bowlingType === 'Fast' && <span className="px-1 py-0.5 bg-stadium-red/10 text-stadium-red text-[8px] font-black rounded uppercase">Fast</span>}
                    {player.bowlingType === 'Spin' && <span className="px-1 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-black rounded uppercase">Spin</span>}
                    <span className={`px-1 py-0.5 bg-white/5 border border-white/10 text-[7px] font-black rounded uppercase ml-auto ${
                      player.trend === 'up' ? 'text-green-500' : player.trend === 'down' ? 'text-stadium-red' : 'text-white/40'
                    }`}>
                      {Math.round(player.points)} SV
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {player.trend === 'up' && <TrendingUp size={10} className="text-green-400" />}
                  {player.trend === 'down' && <TrendingDown size={10} className="text-stadium-red" />}
                  <p className={`text-xs font-black ${
                    player.trend === 'up' ? 'text-green-400' : player.trend === 'down' ? 'text-stadium-red' : 'text-championship-gold'
                  }`}>
                    {player.dynamicPrice} Cr
                  </p>
                </div>
                <button 
                  className={`text-[18px] font-black leading-none transition-colors ${
                    isSelected ? 'text-stadium-red' : 'text-green-500'
                  }`}
                >
                  {isSelected ? '×' : '+'}
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredPlayers.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xs text-white/20 font-bold uppercase tracking-widest">No players found</p>
          </div>
        )}
      </div>
    </aside>
  );
}
