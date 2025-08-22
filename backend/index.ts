import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './src/routes/auth';
import { authenticateToken, requireRole, AuthRequest } from './src/middleware/auth';
import { fiveMService } from './src/services/fivemService';
import { 
  generalLimiter, 
  authLimiter, 
  apiLimiter, 
  securityHeaders, 
  corsOptions, 
  additionalSecurity 
} from './src/middleware/security';
import { requestLogger, errorLogger, logger } from './src/middleware/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(additionalSecurity);
app.use(requestLogger);

// Rate limiting (order matters - specific routes first)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', apiLimiter);
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize default data
const initializeDefaultData = async () => {
  try {
    // Check if server status exists, if not create default
    const serverStatus = await prisma.serverStatus.findFirst();
    if (!serverStatus) {
      await prisma.serverStatus.create({
        data: {
          serverName: 'Wild West RP Server',
          serverDescription: 'Experience the authentic Wild West in Red Dead Redemption 2 roleplay server',
          serverIp: '127.0.0.1',
          serverPort: 30120,
          maxPlayers: 32,
          currentPlayers: 24,
          isOnline: true
        }
      });
    }

    // Check if forum categories exist, if not create defaults
    const categoryCount = await prisma.forumCategory.count();
    if (categoryCount === 0) {
      await prisma.forumCategory.createMany({
        data: [
          {
            name: 'General Discussion',
            description: 'General talk about the server and Wild West life',
            icon: '/assets/star.png',
            order: 1
          },
          {
            name: 'Roleplay Stories',
            description: 'Share your character stories and adventures',
            icon: '/assets/mp_roles_trader.png',
            order: 2
          },
          {
            name: 'Events & Activities',
            description: 'Discuss upcoming events and community activities',
            icon: '/assets/fme_king_of_the_rail.png',
            order: 3
          },
          {
            name: 'Help & Support',
            description: 'Get help with technical issues and questions',
            icon: '/assets/badges.png',
            order: 4
          }
        ]
      });
    }

    console.log('✅ Default data initialized');
  } catch (error) {
    console.error('❌ Error initializing default data:', error);
  }
};

// Initialize default data on startup
initializeDefaultData();

// Routes
app.use('/api/auth', authRoutes);

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RedM Website API is running' });
});

// Cache for server status
let serverStatusCache: any = null;
let lastSuccessfulUpdate = new Date(0);
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Server status route
app.get('/api/server/status', async (req, res) => {
  try {
    // Get server configuration from database
    const serverConfig = await prisma.serverStatus.findFirst();
    if (!serverConfig) {
      return res.status(404).json({ error: 'Server configuration not found' });
    }

    const serverId = "g3jo4z"; // Your RedM server ID
    
    // Check if we have recent cached data
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - lastSuccessfulUpdate.getTime();
    
    if (serverStatusCache && timeSinceLastUpdate < CACHE_DURATION) {
      console.log('Returning cached server status');
      return res.json(serverStatusCache);
    }
    
    try {
      // Try to get server data using Puppeteer (handles Cloudflare)
      const serverData = await fiveMService.getServerData(serverId);
      
      if (serverData) {
        const currentPlayers = serverData.clients || 0;
        const maxPlayers = serverData.sv_maxclients || serverConfig.maxPlayers;
        const hostname = serverData.hostname || serverConfig.serverName;
        const isOnline = true;

        // Update our database with current data
        await prisma.serverStatus.update({
          where: { id: serverConfig.id },
          data: {
            currentPlayers,
            maxPlayers,
            isOnline,
            lastUpdated: new Date()
          }
        });

        // Create response object
        const responseData = {
          server_name: hostname,
          server_description: serverConfig.serverDescription,
          connect_url: `cfx.re/join/${serverId}`,
          connect_code: `connect ${serverId}`,
          server_code: serverId,
          max_players: maxPlayers,
          current_players: currentPlayers,
          is_online: isOnline,
          game_type: 'RedM',
          map_name: 'New Austin',
          last_updated: new Date().toISOString()
        };

        // Cache the successful response
        serverStatusCache = responseData;
        lastSuccessfulUpdate = new Date();
        console.log('Server status updated and cached');

        res.json(responseData);
      } else {
        throw new Error('Failed to fetch server data from FiveM API');
      }
    } catch (apiError) {
      console.warn('RedM API error:', apiError);
      
      // If we have cached data, return it instead of fallback
      if (serverStatusCache) {
        console.log('API failed, returning last cached server status');
        return res.json({
          ...serverStatusCache,
          last_updated: serverStatusCache.last_updated,
          cached: true
        });
      }
      
      // Only update database and return offline status if no cache available
      await prisma.serverStatus.update({
        where: { id: serverConfig.id },
        data: {
          currentPlayers: 0,
          isOnline: false,
          lastUpdated: new Date()
        }
      });
      
      // Return offline status as last resort
      const fallbackData = {
        server_name: serverConfig.serverName,
        server_description: serverConfig.serverDescription,
        connect_url: `cfx.re/join/${serverId}`,
        connect_code: `connect ${serverId}`,
        server_code: serverId,
        max_players: serverConfig.maxPlayers,
        current_players: 0,
        is_online: false,
        game_type: 'RedM',
        map_name: 'New Austin',
        last_updated: new Date().toISOString(),
        fallback: true
      };
      
      res.json(fallbackData);
    }
  } catch (error) {
    console.error('Server status error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Events routes
app.get('/api/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: { date: 'desc' }
    });
    
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      location: event.location,
      max_participants: event.maxParticipants,
      current_participants: 0, // TODO: Implement participant count from registrations
      event_type: event.eventType,
      image_url: event.imageUrl,
      is_featured: event.isFeatured,
      created_at: event.createdAt.toISOString()
    }));
    
    res.json(formattedEvents);
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get single event
app.get('/api/events/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: {
            user: {
              select: { username: true }
            }
          }
        }
      }
    });
    
    if (!event || !event.isActive) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      location: event.location,
      max_participants: event.maxParticipants,
      current_participants: event.registrations.length,
      event_type: event.eventType,
      image_url: event.imageUrl,
      is_featured: event.isFeatured,
      created_at: event.createdAt.toISOString(),
      participants: event.registrations.map(reg => reg.user.username)
    };
    
    res.json(formattedEvent);
  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new event (Super Admin only)
