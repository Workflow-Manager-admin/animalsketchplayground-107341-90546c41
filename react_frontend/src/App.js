import React, { useState } from "react";
import { AppProviders, useAuth } from "./AppProviders";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Drawing from "./pages/Drawing";

/** The main app structure: login → dashboard → drawing page. */
// PUBLIC_INTERFACE
function MainApp() {
  const { user } = useAuth();
  const [mode, setMode] = useState("dashboard");
  if (!user) return <Login onLogin={() => {}} />;
  if (mode === "drawing")
    return <Drawing user={user} onBack={() => setMode("dashboard")} />;
  return <Dashboard onAddDrawing={() => setMode("drawing")} />;
}

// PUBLIC_INTERFACE
export default function App() {
  return (
    <AppProviders>
      <MainApp />
    </AppProviders>
  );
}
