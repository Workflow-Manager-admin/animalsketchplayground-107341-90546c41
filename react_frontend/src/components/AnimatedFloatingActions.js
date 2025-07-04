import React from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";

// PUBLIC_INTERFACE
export default function AnimatedFloatingActions({ onClick }) {
  return (
    <motion.button
      className="fixed z-50 right-4 bottom-6 rounded-full bg-primary text-white p-4 shadow-xl hover:scale-105"
      whileTap={{ scale: 0.93, rotate: -8 }}
      whileHover={{ scale: 1.12, rotate: 8 }}
      onClick={onClick}
      aria-label="Add new drawing"
    >
      <Pencil className="w-7 h-7" />
    </motion.button>
  );
}
