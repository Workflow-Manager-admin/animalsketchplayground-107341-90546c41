import React, { createContext, useContext, useEffect, useState } from "react";
import { listenToAuth } from "./firebase";

// AuthContext
const AuthContext = createContext();
// PUBLIC_INTERFACE
export const useAuth = () => useContext(AuthContext);

/** AppProviders: Provides auth state and theming to children. */
export function AppProviders({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = listenToAuth(u => setUser(u));
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
