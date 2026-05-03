import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { Trophy, Share2, Instagram, X, ShieldAlert, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { Challenge, markPenaltyShared } from '../../lib/challengeService';
import ScratchCard from './ScratchCard';
import { auth } from '../../lib/firebase';

interface PostMatchResultsProps {
  challenge: Challenge;
  onUnlocked: () => void;
}

export default function PostMatchResults({ challenge, onUnlocked }: PostMatchResultsProps) {
  const isWinner = auth.currentUser?.uid === challenge.winnerId;
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (isWinner) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EAB308', '#FFD700', '#FFFFFF']
      });
    }
  }, [isWinner]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#121212',
        scale: 2,
      });
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
      const file = new File([blob], 'wall-of-shame.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Wall of Shame',
          text: 'I lost to a cricket legend. Come beat them for me!',
        });
        await markPenaltyShared(challenge.id);
        onUnlocked();
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wall-of-shame.png';
        link.click();
        alert('Share this image to Instagram to unlock the app!');
        // For simulation, we unlock anyway in fallback if user says they shared
        await markPenaltyShared(challenge.id);
        onUnlocked();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSharing(false);
    }
  };

  if (isWinner) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-3xl overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-championship-gold/20 rounded-full blur-[100px] animate-pulse" />
        </div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center max-w-sm w-full"
        >
          <div className="w-20 h-20 rounded-full bg-championship-gold flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(234,179,8,0.5)]">
            <Trophy size={40} className="text-black" />
          </div>
          
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2 text-center">VICTORY IS YOURS</h2>
          <p className="text-championship-gold text-[10px] font-black uppercase tracking-[0.4em] mb-12">Universal Champion</p>

          <ScratchCard width={320} height={200} onComplete={() => {}}>
            <div className="flex flex-col items-center">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Claim Reward</p>
               <div className="px-6 py-3 rounded-xl bg-white/10 border-2 border-championship-gold/50 flex flex-col items-center gap-1">
                  <span className="text-2xl font-black italic tracking-tighter text-championship-gold">WINNER50</span>
                  <span className="text-[9px] font-bold text-white/60">50% OFF ON ELITE MERCH</span>
               </div>
            </div>
          </ScratchCard>

          <button 
            onClick={onUnlocked}
            className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
          >
            Skip to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Loser View
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-stadium-red/20 backdrop-blur-3xl p-4">
      <div className="max-w-md w-full flex flex-col gap-8">
        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-stadium-red flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                <ShieldAlert size={32} className="text-white" />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">ACCESS DENIED</h2>
            <p className="text-stadium-red text-[10px] font-black uppercase tracking-[0.4em] mt-2 mb-8">Pay the Penalty to Unlock</p>
        </div>

        {/* Wall of Shame Card (Captured) */}
        <div ref={cardRef} className="aspect-[9/16] w-full bg-[#121212] border-4 border-stadium-red rounded-[40px] p-12 flex flex-col items-center justify-between relative shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-stadium-red/10 to-transparent pointer-events-none" />
            
            <div className="flex flex-col items-center gap-4 text-center z-10 w-full">
                <div className="w-20 h-20 rounded-full border-2 border-stadium-red p-1">
                   <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                      <span className="text-3xl font-black italic text-white/20">?</span>
                   </div>
                </div>
                <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none italic">I FAILED<br/><span className="text-stadium-red">THE SQUAD</span></h3>
            </div>

            <div className="w-full flex flex-col items-center gap-6 z-10">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 w-full flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black uppercase text-white/40">Conquered by</p>
                    <p className="text-2xl font-black italic text-championship-gold uppercase">{challenge.winnerId === challenge.creatorId ? challenge.creatorName : challenge.opponentName}</p>
                </div>
                <div className="w-full flex flex-col items-center gap-2">
                    <Sparkles className="text-championship-gold mb-2" size={32} />
                    <p className="text-[10px] font-black text-center uppercase tracking-widest text-white/40 leading-relaxed">
                        CHALLENGE THEM FOR<br/>ME AT ELITE-SQUAD.COM
                    </p>
                </div>
            </div>
        </div>

        <button
          onClick={handleShare}
          disabled={sharing}
          className="w-full py-6 bg-stadium-red text-white rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all group"
        >
          {sharing ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Instagram size={20} />
              Share Penalty to Instagram
            </>
          )}
        </button>

        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 text-center flex items-center justify-center gap-2">
            <AlertTriangle size={10} />
            Post required to reset app permissions
        </p>
      </div>
    </div>
  );
}
