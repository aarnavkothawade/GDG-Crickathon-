import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, CheckCircle2, ShieldCheck, QrCode, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  requiredAmount: number;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, requiredAmount }: PaymentModalProps) {
  const [step, setStep] = useState<'selection' | 'upi' | 'processing' | 'success'>('selection');
  const [selectedPlan, setSelectedPlan] = useState<{ credit: number; price: number } | null>(null);

  const plans = [
    { credit: 5, price: 99, label: 'Starter Pack' },
    { credit: 15, price: 249, label: 'Pro Extension' },
    { credit: 50, price: 499, label: 'Elite Unlimited' },
  ];

  const handlePayment = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        if (selectedPlan) onSuccess(selectedPlan.credit);
        reset();
      }, 2000);
    }, 3000);
  };

  const reset = () => {
    setStep('selection');
    setSelectedPlan(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-championship-gold/10 to-transparent">
              <div className="flex items-center gap-3">
                <CreditCard className="text-championship-gold" />
                <h2 className="text-lg font-black uppercase italic italic">Credit Marketplace</h2>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'selection' && (
                <div className="space-y-4">
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-4">Select Credit Package</p>
                  {plans.map((plan) => (
                    <button
                      key={plan.credit}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setStep('upi');
                      }}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-championship-gold/50 hover:bg-white/10 transition-all flex items-center justify-between group"
                    >
                      <div className="text-left">
                        <p className="text-xs font-bold text-championship-gold uppercase">{plan.label}</p>
                        <p className="text-xl font-black italic">+{plan.credit} Cr</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white">₹{plan.price}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase">One-time</p>
                      </div>
                    </button>
                  ))}
                  <div className="mt-6 flex items-center gap-2 justify-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} />
                    Secured by EliteX Payments
                  </div>
                </div>
              )}

              {step === 'upi' && selectedPlan && (
                <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-xl font-black italic mb-2">Scan to Pay UPI</h3>
                  <p className="text-xs text-white/40 mb-6">Total Amount: ₹{selectedPlan.price}</p>
                  
                  <div className="p-4 bg-white rounded-2xl mb-6 relative group cursor-pointer" onClick={handlePayment}>
                    <QrCode size={180} className="text-black" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                       <span className="text-white font-black uppercase text-xs">Simulate Payment</span>
                    </div>
                  </div>

                  <div className="flex gap-4 w-full">
                    <button onClick={() => setStep('selection')} className="flex-1 py-3 text-xs font-bold text-white/40 uppercase hover:text-white transition-colors">Back</button>
                    <button onClick={handlePayment} className="flex-2 py-3 px-6 bg-championship-gold text-black font-black uppercase text-xs rounded-xl hover:bg-yellow-400 transition-all">Verified & Paid</button>
                  </div>
                </div>
              )}

              {step === 'processing' && (
                <div className="py-20 flex flex-col items-center text-center">
                  <Loader2 size={48} className="text-championship-gold animate-spin mb-4" />
                  <p className="text-lg font-black uppercase italic">Verifying Transaction...</p>
                  <p className="text-xs text-white/40 mt-2 font-bold uppercase">Waiting for bank confirmation</p>
                </div>
              )}

              {step === 'success' && (
                <div className="py-12 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20"
                  >
                    <CheckCircle2 size={40} className="text-black" />
                  </motion.div>
                  <h3 className="text-2xl font-black italic uppercase">Payment Successful!</h3>
                  <p className="text-xs text-white/60 mt-2 font-medium">Credits have been added to your vault.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
