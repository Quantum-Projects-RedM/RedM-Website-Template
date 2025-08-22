'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  const loadingMessages = [
    "Loading the Wild West...",
    "Preparing your horse...",
    "Checking your weapons...",
    "Finding the nearest saloon...",
    "Ready to ride, partner!"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setShowClickPrompt(true);
          return 100;
        }
        const increment = Math.random() * 3 + 1.5;
        const newProgress = prev + increment;
        
        // Change message based on progress
        const messageIndex = Math.min(Math.floor(newProgress / 20), loadingMessages.length - 1);
        if (messageIndex !== currentMessage) {
          setCurrentMessage(messageIndex);
        }
        
        return newProgress;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [currentMessage, loadingMessages.length]);

  const handleClick = () => {
    setIsComplete(true);
    setTimeout(() => {
      onLoadingComplete();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={showClickPrompt ? handleClick : undefined}
          style={{ backgroundColor: 'rgb(32, 32, 32)' }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute opacity-5"
                animate={{
                  x: [-20, 20, -20],
                  y: [-10, 10, -10],
                  rotate: [-1, 1, -1]
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${10 + i * 12}%`,
                }}
              >
                <Image 
                  src="/assets/star.png" 
                  alt="" 
                  width={40} 
                  height={40} 
                  className="sepia contrast-150" 
                />
              </motion.div>
            ))}
          </div>

          {/* Main content container with paper background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative p-12 max-w-2xl mx-auto"
            style={{
              backgroundImage: 'url("/assets/background_paper.png")',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '500px',
              minWidth: '600px'
            }}
          >
            {/* Decorative corners with role badges */}
            <motion.div 
              className="absolute top-6 left-6"
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Image src="/assets/mp_roles_bounty_hunter.png" alt="" width={64} height={64} className="opacity-60 sepia contrast-125" />
            </motion.div>
            <motion.div 
              className="absolute top-6 right-6"
              animate={{ rotate: [2, -2, 2] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
              <Image src="/assets/mp_roles_trader.png" alt="" width={64} height={64} className="opacity-60 sepia contrast-125" />
            </motion.div>
            <motion.div 
              className="absolute bottom-6 left-6"
              animate={{ rotate: [-1, 1, -1] }}
              transition={{ duration: 5, repeat: Infinity, delay: 2 }}
            >
              <Image src="/assets/mp_roles_collector.png" alt="" width={64} height={64} className="opacity-60 sepia contrast-125" />
            </motion.div>
            <motion.div 
              className="absolute bottom-6 right-6"
              animate={{ rotate: [1, -1, 1] }}
              transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
            >
              <Image src="/assets/mp_roles_moonshiner.png" alt="" width={64} height={64} className="opacity-60 sepia contrast-125" />
            </motion.div>

            {/* Center content */}
            <div className="text-center pt-8">
              {/* Main logo with animation */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mb-6"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [-0.5, 0.5, -0.5]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex justify-center mb-4"
                >
                  <Image src="/assets/star.png" alt="Star" width={80} height={80} className="sepia contrast-150" />
                </motion.div>
                
                <motion.h1 
                  className="text-6xl lg:text-7xl font-bold text-white font-serif mb-4" 
                  style={{
                    textShadow: '3px 3px 0px rgba(0,0,0,0.8)',
                    fontFamily: 'Cinzel, serif'
                  }}
                  animate={{ 
                    textShadow: [
                      '3px 3px 0px rgba(0,0,0,0.8)',
                      '4px 4px 0px rgba(0,0,0,0.6)',
                      '3px 3px 0px rgba(0,0,0,0.8)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  WILD WEST
                </motion.h1>
                
                <div className="flex justify-center mb-4">
                  <Image
                    src="/assets/divider_line.png"
                    alt="Divider"
                    width={300}
                    height={8}
                    className="sepia contrast-150"
                  />
                </div>
                
                <h2 className="text-2xl lg:text-3xl text-white font-serif font-bold tracking-wider" style={{fontFamily: 'Cinzel, serif'}}>
                  FRONTIER SERVER
                </h2>
              </motion.div>

              {/* Loading section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="mb-8"
              >
                {/* Loading message */}
                <motion.div
                  key={currentMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <p className="text-white text-xl font-bold font-serif" style={{fontFamily: 'Cinzel, serif'}}>
                    {loadingMessages[currentMessage]}
                  </p>
                </motion.div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-white font-bold text-sm mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    <span>PROGRESS</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-black/50 border-2 border-white">
                    <motion.div
                      className="h-full"
                      style={{ 
                        width: `${progress}%`,
                        backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                        backgroundSize: 'cover'
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Animated loading icons */}
                <div className="flex justify-center space-x-6 mb-6">
                  {['/assets/horseshoes.png', '/assets/star.png', '/assets/dollar.png'].map((icon, index) => (
                    <motion.div
                      key={icon}
                      animate={{
                        y: [-3, 3, -3],
                        rotate: [-5, 5, -5]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    >
                      <Image 
                        src={icon} 
                        alt="" 
                        width={32} 
                        height={32} 
                        className="sepia contrast-125 opacity-80" 
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Click to Continue */}
              <AnimatePresence>
                {showClickPrompt && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                  >
                    <motion.button
                      animate={{ 
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          '0 0 0 rgba(220, 38, 38, 0)',
                          '0 0 20px rgba(220, 38, 38, 0.3)',
                          '0 0 0 rgba(220, 38, 38, 0)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-white font-bold py-4 px-8 border-2 border-white hover:border-red-600 hover:bg-red-600/20 transition-all duration-300"
                      style={{
                        backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                        backgroundSize: 'cover',
                        fontFamily: 'Cinzel, serif'
                      }}
                    >
                      CLICK TO ENTER THE FRONTIER
                    </motion.button>
                    
                    {/* Role icons */}
                    <div className="flex justify-center space-x-4">
                      {['/assets/badges.png', '/assets/outfit.png', '/assets/wagon.png'].map((icon, index) => (
                        <motion.div
                          key={icon}
                          animate={{
                            y: [0, -5, 0],
                            rotate: [0, 10, 0]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: index * 0.3
                          }}
                        >
                          <Image src={icon} alt="" width={28} height={28} className="sepia contrast-125 opacity-70" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/80 text-sm font-serif italic text-center"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              "Honor Among Thieves, Law in the Land"
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}