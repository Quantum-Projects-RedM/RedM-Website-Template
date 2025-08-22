'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Eye, 
  Gavel, 
  Users, 
  Lock,
  ArrowUp,
  ArrowDown,
  X,
  Save
} from 'lucide-react';

interface Rule {
  id: number;
  category: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'ban';
  punishment: string;
  order: number;
}

interface RuleFormData {
  category: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'ban';
  punishment: string;
  order: number;
}

export default function AdminRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<RuleFormData>({
    category: 'general',
    title: '',
    description: '',
    severity: 'medium',
    punishment: '',
    order: 0
  });
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });

  // Rule categories with icons
  const categories = [
    { key: 'general', label: 'General Rules', icon: Shield },
    { key: 'roleplay', label: 'Roleplay', icon: Users },
    { key: 'combat', label: 'Combat & PvP', icon: Gavel },
    { key: 'economy', label: 'Economy', icon: Eye },
    { key: 'community', label: 'Community', icon: Users }
  ];

  // Severity levels with colors and icons
  const severityLevels = [
    { key: 'low', label: 'Low', color: 'text-green-400 border-green-400', icon: Eye },
    { key: 'medium', label: 'Medium', color: 'text-yellow-400 border-yellow-400', icon: AlertTriangle },
    { key: 'high', label: 'High', color: 'text-orange-400 border-orange-400', icon: Shield },
    { key: 'ban', label: 'Bannable', color: 'text-red-400 border-red-400', icon: Lock }
  ];

  useEffect(() => {
    // Check authentication and super admin role
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
      
      if (userData.role !== 'SUPER_ADMIN') {
        window.location.href = '/';
        return;
      }
    } else {
      window.location.href = '/login';
      return;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'SUPER_ADMIN') {
      fetchRules();
    }
  }, [isAuthenticated, user]);

  const fetchRules = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const resetForm = () => {
    setFormData({
      category: 'general',
      title: '',
      description: '',
      severity: 'medium',
      punishment: '',
      order: 0
    });
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.punishment.trim()) {
      showNotification('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create rule (${response.status})`);
      }

      await fetchRules();
      setShowCreateModal(false);
      resetForm();
      showNotification('Rule created successfully!', 'success');
    } catch (error) {
      console.error('Error creating rule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create rule';
      showNotification(errorMessage, 'error');
    }
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setFormData({
      category: rule.category,
      title: rule.title,
      description: rule.description,
      severity: rule.severity,
      punishment: rule.punishment,
      order: rule.order
    });
    setShowEditModal(true);
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRule) return;

    if (!formData.title.trim() || !formData.description.trim() || !formData.punishment.trim()) {
      showNotification('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/rules/${editingRule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update rule (${response.status})`);
      }

      await fetchRules();
      setShowEditModal(false);
      setEditingRule(null);
      resetForm();
      showNotification('Rule updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating rule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update rule';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete rule (${response.status})`);
      }

      await fetchRules();
      showNotification('Rule deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting rule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete rule';
      showNotification(errorMessage, 'error');
    }
  };

  const getSeverityInfo = (severity: string) => {
    return severityLevels.find(s => s.key === severity) || severityLevels[1];
  };

  const filteredRules = rules.filter(rule => rule.category === selectedCategory);

  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen" style={{backgroundColor: 'rgb(32, 32, 32)'}}>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Access Denied - Super Admin Only</div>
        </div>
      </div>
    );
  }

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
              className={`fixed top-24 right-6 z-[100] p-4 border-2 min-w-80 ${
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
                <button
                  onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-white font-serif mb-4" style={{
              textShadow: '3px 3px 0px rgba(0,0,0,0.5)',
              fontFamily: 'Cinzel, serif'
            }}>
              RULES MANAGEMENT
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
              Create and manage server rules to maintain order in the Wild West frontier.
            </p>
          </motion.div>

          {/* Rule Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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

          {/* Create Rule Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-3 text-white font-bold py-4 px-8 border-2 border-transparent hover:border-green-600 transition-all duration-300"
              style={{
                backgroundImage: 'url("/assets/selection_box_bg_1d.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                fontFamily: 'Cinzel, serif'
              }}
            >
              <Plus size={24} />
              <span>CREATE NEW RULE</span>
            </motion.button>
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
              {categories.find(c => c.key === selectedCategory)?.label.toUpperCase()} RULES ({filteredRules.length})
            </h2>
            
            {filteredRules.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="mx-auto mb-4 text-white opacity-50" size={64} />
                <p className="text-white text-xl opacity-75">
                  No rules in this category yet. Create your first rule!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRules.map((rule, index) => {
                  const severityInfo = getSeverityInfo(rule.severity);
                  const SeverityIcon = severityInfo.icon;
                  
                  return (
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
                        
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center space-x-2 px-3 py-1 border-2 ${severityInfo.color}`}>
                            <SeverityIcon size={16} />
                            <span className="text-sm font-bold">{severityInfo.label.toUpperCase()}</span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditRule(rule)}
                              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit Rule"
                            >
                              <Edit size={18} />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete Rule"
                            >
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
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
                  );
                })}
              </div>
            )}
          </motion.section>
        </div>

        {/* Create/Edit Rule Modal */}
        {(showCreateModal || showEditModal) && (
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  {showCreateModal ? <Plus className="text-white" size={24} /> : <Edit className="text-white" size={24} />}
                  <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                    {showCreateModal ? 'CREATE RULE' : 'EDIT RULE'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={showCreateModal ? handleCreateRule : handleUpdateRule} className="space-y-6">
                {/* Rule Category */}
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    CATEGORY *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 bg-black/50 border-2 border-white text-white focus:border-red-600 focus:outline-none font-medium"
                    style={{fontFamily: 'Cinzel, serif'}}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rule Title */}
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    RULE TITLE *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-3 bg-black/50 border-2 border-white text-white placeholder-gray-300 focus:border-red-600 focus:outline-none font-medium"
                    placeholder="Enter rule title"
                    style={{fontFamily: 'Cinzel, serif'}}
                    required
                  />
                </div>

                {/* Rule Description */}
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    DESCRIPTION *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 bg-black/50 border-2 border-white text-white placeholder-gray-300 focus:border-red-600 focus:outline-none font-medium h-32 resize-none"
                    placeholder="Detailed rule description"
                    style={{fontFamily: 'Cinzel, serif'}}
                    required
                  />
                </div>

                {/* Severity and Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      SEVERITY *
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({...formData, severity: e.target.value as any})}
                      className="w-full p-3 bg-black/50 border-2 border-white text-white focus:border-red-600 focus:outline-none font-medium"
                      style={{fontFamily: 'Cinzel, serif'}}
                      required
                    >
                      {severityLevels.map(severity => (
                        <option key={severity.key} value={severity.key}>
                          {severity.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      ORDER
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                      className="w-full p-3 bg-black/50 border-2 border-white text-white focus:border-red-600 focus:outline-none font-medium"
                      style={{fontFamily: 'Cinzel, serif'}}
                    />
                  </div>
                </div>

                {/* Punishment */}
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    PUNISHMENT *
                  </label>
                  <input
                    type="text"
                    value={formData.punishment}
                    onChange={(e) => setFormData({...formData, punishment: e.target.value})}
                    className="w-full p-3 bg-black/50 border-2 border-white text-white placeholder-gray-300 focus:border-red-600 focus:outline-none font-medium"
                    placeholder="e.g., Warning - 24h ban"
                    style={{fontFamily: 'Cinzel, serif'}}
                    required
                  />
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
                    {showCreateModal ? 'CREATE RULE' : 'UPDATE RULE'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setEditingRule(null);
                      resetForm();
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