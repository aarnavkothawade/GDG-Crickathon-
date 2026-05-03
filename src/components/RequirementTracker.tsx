import { motion } from 'motion/react';
import { Check, X, Info } from 'lucide-react';
import { Player } from '../data/players';

interface RequirementTrackerProps {
  squad: Player[];
}

export default function RequirementTracker({ squad }: RequirementTrackerProps) {
  // 1. Opener Rule: 1-2 allowed
  const totalOpeners = squad.filter(p => p.isOpener).length;
  const openerRuleMet = totalOpeners >= 1 && totalOpeners <= 2;

  // 2. Pace/Spin Balance: 1-2 Fast, Exactly 2 Spin
  const fastCount = squad.filter(p => p.bowlingType === 'Fast').length;
  const spinCount = squad.filter(p => p.bowlingType === 'Spin').length;

  const requirements = [
    {
      id: 'opener',
      label: 'Openers',
      description: 'Between 1 and 2 Openers',
      current: totalOpeners,
      target: 2,
      isMet: openerRuleMet,
      isExceeded: totalOpeners > 2,
      display: `${totalOpeners}/2`
    },
    {
      id: 'fast',
      label: 'Fast Bowlers',
      description: 'Max 2 Fast Bowlers',
      current: fastCount,
      target: 2,
      isMet: fastCount > 0 && fastCount <= 2,
      isExceeded: fastCount > 2,
      display: `${fastCount}/2`
    },
    {
      id: 'spin',
      label: 'Spinners',
      description: 'Target 2 Spinners',
      current: spinCount,
      target: 2,
      isMet: spinCount === 2,
      isExceeded: spinCount > 2,
      display: `${spinCount}/2`
    }
  ];

  return (
    <div className="p-4 bg-black/40 border-l border-white/10 w-64 flex flex-col gap-4 overflow-y-auto hidden lg:flex">
      <div className="flex items-center gap-2 mb-2">
        <Info size={16} className="text-championship-gold" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Squad Requirements</h2>
      </div>

      <div className="space-y-3">
        {requirements.map((req) => (
          <div key={req.id} className={`p-3 rounded-xl bg-white/5 border transition-all ${
            req.isExceeded ? 'border-stadium-red bg-stadium-red/10 animate-pulse' : 'border-white/10 hover:border-white/20'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-wider text-white mb-0.5">{req.label}</h3>
                <p className={`text-[9px] leading-tight ${req.isExceeded ? 'text-stadium-red font-bold' : 'text-white/40'}`}>
                  {req.isExceeded ? 'WARNING: Limit Exceeded' : req.description}
                </p>
              </div>
              <div className={`p-1 rounded-full ${req.isMet ? 'bg-green-500/20 text-green-500' : 'bg-stadium-red/20 text-stadium-red'}`}>
                {req.isMet ? <Check size={12} /> : <X size={12} />}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ 
                    width: `${Math.min((req.current / req.target) * 100, 100)}%`,
                    backgroundColor: req.isExceeded ? '#ef4444' : (req.isMet ? '#22c55e' : '#EAB308')
                  }}
                  className="h-full"
                />
              </div>
              <span className={`text-[10px] font-mono font-bold ${req.isExceeded ? 'text-stadium-red' : (req.isMet ? 'text-green-500' : 'text-white/40')}`}>
                {req.display}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/20">
          <span>Status</span>
          <span className={requirements.every(r => r.isMet) ? 'text-green-500' : 'text-stadium-red'}>
            {requirements.every(r => r.isMet) ? 'Valid Squad' : 'Incomplete'}
          </span>
        </div>
      </div>
    </div>
  );
}
