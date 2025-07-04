import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";

const ANIMAL_PROMPTS = [
  "Happy Elephant", "Dancing Penguin", "Sneaky Fox", "Playful Puppy", "Sleepy Cat",
  "Flying Parrot", "Chill Sloth", "Jumpy Frog", "Curious Owl", "Silly Monkey"
];

// PUBLIC_INTERFACE
export default function PromptSpin({ onPrompt }) {
  const [prompt, setPrompt] = useState("");
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    setSpinning(true);
    setPrompt("");
    const timeout = Math.random() * 600 + 800;
    setTimeout(() => {
      const idx = Math.floor(Math.random() * ANIMAL_PROMPTS.length);
      setPrompt(ANIMAL_PROMPTS[idx]);
      setSpinning(false);
      if (onPrompt) onPrompt(ANIMAL_PROMPTS[idx]);
    }, timeout);
  };

  return (
    <div className="flex flex-col items-center">
      <motion.button
        key={String(spinning)}
        className="rounded-full bg-highlight/80 p-6 mb-2 drop-shadow-lg hover:bg-highlight transition"
        onClick={spin}
        animate={{ rotate: spinning ? 420 : 0, scale: spinning ? 1.2 : 1 }}
        transition={{ duration: spinning ? 0.8 : 0.3 }}
        disabled={spinning}
      >
        <RefreshCcw className="w-10 h-10 text-white" />
      </motion.button>
      <div className="text-lg font-titleAlt text-primary">{prompt || "Spin to get a prompt!"}</div>
    </div>
  );
}
