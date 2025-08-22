'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Settings,
  Save,
  X
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

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
  created_at: string;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  eventType: string;
  imageUrl: string;
  isFeatured: boolean;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: 16,
    eventType: 'roleplay',
    imageUrl: '',
    isFeatured: false
  });
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });

  // Available event types with their associated icons
  const eventTypes = [
    { value: 'heist', label: 'Heist', icon: '/assets/dollar.png' },
    { value: 'roleplay', label: 'Roleplay', icon: '/assets/mp_roles_moonshiner.png' },
    { value: 'challenge', label: 'Challenge', icon: '/assets/mp_roles_trader.png' },
    { value: 'pvp', label: 'PvP Event', icon: '/assets/mp_roles_bounty_hunter.png' },
    { value: 'community', label: 'Community', icon: '/assets/awards_set_a_001a.png' },
    { value: 'training', label: 'Training', icon: '/assets/fme_archery.png' }
  ];

  // Additional icon options for events
  const availableIcons = [
    '/assets/dollar.png',
    '/assets/star.png',
    '/assets/mp_roles_bounty_hunter.png',
    '/assets/mp_roles_collector.png',
    '/assets/mp_roles_moonshiner.png',
    '/assets/mp_roles_naturalist.png',
    '/assets/mp_roles_trader.png',
    '/assets/fme_archery.png',
    '/assets/fme_dead_drop.png',
    '/assets/fme_golden_hat.png',
    '/assets/fme_hot_property.png',
    '/assets/fme_king_of_the_castle.png',
    '/assets/fme_king_of_the_rail.png',
    '/assets/fme_penned_in.png',
    '/assets/fme_role_animal_tagging.png',
    '/assets/fme_role_condor_egg.png',
    '/assets/fme_role_greatest_bounty_hunter.png',
    '/assets/fme_role_protect_legendary_animal.png',
    '/assets/fme_role_round_up.png',
    '/assets/fme_role_supply_train.png',
    '/assets/fme_role_wildlife_photographer.png',
    '/assets/fme_role_wreckage.png',
    '/assets/toast_mp_reward_event.png',
    '/assets/awards_set_a_001a.png',
    '/assets/awards_set_a_002a.png',
    '/assets/awards_set_a_003.png'
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
      fetchEvents();
    }
  }, [isAuthenticated, user]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
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
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      maxParticipants: 16,
      eventType: 'roleplay',
      imageUrl: '',
      isFeatured: false
    });
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.date || !formData.time || !formData.location.trim()) {
      showNotification('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create event (${response.status})`);
      }

      await fetchEvents();
      setShowCreateModal(false);
      resetForm();
      showNotification('Event created successfully!', 'success');
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      showNotification(errorMessage, 'error');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      maxParticipants: event.max_participants,
      eventType: event.event_type,
      imageUrl: event.image_url,
      isFeatured: event.is_featured
    });
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEvent) return;

    if (!formData.title.trim() || !formData.description.trim() || !formData.date || !formData.time || !formData.location.trim()) {
      showNotification('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update event (${response.status})`);
      }

      await fetchEvents();
      setShowEditModal(false);
      setEditingEvent(null);
      resetForm();
      showNotification('Event updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone and will remove all registrations.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete event (${response.status})`);
      }

      await fetchEvents();
      showNotification('Event deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      showNotification(errorMessage, 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
              EVENT MANAGEMENT
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
              Create and manage community events for the Wild West frontier.
            </p>
          </motion.div>

          {/* Create Event Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
              <span>CREATE NEW EVENT</span>
            </motion.button>
          </motion.div>

          {/* Events List */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-4xl font-bold text-white font-serif mb-8 text-center" style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Cinzel, serif'
            }}>
              ALL EVENTS ({events.length})
            </h2>
            
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto mb-4 text-white opacity-50" size={64} />
                <p className="text-white text-xl opacity-75">
                  No events created yet. Create your first event!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                    whileHover={{ y: -5 }}
                    className="p-6 transition-all duration-300 hover:shadow-xl relative"
                    style={{
                      backgroundImage: 'url("/assets/background_paper.png")',
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      minHeight: '400px'
                    }}
                  >
                    {/* Featured Badge */}
                    {event.is_featured && (
                      <div className="absolute top-4 right-4">
                        <Star className="text-yellow-400 fill-current" size={20} />
                      </div>
                    )}
                    
                    {/* Event Icon */}
                    <div className="flex justify-center mb-4">
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        width={48}
                        height={48}
                        className="opacity-90"
                      />
                    </div>
                    
                    {/* Event Title */}
                    <h3 className="text-xl font-bold text-white mb-3 text-center" style={{fontFamily: 'Cinzel, serif'}}>
                      {event.title.toUpperCase()}
                    </h3>
                    
                    {/* Event Description */}
                    <p className="text-white font-medium leading-relaxed mb-4 text-sm">
                      {event.description.length > 100 ? 
                        `${event.description.substring(0, 100)}...` : 
                        event.description
                      }
                    </p>
                    
                    {/* Event Details */}
                    <div className="space-y-2 mb-4 text-xs">
                      <div className="flex justify-between text-white">
                        <span className="font-bold">TYPE:</span>
                        <span className="capitalize">{event.event_type}</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span className="font-bold">DATE:</span>
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span className="font-bold">TIME:</span>
                        <span>{event.time}</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span className="font-bold">LOCATION:</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span className="font-bold">SPOTS:</span>
                        <span>{event.current_participants}/{event.max_participants}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditEvent(event)}
                        className="flex-1 flex items-center justify-center space-x-1 text-white font-bold py-2 px-3 border border-blue-600 bg-blue-600/20 hover:bg-blue-600/40 transition-all duration-300 text-xs"
                        style={{fontFamily: 'Cinzel, serif'}}
                        title="Edit Event"
                      >
                        <Edit size={12} />
                        <span>EDIT</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteEvent(event.id)}
                        className="flex-1 flex items-center justify-center space-x-1 text-white font-bold py-2 px-3 border border-red-600 bg-red-600/20 hover:bg-red-600/40 transition-all duration-300 text-xs"
                        style={{fontFamily: 'Cinzel, serif'}}
                        title="Delete Event"
                      >
                        <Trash2 size={12} />
                        <span>DELETE</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </div>

        {/* Create/Edit Event Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(32, 32, 32, 0.8)'}}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              style={{
                backgroundImage: 'url("/assets/background_paper.png")',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '700px'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  {showCreateModal ? <Plus className="text-white" size={24} /> : <Edit className="text-white" size={24} />}
                  <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'Cinzel, serif'}}>
                    {showCreateModal ? 'CREATE EVENT' : 'EDIT EVENT'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={showCreateModal ? handleCreateEvent : handleUpdateEvent} className="grid lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Event Title */}
                  <div>
                    <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      EVENT TITLE *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full p-3 bg-black/50 border-2 border-white text-white placeholder-gray-300 focus:border-red-600 focus:outline-none font-medium"
                      placeholder="Enter event title"
                      style={{fontFamily: 'Cinzel, serif'}}
                      required
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      EVENT TYPE *
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                      className="w-full p-3 bg-black/50 border-2 border-white text-white focus:border-red-600 focus:outline-none font-medium"
                      style={{fontFamily: 'Cinzel, serif'}}
                      required
                    >
                      {eventTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                        DATE *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full p-3 bg-black/50 border-2 border-white text-white focus:border-red-600 focus:outline-none font-medium date-input"
                        style={{
                          fontFamily: 'Cinzel, serif',
                          colorScheme: 'dark'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                        TIME *
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full p-3 bg-black/50 border-2 border-white text-white focus:border-red-600 focus:outline-none font-medium time-input"
                        style={{
                          fontFamily: 'Cinzel, serif',
                          colorScheme: 'dark'
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Custom styles for date/time inputs */}
                  <style jsx>{`
                    .date-input::-webkit-calendar-picker-indicator,
                    .time-input::-webkit-calendar-picker-indicator {
                      filter: invert(1);
                      cursor: pointer;
                      background: rgba(255, 255, 255, 0.1);
                      border-radius: 3px;
                      padding: 2px;
                    }
                    
                    .date-input::-webkit-calendar-picker-indicator:hover,
                    .time-input::-webkit-calendar-picker-indicator:hover {
                      background: rgba(255, 255, 255, 0.2);
                    }

                    .date-input::-webkit-datetime-edit-fields-wrapper,
                    .time-input::-webkit-datetime-edit-fields-wrapper {
                      color: white;
                    }

                    .date-input::-webkit-datetime-edit-text,
                    .time-input::-webkit-datetime-edit-text {
                      color: white;
                      padding: 0 2px;
                    }

                    .date-input::-webkit-datetime-edit-month-field,
                    .date-input::-webkit-datetime-edit-day-field,
                    .date-input::-webkit-datetime-edit-year-field,
                    .time-input::-webkit-datetime-edit-hour-field,
                    .time-input::-webkit-datetime-edit-minute-field {
                      color: white;
                      background: transparent;
                    }

                    .date-input::-webkit-datetime-edit-month-field:focus,
                    .date-input::-webkit-datetime-edit-day-field:focus,
                    .date-input::-webkit-datetime-edit-year-field:focus,
                    .time-input::-webkit-datetime-edit-hour-field:focus,
                    .time-input::-webkit-datetime-edit-minute-field:focus {
                      background: rgba(220, 38, 127, 0.3);
                      outline: none;
                    }
                  `}</style>

                  {/* Location and Max Participants */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                        LOCATION *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full p-3 bg-black/50 border-2 border-white text-white placeholder-gray-300 focus:border-red-600 focus:outline-none font-medium"
                        placeholder="Event location"
                        style={{fontFamily: 'Cinzel, serif'}}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                        MAX PARTICIPANTS *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                        className="w-full p-3 bg-black/50 border-2 border-white text-white focus:border-red-600 focus:outline-none font-medium"
                        style={{fontFamily: 'Cinzel, serif'}}
                        required
                      />
                    </div>
                  </div>

                  {/* Event Icon */}
                  <div>
                    <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      EVENT ICON
                    </label>
                    <div className="grid grid-cols-6 gap-2 p-3 bg-black/30 border border-white/30 max-h-40 overflow-y-auto">
                      {availableIcons.map(icon => (
                        <motion.button
                          key={icon}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setFormData({...formData, imageUrl: icon})}
                          className={`p-2 border-2 transition-all ${
                            formData.imageUrl === icon 
                              ? 'border-red-600 bg-red-600/20' 
                              : 'border-white/30 hover:border-red-600/50'
                          }`}
                        >
                          <Image
                            src={icon}
                            alt="Icon"
                            width={32}
                            height={32}
                            className="opacity-90"
                          />
                        </motion.button>
                      ))}
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-white text-sm">Selected:</span>
                        <Image
                          src={formData.imageUrl}
                          alt="Selected icon"
                          width={24}
                          height={24}
                          className="opacity-90"
                        />
                      </div>
                    )}
                  </div>

                  {/* Featured Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                      className="w-4 h-4 text-yellow-600 bg-black border-yellow-600 rounded focus:ring-yellow-600 focus:ring-2"
                    />
                    <label htmlFor="isFeatured" className="flex items-center space-x-2 text-white font-medium" style={{fontFamily: 'Cinzel, serif'}}>
                      <Star size={16} />
                      <span>FEATURED EVENT</span>
                    </label>
                  </div>
                </div>

                {/* Right Column - Description */}
                <div>
                  <label className="block text-white font-bold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    EVENT DESCRIPTION *
                  </label>
                  <div className="border-2 border-white bg-black/50 h-96">
                    <MDEditor
                      value={formData.description}
                      onChange={(val) => setFormData({...formData, description: val || ''})}
                      preview="edit"
                      hideToolbar={false}
                      data-color-mode="dark"
                      height={380}
                    />
                  </div>
                  <p className="text-white text-xs mt-2 opacity-75">
                    Use markdown for formatting: **bold**, *italic*, # headers, - lists
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="lg:col-span-2 flex space-x-4 mt-8">
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
                    {showCreateModal ? 'CREATE EVENT' : 'UPDATE EVENT'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setEditingEvent(null);
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