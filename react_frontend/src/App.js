import React, { useState } from "react";
import { AppProviders, useAuth } from "./AppProviders";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Drawing from "./pages/Drawing";
import { motion, AnimatePresence } from "framer-motion";

/** 
 * The main app structure: login → dashboard → drawing page.
 * Layout delivers:
 * - Responsive padding, vertical flex, min-height,
 * - Flat look backdrop, playful accent on top-level container,
 * - Ensures sections sit with padded/tiled look for min-height, no sudden jumps
 */
 // PUBLIC_INTERFACE
function MainApp() {
  const { user } = useAuth();
  const [mode, setMode] = useState("dashboard");
  return (
    <div className="App min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-background-gradient1 to-background-gradient2 transition-all">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.92, y: 36 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -14 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, duration: 0.58 }}
            style={{ width: "100%", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Login onLogin={() => {}} />
          </motion.div>
        ) : mode === "drawing" ? (
          <motion.div
            key="drawing"
            className="fade-in-pop"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.96 }}
            transition={{ duration: 0.37, type: "spring", stiffness: 120 }}
            style={{ width: "100%", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Drawing user={user} onBack={() => setMode("dashboard")} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            className="fade-in-up"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.98 }}
            transition={{ duration: 0.39, type: "spring", stiffness: 130 }}
            style={{ width: "100%", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Dashboard onAddDrawing={() => setMode("drawing")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function App() {
  return (
    <AppProviders>
      <MainApp />
    </AppProviders>
  );
}
