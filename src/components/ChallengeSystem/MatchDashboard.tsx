import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Loader2, Zap } from 'lucide-react';
import { Challenge, completeChallenge } from '../../lib/challengeService';

interface MatchDashboardProps {
  challenge: Challenge;
  isCreator: boolean;
}

export default function MatchDashboard({ challenge, isCreator }: MatchDashboardProps) {
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (challenge.status === 'active' && isCreator && !challenge.winnerId) {
      // Simulate match resolution after 5 seconds
      setResolving(true);
      const timer = setTimeout(() => {
        completeChallenge(challenge.id).then(() => setResolving(false));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [challenge.status, isCreator, challenge.winnerId]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] p-4 lg:p-12 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-red-500/10 to-transparent opacity-50" />
      
      {/* HUD Header */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter text-white mb-2">LIVE BATTLE</h1>
        <div className="flex items-center gap-4 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
           <div className="flex items-center gap-2 text-blue-400 font-black uppercase text-[10px]">
             <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
             {challenge.creatorName}
           </div>
           <div className="w-px h-4 bg-white/10" />
           <Swords size={16} className="text-white/40" />
           <div className="w-px h-4 bg-white/10" />
           <div className="flex items-center gap-2 text-red-400 font-black uppercase text-[10px]">
             {challenge.opponentName}
             <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
           </div>
        </div>
      </div>

      {/* Tug of War Visual */}
      <div className="relative w-full max-w-7xl flex flex-col items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Zap size={300} className="text-championship-gold animate-pulse" />
        </div>

        <div className="flex items-center justify-between w-full h-[400px] relative">
          {/* Creator Side */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="relative group">
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-48 h-64 rounded-3xl bg-blue-500/20 border-2 border-blue-500 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)]"
              >
                  <img src={challenge.creatorSquad[0]?.image} className="w-full h-full object-cover grayscale opacity-50 transition-all group-hover:grayscale-0 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </motion.div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 py-3 bg-blue-500 rounded-xl font-black uppercase italic text-xs text-center shadow-lg">
                CAPTAIN
              </div>
            </div>
            <div className="mt-12 text-sm font-black uppercase text-blue-400 tracking-[0.2em]">{challenge.creatorName}'S SQUAD</div>
          </motion.div>

          {/* VS Divider */}
          <div className="w-1 bg-gradient-to-b from-blue-500 via-white to-red-500 h-[300px] rounded-full blur-[2px] relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black border-2 border-white flex items-center justify-center z-10 shadow-[0_0_30px_white]">
               <span className="text-xl font-black italic">VS</span>
            </div>
          </div>

          {/* Opponent Side */}
          <motion.div 
             initial={{ x: 100, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="flex-1 flex flex-col items-center"
          >
            <div className="relative group">
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="w-48 h-64 rounded-3xl bg-red-500/20 border-2 border-red-500 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.3)]"
              >
                  <img src={challenge.opponentSquad?.[0]?.image} className="w-full h-full object-cover grayscale opacity-50 transition-all group-hover:grayscale-0 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </motion.div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 py-3 bg-red-500 rounded-xl font-black uppercase italic text-xs text-center shadow-lg">
                CHALLENGER
              </div>
            </div>
            <div className="mt-12 text-sm font-black uppercase text-red-400 tracking-[0.2em]">{challenge.opponentName}'S SQUAD</div>
          </motion.div>
        </div>

        {/* Resolution Message */}
        <AnimatePresence>
          {resolving && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12 flex flex-col items-center"
            >
               <Loader2 className="animate-spin text-championship-gold mb-4" size={32} />
               <p className="text-xl font-black uppercase italic tracking-widest text-white/80">Resolving Squad Performance...</p>
               <p className="text-[10px] uppercase font-bold text-white/40 mt-2">Calculating match engine results based on real-player ratings</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
