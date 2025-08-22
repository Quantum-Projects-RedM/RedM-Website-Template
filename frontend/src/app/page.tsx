'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';
import Navigation from '@/components/Navigation';
import ServerStatus from '@/components/ServerStatus';
import Image from 'next/image';
import { Calendar, Shield, Users, MessageSquare, Star, Award } from 'lucide-react';

export default function Home() {
  const [showContent, setShowContent] = useState(false);

  const features = [
    {
      icon: Star,
      title: 'Authentic Roleplay',
      description: 'Immerse yourself in the authentic Wild West experience with dedicated roleplay mechanics.',
      image: '/assets/mp_roles_bounty_hunter.png'
    },
    {
      icon: Award,
      title: 'Dynamic Events',
      description: 'Join community-driven events including train robberies, cattle drives, and town festivals.',
      image: '/assets/fme_king_of_the_rail.png'
    },
    {
      icon: Users,
      title: 'Active Community',
      description: 'Connect with fellow outlaws, lawmen, and settlers in our thriving community.',
      image: '/assets/mp_roles_trader.png'
    },
    {
      icon: Shield,
      title: 'Fair Governance',
      description: 'Clear rules and active moderation ensure a fair and enjoyable experience for everyone.',
      image: '/assets/badges.png'
    }
  ];

  const recentUpdates = [
    {
      title: 'New Moonshiner Role Added',
      date: '2024-01-15',
      description: 'Players can now become moonshiners with custom distillery mechanics.',
      image: '/assets/mp_roles_moonshiner.png'
    },
    {
      title: 'Valentine Bank Heist Event',
      date: '2024-01-12',
      description: 'Epic community event featuring coordinated bank robbery gameplay.',
      image: '/assets/dollar.png'
    },
    {
      title: 'New Character Customization',
      date: '2024-01-10',
      description: 'Expanded clothing and accessory options for your character.',
      image: '/assets/outfit.png'
    }
  ];

  return (
    <>
      <LoadingScreen onLoadingComplete={() => setShowContent(true)} />
      
      {showContent && (
        <div className="min-h-screen" style={{backgroundColor: 'rgb(32, 32, 32)'}}>
          
          <Navigation />
          
          <main className="relative z-10">
            {/* Hero Section */}
            <section className="relative py-20 px-6 overflow-hidden">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Hero Content */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                  >
                    <div>
                      <h1 className="text-5xl lg:text-7xl font-bold text-white font-serif leading-tight" style={{
                        textShadow: '3px 3px 0px rgba(0,0,0,0.5)'
                      }}>
                        WILD WEST
                        <span className="block text-white">FRONTIER</span>
                      </h1>
                      <div className="flex items-center mt-4">
                        <Image
                          src="/assets/divider_line.png"
                          alt="Divider"
                          width={300}
                          height={8}
                          className="sepia contrast-150"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xl text-white leading-relaxed font-medium p-4"
                       style={{
                         backgroundImage: 'url("/assets/background_paper.png")',
                         backgroundSize: '100% 100%',
                         backgroundPosition: 'center',
                         backgroundRepeat: 'no-repeat',
                         minHeight: '120px'
                       }}>
                      Step into the untamed frontier where honor among thieves and law in the land 
                      shape your destiny. Experience authentic Wild West roleplay like never before.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open('https://servers.redm.net/servers/detail/g3jo4z', '_blank')}
                        className="text-white font-bold py-4 px-8 border-2 border-transparent hover:border-red-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                        style={{
                          backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                        Join the Frontier
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const featuresSection = document.querySelector('#features-section');
                          featuresSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-white font-bold py-4 px-8 border-2 border-transparent hover:border-red-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                        style={{
                          backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                        Learn More
                      </motion.button>
                    </div>
                  </motion.div>
                  
                  {/* Server Status Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <ServerStatus />
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features-section" className="py-20 px-6">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-4" style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    Why Choose Our Server?
                  </h2>
                  <div className="flex justify-center mb-6">
                    <Image
                      src="/assets/divider_line.png"
                      alt="Divider"
                      width={200}
                      height={8}
                      className="opacity-60"
                    />
                  </div>
                  <p className="text-amber-100 text-lg opacity-90 max-w-2xl mx-auto">
                    Experience the Wild West like never before with our unique features and dedicated community.
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {features.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="p-6 text-center hover:shadow-xl transition-all duration-300"
                        style={{
                          backgroundImage: 'url("/assets/background_paper.png")',
                          backgroundSize: '100% 100%',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          minHeight: '300px'
                        }}
                      >
                        <div className="flex justify-center mb-4">
                          <Image
                            src={feature.image}
                            alt={feature.title}
                            width={64}
                            height={64}
                            className="opacity-90"
                          />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 font-serif">
                          {feature.title.toUpperCase()}
                        </h3>
                        <p className="text-white font-medium leading-relaxed">
                          {feature.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Recent Updates Section */}
            <section className="py-20 px-6" style={{backgroundColor: 'rgb(32, 32, 32)'}}>
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-4" style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    Latest Updates
                  </h2>
                  <div className="flex justify-center mb-6">
                    <Image
                      src="/assets/divider_line.png"
                      alt="Divider"
                      width={200}
                      height={8}
                      className="opacity-60"
                    />
                  </div>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                  {recentUpdates.map((update, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="p-6 hover:shadow-xl transition-all duration-300"
                      style={{
                        backgroundImage: 'url("/assets/background_paper.png")',
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '300px'
                      }}
                    >
                      <div className="flex justify-center mb-4">
                        <Image
                          src={update.image}
                          alt={update.title}
                          width={48}
                          height={48}
                          className="opacity-90"
                        />
                      </div>
                      <div className="text-white text-sm mb-2 font-bold">{update.date}</div>
                      <h3 className="text-xl font-bold text-white mb-3 font-serif">
                        {update.title.toUpperCase()}
                      </h3>
                      <p className="text-white font-medium leading-relaxed">
                        {update.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-amber-600/30">
              <div className="max-w-7xl mx-auto text-center">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/assets/star.png"
                    alt="Server Logo"
                    width={48}
                    height={48}
                    className="opacity-80"
                  />
                </div>
                <p className="text-amber-200 mb-4 font-serif text-lg">
                  Wild West RP Server
                </p>
                <p className="text-amber-300 opacity-70">
                  "Honor among thieves, law in the land"
                </p>
              </div>
            </footer>
          </main>
        </div>
      )}
    </>
  );
}
