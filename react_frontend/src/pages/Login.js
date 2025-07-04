import React, { useState } from "react";
import { motion } from "framer-motion";
import { anonymousSignIn } from "../firebase";
import mascot from "../assets/mascot.svg";
import { Sparkles } from "lucide-react";

/**
 * Login Page: playful, soft, rounded, accent-gradient pastel background, mascot, bubbles/doodle, prominent animation.
 * Font/Gradient/Shadow tokens strictly applied. Lucide accent icon, DaisyUI input/buttons.
 */
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
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-background-gradient1 via-background-gradient2 to-highlight px-4 relative transition-all duration-700">
      {/* Mascot bubble */}
      <motion.div
        className="mb-2 mascot-img mx-auto flex justify-center items-center bg-gradient-to-tr from-accent-pink/90 to-highlight/60 shadow-xl"
        initial={{ scale: 0.93, y: -28, rotate: -8, opacity: 0.7 }}
        animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18, duration: 0.89 }}
      >
        <img src={mascot} alt="Mascot" className="w-36 h-36 md:w-44 md:h-44 object-contain" draggable="false" />
      </motion.div>
      <form
        className="w-full max-w-xs bg-white/85 flex flex-col p-8 rounded-[1.6em] shadow-playful items-center gap-5 border-4 border-accent-pink/25 fade-in-pop"
        onSubmit={doLogin}
        aria-label="Login form"
        style={{ boxShadow: "0 11px 38px 0px #4e73df19" }}
      >
        <motion.h1 className="font-titleAlt text-4xl md:text-5xl text-primary mb-1 tracking-tight flex items-center gap-2" layout>
          <Sparkles className="text-accent-pink mr-2 drop-shadow" />
          Doodle Playground
        </motion.h1>
        <div className="text-base font-body text-primary/85 mb-2 text-center">Enter a <b>fun username</b>!</div>
        <input
          className="input input-lg input-bordered rounded-full text-lg font-semibold bg-background/80 text-primary shadow"
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
          className="prominent-action font-bold px-9 py-3 mt-2 flex items-center justify-center gap-2"
          whileTap={{ scale: 0.93, backgroundColor: "#ff6b81" }}
          disabled={loading}
          type="submit"
          aria-disabled={loading}
        >
          <span>{loading ? "Joining..." : "Start Playing"}</span>
          <Sparkles className="w-5 h-5 text-accent-pink hidden md:inline" />
        </motion.button>
        {error && (
          <div className="text-error text-sm mt-2 text-center">{error}</div>
        )}
      </form>
      <motion.div
        className="absolute left-0 right-0 -z-10 h-full overflow-hidden pointer-events-none"
        style={{ top: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.22 }}
      >
        {/* Accent doodle/gradient blobs (responsive) */}
        <div className="absolute top-24 left-12 w-32 h-32 bg-[radial-gradient(circle_at_60%_50%,#4e73dfcc,transparent_70%)] rounded-full blur-2xl"></div>
        <div className="absolute bottom-36 right-20 w-28 h-28 bg-[radial-gradient(circle_at_60%_50%,#fbbf24cc,transparent_58%)] rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-4 w-24 h-20 bg-[radial-gradient(circle_at_80%_65%,#10b98188,transparent_65%)] rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-14 w-16 h-14 bg-[radial-gradient(circle_at_20%_65%,#ff6b8185,transparent_70%)] rounded-full blur-md"></div>
      </motion.div>
      <div className="mt-6 text-primary/55 font-titleAlt text-center fade-in-up">
        <span className="bg-yellow-100/85 rounded-full px-3 py-1 text-accent font-bold drop-shadow-sm">
          No password or email needed!
        </span>
        <br />
        <span className="text-primary/80">Play and draw—just pick a username 🎨</span>
      </div>
    </div>
  );
}
