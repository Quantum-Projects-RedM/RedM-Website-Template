'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Calendar, Shield, Users, MessageSquare, LogIn, LogOut, User } from 'lucide-react';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

interface ServerStatus {
  server_name: string;
  current_players: number;
  max_players: number;
  is_online: boolean;
  last_updated?: string;
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    server_name: 'Wild West RP',
    current_players: 0,
    max_players: 32,
    is_online: false
  });

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/server/status');
        const data = await response.json();
        setServerStatus(data);
      } catch (error) {
        console.error('Failed to fetch server status:', error);
        // Keep default offline status
      }
    };

    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    window.location.href = '/';
  };


  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/rules', label: 'Rules', icon: Shield },
    { href: '/about', label: 'About Us', icon: Users },
    { href: '/forums', label: 'Forums', icon: MessageSquare },
  ];

  return (
    <nav className="relative z-40">
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center p-6 bg-black border-b-4 border-white shadow-lg">
        {/* Logo */}
        <div className="flex-1">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/assets/star.png"
              alt="Server Logo"
              width={40}
              height={40}
              className="opacity-90 hover:opacity-100 transition-opacity"
            />
            <span className="text-2xl font-bold text-white font-serif tracking-wide" style={{fontFamily: 'Cinzel, serif'}}>
              WILD WEST RP
            </span>
          </Link>
        </div>

        {/* Menu Items - Centered */}
        <div className="flex items-center space-x-8 flex-1 justify-center">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center space-x-2 text-white hover:text-gray-300 transition-colors relative font-bold"
              >
                <IconComponent size={18} className="opacity-80 group-hover:opacity-100" />
                <span className="font-medium tracking-wide">{item.label}</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></div>
              </Link>
            );
          })}
        </div>

        {/* Auth Section */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          {user ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-white font-bold py-2 px-4 border-2 border-transparent hover:border-red-600 transition-all duration-300"
                style={{
                  backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  fontFamily: 'Cinzel, serif'
                }}
              >
                <User size={18} />
                <span>{user.username.toUpperCase()}</span>
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-black border-2 border-white shadow-xl z-50"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-white text-sm border-b border-white">
                        <div className="font-bold">{user.username}</div>
                        <div className="text-gray-300">{user.role}</div>
                      </div>
                      <Link href="/profile" className="block px-3 py-2 text-white hover:bg-gray-800 transition-colors">
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-white hover:bg-gray-800 transition-colors flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 text-white font-bold py-2 px-4 border-2 border-transparent hover:border-red-600 transition-all duration-300"
                  style={{
                    backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    fontFamily: 'Cinzel, serif'
                  }}
                >
                  <LogIn size={18} />
                  <span>SIGN IN</span>
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-white font-bold py-2 px-4 border-2 border-white hover:border-red-600 hover:bg-red-600/20 transition-all duration-300"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  JOIN
                </motion.button>
              </Link>
            </div>
          )}

          {/* Server Status Badge */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 border-2 border-white ${
              serverStatus.is_online ? 'bg-green-600' : 'bg-red-600'
            }`}>
              <div className={`w-2 h-2 bg-white rounded-full ${
                serverStatus.is_online ? 'animate-pulse' : ''
              }`}></div>
              <span className="text-white text-sm font-bold">
                {serverStatus.is_online ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="text-white text-sm font-bold">
              <span>PLAYERS:</span> <span className="font-black">
                {serverStatus.current_players}/{serverStatus.max_players}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-black border-b-2 border-white">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/assets/star.png"
              alt="Server Logo"
              width={32}
              height={32}
              className="opacity-90"
            />
            <span className="text-xl font-bold text-white font-serif" style={{fontFamily: 'Cinzel, serif'}}>WILD WEST RP</span>
          </Link>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="text-white text-sm font-bold">
                {user.username.toUpperCase()}
              </div>
            ) : (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-white font-bold py-1 px-3 border border-white hover:border-red-600 transition-all duration-300 text-sm"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  SIGN IN
                </motion.button>
              </Link>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white hover:text-gray-300 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 right-0 bg-black border-b-2 border-white shadow-xl"
            >
              <div className="p-4 space-y-4">
                {menuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 text-white hover:text-gray-300 transition-colors p-3 hover:bg-gray-800/50 border border-transparent hover:border-white font-bold"
                      >
                        <IconComponent size={20} className="opacity-80" />
                        <span className="font-medium text-lg">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
                
                {/* Mobile Auth Section */}
                {user ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: menuItems.length * 0.1 }}
                    className="pt-4 border-t-2 border-white space-y-3"
                  >
                    <div className="text-white">
                      <div className="font-bold">{user.username}</div>
                      <div className="text-gray-300 text-sm">{user.role}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-white hover:bg-gray-800 transition-colors p-3 border border-white hover:border-red-600 flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: menuItems.length * 0.1 }}
                    className="pt-4 border-t-2 border-white space-y-3"
                  >
                    <Link href="/register">
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full text-white font-bold py-3 px-4 border-2 border-white hover:border-red-600 hover:bg-red-600/20 transition-all duration-300"
                        style={{fontFamily: 'Cinzel, serif'}}
                      >
                        JOIN THE FRONTIER
                      </button>
                    </Link>
                  </motion.div>
                )}

                {/* Mobile Server Status */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (menuItems.length + 1) * 0.1 }}
                  className="pt-4 border-t-2 border-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        serverStatus.is_online ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                      }`}></div>
                      <span className="text-white font-bold">
                        SERVER {serverStatus.is_online ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                    <span className="text-white font-bold">
                      {serverStatus.current_players}/{serverStatus.max_players}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}