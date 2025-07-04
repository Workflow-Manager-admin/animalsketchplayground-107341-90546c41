import React, { useState } from "react";
import { CheckCircle, XCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// PUBLIC_INTERFACE
/**
 * DrawingCard: Soft, pastel card for display of animal drawing, guess feedback, and user interaction.
 * Animates in, highlights top card, uses playful microanimation for correct/wrong answer.
 */
export default function DrawingCard({
  drawing,
  onSubmitGuess,
  userGuessHistory = [],
  isTop
}) {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState(null);

  const handleGuess = e => {
    e.preventDefault();
    if (!guess.trim()) return;
    const correct = onSubmitGuess(guess.trim());
    setFeedback(correct ? "correct" : "wrong");
    setGuess("");
  };

  return (
    <motion.div
      className={`drawing-card relative ${isTop ? "drawing-card-top ring-4 ring-accent-pink scale-[1.05]" : "hover:scale-105 transition-transform"} rounded-2xl p-4 mb-6 bg-white/95 shadow-playful min-w-[0]`}
      layout
    >
      {isTop && (
        <motion.div
          className="absolute left-2 -top-4 z-10"
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Sparkles className="text-accent-pink" size={32} />
        </motion.div>
      )}
      <img
        src={drawing.imageUrl}
        alt="User drawing"
        className="rounded-lg w-full max-h-44 object-contain bg-gradient-to-t from-background-gradient1"
      />
      <div className="font-bold text-primary text-lg md:text-xl mt-2 capitalize font-titleAlt tracking-tight">
        {drawing.animal}
      </div>
      <form onSubmit={handleGuess} className="flex gap-2 mt-2">
        <input
          className={`input input-bordered rounded-full flex-1 text-base font-body bg-background transition-all ${
            feedback === "wrong" ? "input-guess-wrong border-error" : ""
          }`}
          type="text"
          placeholder="Guess animal..."
          value={guess}
          onChange={e => setGuess(e.target.value)}
          disabled={feedback === "correct"}
          autoFocus={isTop}
          aria-label="Guess animal name"
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
              feedback === "correct"
                ? "text-success bg-gradient-to-r from-accent-green/20 to-accent-green/10 rounded px-3 py-1"
                : "text-error bg-gradient-to-r from-error/20 to-error/5 rounded px-3 py-1"
            }`}
            initial={{ y: 12, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1.08 }}
            exit={{ y: 10, opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 230 }}
            role={feedback === "correct" ? "status" : "alert"}
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
        <div className="mt-2 text-xs text-accent-pink animate-pulse">
          Previous guesses: {userGuessHistory.join(", ")}
        </div>
      )}
    </motion.div>
  );
}
