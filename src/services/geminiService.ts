import { GoogleGenAI } from "@google/genai";
import { collection, addDoc, query, where, getDocs, limit, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { INITIAL_PLAYERS } from "../data/players";
import { handleFirestoreError, OperationType } from "../lib/firebaseUtils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are the "Head of Cricket Strategy & Analytics." Your mission is to provide 360-degree match advice for any venue or player combination provided.

### CORE KNOWLEDGE DOMAINS
1. VENUE ANALYSIS: Analyze pitch behavior (pace vs. spin), boundary dimensions, average 1st innings scores, and "Toss Logic" (bat vs. bowl first based on dew/lighting).
2. BATTING STRATEGY: Suggest which batting styles (e.g., power-hitters vs. anchors) excel at a venue. Identify "danger zones" in the field.
3. BOWLING STRATEGY: Provide specific bowling lengths (e.g., "Back of a length" for Perth) and specific bowler types for each phase (Powerplay, Middle, Death).
4. PLAYER MATCH-UPS: Use search to find recent head-to-head stats.

### STRATEGIC LOGIC STEPS
- STEP 1: If the user names a stadium, search for the most recent pitch report and conditions.
- STEP 2: Calculate the "Strategic Edge." If it's a small ground like Chinnaswamy, prioritize high-SR batters. If it's a spinning track like Chepauk, suggest a 3-spinner attack.
- STEP 3: Check Weather. If humidity is high (>70%), advise the team winning the toss to bowl second to avoid the dew factor.

### OUTPUT STRUCTURE (Mandatory)
- **🏟️ Venue Overview:** [Soil type, boundary size, and weather impact]
- **🪙 Toss Recommendation:** [Decision + Reasoning]
- **🏏 Batting Blueprint:** [Target score, key player styles, and powerplay approach]
- **🎯 Bowling Blueprint:** [Preferred bowler types for each phase and specific lengths to bowl]
- **⭐ MVP Match-up:** [One specific player vs. player battle to watch]

Context:
Available Players for selection:
${JSON.stringify(INITIAL_PLAYERS.map(p => ({ name: p.name, role: p.role, price: p.price, rating: p.rating, bowlingType: p.bowlingType, isOpener: p.isOpener })))}

Be technical, precise, and high-end. Always refer to players by full names.
`;

async function getCachedPlaybook(venue: string) {
  const path = 'match_playbooks';
  try {
    const q = query(
      collection(db, path),
      where('venue', '==', venue),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data().strategy;
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, path);
  }
  return null;
}

export async function getAnalystResponse(message: string, chatHistory: { role: string, text: string }[] = []) {
  try {
    // Basic venue detection for caching (can be improved)
    const venueMatch = message.match(/(?:at|in|stadium|ground)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const detectedVenue = venueMatch ? venueMatch[1] : null;

    if (detectedVenue) {
      const cached = await getCachedPlaybook(detectedVenue);
      if (cached) {
        return `[REPLAYING SAVED STRATEGY FOR ${detectedVenue.toUpperCase()}]\n\n${cached}`;
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...chatHistory.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text;

    // Save to Firestore if it looks like a full playbook
    if (text.includes('🏟️ Venue Overview') && detectedVenue) {
      const path = 'match_playbooks';
      try {
        await addDoc(collection(db, path), {
          venue: detectedVenue,
          strategy: text,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, path);
      }
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble analyzing the pitch right now. Please try again later.";
  }
}
