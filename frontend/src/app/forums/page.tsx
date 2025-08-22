'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MessageSquare, Users, Clock, Pin, Lock, Eye, ThumbsUp, Award, ChevronLeft, ChevronRight, Settings, Plus, Image as ImageIcon, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface ForumPost {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  category: string;
  category_name: string;
  created_at: string;
  replies: number;
  views: number;
  is_pinned: boolean;
  is_locked: boolean;
  last_reply: string;
  last_reply_author: string;
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  post_count: number;
  postMinRole?: string;
  replyMinRole?: string;
}

export default function ForumsPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '/assets/star.png'
  });
  const [showManageCategoryModal, setShowManageCategoryModal] = useState(false);
  const [selectedManageCategory, setSelectedManageCategory] = useState<ForumCategory | null>(null);
  const [categoryPermissions, setCategoryPermissions] = useState({
    postMinRole: 'USER',
    replyMinRole: 'USER'
  });
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    imageUrl: ''
  });
  const [forumStats, setForumStats] = useState({
    total_posts: 0,
    active_members: 0,
    daily_posts: 0,
    total_replies: 0
  });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const categoriesPerPage = 4;

  useEffect(() => {
    // Check for user authentication
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchForumData = async () => {
      try {
        const [postsResponse, categoriesResponse, statsResponse] = await Promise.all([
          fetch('http://localhost:3001/api/forum/posts'),
          fetch('http://localhost:3001/api/forum/categories'),
          fetch('http://localhost:3001/api/forum/stats')
        ]);
        
        const postsData = await postsResponse.json();
        const categoriesData = await categoriesResponse.json();
        const statsData = await statsResponse.json();
        
        setPosts(postsData);
        setCategories(categoriesData);
        setForumStats(statsData);
      } catch (error) {
        console.error('Failed to fetch forum data:', error);
        // Fallback demo data
        setCategories([
          {
            id: 'general',
            name: 'General Discussion',
            description: 'General talk about the server and Wild West life',
            icon: '/assets/star.png',
            post_count: 156
          },
          {
            id: 'roleplay',
            name: 'Roleplay Stories',
            description: 'Share your character stories and adventures',
            icon: '/assets/mp_roles_trader.png',
            post_count: 89
          },
          {
            id: 'events',
            name: 'Events & Activities',
            description: 'Discuss upcoming events and community activities',
            icon: '/assets/fme_king_of_the_rail.png',
            post_count: 67
          },
          {
            id: 'support',
            name: 'Help & Support',
            description: 'Get help with technical issues and questions',
            icon: '/assets/badges.png',
            post_count: 43
          }
        ]);

        setPosts([
          {
            id: 1,
            title: 'Welcome to the Wild West!',
            content: 'New to the server? Introduce yourself here and get to know the community.',
            author: 'Sheriff Thompson',
            category: '1',
            category_name: 'General Discussion',
            created_at: '2024-01-20T10:30:00Z',
            replies: 24,
            views: 156,
            is_pinned: true,
            is_locked: false,
            last_reply: '2024-01-22T14:20:00Z',
            last_reply_author: 'CowboyJoe'
          },
          {
            id: 2,
            title: 'The Great Train Robbery of 1899',
            content: 'Last night\'s train robbery event was incredible! Here\'s my character\'s perspective...',
            author: 'OutlawKate',
            category: '2',
            category_name: 'Roleplay Stories',
            created_at: '2024-01-21T18:45:00Z',
            replies: 12,
            views: 89,
            is_pinned: false,
            is_locked: false,
            last_reply: '2024-01-22T09:15:00Z',
            last_reply_author: 'Deputy_Marshal'
          },
          {
            id: 3,
            title: 'Upcoming Moonshine Festival',
            content: 'Planning details for our upcoming moonshine brewing competition and festival.',
            author: 'EventCoordinator',
            category: '3',
            category_name: 'Events & Activities',
            created_at: '2024-01-19T12:00:00Z',
            replies: 18,
            views: 134,
            is_pinned: true,
            is_locked: false,
            last_reply: '2024-01-22T11:30:00Z',
            last_reply_author: 'MoonshinerMike'
          },
          {
            id: 4,
            title: 'Character Creation Guidelines',
            content: 'Everything you need to know about creating an authentic Wild West character.',
            author: 'RoleplayModerator',
            category: '2',
            category_name: 'Roleplay Stories',
            created_at: '2024-01-18T16:20:00Z',
            replies: 31,
            views: 245,
            is_pinned: true,
            is_locked: true,
            last_reply: '2024-01-21T20:45:00Z',
            last_reply_author: 'NewPlayer123'
          },
          {
            id: 5,
            title: 'Game keeps crashing on startup',
            content: 'Having issues with the game crashing when trying to connect to the server.',
            author: 'TechSupport_User',
            category: '4',
            category_name: 'Help & Support',
            created_at: '2024-01-22T08:15:00Z',
            replies: 3,
            views: 27,
            is_pinned: false,
            is_locked: false,
            last_reply: '2024-01-22T13:40:00Z',
            last_reply_author: 'TechModerator'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchForumData();
  }, []);

  const filteredPosts = Array.isArray(posts) ? posts.filter(post => post.category === selectedCategory) : [];
  const sortedPosts = filteredPosts.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const visibleCategories = Array.isArray(categories) ? categories.slice(categoryIndex, categoryIndex + categoriesPerPage) : [];
  const canGoLeft = categoryIndex > 0;
  const canGoRight = Array.isArray(categories) && categoryIndex + categoriesPerPage < categories.length;

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      showNotification('Please fill in title and content', 'warning');
      return;
    }

    if (!selectedCategory) {
      showNotification('Please select a category', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          imageUrl: newPost.imageUrl || null,
          categoryId: parseInt(selectedCategory)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create post (${response.status})`);
      }

      // Refresh posts and stats
      const [postsResponse, statsResponse] = await Promise.all([
        fetch('http://localhost:3001/api/forum/posts'),
        fetch('http://localhost:3001/api/forum/stats')
      ]);
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData);
      }
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setForumStats(statsData);
      }

      // Reset form and close modal
      setNewPost({ title: '', content: '', imageUrl: '' });
      setShowNewPostModal(false);
      showNotification('Post created successfully!', 'success');
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      showNotification(errorMessage, 'error');
    }
  };

  const handleCategoryNavigation = (direction: 'left' | 'right') => {
    if (direction === 'left' && canGoLeft) {
      setCategoryIndex(Math.max(0, categoryIndex - categoriesPerPage));
    } else if (direction === 'right' && canGoRight) {
      setCategoryIndex(Math.min(categories.length - categoriesPerPage, categoryIndex + categoriesPerPage));
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name || !newCategory.description) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/forum/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          icon: newCategory.icon
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      // Refresh categories
      const categoriesResponse = await fetch('http://localhost:3001/api/forum/categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);

      // Reset form and close modal
      setNewCategory({ name: '', description: '', icon: '/assets/star.png' });
      setShowCategoryModal(false);
      showNotification('Category created successfully!', 'success');
    } catch (error) {
      console.error('Error creating category:', error);
      showNotification('Failed to create category', 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedManageCategory) return;
    
    if (!confirm(`Are you sure you want to delete the "${selectedManageCategory.name}" category? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/forum/categories/${selectedManageCategory.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      // Refresh categories
      const categoriesResponse = await fetch('http://localhost:3001/api/forum/categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);

      // Close modal
      setShowManageCategoryModal(false);
      setSelectedManageCategory(null);
      showNotification('Category deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification('Failed to delete category', 'error');
    }
  };

  const handleUpdateCategoryPermissions = async () => {
    if (!selectedManageCategory) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/forum/categories/${selectedManageCategory.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postMinRole: categoryPermissions.postMinRole,
          replyMinRole: categoryPermissions.replyMinRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Permission update failed:', response.status, errorData);
        throw new Error(errorData.error || `Failed to update permissions (${response.status})`);
      }

      showNotification('Permissions updated successfully!', 'success');
      setShowManageCategoryModal(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update permissions';
      showNotification(errorMessage, 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
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
        {/* Admin Panel - Fixed to left side */}
        {isSuperAdmin && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-80 p-6 fixed left-4 top-24 z-30"
            style={{
              backgroundImage: 'url("/assets/background_paper.png")',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '600px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
                <div className="flex items-center space-x-2 mb-6">
                  <Settings className="text-white" size={24} />
                  <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                    ADMIN PANEL
                  </h2>
                </div>

                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCategoryModal(true)}
                    className="w-full flex items-center space-x-2 text-white font-bold py-3 px-4 border-2 border-transparent hover:border-red-600 transition-all duration-300"
                    style={{
                      backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      fontFamily: 'Cinzel, serif'
                    }}
                  >
                    <Plus size={18} />
                    <span>NEW CATEGORY</span>
                  </motion.button>

                  <div className="border-t-2 border-white pt-4">
                    <h3 className="text-white font-bold mb-3" style={{fontFamily: 'Cinzel, serif'}}>
                      MANAGE CATEGORIES
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {categories.map((category) => (
                        <motion.div
                          key={category.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedManageCategory(category);
                            setCategoryPermissions({
                              postMinRole: category.postMinRole || 'USER',
                              replyMinRole: category.replyMinRole || 'USER'
                            });
                            setShowManageCategoryModal(true);
                          }}
                          className="flex items-center justify-between p-2 border border-white/30 hover:border-white transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <Image
                              src={category.icon}
                              alt={category.name}
                              width={20}
                              height={20}
                              className="opacity-90"
                            />
                            <span className="text-white text-sm font-medium">{category.name}</span>
                          </div>
                          <span className="text-white text-xs">{category.post_count} posts</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

        {/* Main Forum Content */}
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
              FRONTIER FORUMS
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
              Connect with fellow frontiersmen, share your stories, and stay updated on community happenings.
            </p>
          </motion.div>

          {/* Authentication Notice */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12 p-6 border-2 border-yellow-600"
              style={{
                backgroundImage: 'url("/assets/background_paper.png")',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '150px'
              }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="text-yellow-400" size={24} />
                <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                  MEMBER LOGIN REQUIRED
                </h2>
              </div>
              <p className="text-white font-medium leading-relaxed mb-4">
                To participate in forum discussions, you need to be a registered member of our community. 
                Join our Discord server to get verified and gain access to posting privileges.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white font-bold py-3 px-6 border-2 border-transparent hover:border-red-600 transition-all duration-300"
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
            </motion.div>
          )}

          {/* Forum Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white font-serif mb-6 text-center" style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Cinzel, serif'
            }}>
              FORUM CATEGORIES
            </h2>
            
            {/* Category Carousel */}
            <div className="relative">
              {/* Navigation Arrows */}
              {categories.length > categoriesPerPage && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCategoryNavigation('left')}
                    disabled={!canGoLeft}
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-3 transition-all duration-300 ${
                      !canGoLeft ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                    }`}
                    style={{ marginLeft: '-60px' }}
                  >
                    <Image
                      src="/assets/arrow_right.png"
                      alt="Previous"
                      width={32}
                      height={32}
                      className="opacity-90 transform rotate-180"
                    />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCategoryNavigation('right')}
                    disabled={!canGoRight}
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-3 transition-all duration-300 ${
                      !canGoRight ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                    }`}
                    style={{ marginRight: '-60px' }}
                  >
                    <Image
                      src="/assets/arrow_right.png"
                      alt="Next"
                      width={32}
                      height={32}
                      className="opacity-90"
                    />
                  </motion.button>
                </>
              )}

              {/* Categories Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleCategories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-6 text-center transition-all duration-300 border-2 ${
                      selectedCategory === category.id ? 'border-red-600' : 'border-transparent'
                    }`}
                    style={{
                      backgroundImage: 'url("/assets/background_paper.png")',
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      minHeight: '200px'
                    }}
                  >
                    <div className="flex justify-center mb-4">
                      <Image
                        src={category.icon}
                        alt={category.name}
                        width={48}
                        height={48}
                        className="opacity-90"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      {category.name.toUpperCase()}
                    </h3>
                    <p className="text-white font-medium text-sm mb-3 leading-relaxed">
                      {category.description}
                    </p>
                    <div className="text-white font-bold text-sm">
                      {category.post_count} POSTS
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Category Indicators */}
              {categories.length > categoriesPerPage && (
                <div className="flex justify-center space-x-2 mt-6">
                  {Array.from({ length: Math.ceil(categories.length / categoriesPerPage) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCategoryIndex(index * categoriesPerPage)}
                      className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
                        Math.floor(categoryIndex / categoriesPerPage) === index 
                          ? 'bg-white' 
                          : 'bg-transparent hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Forum Posts */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-white font-serif" style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                fontFamily: 'Cinzel, serif'
              }}>
                {categories.find(c => c.id === selectedCategory)?.name.toUpperCase()}
              </h2>
              
              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewPostModal(true)}
                  className="text-white font-bold py-3 px-6 border-2 border-transparent hover:border-red-600 transition-all duration-300"
                  style={{
                    backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    fontFamily: 'Cinzel, serif'
                  }}
                >
                  NEW POST
                </motion.button>
              )}
            </div>
            
            <div className="space-y-4">
              {sortedPosts.map((post, index) => (
                <Link href={`/forums/post/${post.id}`} key={post.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 + (index * 0.1) }}
                    whileHover={{ x: 5 }}
                    className="transition-all duration-300 hover:shadow-xl cursor-pointer border-b border-white/20"
                  style={{
                    backgroundImage: 'url("/assets/background_paper.png")',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '80px'
                  }}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Post thumbnail */}
                      {post.imageUrl && (
                        <div className="flex-shrink-0">
                          <img 
                            src={post.imageUrl} 
                            alt={post.title}
                            className="w-16 h-16 object-cover border-2 border-white/30 rounded"
                          />
                        </div>
                      )}
                      
                      {/* Post info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {post.is_pinned && <Pin className="text-yellow-400" size={14} />}
                          {post.is_locked && <Lock className="text-red-400" size={14} />}
                          <h3 className="text-lg font-bold text-white truncate" style={{fontFamily: 'Cinzel, serif'}}>
                            {post.title.toUpperCase()}
                          </h3>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-white text-xs">
                          <div className="flex items-center space-x-1">
                            <Users size={12} />
                            <span>By {post.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{getTimeAgo(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-center">
                      <div className="text-white text-sm">
                        <div className="font-bold">{post.replies}</div>
                        <div className="text-xs opacity-75">REPLIES</div>
                      </div>
                      <div className="text-white text-sm">
                        <div className="font-bold">{post.views}</div>
                        <div className="text-xs opacity-75">VIEWS</div>
                      </div>
                      <div className="text-right text-white text-xs">
                        <div className="font-bold mb-1">LAST REPLY</div>
                        <div>{getTimeAgo(post.last_reply)}</div>
                        <div>by {post.last_reply_author}</div>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Forum Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-16 grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: MessageSquare, label: 'Total Posts', value: forumStats.total_posts.toString() },
              { icon: Users, label: 'Active Members', value: forumStats.active_members.toString() },
              { icon: Award, label: 'Daily Posts', value: forumStats.daily_posts.toString() }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="p-6 text-center"
                  style={{
                    backgroundImage: 'url("/assets/background_paper.png")',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '150px'
                  }}
                >
                  <div className="flex justify-center mb-3">
                    <IconComponent className="text-white" size={32} />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    {stat.value}
                  </div>
                  <div className="text-white font-medium" style={{fontFamily: 'Cinzel, serif'}}>
                    {stat.label.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

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

        {/* New Post Modal */}
        {showNewPostModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(32, 32, 32, 0.8)'}}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              style={{
                backgroundImage: 'url("/assets/background_paper.png")',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '600px'
              }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="text-white" size={24} />
                <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                  CREATE NEW POST
                </h2>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-6">
                {/* Post Title */}
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    POST TITLE
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="w-full p-3 bg-black/50 border-2 border-white text-white placeholder-gray-300 focus:border-red-600 focus:outline-none font-medium"
                    placeholder="Enter post title"
                    style={{fontFamily: 'Cinzel, serif'}}
                    required
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    CATEGORY
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categories.map((category) => (
                      <motion.button
                        key={category.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-3 border-2 transition-colors flex items-center space-x-2 ${
                          selectedCategory === category.id 
                            ? 'border-red-600 bg-red-600/20' 
                            : 'border-white/30 hover:border-red-600 bg-transparent'
                        }`}
                      >
                        <Image
                          src={category.icon}
                          alt={category.name}
                          width={20}
                          height={20}
                          className="opacity-90"
                        />
                        <span className="text-white text-sm font-bold" style={{fontFamily: 'Cinzel, serif'}}>
                          {category.name.split(' ')[0]}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Image URL (Optional) */}
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    IMAGE URL (OPTIONAL)
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ImageIcon className="text-white opacity-60" size={20} />
                      </div>
                      <input
                        type="url"
                        value={newPost.imageUrl}
                        onChange={(e) => setNewPost({...newPost, imageUrl: e.target.value})}
                        className="w-full pl-10 pr-4 p-3 bg-black/50 border-2 border-white text-white placeholder-gray-300 focus:border-red-600 focus:outline-none font-medium"
                        placeholder="https://example.com/image.jpg"
                        style={{fontFamily: 'Cinzel, serif'}}
                      />
                    </div>
                  </div>
                  {newPost.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={newPost.imageUrl} 
                        alt="Preview" 
                        className="max-w-xs max-h-32 object-cover border-2 border-white/30"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Content with Markdown Editor */}
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    POST CONTENT
                  </label>
                  <div className="border-2 border-white bg-black/50" style={{minHeight: '300px'}}>
                    <MDEditor
                      value={newPost.content}
                      onChange={(val) => setNewPost({...newPost, content: val || ''})}
                      preview="edit"
                      hideToolbar={false}
                      data-color-mode="dark"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'white'
                      }}
                    />
                  </div>
                  <p className="text-white text-xs mt-2 opacity-75">
                    Use markdown for formatting: **bold**, *italic*, # headers, - lists, [links](url), &gt; quotes
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 text-white font-bold py-3 px-4 border-2 border-transparent hover:border-red-600 transition-all duration-300"
                    style={{
                      backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      fontFamily: 'Cinzel, serif'
                    }}
                  >
                    CREATE POST
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowNewPostModal(false);
                      setNewPost({ title: '', content: '', imageUrl: '' });
                    }}
                    className="flex-1 text-white font-bold py-3 px-4 border-2 border-white hover:border-red-600 transition-all duration-300"
                    style={{fontFamily: 'Cinzel, serif'}}
                  >
                    CANCEL
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Category Creation Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(32, 32, 32, 0.8)'}}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 max-w-md w-full mx-4"
              style={{
                backgroundImage: 'url("/assets/background_paper.png")',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '500px'
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center" style={{fontFamily: 'Cinzel, serif'}}>
                CREATE NEW CATEGORY
              </h2>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    CATEGORY NAME
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="w-full p-3 bg-transparent border-2 border-white text-white placeholder-gray-300 focus:border-red-600 focus:outline-none font-medium"
                    placeholder="Enter category name"
                    style={{fontFamily: 'Cinzel, serif'}}
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    DESCRIPTION
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    className="w-full p-3 bg-transparent border-2 border-white text-white placeholder-gray-300 focus:border-red-600 focus:outline-none h-20 resize-none font-medium"
                    placeholder="Enter category description"
                    style={{fontFamily: 'Cinzel, serif'}}
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    ICON
                  </label>
                  <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto bg-transparent p-2 border border-white">
                    {[
                      '/assets/star.png',
                      '/assets/badges.png',
                      '/assets/mp_roles_trader.png',
                      '/assets/mp_roles_bounty_hunter.png',
                      '/assets/mp_roles_moonshiner.png',
                      '/assets/fme_king_of_the_rail.png',
                      '/assets/dollar.png',
                      '/assets/outfit.png'
                    ].map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setNewCategory({...newCategory, icon})}
                        className={`p-2 border transition-colors bg-transparent ${
                          newCategory.icon === icon 
                            ? 'border-red-600' 
                            : 'border-white/30 hover:border-red-600'
                        }`}
                      >
                        <Image
                          src={icon}
                          alt="Icon"
                          width={32}
                          height={32}
                          className="opacity-90"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 text-white font-bold py-3 px-4 border-2 border-transparent hover:border-red-600 transition-all duration-300"
                    style={{
                      backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      fontFamily: 'Cinzel, serif'
                    }}
                  >
                    CREATE
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 text-white font-bold py-3 px-4 border-2 border-white hover:border-red-600 transition-all duration-300"
                    style={{fontFamily: 'Cinzel, serif'}}
                  >
                    CANCEL
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Category Management Modal */}
        {showManageCategoryModal && selectedManageCategory && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(32, 32, 32, 0.8)'}}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 max-w-md w-full mx-4"
              style={{
                backgroundImage: 'url("/assets/background_paper.png")',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '600px'
              }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <Image
                  src={selectedManageCategory.icon}
                  alt={selectedManageCategory.name}
                  width={24}
                  height={24}
                  className="opacity-90"
                />
                <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                  {selectedManageCategory.name.toUpperCase()}
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-white font-medium mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                    {selectedManageCategory.description}
                  </p>
                  <p className="text-white text-sm">
                    <span className="font-bold">{selectedManageCategory.post_count}</span> posts in this category
                  </p>
                </div>

                <div className="border-t-2 border-white pt-4">
                  <h3 className="text-white font-bold mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                    CATEGORY PERMISSIONS
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                        MINIMUM ROLE TO CREATE POSTS
                      </label>
                      <select
                        value={categoryPermissions.postMinRole}
                        onChange={(e) => setCategoryPermissions({...categoryPermissions, postMinRole: e.target.value})}
                        className="w-full p-3 bg-black/50 border-2 border-white text-white focus:border-red-600 focus:outline-none font-medium"
                        style={{fontFamily: 'Cinzel, serif'}}
                      >
                        <option value="USER">USER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER ADMIN</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                        MINIMUM ROLE TO REPLY TO POSTS
                      </label>
                      <select
                        value={categoryPermissions.replyMinRole}
                        onChange={(e) => setCategoryPermissions({...categoryPermissions, replyMinRole: e.target.value})}
                        className="w-full p-3 bg-black/50 border-2 border-white text-white focus:border-red-600 focus:outline-none font-medium"
                        style={{fontFamily: 'Cinzel, serif'}}
                      >
                        <option value="USER">USER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER ADMIN</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-white pt-4">
                  <h3 className="text-red-400 font-bold mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                    DANGER ZONE
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteCategory}
                    className="w-full text-white font-bold py-3 px-4 border-2 border-red-600 bg-red-600/20 hover:bg-red-600/40 transition-all duration-300"
                    style={{fontFamily: 'Cinzel, serif'}}
                  >
                    DELETE CATEGORY
                  </motion.button>
                  <p className="text-white text-xs mt-2 text-center opacity-75">
                    This action cannot be undone and will remove all posts in this category.
                  </p>
                </div>

                <div className="flex space-x-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateCategoryPermissions}
                    className="flex-1 text-white font-bold py-3 px-4 border-2 border-transparent hover:border-red-600 transition-all duration-300"
                    style={{
                      backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      fontFamily: 'Cinzel, serif'
                    }}
                  >
                    UPDATE PERMISSIONS
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowManageCategoryModal(false);
                      setSelectedManageCategory(null);
                    }}
                    className="flex-1 text-white font-bold py-3 px-4 border-2 border-white hover:border-red-600 transition-all duration-300"
                    style={{fontFamily: 'Cinzel, serif'}}
                  >
                    CLOSE
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}