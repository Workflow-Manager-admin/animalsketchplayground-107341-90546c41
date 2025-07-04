import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import DrawingCard from "../components/DrawingCard";
import AnimatedFloatingActions from "../components/AnimatedFloatingActions";

// PUBLIC_INTERFACE
export default function Dashboard({ onAddDrawing }) {
  const [drawings, setDrawings] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "drawings"), orderBy("guessesCount", "desc"));
    const unsub = onSnapshot(q, snap => {
      setDrawings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Map from drawing.id -> wrong guesses by local user (in production, would want per-user store)
  const [guessedWrong, setGuessedWrong] = useState({});

  const handleGuess = (drawingId) => (guess) => {
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
    // Could add to global guesses list in Firestore as well for statistics
    return isCorrect;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-gradient1 to-background-gradient2 py-8 px-2 flex flex-col items-center">
      <h2 className="font-titleAlt text-3xl text-primary mb-5 tracking-tight animate__bounceIn">
        🏆 Top Drawings
      </h2>
      {drawings.length === 0 ? (
        <div className="text-center py-20 font-semibld text-primary">Loading drawings...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 w-full max-w-screen-lg">
          {drawings.map((drawing, i) => (
            <DrawingCard
              key={drawing.id}
              drawing={drawing}
              // Top card gets highlight
              isTop={i === 0}
              userGuessHistory={guessedWrong[drawing.id] || []}
              onSubmitGuess={handleGuess(drawing.id)}
            />
          ))}
        </div>
      )}
      <AnimatedFloatingActions onClick={onAddDrawing} />
    </div>
  );
}
