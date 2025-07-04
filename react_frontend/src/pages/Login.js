import React, { useState } from "react";
import { motion } from "framer-motion";
import { anonymousSignIn } from "../firebase";
import mascot from "../assets/mascot.svg";

// PUBLIC_INTERFACE
export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  // Handles username submit and authentication with Firebase
  const [error, setError] = useState(null);
  const doLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    const { error } = await anonymousSignIn(username.trim());
    setLoading(false);
    if (error) {
      setError(
        "Failed to sign in. Please check your connection or try again."
      );
    } else if (onLogin) {
      onLogin();
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-[#f6fff9] to-[#e4f0ff] px-4 relative">
      <motion.img
        src={mascot}
        alt="Mascot"
        className="mascot-img mx-auto"
        initial={{ scale: 0.9, y: -36, opacity: 0.8 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 11, duration: 0.89 }}
      />
      <form
        className="w-full max-w-xs bg-white/85 flex flex-col p-8 rounded-3xl shadow-playful items-center gap-5 border-4 border-accent/30 fade-in-pop"
        onSubmit={doLogin}
        aria-label="Login form"
      >
        <motion.h1 className="font-titleAlt text-4xl md:text-5xl text-primary mb-1 tracking-tight" layout>
          Doodle Playground
        </motion.h1>
        <div className="text-base font-body text-primary/80 mb-2">Enter a fun username!</div>
        <input
          className="input input-lg input-bordered rounded-full text-lg font-semibold bg-background/80 text-primary"
          placeholder="Choose your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={18}
          required
          autoFocus
          autoComplete="off"
          aria-label="Choose your username"
        />
        <motion.button
          className="prominent-action font-bold px-9 py-3 mt-2 flex items-center justify-center"
          whileTap={{ scale: 0.93 }}
          disabled={loading}
          type="submit"
          aria-disabled={loading}
        >
          {loading ? "Joining..." : "Start Playing"}
        </motion.button>
        {error && (
          <div className="text-error text-sm mt-2 text-center">{error}</div>
        )}
      </form>
      <motion.div
        className="absolute left-0 right-0 -z-10 h-full overflow-hidden pointer-events-none"
        style={{ top: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.23 }}
      >
        {/* playful background doodle bubbles (colorful blobs) */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[radial-gradient(circle_at_60%_50%,#4e73dfbb,transparent_60%)] rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 right-14 w-24 h-24 bg-[radial-gradient(circle_at_60%_50%,#fbbf24bb,transparent_50%)] rounded-full blur-xl"></div>
        <div className="absolute top-2/3 left-4 w-20 h-16 bg-[radial-gradient(circle_at_80%_65%,#10b98188,transparent_60%)] rounded-full blur-xl"></div>
      </motion.div>
      <div className="mt-5 text-primary/50 font-titleAlt text-center fade-in-up">
        <span className="bg-yellow-100/80 rounded-full px-3 py-1 text-accent font-bold drop-shadow-sm">No password or email needed!</span>
        <br />
        Play and draw as a fun username.
      </div>
    </div>
  );
}
