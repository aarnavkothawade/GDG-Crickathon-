import { useState } from 'react';
import { motion } from 'motion/react';
import { Undo2, Redo2, PlusCircle } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface HeaderProps {
  used: number;
  max: number;
  playerCount: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCreditPurchased: (amount: number) => void;
}

export default function Header({ used, max, playerCount, onUndo, onRedo, canUndo, canRedo, onCreditPurchased }: HeaderProps) {
  const [showPayment, setShowPayment] = useState(false);
  const isOver = used > max;
  const percentage = Math.min((used / max) * 100, 100);

  return (
    <header className="h-20 border-b border-white/10 bg-[#121212]/80 backdrop-blur-md flex items-center justify-between px-8 z-50">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-stadium-red rounded flex items-center justify-center font-bold text-xl italic shadow-lg shadow-stadium-red/20">S</div>
        <div>
          <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">
            Squad<span className="text-championship-gold">Builder</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Championship Edition</p>
        </div>
      </div>

      {/* Undo/Redo Controls */}
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          title="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          title="Redo"
        >
          <Redo2 size={16} />
        </button>
      </div>

      {/* Budget Progress */}
      <div className="flex-1 max-w-2xl px-12">
        <div className="flex justify-between items-end mb-1 text-[10px] uppercase font-bold tracking-widest">
          <span className="text-white/60">Team Budget</span>
          <span className={`transition-all duration-300 ${isOver ? 'text-stadium-red animate-pulse shadow-[0_0_10px_rgba(215,25,32,0.5)]' : 'text-championship-gold'}`}>
            {isOver ? 'Budget Overload' : 'Budget Used'}: {used.toFixed(1)} / {max.toFixed(1)} Cr
          </span>
        </div>
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full rounded-full transition-colors duration-500 bg-gradient-to-r ${
              isOver 
              ? 'from-championship-gold via-stadium-red to-stadium-red shadow-[0_0_15px_rgba(215,25,32,0.6)]' 
              : 'from-championship-gold to-championship-gold shadow-[0_0_15px_rgba(255,215,0,0.3)]'
            }`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {isOver && (
          <button 
            onClick={() => setShowPayment(true)}
            className="flex items-center gap-2 bg-stadium-red px-4 py-2 rounded text-[10px] font-black uppercase italic shadow-[0_0_15px_rgba(215,25,32,0.4)] hover:scale-105 active:scale-95 transition-all text-white border border-white/20 animate-pulse"
          >
            <PlusCircle size={14} />
            Buy Extra Credit
          </button>
        )}
        <div className="text-right">
          <p className="text-[10px] uppercase text-white/40 font-bold">Players</p>
          <p className="font-bold text-championship-gold">{playerCount}/11</p>
        </div>
        <button className="px-6 py-2 bg-championship-gold text-black font-black uppercase text-xs rounded hover:bg-yellow-400 transition-all shadow-lg active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed">
          Confirm Squad
        </button>
      </div>

      <PaymentModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)} 
        onSuccess={(amount) => {
          onCreditPurchased(amount);
          setShowPayment(false);
        }}
        requiredAmount={used - max}
      />
    </header>
  );
}
