// src/components/VMLoader.jsx – Animated VoxaMail Loader (V and M bounce)
import React from "react";
import { motion } from "framer-motion";

export default function VMLoader({ size = 32, color = "#6366f1" }) {
  return (
    <div className="flex items-center justify-center space-x-2 h-12">
      <motion.span
        className="font-extrabold"
        style={{ fontSize: size, color }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2 }}
      >
        V
      </motion.span>
      <motion.span
        className="font-extrabold"
        style={{ fontSize: size, color }}
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatDelay: 0.2,
          delay: 0.3,
        }}
      >
        M
      </motion.span>
    </div>
  );
}
