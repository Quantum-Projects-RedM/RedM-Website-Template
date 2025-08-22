'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import { Shield, AlertTriangle, Users, Gavel, Eye, Lock } from 'lucide-react';
import Link from 'next/link';

interface Rule {
  id: number;
  category: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'ban';
  punishment: string;
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/rules');
        const data = await response.json();
        setRules(data);
      } catch (error) {
        console.error('Failed to fetch rules:', error);
        // Fallback demo data
        setRules([
          {
            id: 1,
            category: 'general',
            title: 'Respect All Players',
            description: 'Treat all players with respect regardless of their character, background, or playstyle. No harassment, discrimination, or toxic behavior.',
            severity: 'high',
            punishment: '24h ban - Permanent ban'
          },
          {
            id: 2,
            category: 'general',
            title: 'No Metagaming',
            description: 'Do not use out-of-character information in roleplay. Information gained outside of roleplay cannot be used by your character.',
            severity: 'medium',
            punishment: 'Warning - 12h ban'
          },
          {
            id: 3,
            category: 'roleplay',
            title: 'Stay in Character',
            description: 'Remain in character at all times while in the server. Use /ooc for out-of-character communication sparingly.',
            severity: 'low',
            punishment: 'Warning - Kick'
          },
          {
            id: 4,
            category: 'roleplay',
            title: 'Realistic Character Development',
            description: 'Your character must have realistic motivations, fears, and limitations. No superhuman abilities or unrealistic behavior.',
            severity: 'medium',
            punishment: 'Character reset - 24h ban'
          },
          {
            id: 5,
            category: 'combat',
            title: 'No Random Death Match (RDM)',
            description: 'You must have a valid roleplay reason before engaging in combat with another player. Random killing is prohibited.',
            severity: 'high',
            punishment: '24h ban - 7 day ban'
          },
          {
            id: 6,
            category: 'combat',
            title: 'Fear for Your Life',
            description: 'Your character must value their life. If outnumbered or outgunned, act accordingly with realistic fear and self-preservation.',
            severity: 'medium',
            punishment: 'Warning - 12h ban'
          },
          {
            id: 7,
            category: 'economy',
            title: 'No Exploiting',
            description: 'Do not exploit game mechanics, bugs, or glitches for personal gain. Report any discovered exploits to staff.',
            severity: 'ban',
            punishment: 'Permanent ban'
          },
          {
            id: 8,
            category: 'economy',
            title: 'Realistic Money Handling',
            description: 'Money transactions must be realistic. No giving away large sums without proper roleplay reasoning.',
            severity: 'medium',
            punishment: 'Money reset - 24h ban'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const categories = [
    { key: 'general', label: 'General Rules', icon: Shield },
    { key: 'roleplay', label: 'Roleplay', icon: Users },
    { key: 'combat', label: 'Combat & PvP', icon: Gavel },
    { key: 'economy', label: 'Economy', icon: Eye }
  ];

  const filteredRules = rules.filter(rule => rule.category === selectedCategory);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400 border-green-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'high': return 'text-orange-400 border-orange-400';
      case 'ban': return 'text-red-400 border-red-400';
      default: return 'text-white border-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <Eye size={16} />;
      case 'medium': return <AlertTriangle size={16} />;
      case 'high': return <Shield size={16} />;
      case 'ban': return <Lock size={16} />;
      default: return <Eye size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{backgroundColor: 'rgb(32, 32, 32)'}}>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'rgb(32, 32, 32)'}}>
      <Navigation />
      
      <main className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Manage Rules Button for Super Admins */}
            {isAuthenticated && user?.role === 'SUPER_ADMIN' && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex justify-end mb-8"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/admin/rules'}
                  className="group relative px-6 py-3 overflow-hidden transition-all duration-300"
                  style={{
                    width: '200px',
                    height: '50px'
                  }}
                >
                <div className="absolute inset-0"
                     style={{
                       backgroundImage: 'url("/assets/ButtonBg.png")',
                       backgroundSize: '100% 100%',
                       backgroundPosition: 'center',
                       backgroundRepeat: 'no-repeat'
                     }} />
                <div className="absolute inset-0 bg-black group-hover:bg-white transition-colors duration-300"
                     style={{
                       maskImage: 'url("/assets/ButtonBg.png")',
                       maskSize: '100% 100%',
                       maskPosition: 'center',
                       maskRepeat: 'no-repeat'
                     }} />
                    {/* Content */}
                    <span className="relative z-10 text-white group-hover:text-black font-bold transition-colors duration-300"
                          style={{fontFamily: 'Cinzel, serif'}}>
                      MANAGE RULES
                    </span>
                </motion.button>
              </motion.div>
            )}

            <h1 className="text-5xl lg:text-7xl font-bold text-white font-serif mb-4" style={{
              textShadow: '3px 3px 0px rgba(0,0,0,0.5)',
              fontFamily: 'Cinzel, serif'
            }}>
              FRONTIER LAW
            </h1>
            <div className="flex justify-center mb-6">
              <Image
                src="/assets/divider_line.png"
                alt="Divider"
                width={300}
                height={8}
                className="sepia contrast-150"
              />
            </div>
            <p className="text-white text-xl leading-relaxed font-medium p-4 max-w-3xl mx-auto"
               style={{
                 backgroundImage: 'url("/assets/background_paper.png")',
                 backgroundSize: '100% 100%',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat',
                 minHeight: '120px'
               }}>
              Law and order in the Wild West. Follow these rules to ensure a fair and enjoyable experience for all citizens of the frontier.
            </p>
          </motion.div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 p-6 border-2 border-red-600"
            style={{
              backgroundImage: 'url("/assets/background_paper.png")',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '150px'
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-red-400" size={24} />
              <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                IMPORTANT NOTICE
              </h2>
            </div>
            <p className="text-white font-medium leading-relaxed">
              Ignorance of the law is no excuse. All players are expected to read and understand these rules. 
              Breaking any rule may result in punishment up to and including permanent banishment from the server. 
              Staff decisions are final.
            </p>
          </motion.div>

          {/* Rule Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.button
                  key={category.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-6 py-3 font-bold border-2 transition-all duration-300 flex items-center space-x-2 ${
                    selectedCategory === category.key 
                      ? 'text-white border-red-600' 
                      : 'text-white border-transparent hover:border-red-600'
                  }`}
                  style={{
                    backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    fontFamily: 'Cinzel, serif'
                  }}
                >
                  <IconComponent size={18} />
                  <span>{category.label.toUpperCase()}</span>
                </motion.button>
              );
            })}
          </motion.div>


          {/* Rules List */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-4xl font-bold text-white font-serif mb-8 text-center" style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Cinzel, serif'
            }}>
              {categories.find(c => c.key === selectedCategory)?.label.toUpperCase()} RULES
            </h2>
            
            <div className="space-y-6">
              {filteredRules.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + (index * 0.1) }}
                  whileHover={{ x: 5 }}
                  className="p-6 transition-all duration-300 hover:shadow-xl"
                  style={{
                    backgroundImage: 'url("/assets/background_paper.png")',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '200px'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                        #{rule.id}
                      </div>
                      <h3 className="text-xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                        {rule.title.toUpperCase()}
                      </h3>
                    </div>
                    
                    <div className={`flex items-center space-x-2 px-3 py-1 border-2 ${getSeverityColor(rule.severity)}`}>
                      {getSeverityIcon(rule.severity)}
                      <span className="text-sm font-bold">{rule.severity.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <p className="text-white font-medium leading-relaxed mb-4">
                    {rule.description}
                  </p>
                  
                  <div className="border-t-2 border-white pt-4">
                    <div className="flex items-center space-x-2">
                      <Gavel className="text-red-400" size={16} />
                      <span className="text-white font-bold text-sm">PUNISHMENT:</span>
                      <span className="text-white font-medium text-sm">{rule.punishment}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Contact Staff */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 text-center p-8"
            style={{
              backgroundImage: 'url("/assets/background_paper.png")',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '200px'
            }}
          >
            <h2 className="text-3xl font-bold text-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              QUESTIONS ABOUT THE RULES?
            </h2>
            <p className="text-white font-medium leading-relaxed mb-6">
              If you have any questions about our rules or need clarification, don't hesitate to contact our staff team. 
              We're here to help ensure everyone has a great roleplay experience.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-white font-bold py-4 px-8 border-2 border-transparent hover:border-red-600 transition-all duration-300"
              style={{
                backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                fontFamily: 'Cinzel, serif'
              }}
            >
              CONTACT STAFF
            </motion.button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}