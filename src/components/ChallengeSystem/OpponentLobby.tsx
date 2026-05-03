import React from 'react';
import { motion } from 'motion/react';
import { Swords, Trophy, Instagram, ChevronRight } from 'lucide-react';
import { Challenge } from '../../lib/challengeService';

interface OpponentLobbyProps {
  challenge: Challenge;
  onAccept: () => void;
}

export default function OpponentLobby({ challenge, onAccept }: OpponentLobbyProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121212]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-championship-gold/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl flex flex-col md:flex-row bg-black/40 border-2 border-white/10 rounded-[40px] overflow-hidden backdrop-blur-2xl shadow-2xl"
      >
        {/* Creator Identity */}
        <div className="flex-1 p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="w-24 h-24 rounded-[32px] bg-white/10 flex items-center justify-center mb-6 border border-white/20 relative">
            <span className="text-4xl font-black italic">{challenge.creatorName[0]}</span>
            <div className="absolute -bottom-2 -right-2 bg-championship-gold text-black p-1.5 rounded-lg">
              <Trophy size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-1">{challenge.creatorName}</h2>
          <p className="text-championship-gold text-[10px] font-black uppercase tracking-[0.3em] mb-8">Challenger</p>
          
          <div className="w-full grid grid-cols-2 gap-4">
            {challenge.creatorSquad.slice(0, 4).map((player, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                <img src={player.image} alt="" className="w-full h-full object-cover blur-2xl opacity-40" />
                <span className="absolute text-white/20 font-black italic">?</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-white/20 font-black uppercase italic">Squad Blurred for Suspense</p>
        </div>

        {/* Stakes & Action */}
        <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-stadium-red/20 flex items-center justify-center mb-8">
            <Swords size={32} className="text-stadium-red" />
          </div>

          <h3 className="text-4xl font-black italic tracking-tighter mb-4 leading-none">YOU HAVE BEEN CHALLENGED</h3>
          
          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
              <Instagram className="text-pink-500" />
              <div>
                <p className="text-[10px] font-black uppercase text-pink-500">The Penalty</p>
                <p className="text-xs text-white/60">Loser posts an Instagram Story Wall of Shame</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
              <Trophy className="text-championship-gold" />
              <div>
                <p className="text-[10px] font-black uppercase text-championship-gold">The Prize</p>
                <p className="text-xs text-white/60">Winner gets a Reward Scratch Card</p>
              </div>
            </div>
          </div>

          <button
            onClick={onAccept}
            className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-championship-gold transition-all group"
          >
            Accept & Build Squad
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
