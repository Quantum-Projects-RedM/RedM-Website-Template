'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Users, Clock, Pin, Lock, Eye, Reply, Edit, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';

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
  author_id: number;
  category_name: string;
  created_at: string;
  replies: number;
  views: number;
  is_pinned: boolean;
  is_locked: boolean;
}

interface ForumReply {
  id: number;
  content: string;
  author: string;
  created_at: string;
}

export default function ForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedPost, setEditedPost] = useState({
    title: '',
    content: '',
    imageUrl: ''
  });
  const [lockAfterReply, setLockAfterReply] = useState(false);
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
    const fetchPostData = async () => {
      try {
        const postId = resolvedParams.id;
        const [postResponse, repliesResponse] = await Promise.all([
          fetch(`http://localhost:3001/api/forum/posts/${postId}`),
          fetch(`http://localhost:3001/api/forum/posts/${postId}/replies`)
        ]);
        
        if (postResponse.ok) {
          const postData = await postResponse.json();
          setPost(postData);
        }
        
        if (repliesResponse.ok) {
          const repliesData = await repliesResponse.json();
          setReplies(repliesData);
        }
      } catch (error) {
        console.error('Failed to fetch post data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [resolvedParams]);

  // Helper functions
  const isAdmin = () => ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role);
  const isPostOwner = () => user?.id === post?.author_id;

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const handleEditPost = () => {
    if (post) {
      setEditedPost({
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl || ''
      });
      setShowEditModal(true);
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editedPost.title.trim() || !editedPost.content.trim()) {
      showNotification('Please fill in title and content', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/forum/posts/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editedPost.title,
          content: editedPost.content,
          imageUrl: editedPost.imageUrl || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update post (${response.status})`);
      }

      // Refresh post data
      const postResponse = await fetch(`http://localhost:3001/api/forum/posts/${resolvedParams.id}`);
      if (postResponse.ok) {
        const postData = await postResponse.json();
        setPost(postData);
      }

      setShowEditModal(false);
      showNotification('Post updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone and will delete all replies as well.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/forum/posts/${resolvedParams.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete post (${response.status})`);
      }

      showNotification('Post deleted successfully', 'success');
      // Redirect to forums after successful deletion
      setTimeout(() => {
        window.location.href = '/forums';
      }, 1500);
    } catch (error) {
      console.error('Error deleting post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
      showNotification(errorMessage, 'error');
    }
  };

  const handleToggleLock = async () => {
    if (!post) return;
    
    const newLockState = !post.is_locked;
    const action = newLockState ? 'lock' : 'unlock';
    
    if (!confirm(`Are you sure you want to ${action} this post?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/forum/posts/${resolvedParams.id}/lock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isLocked: newLockState })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${action} post (${response.status})`);
      }

      // Update post state
      setPost(prev => prev ? { ...prev, is_locked: newLockState } : prev);
      showNotification(`Post ${action}ed successfully!`, 'success');
    } catch (error) {
      console.error(`Error ${action}ing post:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action} post`;
      showNotification(errorMessage, 'error');
    }
  };

  const handleTogglePin = async () => {
    if (!post) return;
    
    const newPinState = !post.is_pinned;
    const action = newPinState ? 'pin' : 'unpin';
    
    if (!confirm(`Are you sure you want to ${action} this post?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/forum/posts/${resolvedParams.id}/pin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPinned: newPinState })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${action} post (${response.status})`);
      }

      // Update post state
      setPost(prev => prev ? { ...prev, is_pinned: newPinState } : prev);
      showNotification(`Post ${action}ned successfully!`, 'success');
    } catch (error) {
      console.error(`Error ${action}ning post:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action} post`;
      showNotification(errorMessage, 'error');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      showNotification('Please enter a reply', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const postId = resolvedParams.id;
      const response = await fetch(`http://localhost:3001/api/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: replyContent,
          lockAfterReply: lockAfterReply 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to post reply (${response.status})`);
      }

      // Refresh replies and post data (in case it was locked)
      const [repliesResponse, postResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/forum/posts/${postId}/replies`),
        fetch(`http://localhost:3001/api/forum/posts/${postId}`)
      ]);
      
      if (repliesResponse.ok) {
        const repliesData = await repliesResponse.json();
        setReplies(repliesData);
      }
      
      if (postResponse.ok) {
        const postData = await postResponse.json();
        setPost(postData);
      }

      // Reset form
      setReplyContent('');
      setLockAfterReply(false);
      setShowReplyEditor(false);
      showNotification(lockAfterReply ? 'Reply posted and conversation locked!' : 'Reply posted successfully!', 'success');
    } catch (error) {
      console.error('Error posting reply:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to post reply';
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

  if (!post) {
    return (
      <div className="min-h-screen" style={{backgroundColor: 'rgb(32, 32, 32)'}}>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Post not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'rgb(32, 32, 32)'}}>
      <Navigation />
      
      <main className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
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

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link href="/forums">
              <motion.button
                whileHover={{ scale: 1.02, x: -5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 text-white font-bold py-3 px-6 border-2 border-transparent hover:border-red-600 transition-all duration-300"
                style={{
                  backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  fontFamily: 'Cinzel, serif'
                }}
              >
                <ArrowLeft size={20} />
                <span>BACK TO FORUMS</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Post Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-12 mb-8"
            style={{
              backgroundImage: 'url("/assets/background_paper.png")',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '400px'
            }}
          >
            {/* Post Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                {post.is_pinned && <Pin className="text-yellow-400" size={20} />}
                {post.is_locked && <Lock className="text-red-400" size={20} />}
                <h1 className="text-3xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                  {post.title.toUpperCase()}
                </h1>
              </div>
              <div className="text-white text-sm">
                <span className="opacity-75">{post.category_name}</span>
              </div>
            </div>

            {/* Post Meta */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/30">
              <div className="flex items-center space-x-6 text-white text-sm">
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>By <strong>{post.author}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare size={16} />
                  <span>{post.replies} replies</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye size={16} />
                  <span>{post.views} views</span>
                </div>
              </div>

              {/* Management Controls */}
              {isAuthenticated && (isPostOwner() || isAdmin()) && (
                <div className="flex items-center space-x-2">
                  {/* Edit Post (Owner only) */}
                  {isPostOwner() && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEditPost}
                      className="flex items-center space-x-1 text-white font-bold py-2 px-3 border border-blue-600 bg-blue-600/20 hover:bg-blue-600/40 transition-all duration-300"
                      style={{fontFamily: 'Cinzel, serif'}}
                      title="Edit Post"
                    >
                      <Edit size={14} />
                      <span className="hidden sm:inline">EDIT</span>
                    </motion.button>
                  )}

                  {/* Admin Controls */}
                  {isAdmin() && (
                    <>
                      {/* Lock/Unlock */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggleLock}
                        className={`flex items-center space-x-1 text-white font-bold py-2 px-3 border transition-all duration-300 ${
                          post.is_locked 
                            ? 'border-green-600 bg-green-600/20 hover:bg-green-600/40' 
                            : 'border-yellow-600 bg-yellow-600/20 hover:bg-yellow-600/40'
                        }`}
                        style={{fontFamily: 'Cinzel, serif'}}
                        title={post.is_locked ? 'Unlock Post' : 'Lock Post'}
                      >
                        <Lock size={14} />
                        <span className="hidden sm:inline">{post.is_locked ? 'UNLOCK' : 'LOCK'}</span>
                      </motion.button>

                      {/* Pin/Unpin */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTogglePin}
                        className={`flex items-center space-x-1 text-white font-bold py-2 px-3 border transition-all duration-300 ${
                          post.is_pinned 
                            ? 'border-yellow-600 bg-yellow-600/20 hover:bg-yellow-600/40' 
                            : 'border-gray-600 bg-gray-600/20 hover:bg-gray-600/40'
                        }`}
                        style={{fontFamily: 'Cinzel, serif'}}
                        title={post.is_pinned ? 'Unpin Post' : 'Pin Post'}
                      >
                        <Pin size={14} />
                        <span className="hidden sm:inline">{post.is_pinned ? 'UNPIN' : 'PIN'}</span>
                      </motion.button>

                      {/* Delete */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDeletePost}
                        className="flex items-center space-x-1 text-white font-bold py-2 px-3 border border-red-600 bg-red-600/20 hover:bg-red-600/40 transition-all duration-300"
                        style={{fontFamily: 'Cinzel, serif'}}
                        title="Delete Post"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">DELETE</span>
                      </motion.button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Post Image */}
            {post.imageUrl && (
              <div className="mb-6">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="max-w-2xl max-h-96 object-cover border-2 border-white/30 rounded"
                />
              </div>
            )}

            {/* Post Content */}
            <div className="bg-black/10 p-6 rounded-lg border border-white/20">
              <div className="prose prose-invert max-w-none text-white">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mb-3 mt-5 first:mt-0" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold text-white mb-2 mt-4 first:mt-0" {...props} />,
                    p: ({node, ...props}) => <p className="text-white mb-4 leading-relaxed text-base" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="text-white italic" {...props} />,
                    ul: ({node, ...props}) => <ul className="text-white list-disc ml-6 mb-4 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="text-white list-decimal ml-6 mb-4 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="text-white mb-1" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-red-600 pl-6 ml-4 text-white italic mb-4 py-2 bg-black/20 rounded-r" {...props} />,
                    a: ({node, ...props}) => <a className="text-red-400 underline hover:text-red-300 transition-colors font-medium" {...props} />,
                    code: ({node, ...props}) => <code className="bg-black/50 px-2 py-1 rounded text-red-300 text-sm border border-white/20" {...props} />,
                    pre: ({node, ...props}) => <pre className="bg-black/70 p-4 rounded border border-white/30 text-white mb-4 overflow-x-auto text-sm" {...props} />
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>

          {/* Replies Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6" style={{fontFamily: 'Cinzel, serif'}}>
              REPLIES ({replies.length})
            </h2>

            {/* Reply Form */}
            {isAuthenticated && !post.is_locked && (
              <div className="mb-8 p-8" style={{
                backgroundImage: 'url("/assets/background_paper.png")',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '200px'
              }}>
                {!showReplyEditor ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowReplyEditor(true)}
                    className="flex items-center space-x-2 text-white font-bold py-3 px-6 border-2 border-transparent hover:border-red-600 transition-all duration-300"
                    style={{
                      backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      fontFamily: 'Cinzel, serif'
                    }}
                  >
                    <Reply size={20} />
                    <span>WRITE REPLY</span>
                  </motion.button>
                ) : (
                  <form onSubmit={handleReplySubmit} className="space-y-4">
                    <div>
                      <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                        YOUR REPLY
                      </label>
                      <div className="border-2 border-white bg-black/50" style={{minHeight: '200px'}}>
                        <MDEditor
                          value={replyContent}
                          onChange={(val) => setReplyContent(val || '')}
                          preview="edit"
                          hideToolbar={false}
                          data-color-mode="dark"
                        />
                      </div>
                    </div>

                    {/* Lock conversation checkbox for admins */}
                    {isAdmin() && (
                      <div className="flex items-center space-x-2 p-3 border border-yellow-600/50 bg-yellow-600/10 rounded">
                        <input
                          type="checkbox"
                          id="lockAfterReply"
                          checked={lockAfterReply}
                          onChange={(e) => setLockAfterReply(e.target.checked)}
                          className="w-4 h-4 text-yellow-600 bg-black border-yellow-600 rounded focus:ring-yellow-600 focus:ring-2"
                        />
                        <label htmlFor="lockAfterReply" className="flex items-center space-x-2 text-white font-medium" style={{fontFamily: 'Cinzel, serif'}}>
                          <Lock size={16} />
                          <span>LOCK CONVERSATION AFTER REPLY</span>
                        </label>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="text-white font-bold py-3 px-6 border-2 border-transparent hover:border-red-600 transition-all duration-300"
                        style={{
                          backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          fontFamily: 'Cinzel, serif'
                        }}
                      >
                        POST REPLY
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => {
                          setShowReplyEditor(false);
                          setReplyContent('');
                        }}
                        className="text-white font-bold py-3 px-6 border-2 border-white hover:border-red-600 transition-all duration-300"
                        style={{fontFamily: 'Cinzel, serif'}}
                      >
                        CANCEL
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Replies List */}
            <div className="space-y-4">
              {replies.map((reply, index) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                  className="p-8 border-l-4 border-red-600"
                  style={{
                    backgroundImage: 'url("/assets/background_paper.png")',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '150px'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                        {reply.author.toUpperCase()}
                      </h3>
                      <div className="flex items-center space-x-2 text-white text-sm opacity-75">
                        <Clock size={14} />
                        <span>{getTimeAgo(reply.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/5 p-4 rounded border border-white/10">
                    <div className="prose prose-invert max-w-none text-white">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mb-3 mt-4 first:mt-0" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mb-2 mt-3 first:mt-0" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-md font-bold text-white mb-2 mt-2 first:mt-0" {...props} />,
                          p: ({node, ...props}) => <p className="text-white mb-3 leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                          em: ({node, ...props}) => <em className="text-white italic" {...props} />,
                          ul: ({node, ...props}) => <ul className="text-white list-disc ml-5 mb-3 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="text-white list-decimal ml-5 mb-3 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="text-white" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-red-600 pl-4 ml-2 text-white italic mb-3 py-1 bg-black/20 rounded-r" {...props} />,
                          a: ({node, ...props}) => <a className="text-red-400 underline hover:text-red-300 transition-colors" {...props} />,
                          code: ({node, ...props}) => <code className="bg-black/40 px-2 py-0.5 rounded text-red-300 text-sm border border-white/20" {...props} />
                        }}
                      >
                        {reply.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {replies.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto mb-4 text-white opacity-50" size={48} />
                <p className="text-white text-lg opacity-75">
                  No replies yet. Be the first to reply!
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Edit Post Modal */}
        {showEditModal && (
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
                <Edit className="text-white" size={24} />
                <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                  EDIT POST
                </h2>
              </div>

              <form onSubmit={handleUpdatePost} className="space-y-6">
                {/* Post Title */}
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    POST TITLE
                  </label>
                  <input
                    type="text"
                    value={editedPost.title}
                    onChange={(e) => setEditedPost({...editedPost, title: e.target.value})}
                    className="w-full p-3 bg-black/50 border-2 border-white text-white placeholder-gray-300 focus:border-red-600 focus:outline-none font-medium"
                    placeholder="Enter post title"
                    style={{fontFamily: 'Cinzel, serif'}}
                    required
                  />
                </div>

                {/* Image URL (Optional) */}
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    IMAGE URL (OPTIONAL)
                  </label>
                  <input
                    type="url"
                    value={editedPost.imageUrl}
                    onChange={(e) => setEditedPost({...editedPost, imageUrl: e.target.value})}
                    className="w-full p-3 bg-black/50 border-2 border-white text-white placeholder-gray-300 focus:border-red-600 focus:outline-none font-medium"
                    placeholder="https://example.com/image.jpg"
                    style={{fontFamily: 'Cinzel, serif'}}
                  />
                  {editedPost.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={editedPost.imageUrl} 
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
                      value={editedPost.content}
                      onChange={(val) => setEditedPost({...editedPost, content: val || ''})}
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
                    UPDATE POST
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditedPost({ title: '', content: '', imageUrl: '' });
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
      </main>
    </div>
  );
}