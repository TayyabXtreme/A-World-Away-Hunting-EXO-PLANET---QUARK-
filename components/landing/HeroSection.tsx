'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center overflow-hidden">
      {/* Dark Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/10 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center min-h-screen">
        {/* Left Side - Hero Content */}
        <motion.div 
          className="relative z-10 text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Badge */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Badge variant="secondary" className="bg-slate-900/50 text-slate-300 border-slate-700 px-4 py-2 text-sm backdrop-blur-sm">
             
                <Sparkles className="h-4 w-4 mr-2" />
              
              Exoplanet Discovery Platform
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <motion.span 
              className="block bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Explore
            </motion.span>
            <motion.span 
              className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Distant Worlds
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            className="text-xl text-slate-400 mb-8 max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Journey through the cosmos and discover exoplanets beyond our solar system using advanced AI analysis and interactive visualization.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-lg font-semibold group transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                onClick={() => router.push('/dataSetVisualize')}
              >
                Start Exploring
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Side - Animated Solar System */}
        <motion.div 
          className="relative h-96 lg:h-[600px] flex items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Central Star */}
          <motion.div
            className="absolute w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 20px rgba(251, 191, 36, 0.5)",
                "0 0 40px rgba(251, 191, 36, 0.8)",
                "0 0 20px rgba(251, 191, 36, 0.5)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Orbit 1 - Small planet */}
          <motion.div
            className="absolute w-80 h-80 border border-slate-700/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full shadow-lg"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(59, 130, 246, 0.5)",
                  "0 0 20px rgba(59, 130, 246, 0.8)",
                  "0 0 10px rgba(59, 130, 246, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Orbit 2 - Medium planet */}
          <motion.div
            className="absolute w-96 h-96 border border-slate-700/20 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(168, 85, 247, 0.5)",
                  "0 0 20px rgba(168, 85, 247, 0.8)",
                  "0 0 10px rgba(168, 85, 247, 0.5)"
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Orbit 3 - Large planet */}
          <motion.div
            className="absolute w-[450px] h-[450px] border border-slate-700/10 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"
              animate={{
                boxShadow: [
                  "0 0 15px rgba(34, 197, 94, 0.5)",
                  "0 0 25px rgba(34, 197, 94, 0.8)",
                  "0 0 15px rgba(34, 197, 94, 0.5)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          {/* Background Stars */}
          {Array.from({ length: 30 }).map((_, i) => {
            // Use deterministic values based on index to avoid hydration issues
            const leftPos = 20 + ((i * 13) % 60);
            const topPos = 20 + ((i * 17) % 60);
            const duration = 2 + ((i % 3) + 1);
            const delay = (i % 4) * 0.5;
            
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${leftPos}%`,
                  top: `${topPos}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                }}
              />
            );
          })}

          {/* Floating Particles */}
          {Array.from({ length: 15 }).map((_, i) => {
            // Use deterministic values based on index to avoid hydration issues
            const leftPos = (i * 7) % 100;
            const topPos = (i * 11) % 100;
            const duration = 6 + ((i % 4) + 1);
            const delay = (i % 5);
            
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
                style={{
                  left: `${leftPos}%`,
                  top: `${topPos}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, 20, 0],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                }}
              />
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

