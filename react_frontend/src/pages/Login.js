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
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-background-gradient1 to-background-gradient2 px-4">
      <motion.img
        src={mascot}
        alt="Mascot"
        className="w-40 h-40 mb-8 drop-shadow-xl"
        initial={{ scale: 0.7, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 130 }}
      />
      <form
        className="bg-white/70 flex flex-col p-8 rounded-3xl shadow-playful items-center gap-5"
        onSubmit={doLogin}
      >
        <motion.h1 className="font-titleAlt text-3xl md:text-4xl text-primary mb-1 tracking-tight" layout>
          Doodle Playground
        </motion.h1>
        <div className="text-sm font-body text-primary/80 mb-2">
          Enter a fun username!
        </div>
        <input
          className="input input-lg input-bordered rounded-full text-lg font-semibold bg-background/80"
          placeholder="Choose your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={18}
          required
          autoFocus
          autoComplete="off"
        />
        <motion.button
          className="btn btn-primary font-bold rounded-full px-8 py-2 text-lg mt-2 flex items-center justify-center"
          whileTap={{ scale: 0.93 }}
          disabled={loading}
          type="submit"
        >
          {loading ? "Joining..." : "Start Playing"}
        </motion.button>
        {error && (
          <div className="text-error text-sm mt-2 text-center">
            {error}
          </div>
        )}
      </form>
      <motion.div
        className="absolute left-0 right-0 -z-10 h-full overflow-hidden pointer-events-none"
        style={{ top: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
      >
        {/* playful background doodle bubbles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[radial-gradient(circle_at_60%_50%,#4e73dfbb,transparent_60%)] rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 right-14 w-24 h-24 bg-[radial-gradient(circle_at_60%_50%,#fbbf24bb,transparent_50%)] rounded-full blur-xl"></div>
        <div className="absolute top-2/3 left-4 w-20 h-16 bg-[radial-gradient(circle_at_80%_65%,#10b98188,transparent_60%)] rounded-full blur-xl"></div>
      </motion.div>
    </div>
  );
}
