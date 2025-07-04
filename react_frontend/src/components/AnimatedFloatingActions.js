import React from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";

// PUBLIC_INTERFACE
export default function AnimatedFloatingActions({ onClick }) {
  return (
    <motion.button
      className="fixed z-50 right-7 bottom-8 flex items-center gap-3 rounded-full bg-highlight text-primary shadow-playful px-6 py-3 font-bold text-lg border-2 border-white hover:bg-yellow-400 active:scale-95 hover:scale-105 drop-shadow-2xl transition-all"
      whileTap={{ scale: 0.96, rotate: -8 }}
      whileHover={{ scale: 1.09, y: -4 }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 160 } }}
      transition={{ type: "spring" }}
      onClick={onClick}
      aria-label="Add Your Drawing"
      style={{ boxShadow: "0 12px 32px rgba(251,191,36,0.14)" }}
    >
      <Pencil className="w-7 h-7 mr-1 text-primary drop-shadow" />
      <span className="font-titleAlt whitespace-nowrap hidden md:inline">Add Your Drawing</span>
      <span className="font-titleAlt md:hidden">+</span>
    </motion.button>
  );
}
