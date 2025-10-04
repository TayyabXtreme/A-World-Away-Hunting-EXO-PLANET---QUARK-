'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Telescope, Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  progress: number;
  message: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
    >
      <div className="text-center space-y-8">
        {/* Animated telescope icon */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="flex justify-center"
        >
          <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full border border-blue-400/30">
            <Telescope className="h-12 w-12 text-blue-300" />
          </div>
        </motion.div>

        {/* Loading text */}
        <div className="space-y-4">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white"
          >
            Scanning the Galaxy
          </motion.h2>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300"
          >
            {message}
          </motion.p>
        </div>

        {/* Loading spinner and dots */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-2 h-2 bg-blue-400 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Progress information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <div className="text-sm text-gray-400">
            Loading K2, Kepler, and TESS datasets...
          </div>
          <div className="flex justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300">K2 Mission</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-300">Kepler</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-red-300">TESS</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}