'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import { Users, Star, Award, Shield, Clock, Globe } from 'lucide-react';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  description: string;
  avatar: string;
  discord: string;
}

export default function AboutPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/staff');
        const data = await response.json();
        setStaff(data);
      } catch (error) {
        console.error('Failed to fetch staff:', error);
        // Fallback demo data
        setStaff([
          {
            id: 1,
            name: 'Sheriff Thompson',
            role: 'Server Owner',
            description: 'Founded the server with a vision of authentic Wild West roleplay. Ensures fair play and community growth.',
            avatar: '/assets/badges.png',
            discord: 'SheriffThompson#1234'
          },
          {
            id: 2,
            name: 'Deputy Marshal Kate',
            role: 'Head Administrator',
            description: 'Oversees daily operations and staff management. Expert in conflict resolution and community building.',
            avatar: '/assets/star.png',
            discord: 'DeputyKate#5678'
          },
          {
            id: 3,
            name: 'Doc Holiday',
            role: 'Lead Developer',
            description: 'Develops custom scripts and maintains server stability. Specialist in RedM framework and optimization.',
            avatar: '/assets/outfit.png',
            discord: 'DocHoliday#9012'
          },
          {
            id: 4,
            name: 'Ranger Smith',
            role: 'Community Manager',
            description: 'Manages community events and player relations. Coordinates between staff and community members.',
            avatar: '/assets/mp_roles_bounty_hunter.png',
            discord: 'RangerSmith#3456'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const serverStats = [
    { icon: Users, label: 'Active Players', value: '500+' },
    { icon: Clock, label: 'Server Uptime', value: '99.9%' },
    { icon: Star, label: 'Community Rating', value: '4.9/5' },
    { icon: Globe, label: 'Monthly Events', value: '20+' }
  ];

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
            <h1 className="text-5xl lg:text-7xl font-bold text-white font-serif mb-4" style={{
              textShadow: '3px 3px 0px rgba(0,0,0,0.5)',
              fontFamily: 'Cinzel, serif'
            }}>
              ABOUT OUR FRONTIER
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
              Learn about our community, our vision, and the dedicated people who make the Wild West come alive.
            </p>
          </motion.div>

          {/* Our Story */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold text-white font-serif mb-8 text-center" style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Cinzel, serif'
            }}>
              OUR STORY
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="p-8"
                style={{
                  backgroundImage: 'url("/assets/background_paper.png")',
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  minHeight: '400px'
                }}
              >
                <h3 className="text-2xl font-bold text-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                  THE BEGINNING
                </h3>
                <p className="text-white font-medium leading-relaxed mb-4">
                  Founded in 2023 by a group of passionate Red Dead Redemption 2 enthusiasts, our server was born from 
                  a simple vision: create the most authentic and immersive Wild West roleplay experience possible.
                </p>
                <p className="text-white font-medium leading-relaxed">
                  We started with just a handful of players who shared our dedication to quality roleplay. Through 
                  countless hours of development, community building, and fine-tuning, we've grown into one of the 
                  most respected roleplay communities in the RedM scene.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center"
              >
                <Image
                  src="/assets/fme_king_of_the_rail.png"
                  alt="Server History"
                  width={200}
                  height={200}
                  className="opacity-90"
                />
              </motion.div>
            </div>
          </motion.section>

          {/* Server Stats */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold text-white font-serif mb-8 text-center" style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Cinzel, serif'
            }}>
              BY THE NUMBERS
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {serverStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                    whileHover={{ y: -5 }}
                    className="p-6 text-center transition-all duration-300"
                    style={{
                      backgroundImage: 'url("/assets/background_paper.png")',
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      minHeight: '200px'
                    }}
                  >
                    <div className="flex justify-center mb-4">
                      <IconComponent className="text-white" size={48} />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      {stat.value}
                    </div>
                    <div className="text-white font-medium" style={{fontFamily: 'Cinzel, serif'}}>
                      {stat.label.toUpperCase()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Our Mission */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold text-white font-serif mb-8 text-center" style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Cinzel, serif'
            }}>
              OUR MISSION
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Quality Roleplay',
                  description: 'We maintain high standards for roleplay to ensure immersive and meaningful interactions for all players.'
                },
                {
                  icon: Users,
                  title: 'Community First',
                  description: 'Our community comes first. We listen to feedback and continuously improve based on player needs.'
                },
                {
                  icon: Award,
                  title: 'Innovation',
                  description: 'We constantly develop new features and systems to enhance the Wild West experience.'
                }
              ].map((mission, index) => {
                const IconComponent = mission.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 + (index * 0.1) }}
                    whileHover={{ y: -5 }}
                    className="p-6 text-center transition-all duration-300"
                    style={{
                      backgroundImage: 'url("/assets/background_paper.png")',
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      minHeight: '250px'
                    }}
                  >
                    <div className="flex justify-center mb-4">
                      <IconComponent className="text-white" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3" style={{fontFamily: 'Cinzel, serif'}}>
                      {mission.title.toUpperCase()}
                    </h3>
                    <p className="text-white font-medium leading-relaxed">
                      {mission.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Staff Team */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <h2 className="text-4xl font-bold text-white font-serif mb-8 text-center" style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Cinzel, serif'
            }}>
              MEET THE STAFF
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {staff && staff.length > 0 ? staff.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.3 + (index * 0.1) }}
                  whileHover={{ y: -5 }}
                  className="p-6 transition-all duration-300"
                  style={{
                    backgroundImage: 'url("/assets/background_paper.png")',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '300px'
                  }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={64}
                      height={64}
                      className="opacity-90"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                        {member.name.toUpperCase()}
                      </h3>
                      <div className="text-white font-medium">{member.role}</div>
                    </div>
                  </div>
                  
                  <p className="text-white font-medium leading-relaxed mb-4">
                    {member.description}
                  </p>
                  
                  <div className="border-t-2 border-white pt-4">
                    <div className="text-white font-bold text-sm">
                      DISCORD: {member.discord}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-2 text-center">
                  <div className="text-white text-lg">
                    {loading ? 'Loading staff...' : 'No staff members found.'}
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          {/* Join Community */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
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
              JOIN OUR COMMUNITY
            </h2>
            <p className="text-white font-medium leading-relaxed mb-6 max-w-2xl mx-auto">
              Ready to become part of our Wild West family? Join thousands of players who have made our server their home. 
              Your frontier adventure awaits!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                JOIN DISCORD
              </motion.button>
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
                JOIN SERVER
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}