app.post('/api/events', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      time, 
      location, 
      maxParticipants, 
      eventType, 
      imageUrl, 
      isFeatured 
    } = req.body;

    if (!title || !description || !date || !time || !location || !maxParticipants || !eventType) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate date format and ensure it's not in the past
    const eventDate = new Date(date + 'T00:00:00'); // Treat as local date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    // Allow today and future dates
    if (eventDate.getTime() < today.getTime()) {
      return res.status(400).json({ error: 'Event date cannot be in the past' });
    }

    // Validate event type
    const validEventTypes = ['heist', 'roleplay', 'challenge', 'pvp', 'community', 'training'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    // Validate max participants
    if (maxParticipants < 1 || maxParticipants > 100) {
      return res.status(400).json({ error: 'Max participants must be between 1 and 100' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: eventDate,
        time,
        location,
        maxParticipants: parseInt(maxParticipants),
        eventType,
        imageUrl: imageUrl || '/assets/star.png',
        isFeatured: isFeatured || false
      }
    });

    res.status(201).json({
      message: 'Event created successfully',
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
        time: event.time,
        location: event.location,
        max_participants: event.maxParticipants,
        event_type: event.eventType,
        image_url: event.imageUrl,
        is_featured: event.isFeatured
      }
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update event (Super Admin only)
app.put('/api/events/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { 
      title, 
      description, 
      date, 
      time, 
      location, 
      maxParticipants, 
      eventType, 
      imageUrl, 
      isFeatured 
    } = req.body;

    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    if (!title || !description || !date || !time || !location || !maxParticipants || !eventType) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Validate date
    const eventDate = new Date(date + 'T00:00:00'); // Treat as local date
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Validate event type
    const validEventTypes = ['heist', 'roleplay', 'challenge', 'pvp', 'community', 'training'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        date: eventDate,
        time,
        location,
        maxParticipants: parseInt(maxParticipants),
        eventType,
        imageUrl: imageUrl || '/assets/star.png',
        isFeatured: isFeatured || false,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Event updated successfully',
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description,
        date: updatedEvent.date.toISOString().split('T')[0],
        time: updatedEvent.time,
        location: updatedEvent.location,
        max_participants: updatedEvent.maxParticipants,
        event_type: updatedEvent.eventType,
        image_url: updatedEvent.imageUrl,
        is_featured: updatedEvent.isFeatured
      }
    });
  } catch (error) {
    console.error('Event update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete event (Super Admin only)
app.delete('/api/events/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Delete event and all registrations
    await prisma.$transaction(async (tx) => {
      // Delete all registrations first
      await tx.eventRegistration.deleteMany({
        where: { eventId: eventId }
      });

      // Delete the event
      await tx.event.delete({
        where: { id: eventId }
      });
    });

    res.json({
      message: 'Event and all registrations deleted successfully',
      deletedRegistrations: event._count.registrations
    });
  } catch (error) {
    console.error('Event deletion error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Register for event (authenticated users)
app.post('/api/events/:id/register', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId, isActive: true },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or inactive' });
    }

    // Check if event is full
    if (event._count.registrations >= event.maxParticipants) {
      return res.status(409).json({ error: 'Event is full' });
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      }
    });

    if (existingRegistration) {
      return res.status(409).json({ error: 'Already registered for this event' });
    }

    // Create registration
    await prisma.eventRegistration.create({
      data: {
        userId: userId,
        eventId: eventId
      }
    });

    res.status(201).json({
      message: 'Successfully registered for event'
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Unregister from event (authenticated users)
app.delete('/api/events/:id/register', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if registration exists
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      }
    });

    if (!registration) {
      return res.status(404).json({ error: 'Not registered for this event' });
    }

    // Delete registration
    await prisma.eventRegistration.delete({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      }
    });

    res.json({
      message: 'Successfully unregistered from event'
    });
  } catch (error) {
    console.error('Event unregistration error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Rules routes
app.get('/api/rules', async (req, res) => {
  try {
    const rules = await prisma.rule.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }]
    });
    
    const formattedRules = rules.map(rule => ({
      id: rule.id,
      category: rule.category,
      title: rule.title,
      description: rule.description,
      severity: rule.severity,
      punishment: rule.punishment,
      order: rule.order
    }));
    
    res.json(formattedRules);
  } catch (error) {
    console.error('Rules error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get single rule (Super Admin only)
app.get('/api/rules/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const ruleId = parseInt(req.params.id);
    
    if (isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid rule ID' });
    }
    
    const rule = await prisma.rule.findUnique({
      where: { id: ruleId }
    });
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    res.json({
      id: rule.id,
      category: rule.category,
      title: rule.title,
      description: rule.description,
      severity: rule.severity,
      punishment: rule.punishment,
      order: rule.order,
      isActive: rule.isActive
    });
  } catch (error) {
    console.error('Rule fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new rule (Super Admin only)
app.post('/api/rules', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { category, title, description, severity, punishment, order } = req.body;

    if (!category || !title || !description || !severity || !punishment) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate category
    const validCategories = ['general', 'roleplay', 'combat', 'economy', 'community'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'ban'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ error: 'Invalid severity level' });
    }

    // Set order if not provided
    const ruleOrder = order || 0;

    const rule = await prisma.rule.create({
      data: {
        category,
        title,
        description,
        severity,
        punishment,
        order: ruleOrder
      }
    });

    res.status(201).json({
      message: 'Rule created successfully',
      rule: {
        id: rule.id,
        category: rule.category,
        title: rule.title,
        description: rule.description,
        severity: rule.severity,
        punishment: rule.punishment,
        order: rule.order
      }
    });
  } catch (error) {
    console.error('Rule creation error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update rule (Super Admin only)
app.put('/api/rules/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const ruleId = parseInt(req.params.id);
    const { category, title, description, severity, punishment, order } = req.body;

    if (isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid rule ID' });
    }

    if (!category || !title || !description || !severity || !punishment) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if rule exists
    const existingRule = await prisma.rule.findUnique({
      where: { id: ruleId }
    });

    if (!existingRule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    // Validate category
    const validCategories = ['general', 'roleplay', 'combat', 'economy', 'community'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'ban'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ error: 'Invalid severity level' });
    }

    const updatedRule = await prisma.rule.update({
      where: { id: ruleId },
      data: {
        category,
        title,
        description,
        severity,
        punishment,
        order: order || 0,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Rule updated successfully',
      rule: {
        id: updatedRule.id,
        category: updatedRule.category,
        title: updatedRule.title,
        description: updatedRule.description,
        severity: updatedRule.severity,
        punishment: updatedRule.punishment,
        order: updatedRule.order
      }
    });
  } catch (error) {
    console.error('Rule update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete rule (Super Admin only)
app.delete('/api/rules/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const ruleId = parseInt(req.params.id);

    if (isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid rule ID' });
    }

    // Check if rule exists
    const rule = await prisma.rule.findUnique({
      where: { id: ruleId }
    });

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    // Soft delete - mark as inactive
    await prisma.rule.update({
      where: { id: ruleId },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    console.error('Rule deletion error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Forum routes
app.get('/api/forum/categories', async (req, res) => {
  try {
    const categories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    const formattedCategories = categories.map(cat => ({
      id: cat.id.toString(),
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      post_count: cat._count.posts,
      postMinRole: cat.postMinRole,
      replyMinRole: cat.replyMinRole
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error('Forum categories error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/forum/posts', async (req, res) => {
  try {
    const posts = await prisma.forumPost.findMany({
      include: {
        author: {
          select: { username: true }
        },
        category: {
          select: { name: true }
        },
        _count: {
          select: { replies: true }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      author: post.author.username,
      category: post.categoryId.toString(), // Use categoryId instead of category name for filtering
      category_name: post.category.name,
      created_at: post.createdAt.toISOString(),
      replies: post._count.replies,
      views: post.views,
      is_pinned: post.isPinned,
      is_locked: post.isLocked,
      last_reply: post.updatedAt.toISOString(),
      last_reply_author: post.author.username
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Forum posts error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new forum category (Super Admin only)
app.post('/api/forum/categories', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name || !description || !icon) {
      return res.status(400).json({ error: 'Name, description, and icon are required' });
    }

    // Check if category name already exists
    const existingCategory = await prisma.forumCategory.findFirst({
      where: { name }
    });

    if (existingCategory) {
      return res.status(409).json({ error: 'Category name already exists' });
    }

    // Get the highest order number and add 1
    const lastCategory = await prisma.forumCategory.findFirst({
      orderBy: { order: 'desc' }
    });

    const newOrder = lastCategory ? lastCategory.order + 1 : 1;

    const category = await prisma.forumCategory.create({
      data: {
        name,
        description,
        icon,
        order: newOrder
      }
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete forum category (Super Admin only)
app.delete('/api/forum/categories/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Check if category exists
    const category = await prisma.forumCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete all posts and replies in this category first
    await prisma.$transaction(async (tx) => {
      // Delete all replies for posts in this category
      await tx.forumReply.deleteMany({
        where: {
          post: {
            categoryId: categoryId
          }
        }
      });

      // Delete all posts in this category
      await tx.forumPost.deleteMany({
        where: {
          categoryId: categoryId
        }
      });

      // Finally delete the category
      await tx.forumCategory.delete({
        where: { id: categoryId }
      });
    });

    res.json({
      message: 'Category and all associated content deleted successfully',
      deletedPosts: category._count.posts
    });
  } catch (error) {
    console.error('Category deletion error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update forum category permissions (Super Admin only)
app.put('/api/forum/categories/:id/permissions', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const { postMinRole, replyMinRole } = req.body;

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const validRoles = ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(postMinRole) || !validRoles.includes(replyMinRole)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Check if category exists
    const category = await prisma.forumCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update category permissions
    const updatedCategory = await prisma.forumCategory.update({
      where: { id: categoryId },
      data: {
        postMinRole,
        replyMinRole
      }
    });

    res.json({
      message: 'Category permissions updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Category permission update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get single forum post
app.get('/api/forum/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { username: true }
        },
        category: {
          select: { name: true }
        },
        _count: {
          select: { replies: true }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await prisma.forumPost.update({
      where: { id: postId },
      data: { views: { increment: 1 } }
    });

    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      author: post.author.username,
      author_id: post.authorId,
      category_name: post.category.name,
      created_at: post.createdAt.toISOString(),
      replies: post._count.replies,
      views: post.views + 1,
      is_pinned: post.isPinned,
      is_locked: post.isLocked
    };

    res.json(formattedPost);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get replies for a forum post
app.get('/api/forum/posts/:id/replies', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const replies = await prisma.forumReply.findMany({
      where: { postId: postId },
      include: {
        author: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formattedReplies = replies.map(reply => ({
      id: reply.id,
      content: reply.content,
      author: reply.author.username,
      created_at: reply.createdAt.toISOString()
    }));

    res.json(formattedReplies);
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create reply to a forum post
app.post('/api/forum/posts/:id/replies', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content, lockAfterReply } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    // Check if post exists and is not locked
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        category: true
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.isLocked) {
      return res.status(403).json({ error: 'This post is locked and cannot receive replies' });
    }

    // Get user role to check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has permission to reply in this category
    const roleHierarchy = ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
    const userRoleIndex = roleHierarchy.indexOf(user.role);
    const requiredRoleIndex = roleHierarchy.indexOf(post.category.replyMinRole);

    if (userRoleIndex < requiredRoleIndex) {
      return res.status(403).json({ error: 'Insufficient permissions to reply in this category' });
    }

    // Create the reply and optionally lock post
    const reply = await prisma.$transaction(async (tx) => {
      // Create the reply
      const newReply = await tx.forumReply.create({
        data: {
          content: content.trim(),
          authorId: userId,
          postId: postId
        },
        include: {
          author: {
            select: { username: true }
          }
        }
      });

      // Update post's updated timestamp and lock if requested by admin
      const updateData: { updatedAt: Date; isLocked?: boolean } = { 
        updatedAt: new Date() 
      };
      
      // Check if user is admin+ and requested to lock
      if (lockAfterReply && ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        updateData.isLocked = true;
      }

      await tx.forumPost.update({
        where: { id: postId },
        data: updateData
      });

      return newReply;
    });

    res.status(201).json({
      message: 'Reply created successfully',
      reply: {
        id: reply.id,
        content: reply.content,
        author: reply.author.username,
        created_at: reply.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Reply creation error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get forum statistics
app.get('/api/forum/stats', async (req, res) => {
  try {
    const [totalPosts, totalUsers, totalReplies] = await Promise.all([
      prisma.forumPost.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.forumReply.count()
    ]);

    // Get today's posts count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyPosts = await prisma.forumPost.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    res.json({
      total_posts: totalPosts,
      active_members: totalUsers,
      daily_posts: dailyPosts,
      total_replies: totalReplies
    });
  } catch (error) {
    console.error('Forum stats error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update forum post (post owner only)
app.put('/api/forum/posts/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, content, imageUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Check if post exists and user is the owner
    const existingPost = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: { author: true }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.authorId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    // Update the post
    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: { username: true }
        },
        category: {
          select: { name: true }
        }
      }
    });

    res.json({
      message: 'Post updated successfully',
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        imageUrl: updatedPost.imageUrl,
        author: updatedPost.author.username,
        category_name: updatedPost.category.name,
        created_at: updatedPost.createdAt.toISOString(),
        views: updatedPost.views,
        is_pinned: updatedPost.isPinned,
        is_locked: updatedPost.isLocked
      }
    });
  } catch (error) {
    console.error('Post update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete forum post (Admin+ only)
app.delete('/api/forum/posts/:id', authenticateToken, requireRole(['MODERATOR', 'ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: { replies: true }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Delete all replies and the post in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all replies first
      await tx.forumReply.deleteMany({
        where: { postId: postId }
      });

      // Delete the post
      await tx.forumPost.delete({
        where: { id: postId }
      });
    });

    res.json({
      message: 'Post and all replies deleted successfully',
      deletedReplies: post._count.replies
    });
  } catch (error) {
    console.error('Post deletion error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Lock/Unlock forum post (Admin+ only)
app.patch('/api/forum/posts/:id/lock', authenticateToken, requireRole(['MODERATOR', 'ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { isLocked } = req.body;

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (typeof isLocked !== 'boolean') {
      return res.status(400).json({ error: 'isLocked must be a boolean' });
    }

    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update lock status
    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data: { isLocked }
    });

    res.json({
      message: `Post ${isLocked ? 'locked' : 'unlocked'} successfully`,
      post: {
        id: updatedPost.id,
        is_locked: updatedPost.isLocked
      }
    });
  } catch (error) {
    console.error('Post lock error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Pin/Unpin forum post (Admin+ only)
app.patch('/api/forum/posts/:id/pin', authenticateToken, requireRole(['MODERATOR', 'ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { isPinned } = req.body;

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (typeof isPinned !== 'boolean') {
      return res.status(400).json({ error: 'isPinned must be a boolean' });
    }

    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update pin status
    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data: { isPinned }
    });

    res.json({
      message: `Post ${isPinned ? 'pinned' : 'unpinned'} successfully`,
      post: {
        id: updatedPost.id,
        is_pinned: updatedPost.isPinned
      }
    });
  } catch (error) {
    console.error('Post pin error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new forum post
app.post('/api/forum/posts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, content, categoryId, imageUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!title || !content || !categoryId) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    // Validate category exists and check permissions
    const category = await prisma.forumCategory.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get user role to check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has permission to post in this category
    const roleHierarchy = ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
    const userRoleIndex = roleHierarchy.indexOf(user.role);
    const requiredRoleIndex = roleHierarchy.indexOf(category.postMinRole);

    if (userRoleIndex < requiredRoleIndex) {
      return res.status(403).json({ error: 'Insufficient permissions to post in this category' });
    }

    // Create the post
    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        authorId: userId,
        categoryId: parseInt(categoryId)
      },
      include: {
        author: {
          select: { username: true }
        },
        category: {
          select: { name: true }
        }
      }
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl,
        author: post.author.username,
        category: post.category.name,
        created_at: post.createdAt.toISOString(),
        views: post.views,
        is_pinned: post.isPinned,
        is_locked: post.isLocked
      }
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Error handling middleware
// Error handling middleware (must be last)
app.use(errorLogger);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  logger.info(`RedM Website API server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
  console.log(`🚀 RedM Website API server running on port ${PORT}`);
});

export default app;