'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Users, Wifi, Clock, Globe, Copy } from 'lucide-react';

interface ServerStatusData {
  server_name: string;
  server_description: string;
  connect_url?: string;
  connect_code?: string;
  server_code?: string;
  server_ip?: string;
  server_port?: number;
  max_players: number;
  current_players: number;
  is_online: boolean;
  game_type?: string;
  map_name?: string;
  last_updated?: string;
  fallback?: boolean;
}

export default function ServerStatus() {
  const [serverData, setServerData] = useState<ServerStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/server/status');
        const data = await response.json();
        setServerData(data);
      } catch (error) {
        console.error('Failed to fetch server status:', error);
        // Server offline fallback data
        setServerData({
          server_name: 'Wild West RP Server',
          server_description: 'Experience the authentic Wild West in Red Dead Redemption 2 roleplay server',
          connect_code: 'connect g3jo4z',
          server_code: 'g3jo4z',
          max_players: 32,
          current_players: 0,
          is_online: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-950/40 to-amber-900/40 backdrop-blur-sm border border-amber-600/30 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-amber-600/20 rounded mb-4"></div>
          <div className="h-4 bg-amber-600/20 rounded mb-2"></div>
          <div className="h-4 bg-amber-600/20 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!serverData) return null;

  const playerPercentage = (serverData.current_players / serverData.max_players) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6"
      style={{
        backgroundImage: 'url("/assets/background_paper.png")',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '300px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Image
            src="/assets/star.png"
            alt="Server"
            width={32}
            height={32}
            className="opacity-90"
          />
          <div>
            <h3 className="text-xl font-bold text-white font-serif">
              {serverData.server_name.toUpperCase()}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${serverData.is_online ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className={`text-sm font-bold ${serverData.is_online ? 'text-white' : 'text-red-400'}`}>
                {serverData.is_online ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {serverData.current_players}<span className="text-gray-300">/{serverData.max_players}</span>
          </div>
          <div className="text-white text-sm font-bold">PLAYERS</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-white text-sm leading-relaxed mb-6 font-medium border-l-2 border-white pl-3 p-3">
        {serverData.server_description}
      </p>

      {/* Player Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-white font-bold mb-2">
          <span>SERVER POPULATION</span>
          <span>{Math.round(playerPercentage)}% FULL</span>
        </div>
        <div className="w-full bg-black border-2 border-white h-4">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${playerPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Server Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2 text-white">
          <Globe size={16} />
          <div>
            <div className="text-xs font-bold">CONNECT CODE</div>
            <div className="font-mono text-sm font-bold">{serverData.server_code || 'g3jo4z'}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-white">
          <Clock size={16} />
          <div>
            <div className="text-xs font-bold">LAST UPDATED</div>
            <div className="text-sm font-bold">
              {serverData.last_updated ? new Date(serverData.last_updated).toLocaleTimeString() : 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Connect Button */}
      <motion.button
        whileHover={{ scale: serverData.is_online ? 1.02 : 1.0, y: serverData.is_online ? -1 : 0 }}
        whileTap={{ scale: serverData.is_online ? 0.98 : 1.0 }}
        className={`w-full mt-6 font-bold py-3 px-4 border-2 transition-all duration-300 shadow-lg tracking-wide flex items-center justify-center space-x-2 ${
          serverData.is_online 
            ? 'text-white border-transparent hover:border-red-600 hover:shadow-xl cursor-pointer' 
            : 'text-gray-400 border-gray-600 cursor-not-allowed opacity-60'
        }`}
        style={{
          backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        onClick={async () => {
          if (serverData.is_online && serverData.connect_code) {
            try {
              await navigator.clipboard.writeText(serverData.connect_code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch (error) {
              console.error('Failed to copy:', error);
            }
          }
        }}
        disabled={!serverData.is_online}
      >
        <Copy size={16} />
        <span>
          {!serverData.is_online ? 'SERVER OFFLINE' : 
           copied ? 'COPIED!' : 'COPY CONNECT CODE'}
        </span>
      </motion.button>
    </motion.div>
  );
}