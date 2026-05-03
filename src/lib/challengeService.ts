import { collection, doc, addDoc, updateDoc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Player } from '../data/players';
import { handleFirestoreError, OperationType } from './firebaseUtils';

export interface Challenge {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorSquad: Player[];
  opponentId?: string;
  opponentName?: string;
  opponentSquad?: Player[];
  status: 'pending' | 'active' | 'completed';
  winnerId?: string;
  createdAt: any;
  penaltyShared?: boolean;
}

export async function createChallenge(squad: Player[], userName: string) {
  if (!auth.currentUser) throw new Error('Not authenticated');

  const path = 'challenges';
  const challengeData = {
    creatorId: auth.currentUser.uid,
    creatorName: userName || 'Legendary Player',
    creatorSquad: squad,
    status: 'pending',
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, path), challengeData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function acceptChallenge(challengeId: string, squad: Player[], userName: string) {
  if (!auth.currentUser) throw new Error('Not authenticated');

  const path = `challenges/${challengeId}`;
  const challengeRef = doc(db, 'challenges', challengeId);
  try {
    await updateDoc(challengeRef, {
      opponentId: auth.currentUser.uid,
      opponentName: userName || 'Challenger',
      opponentSquad: squad,
      status: 'active',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function completeChallenge(challengeId: string) {
  const path = `challenges/${challengeId}`;
  const challengeRef = doc(db, 'challenges', challengeId);
  try {
    const challengeSnap = await getDoc(challengeRef);
    if (!challengeSnap.exists()) return;
    
    const data = challengeSnap.data();
    const winnerId = Math.random() > 0.5 ? data.creatorId : data.opponentId;

    await updateDoc(challengeRef, {
      status: 'completed',
      winnerId: winnerId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function markPenaltyShared(challengeId: string) {
  const path = `challenges/${challengeId}`;
  const challengeRef = doc(db, 'challenges', challengeId);
  try {
    await updateDoc(challengeRef, {
      penaltyShared: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
