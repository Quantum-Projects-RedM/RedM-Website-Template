'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import { User, Mail, Shield, Calendar, MessageSquare, Award, Edit, Save, X } from 'lucide-react';

interface UserProfile {
  id: number;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

interface UserStats {
  totalPosts: number;
  totalReplies: number;
  eventsRegistered: number;
  accountAge: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', email: '' });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const text = await response.text();
      let profileData;
      try {
        profileData = JSON.parse(text);
      } catch (jsonError) {
        console.error('Failed to parse profile response as JSON:', text);
        throw new Error('Server returned invalid response');
      }
      setUser(profileData);
      setEditData({ 
        username: profileData.username, 
        email: profileData.email 
      });

      // Calculate user stats from API response
      const accountAge = Math.floor((new Date().getTime() - new Date(profileData.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      setUserStats({
        totalPosts: profileData.totalPosts || 0,
        totalReplies: profileData.totalReplies || 0,
        eventsRegistered: profileData.eventsRegistered || 0,
        accountAge: accountAge
      });
    } catch (error: any) {
      setError(error.message);
      if (error.message.includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setUser(updatedProfile);
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'text-red-400';
      case 'ADMIN': return 'text-orange-400';
      case 'MODERATOR': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return '/assets/badges.png';
      case 'ADMIN': return '/assets/star.png';
      case 'MODERATOR': return '/assets/mp_roles_trader.png';
      default: return '/assets/outfit.png';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{backgroundColor: 'rgb(32, 32, 32)'}}>
        <Navigation />
        <main className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-white text-xl">Loading profile...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen" style={{backgroundColor: 'rgb(32, 32, 32)'}}>
        <Navigation />
        <main className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-red-400 text-xl">Error: {error || 'Profile not found'}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'rgb(32, 32, 32)'}}>
      <Navigation />
      
      <main className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-4" style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Cinzel, serif'
            }}>
              USER PROFILE
            </h1>
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div 
                className="p-8 text-center"
                style={{
                  backgroundImage: 'url("/assets/background_paper.png")',
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  minHeight: '400px'
                }}
              >
                {/* Profile Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Image
                      src={getRoleBadge(user.role)}
                      alt="Profile"
                      width={120}
                      height={120}
                      className="sepia contrast-125 opacity-90"
                    />
                    <div className="absolute -bottom-2 -right-2">
                      <Image
                        src="/assets/star.png"
                        alt="Star"
                        width={32}
                        height={32}
                        className="sepia contrast-150"
                      />
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={editData.username}
                          onChange={(e) => setEditData({...editData, username: e.target.value})}
                          className="w-full p-2 bg-black/50 border-2 border-white text-white text-center font-bold text-xl"
                          style={{fontFamily: 'Cinzel, serif'}}
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                          className="w-full p-2 bg-black/50 border-2 border-white text-white text-center"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveProfile}
                          className="flex-1 text-white font-bold py-2 px-4 border-2 border-green-600 hover:bg-green-600/20 transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <Save size={16} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => {setIsEditing(false); setEditData({username: user.username, email: user.email});}}
                          className="flex-1 text-white font-bold py-2 px-4 border-2 border-red-600 hover:bg-red-600/20 transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <X size={16} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-white font-serif" style={{fontFamily: 'Cinzel, serif'}}>
                        {user.username.toUpperCase()}
                      </h2>
                      <div className={`text-lg font-bold ${getRoleColor(user.role)} flex items-center justify-center space-x-2`}>
                        <Shield size={20} />
                        <span>{user.role.replace('_', ' ')}</span>
                      </div>
                      <div className="text-white opacity-80 flex items-center justify-center space-x-2">
                        <Mail size={16} />
                        <span>{user.email}</span>
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-white font-bold py-2 px-6 border-2 border-white hover:border-blue-600 hover:bg-blue-600/20 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
                        style={{fontFamily: 'Cinzel, serif'}}
                      >
                        <Edit size={16} />
                        <span>EDIT PROFILE</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Profile Details & Stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Account Details */}
              <div 
                className="p-8"
                style={{
                  backgroundImage: 'url("/assets/background_paper.png")',
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  minHeight: '200px'
                }}
              >
                <h3 className="text-2xl font-bold text-white font-serif mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                  ACCOUNT DETAILS
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="text-white opacity-60" size={20} />
                      <div>
                        <div className="text-white font-bold">Member Since</div>
                        <div className="text-white opacity-80">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="text-white opacity-60" size={20} />
                      <div>
                        <div className="text-white font-bold">Account Status</div>
                        <div className={user.isActive ? "text-green-400" : "text-red-400"}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="text-white opacity-60" size={20} />
                      <div>
                        <div className="text-white font-bold">Last Login</div>
                        <div className="text-white opacity-80">
                          {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Award className="text-white opacity-60" size={20} />
                      <div>
                        <div className="text-white font-bold">Account Age</div>
                        <div className="text-white opacity-80">
                          {userStats?.accountAge || 0} days
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Stats */}
              <div 
                className="p-8"
                style={{
                  backgroundImage: 'url("/assets/background_paper.png")',
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  minHeight: '200px'
                }}
              >
                <h3 className="text-2xl font-bold text-white font-serif mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                  COMMUNITY ACTIVITY
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Image src="/assets/mp_roles_trader.png" alt="Posts" width={48} height={48} className="sepia contrast-125" />
                    </div>
                    <div className="text-3xl font-bold text-white font-serif">{userStats?.totalPosts || 0}</div>
                    <div className="text-white opacity-80">Forum Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Image src="/assets/mp_roles_collector.png" alt="Replies" width={48} height={48} className="sepia contrast-125" />
                    </div>
                    <div className="text-3xl font-bold text-white font-serif">{userStats?.totalReplies || 0}</div>
                    <div className="text-white opacity-80">Replies</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Image src="/assets/mp_roles_moonshiner.png" alt="Events" width={48} height={48} className="sepia contrast-125" />
                    </div>
                    <div className="text-3xl font-bold text-white font-serif">{userStats?.eventsRegistered || 0}</div>
                    <div className="text-white opacity-80">Events Joined</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}