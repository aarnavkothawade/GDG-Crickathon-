/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import PlayerPool from './components/PlayerPool';
import CricketPitch from './components/CricketPitch';
import ChatBot from './components/ChatBot';
import RequirementTracker from './components/RequirementTracker';
import ChallengeLobby from './components/ChallengeSystem/ChallengeLobby';
import OpponentLobby from './components/ChallengeSystem/OpponentLobby';
import MatchDashboard from './components/ChallengeSystem/MatchDashboard';
import PostMatchResults from './components/ChallengeSystem/PostMatchResults';
import { INITIAL_PLAYERS, Player } from './data/players';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from './lib/firebase';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { Challenge, acceptChallenge } from './lib/challengeService';
import { Swords, X, LogIn } from 'lucide-react';

const MAX_BUDGET = 100;

export default function App() {
  const [history, setHistory] = useState<Player[][]>([[]]);
  const [pointer, setPointer] = useState(0);
  const [extraBudget, setExtraBudget] = useState(0);

  // Challenge System State
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
  const [mode, setMode] = useState<'build' | 'challenge'>('build');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Handle Auth
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    // 2. Handle Challenge ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('challengeId');
    if (id) {
      setChallengeId(id);
    }

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (challengeId) {
      const unsubscribeDoc = onSnapshot(doc(db, 'challenges', challengeId), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Challenge;
          setCurrentChallenge({ ...data, id: snapshot.id });
          
          // Determine mode/view
          if (data.status === 'pending') {
            if (data.creatorId !== auth.currentUser?.uid) {
              setMode('challenge');
            }
          } else if (data.status === 'active' || data.status === 'completed') {
            setMode('challenge');
          }
        }
      });
      return () => unsubscribeDoc();
    }
  }, [challengeId, isAuthenticated]);

  const squad = useMemo(() => history[pointer], [history, pointer]);

  const MAX_BASE_BUDGET = 100;
  const totalMaxBudget = MAX_BASE_BUDGET + extraBudget;

  const usedBudget = useMemo(() => {
    return squad.reduce((total, player) => total + player.price, 0);
  }, [squad]);

  const addToHistory = (newSquad: Player[]) => {
    const nextHistory = history.slice(0, pointer + 1);
    nextHistory.push(newSquad);
    setHistory(nextHistory);
    setPointer(nextHistory.length - 1);
  };

  const togglePlayer = (player: Player) => {
    const isAlreadyIn = squad.some((p) => p.id === player.id);
    let nextSquad;
    if (isAlreadyIn) {
      nextSquad = squad.filter((p) => p.id !== player.id);
    } else {
      if (squad.length >= 11) return;
      // Budget enforcement: check if adding this player exceeds limit
      if (usedBudget + player.price > totalMaxBudget) {
        // We could show a toast here, but for now we just block
        return;
      }
      nextSquad = [...squad, player];
    }
    addToHistory(nextSquad);
  };

  const removePlayer = (id: string) => {
    const nextSquad = squad.filter((p) => p.id !== id);
    addToHistory(nextSquad);
  };

  const undo = () => {
    if (pointer > 0) setPointer(pointer - 1);
  };

  const redo = () => {
    if (pointer < history.length - 1) setPointer(pointer + 1);
  };

  const selectedIds = squad.map((p) => p.id);

  const winProbability = useMemo(() => {
    if (squad.length === 0) return 0;
    
    // 1. Base potential from squad size (reaching 11 increases baseline)
    let prob = (squad.length / 11) * 40; 

    // 2. Performance Factor
    const avgRating = squad.reduce((a, b) => a + b.rating, 0) / squad.length;
    prob += (avgRating - 85) * 3;

    // 3. Balance Bonus
    const roles = {
      Batter: squad.filter(p => p.role === 'Batter').length,
      Bowler: squad.filter(p => p.role === 'Bowler').length,
      'All-rounder': squad.filter(p => p.role === 'All-rounder').length
    };

    if (roles.Batter >= 4) prob += 10;
    if (roles.Bowler >= 4) prob += 10;
    if (roles.Batter + roles['All-rounder'] >= 6) prob += 5;

    // 4. Form/Trend Adjustment
    // We calculate the average recent form compared to ratings
    const formBonus = squad.reduce((sum, p) => {
      const avgForm = (p.recentForm?.reduce((a, b) => a + b, 0) || 0) / (p.recentForm?.length || 1);
      // Normalized form score
      const threshold = p.role === 'Bowler' ? 2 : 50;
      return sum + (avgForm > threshold ? 2 : -1);
    }, 0);
    
    prob += formBonus;

    return Math.min(Math.max(Math.round(prob), 5), 99);
  }, [squad]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleAcceptChallenge = async () => {
    if (!isAuthenticated) {
      await handleLogin();
      return;
    }
    if (!challengeId || !currentChallenge) return;
    await acceptChallenge(challengeId, squad, auth.currentUser?.displayName || 'Challenger Elite');
  };

  const handleCreateChallengeClick = async () => {
    if (!isAuthenticated) {
      await handleLogin();
      return;
    }
    setShowChallengeCreator(true);
  };

  const renderChallengeContent = () => {
    if (!currentChallenge) return null;

    if (currentChallenge.status === 'pending' && currentChallenge.creatorId !== auth.currentUser?.uid) {
      return (
        <OpponentLobby 
          challenge={currentChallenge} 
          onAccept={() => setMode('build')} 
        />
      );
    }

    if (currentChallenge.status === 'active' || (currentChallenge.status === 'completed' && !currentChallenge.penaltyShared)) {
      if (currentChallenge.status === 'completed') {
        const isParticipant = auth.currentUser?.uid === currentChallenge.creatorId || auth.currentUser?.uid === currentChallenge.opponentId;
        if (isParticipant) {
           return (
             <PostMatchResults 
               challenge={currentChallenge} 
               onUnlocked={() => {
                 setMode('build');
                 setChallengeId(null);
               }} 
             />
           );
        }
      }
      return (
        <MatchDashboard 
          challenge={currentChallenge} 
          isCreator={auth.currentUser?.uid === currentChallenge.creatorId} 
        />
      );
    }

    return null;
  };

  return (
    <div id="app-root" className="w-full h-screen bg-[#121212] text-white font-sans flex flex-col overflow-hidden relative">
      <AnimatePresence>
        {mode === 'challenge' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            {renderChallengeContent()}
          </motion.div>
        )}
      </AnimatePresence>

      <Header 
        used={usedBudget} 
        max={totalMaxBudget} 
        playerCount={squad.length} 
        onUndo={undo} 
        onRedo={redo} 
        canUndo={pointer > 0} 
        canRedo={pointer < history.length - 1} 
        onCreditPurchased={(amount) => setExtraBudget(prev => prev + amount)}
      />

      <main className="flex flex-1 overflow-hidden relative">
        <PlayerPool 
          players={INITIAL_PLAYERS} 
          selectedIds={selectedIds} 
          onTogglePlayer={togglePlayer} 
        />
        
        <CricketPitch 
          squad={squad} 
          onRemovePlayer={removePlayer} 
        />

        <RequirementTracker squad={squad} />

        {/* Challenge Creator Overlay */}
        <AnimatePresence>
          {showChallengeCreator && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowChallengeCreator(false)} />
              <ChallengeLobby 
                squad={squad} 
                onChallengeCreated={(id) => {
                  setChallengeId(id);
                  setShowChallengeCreator(false);
                }} 
              />
              <button 
                onClick={() => setShowChallengeCreator(false)}
                className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Overlay & Challenge Button */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-4 z-30">
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center">
              <span className="text-[8px] uppercase text-white/40 tracking-widest font-bold">Proj. Points</span>
              <span className="text-2xl font-black text-championship-gold">
                {squad.reduce((a, b) => a + b.rating * 10, 0)}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center">
              <span className="text-[8px] uppercase text-white/40 tracking-widest font-bold">Win Prob.</span>
              <span className={`text-2xl font-black ${winProbability > 70 ? 'text-green-500' : winProbability > 40 ? 'text-championship-gold' : 'text-stadium-red'}`}>
                {winProbability}%
              </span>
            </div>
          </div>
          
          {currentChallenge?.status === 'pending' && currentChallenge.creatorId !== auth.currentUser?.uid ? (
            <button 
              onClick={handleAcceptChallenge}
              disabled={squad.length !== 11}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black uppercase text-xs italic tracking-widest transition-all ${
                squad.length === 11 
                ? 'bg-championship-gold text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105' 
                : 'bg-white/5 text-white/20 border border-white/10'
              }`}
            >
              {!isAuthenticated ? <LogIn size={18} /> : <Swords size={18} />}
              {squad.length === 11 
                ? (!isAuthenticated ? 'Login to Confirm Battle' : 'Finalize & Fight') 
                : `Finish Squad (${squad.length}/11)`}
            </button>
          ) : (
            <button 
              onClick={handleCreateChallengeClick}
              disabled={squad.length !== 11}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black uppercase text-xs italic tracking-widest transition-all ${
                squad.length === 11 
                ? 'bg-championship-gold text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105' 
                : 'bg-white/5 text-white/20 border border-white/10'
              }`}
            >
              {!isAuthenticated ? <LogIn size={18} /> : <Swords size={18} />}
              {squad.length === 11 
                ? (!isAuthenticated ? 'Login to Challege' : '1v1 Battle Link') 
                : `Finish Squad (${squad.length}/11)`}
            </button>
          )}
        </div>
      </main>

      <footer className="h-10 bg-black flex items-center px-8 border-t border-white/5 z-50">
        <div className="flex gap-6 text-[9px] uppercase tracking-tighter text-white/40 font-bold italic">
          <span>Rules & Scoring</span>
          <span>Squad Strength: <span className="text-green-500">ELITE</span></span>
          <span className="hidden md:inline">Formation: {squad.filter(p => p.role === 'Batter').length} BAT • {squad.filter(p => p.role === 'Bowler').length} BOWL • {squad.filter(p => p.role === 'All-rounder').length} AR</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[9px] uppercase font-bold text-white/40">Live Server: Asia-South</span>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}

