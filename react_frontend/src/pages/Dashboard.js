import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import DrawingCard from "../components/DrawingCard";
import AnimatedFloatingActions from "../components/AnimatedFloatingActions";
import { motion } from "framer-motion";

// PUBLIC_INTERFACE
/**
 * Dashboard: pastel grid of top drawings sorted by guessesCount, with floating action and playful header.
 * Responsive, soft grid, focus on animated transitions and bold titles.
 */
export default function Dashboard({ onAddDrawing }) {
  const [drawings, setDrawings] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "drawings"), orderBy("guessesCount", "desc"));
    const unsub = onSnapshot(q, snap => {
      setDrawings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Map from drawing.id -> wrong guesses by local user (in production, per-user store would be used)
  const [guessedWrong, setGuessedWrong] = useState({});

  const handleGuess = drawingId => guess => {
    // Compare lowercased (in real app: store hashes, etc.)
    const d = drawings.find(x => x.id === drawingId);
    if (!d) return false;

    const isCorrect = guess.trim().toLowerCase() === d.animal.toLowerCase();
    setGuessedWrong(prev => ({
      ...prev,
      [drawingId]: isCorrect
        ? []
        : [...(prev[drawingId] || []), guess]
    }));
    // Could add to global guesses list in Firestore for statistics
    return isCorrect;
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center bg-gradient-to-br from-[#f6fff9] to-[#e4f0ff] pb-10">
      <motion.h2
        className="font-titleAlt text-4xl md:text-5xl text-primary mb-7 tracking-tight fade-in-pop flex gap-3 items-center"
        initial={{ opacity: 0, y: -15, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65 }}
        aria-label="Top Drawings"
      >
        🏆 Top Drawings
        <span className="ml-2 text-accent bg-yellow-200/55 px-3 py-1 rounded-lg font-bold text-lg tracking-tight hidden md:inline fade-in-pop">
          New!
        </span>
      </motion.h2>
      {drawings.length === 0 ? (
        <div className="text-center pt-20 font-semibold text-primary" aria-busy="true">
          <span className="animate-pulse">Loading drawings...</span>
        </div>
      ) : (
        <div className="dashboard-grid mt-3">
          {drawings.map((drawing, i) => (
            <DrawingCard
              key={drawing.id}
              drawing={drawing}
              isTop={i === 0}
              userGuessHistory={guessedWrong[drawing.id] || []}
              onSubmitGuess={handleGuess(drawing.id)}
            />
          ))}
        </div>
      )}
      <AnimatedFloatingActions onClick={onAddDrawing} />
      <motion.div
        className="mt-6 mx-auto"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.09 }}
      >
        <span className="text-accent-pink text-md font-titleAlt">Play, guess, and add your own sketch!</span>
      </motion.div>
    </section>
  );
}
