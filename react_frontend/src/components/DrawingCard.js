import React, { useState } from "react";
import { CheckCircle, XCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// PUBLIC_INTERFACE
export default function DrawingCard({
  drawing,
  onSubmitGuess,
  userGuessHistory = [],
  isTop
}) {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState(null);

  const handleGuess = (e) => {
    e.preventDefault();
    if (!guess.trim()) return;
    const correct = onSubmitGuess(guess.trim());
    setFeedback(correct ? "correct" : "wrong");
    setGuess("");
  };

  return (
    <motion.div
      className={`rounded-lg shadow-playful bg-white/95 p-4 mb-6 relative ${isTop ? "ring-4 ring-highlight scale-105" : "hover:scale-105 transition"}`}
      layout
    >
      {isTop && (
        <motion.div
          className="absolute left-3 -top-3 z-10"
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Sparkles className="text-highlight" size={30} />
        </motion.div>
      )}
      <img
        src={drawing.imageUrl}
        alt="User drawing"
        className="rounded-lg w-full max-h-44 object-contain bg-gradient-to-t from-background-gradient1"
      />
      <div className="font-bold text-primary text-base md:text-lg mt-2">{drawing.prompt}</div>
      <form onSubmit={handleGuess} className="flex gap-2 mt-2">
        <input
          className="input input-bordered rounded-full flex-1 !bg-background"
          type="text"
          placeholder="Guess animal..."
          value={guess}
          onChange={e => setGuess(e.target.value)}
          disabled={feedback === "correct"}
        />
        <button
          className="btn btn-accent font-titleAlt rounded-full px-4"
          type="submit"
          disabled={feedback === "correct"}
        >
          Guess
        </button>
      </form>
      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`mt-2 flex items-center gap-2 text-lg font-titleAlt ${
              feedback === "correct" ? "text-success" : "text-error"
            }`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
          >
            {feedback === "correct" ? (
              <>
                <CheckCircle /> Correct! 🎉
              </>
            ) : (
              <>
                <XCircle /> Nope! Try again.
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {userGuessHistory?.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 animate-pulse">
          Previous guesses: {userGuessHistory.join(", ")}
        </div>
      )}
    </motion.div>
  );
}
