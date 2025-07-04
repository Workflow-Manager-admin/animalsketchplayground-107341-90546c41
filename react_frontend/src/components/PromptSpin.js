import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, PawPrint } from "lucide-react";

// Unified, minimal, playful animal prompt list
const ANIMAL_PROMPTS = [
  "monkey", "sparrow", "whale", "cat", "dog", "elephant", "lion", "penguin", "owl", "rabbit", "giraffe", "bear"
];

// PUBLIC_INTERFACE
export default function PromptSpin({ onPrompt }) {
  const [prompt, setPrompt] = useState("");
  const [spinning, setSpinning] = useState(false);

  // Show available animals under the spinner
  const animalListString = ANIMAL_PROMPTS.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(", ");

  const spin = () => {
    setSpinning(true);
    setPrompt("");
    const timeout = Math.random() * 600 + 700;
    setTimeout(() => {
      const idx = Math.floor(Math.random() * ANIMAL_PROMPTS.length);
      setPrompt(ANIMAL_PROMPTS[idx]);
      setSpinning(false);
      if (onPrompt) onPrompt(ANIMAL_PROMPTS[idx]);
    }, timeout);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        key={String(spinning)}
        className="rounded-full bg-highlight p-8 shadow-xl mb-2 border-4 border-white hover:shadow-2xl transition-transform hover:scale-110"
        onClick={spin}
        animate={{ rotate: spinning ? 540 : 0, scale: spinning ? 1.27 : 1 }}
        transition={{ duration: spinning ? 1.0 : 0.4, ease: "backOut" }}
        disabled={spinning}
        aria-label="Spin for an animal prompt"
      >
        {spinning ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
            className="flex items-center justify-center"
          >
            <PawPrint className="w-10 h-10 text-white opacity-80 animate-bounce" />
          </motion.div>
        ) : (
          <RefreshCcw className="w-10 h-10 text-white" />
        )}
      </motion.button>
      <div className="font-titleAlt text-xl text-primary min-h-[2.5rem] mt-1">
        {prompt ? `Draw: ${prompt.charAt(0).toUpperCase() + prompt.slice(1)}` : "Tap to spin for an animal!"}
      </div>
      <div className="text-xs text-accent-pink mt-1 italic text-center max-w-xs">
        Animals: <span className="font-mono">{animalListString}</span>
      </div>
    </div>
  );
}
