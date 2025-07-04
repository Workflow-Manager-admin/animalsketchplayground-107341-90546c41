import React, { useState } from "react";
import { AppProviders, useAuth } from "./AppProviders";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Drawing from "./pages/Drawing";
import { motion, AnimatePresence } from "framer-motion";

/** The main app structure: login → dashboard → drawing page. */
// PUBLIC_INTERFACE
function MainApp() {
  const { user } = useAuth();
  const [mode, setMode] = useState("dashboard");
  return (
    <div className="App flex flex-col min-h-screen items-center justify-center">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -14 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, duration: 0.58 }}
          >
            <Login onLogin={() => {}} />
          </motion.div>
        ) : mode === "drawing" ? (
          <motion.div
            key="drawing"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.98 }}
            transition={{ duration: 0.39, type: "spring", stiffness: 120 }}
          >
            <Drawing user={user} onBack={() => setMode("dashboard")} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.98 }}
            transition={{ duration: 0.41, type: "spring", stiffness: 120 }}
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
