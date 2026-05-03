import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../data/players';
import { X } from 'lucide-react';

interface CricketPitchProps {
  squad: Player[];
  onRemovePlayer: (id: string) => void;
}

export default function CricketPitch({ squad, onRemovePlayer }: CricketPitchProps) {
  // Sort squad into roles for positioning
  const batters = squad.filter(p => p.role === 'Batter');
  const bowlers = squad.filter(p => p.role === 'Bowler');
  const allRounders = squad.filter(p => p.role === 'All-rounder');

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_50%,_#1a1a1a_0%,_#121212_100%)] relative overflow-hidden">
      {/* Stadium Ambient Lights */}
      <div className="absolute top-0 w-full h-48 bg-gradient-to-b from-championship-gold/5 to-transparent opacity-30 pointer-events-none"></div>

      {/* Pitch Container */}
      <div className="w-[800px] h-full flex flex-col items-center justify-center transform scale-90 translate-y-8" style={{ perspective: '1200px' }}>
        <div 
          className="w-[450px] h-[600px] bg-[#1a1a1a] rounded-[100px] relative border-[6px] border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
          style={{ transform: 'rotateX(55deg) rotateZ(0deg)' }}
        >
          {/* Pitch Grass Lines */}
          <div className="absolute inset-10 border-2 border-white/10 rounded-[60px] flex items-center justify-center">
            <div className="w-px h-full bg-white/5"></div>
            <div className="w-full h-px bg-white/5 absolute"></div>
          </div>

          {/* Crease Areas */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/20"></div>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/20"></div>
        </div>

        {/* Player Slotted Icons (Counter-perspective) */}
        <div className="absolute inset-0 z-10 grid grid-rows-3 items-center justify-center py-20 pointer-events-none">
          
          {/* Batters */}
          <div className="flex justify-center gap-12 -translate-y-10 scale-90 pointer-events-auto">
             <AnimatePresence>
               {batters.map(player => (
                 <PitchPlayerSlot key={player.id} player={player} onRemove={onRemovePlayer} color="border-championship-gold" />
               ))}
               {Array.from({ length: Math.max(0, 4 - batters.length) }).map((_, i) => (
                 <EmptySlot key={`bat-empty-${i}`} label="BAT" />
               ))}
             </AnimatePresence>
          </div>

          {/* AR */}
          <div className="flex justify-center gap-16 scale-100 pointer-events-auto">
             <AnimatePresence>
               {allRounders.map(player => (
                 <PitchPlayerSlot key={player.id} player={player} onRemove={onRemovePlayer} color="border-stadium-red" />
               ))}
               {Array.from({ length: Math.max(0, 3 - allRounders.length) }).map((_, i) => (
                 <EmptySlot key={`ar-empty-${i}`} label="AR" />
               ))}
             </AnimatePresence>
          </div>

          {/* Bowlers */}
          <div className="flex justify-center gap-12 translate-y-10 scale-110 pointer-events-auto">
             <AnimatePresence>
               {bowlers.map(player => (
                 <PitchPlayerSlot key={player.id} player={player} onRemove={onRemovePlayer} color="border-white" />
               ))}
               {Array.from({ length: Math.max(0, 4 - bowlers.length) }).map((_, i) => (
                 <EmptySlot key={`bowl-empty-${i}`} label="BOWL" />
               ))}
             </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

function PitchPlayerSlot({ player, onRemove, color }: { player: Player, onRemove: (id: string) => void, color: string, key?: React.Key }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="flex flex-col items-center group relative cursor-pointer"
      onClick={() => onRemove(player.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Stats Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-3 z-[100] w-36 p-3 bg-black/90 border border-white/10 backdrop-blur-xl rounded-xl shadow-2xl pointer-events-none"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Stats</span>
              <span className="text-[10px] font-black text-championship-gold italic">{player.rating} RTG</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-bold">
                <span className="text-white/40">CV Score</span>
                <span className="text-championship-gold">{player.price} Cr</span>
              </div>
              <div className="pt-1 border-t border-white/5">
                <span className="text-[7px] font-black uppercase text-white/40 mb-1 block">Recent Form</span>
                <div className="flex gap-1 items-end h-6">
                  {player.recentForm?.map((score, i) => (
                    <div 
                      key={i} 
                      className="bg-white/20 w-full rounded-t-sm"
                      style={{ 
                        height: `${Math.min((score / (player.role === 'Bowler' ? 5 : 100)) * 100, 100)}%`,
                        opacity: 0.3 + (i * 0.15) 
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-[9px] font-bold">
                <span className="text-white/40">Role</span>
                <span className="text-white">{player.role}</span>
              </div>
              {player.isOpener && (
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-white/40">Special</span>
                  <span className="text-championship-gold">Opener</span>
                </div>
              )}
              {player.bowlingType && (
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-white/40">Bowling</span>
                  <span className={`text-white ${player.bowlingType === 'Fast' ? 'text-stadium-red' : 'text-blue-400'}`}>
                    {player.bowlingType}
                  </span>
                </div>
              )}
            </div>
            
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-14 h-14 rounded-full border-2 ${color} bg-black/80 flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.2)] overflow-hidden transition-transform group-hover:scale-110`}>
         {player.image ? (
           <img src={player.image} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
         ) : (
           <span className="text-xl font-black text-white/50">{player.name[0]}</span>
         )}
      </div>
      <span className={`text-[10px] mt-1 font-black bg-black/80 px-2 py-0.5 rounded ${color === 'border-championship-gold' ? 'text-championship-gold' : 'text-white'} border border-white/10 uppercase`}>
        {player.name.split(' ').pop()}
      </span>
      {/* Remove indicator on hover */}
      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-stadium-red text-white p-0.5 rounded-full scale-75">
         <X size={12} />
      </div>
    </motion.div>
  );
}

function EmptySlot({ label }: { label: string, key?: React.Key }) {
  return (
    <div className="flex flex-col items-center opacity-30 grayscale">
      <div className="w-12 h-12 rounded-full border-2 border-white/20 bg-white/5 flex items-center justify-center border-dashed">
        <span className="text-xl text-white/20 italic">+</span>
      </div>
      <span className="text-[8px] mt-1 font-bold text-white/40 uppercase tracking-widest">{label}</span>
    </div>
  );
}
