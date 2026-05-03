import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Swords, Share2, Loader2, Sparkles } from 'lucide-react';
import { createChallenge } from '../../lib/challengeService';
import { Player } from '../../data/players';

interface ChallengeLobbyProps {
  squad: Player[];
  onChallengeCreated: (id: string) => void;
}

export default function ChallengeLobby({ squad, onChallengeCreated }: ChallengeLobbyProps) {
  const [loading, setLoading] = useState(false);

  const handleCreateChallenge = async () => {
    setLoading(true);
    try {
      const challengeId = await createChallenge(squad, 'Pro Manager');
      
      const shareUrl = `${window.location.origin}?challengeId=${challengeId}`;
      const shareText = "I challenge you to a Fantasy Face-off! Loser posts an Insta Story. Click to accept:";

      if (navigator.share) {
        await navigator.share({
          title: 'Fantasy Face-off Challenge',
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Challenge link copied to clipboard!');
      }

      onChallengeCreated(challengeId);
    } catch (error) {
      console.error('Error creating challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full p-8 rounded-[40px] bg-black/40 border-2 border-championship-gold/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-championship-gold to-transparent opacity-50" />
      
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-championship-gold/10 flex items-center justify-center mb-6 relative">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-championship-gold/20 blur-xl"
          />
          <Swords size={40} className="text-championship-gold relative z-10" />
        </div>

        <h2 className="text-3xl font-black italic uppercase italic tracking-tighter mb-2">Throw the Gauntlet</h2>
        <p className="text-white/60 text-sm font-medium mb-8">
          Challenge a friend to a high-stakes squad battle. 
          <span className="block mt-1 text-championship-gold/80 italic">Loser posts the Wall of Shame.</span>
        </p>

        <button
          onClick={handleCreateChallenge}
          disabled={loading}
          className="w-full py-5 bg-championship-gold text-black rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all relative group overflow-hidden shadow-[0_10px_30px_rgba(234,179,8,0.3)]"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Share2 size={20} />
              Generate Challenge Link
            </>
          )}
          
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.5 }}
          />
        </button>

        <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
          <Sparkles size={12} />
          Secure 1v1 Battle System
        </div>
      </div>
    </motion.div>
  );
}
