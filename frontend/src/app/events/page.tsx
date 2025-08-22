'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Users, MapPin, Star, Settings, Shield } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  event_type: string;
  image_url: string;
  is_featured: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });

  useEffect(() => {
    // Check for user authentication
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          throw new Error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        // Fallback demo data
        setEvents([
          {
            id: 1,
            title: 'Grand Valentine Bank Heist',
            description: 'Join us for the biggest bank robbery event of the month. Plan your approach, gather your gang, and execute the perfect heist.',
            date: '2024-01-25',
            time: '20:00',
            location: 'Valentine Bank',
            max_participants: 16,
            current_participants: 12,
            event_type: 'heist',
            image_url: '/assets/dollar.png',
            is_featured: true
          },
          {
            id: 2,
            title: 'Moonshine Runners Convention',
            description: 'Moonshiners unite! Share your best recipes and compete in the ultimate moonshine quality contest.',
            date: '2024-01-27',
            time: '19:30',
            location: 'Bayou Nwa',
            max_participants: 20,
            current_participants: 8,
            event_type: 'roleplay',
            image_url: '/assets/mp_roles_moonshiner.png',
            is_featured: false
          },
          {
            id: 3,
            title: 'Cattle Drive Challenge',
            description: 'Help drive cattle across the frontier while defending against rustlers and wild animals.',
            date: '2024-01-30',
            time: '18:00',
            location: 'Great Plains',
            max_participants: 12,
            current_participants: 5,
            event_type: 'challenge',
            image_url: '/assets/mp_roles_trader.png',
            is_featured: false
          },
          {
            id: 4,
            title: 'Bounty Hunter Showdown',
            description: 'The most wanted outlaws are on the loose. Team up with fellow bounty hunters to bring them to justice.',
            date: '2024-02-01',
            time: '21:00',
            location: 'Strawberry',
            max_participants: 10,
            current_participants: 7,
            event_type: 'pvp',
            image_url: '/assets/mp_roles_bounty_hunter.png',
            is_featured: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => 
    filter === 'all' || event.event_type === filter
  );

  const eventTypes = [
    { key: 'all', label: 'All Events' },
    { key: 'heist', label: 'Heists' },
    { key: 'roleplay', label: 'Roleplay' },
    { key: 'challenge', label: 'Challenges' },
    { key: 'pvp', label: 'PvP Events' },
    { key: 'community', label: 'Community' },
    { key: 'training', label: 'Training' }
  ];

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const handleJoinEvent = async (eventId: number) => {
    if (!isAuthenticated) {
      showNotification('Please log in to join events', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to join event (${response.status})`);
      }

      showNotification('Successfully joined event!', 'success');
      // Refresh events to update participant count
      const eventsResponse = await fetch('http://localhost:3001/api/events');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error joining event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join event';
      showNotification(errorMessage, 'error');
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
          {/* Custom Notification */}
          {notification.visible && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className={`fixed top-24 right-6 z-50 p-4 border-2 min-w-80 ${
                notification.type === 'success' ? 'border-green-600 bg-green-600/20' :
                notification.type === 'error' ? 'border-red-600 bg-red-600/20' :
                'border-yellow-600 bg-yellow-600/20'
              }`}
              style={{
                backgroundImage: 'url("/assets/background_paper.png")',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '80px'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    notification.type === 'success' ? 'bg-green-400' :
                    notification.type === 'error' ? 'bg-red-400' :
                    'bg-yellow-400'
                  }`} />
                  <span className="text-white font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                    {notification.message}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  ✕
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 relative"
          >
            {/* Super Admin Management Button */}
            {isAuthenticated && user?.role === 'SUPER_ADMIN' && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute top-0 right-0"
              >
                <Link href="/admin/events">
                  <motion.button
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 text-white font-bold py-3 px-4 border-2 border-transparent transition-all duration-300 shadow-lg relative overflow-hidden group"
                    style={{
                      fontFamily: 'Cinzel, serif'
                    }}
                    title="Manage Events (Super Admin)"
                  >
                    {/* Background with ButtonBg.png mask */}
                    <div 
                      className="absolute inset-0 bg-black group-hover:bg-white transition-colors duration-300"
                      style={{
                        maskImage: 'url("/assets/ButtonBg.png")',
                        WebkitMaskImage: 'url("/assets/ButtonBg.png")',
                        maskSize: 'cover',
                        WebkitMaskSize: 'cover',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat'
                      }}
                    />
                    {/* Content */}
                    <div className="relative z-10 flex items-center space-x-2 text-white group-hover:text-black transition-colors duration-300">
                      <Shield size={18} className="text-yellow-400 group-hover:text-black transition-colors duration-300" />
                      <span>MANAGE EVENTS</span>
                    </div>
                  </motion.button>
                </Link>
              </motion.div>
            )}

            <h1 className="text-5xl lg:text-7xl font-bold text-white font-serif mb-4" style={{
              textShadow: '3px 3px 0px rgba(0,0,0,0.5)',
              fontFamily: 'Cinzel, serif'
            }}>
              FRONTIER EVENTS
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
              Join fellow outlaws, lawmen, and settlers in epic community events across the Wild West frontier.
            </p>
          </motion.div>

          {/* Event Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {eventTypes.map((type) => (
              <motion.button
                key={type.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(type.key)}
                className={`px-6 py-3 font-bold border-2 transition-all duration-300 ${
                  filter === type.key 
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
                {type.label.toUpperCase()}
              </motion.button>
            ))}
          </motion.div>

          {/* Featured Events */}
          {filteredEvents.some(event => event.is_featured) && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-4xl font-bold text-white font-serif mb-8 text-center" style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                fontFamily: 'Cinzel, serif'
              }}>
                FEATURED EVENTS
              </h2>
              <div className="grid lg:grid-cols-2 gap-8">
                {filteredEvents.filter(event => event.is_featured).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
                    whileHover={{ y: -5 }}
                    className="p-8 transition-all duration-300 hover:shadow-xl relative"
                    style={{
                      backgroundImage: 'url("/assets/background_paper.png")',
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      minHeight: '400px'
                    }}
                  >
                    <div className="absolute top-4 right-4">
                      <Star className="text-yellow-400 fill-current" size={24} />
                    </div>
                    
                    <div className="flex justify-center mb-6">
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        width={80}
                        height={80}
                        className="opacity-90"
                      />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4 text-center" style={{fontFamily: 'Cinzel, serif'}}>
                      {event.title.toUpperCase()}
                    </h3>
                    
                    <p className="text-white font-medium leading-relaxed mb-6">
                      {event.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-2 text-white">
                        <Calendar size={16} />
                        <div>
                          <div className="text-xs font-bold">DATE</div>
                          <div className="text-sm font-medium">{event.date}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-white">
                        <Clock size={16} />
                        <div>
                          <div className="text-xs font-bold">TIME</div>
                          <div className="text-sm font-medium">{event.time}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-white">
                        <MapPin size={16} />
                        <div>
                          <div className="text-xs font-bold">LOCATION</div>
                          <div className="text-sm font-medium">{event.location}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-white">
                        <Users size={16} />
                        <div>
                          <div className="text-xs font-bold">PARTICIPANTS</div>
                          <div className="text-sm font-medium">{event.current_participants}/{event.max_participants}</div>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={event.current_participants >= event.max_participants}
                      className={`w-full text-white font-bold py-3 px-4 border-2 border-transparent transition-all duration-300 ${
                        event.current_participants >= event.max_participants
                          ? 'opacity-50 cursor-not-allowed hover:border-transparent'
                          : 'hover:border-red-600'
                      }`}
                      style={{
                        backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        fontFamily: 'Cinzel, serif'
                      }}
                    >
                      {event.current_participants >= event.max_participants ? 'EVENT FULL' : 'JOIN EVENT'}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* All Events */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-white font-serif mb-8 text-center" style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Cinzel, serif'
            }}>
              {filter === 'all' ? 'ALL EVENTS' : eventTypes.find(t => t.key === filter)?.label.toUpperCase()}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                  whileHover={{ y: -5 }}
                  className="p-6 transition-all duration-300 hover:shadow-xl"
                  style={{
                    backgroundImage: 'url("/assets/background_paper.png")',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '350px'
                  }}
                >
                  <div className="flex justify-center mb-4">
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      width={48}
                      height={48}
                      className="opacity-90"
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 text-center" style={{fontFamily: 'Cinzel, serif'}}>
                    {event.title.toUpperCase()}
                  </h3>
                  
                  <p className="text-white font-medium leading-relaxed mb-4 text-sm">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-white text-xs">
                      <span className="font-bold">DATE:</span>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex justify-between text-white text-xs">
                      <span className="font-bold">TIME:</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex justify-between text-white text-xs">
                      <span className="font-bold">LOCATION:</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex justify-between text-white text-xs">
                      <span className="font-bold">SPOTS:</span>
                      <span>{event.current_participants}/{event.max_participants}</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleJoinEvent(event.id)}
                    disabled={event.current_participants >= event.max_participants}
                    className={`w-full text-white font-bold py-2 px-3 border-2 border-transparent transition-all duration-300 text-sm ${
                      event.current_participants >= event.max_participants
                        ? 'opacity-50 cursor-not-allowed hover:border-transparent'
                        : 'hover:border-red-600'
                    }`}
                    style={{
                      backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      fontFamily: 'Cinzel, serif'
                    }}
                  >
                    {event.current_participants >= event.max_participants ? 'FULL' : 'JOIN'}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}