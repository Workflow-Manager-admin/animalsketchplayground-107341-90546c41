import React from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";

// PUBLIC_INTERFACE
/**
 * Modern, playful floating button with microinteractions and proper pastel gradient, icon, and soft shadow.
 * Shows "Add Your Drawing" on desktop, just "+" on mobile. Pops/animates in, always pastel.
 */
export default function AnimatedFloatingActions({ onClick }) {
  return (
    <motion.button
      type="button"
      className="fixed z-40 right-6 bottom-6 prominent-action floating-action-btn flex items-center gap-2 shadow-playful border-2 border-white bg-gradient-to-r from-primary to-accent-pink text-white font-titleAlt px-7 py-3 backdrop-blur-lg focus:outline-accent-pink transition-all active:scale-97 hover:scale-110"
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.11, y: -6 }}
      whileTap={{ scale: 0.95, rotate: -8 }}
      transition={{ type: "spring", stiffness: 170, damping: 15 }}
      onClick={onClick}
      aria-label="Add Your Drawing"
      style={{
        boxShadow: "0 18px 44px #fbbf2439, 0 6px 12px #4e73df52",
        border: "2px solid #fff4d1"
      }}
    >
      <Pencil className="w-7 h-7 mr-1 text-white drop-shadow" />
      <span className="font-titleAlt whitespace-nowrap hidden sm:inline">Add Your Drawing</span>
      <span className="font-titleAlt sm:hidden inline">+</span>
    </motion.button>
  );
}
