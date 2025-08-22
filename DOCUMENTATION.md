# 📚 RedM Website - Technical Documentation

This document provides comprehensive technical documentation for developers, administrators, and contributors working with the RedM Community Website.

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Frontend Components](#-frontend-components)
- [Authentication System](#-authentication-system)
- [Development Guide](#-development-guide)
- [Deployment Guide](#-deployment-guide)
- [Customization](#-customization)
- [Troubleshooting](#-troubleshooting)

## 🏗️ Architecture Overview

### Technology Stack

```
Frontend (Next.js 15)
├── TypeScript
├── Tailwind CSS
├── Framer Motion
├── React Markdown
└── Lucide React Icons

Backend (Express.js + Bun)
├── TypeScript
├── Prisma ORM
├── JWT Authentication
├── bcrypt Password Hashing
├── Helmet.js Security
├── Express Rate Limit
├── Input Validation & Sanitization
└── Comprehensive Logging System

Database
├── SQLite (Development)
└── PostgreSQL (Production)
```

### Project Structure

```
RedM-Website/
├── backend/                    # Express.js API Server
│   ├── src/
│   │   ├── middleware/         # Auth & security middleware
│   │   │   ├── auth.ts        # JWT authentication
│   │   │   ├── validation.ts  # Input validation & sanitization
│   │   │   ├── security.ts    # Rate limiting & security headers
│   │   │   └── logger.ts      # Comprehensive logging system
│   │   └── routes/            # API route handlers
│   │       └── auth.ts        # Authentication routes
│   ├── prisma/                # Database layer
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── dev.db            # SQLite database file
│   ├── index.ts              # Main server file
│   └── package.json          # Backend dependencies
├── frontend/                  # Next.js React App
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   │   ├── about/        # About page
│   │   │   ├── admin/        # Admin dashboard
│   │   │   ├── events/       # Events page
│   │   │   ├── forums/       # Forum system
│   │   │   ├── login/        # Authentication pages
│   │   │   ├── register/     # User registration
│   │   │   └── rules/        # Server rules
│   │   └── components/       # Reusable React components
│   │       ├── LoadingScreen.tsx
│   │       ├── Navigation.tsx
│   │       └── ServerStatus.tsx
│   ├── public/assets/        # Static Wild West assets
│   └── package.json          # Frontend dependencies
└── assets/                   # Shared game assets
```

## 🗄️ Database Schema

### User Management

```prisma
model User {
  id          Int      @id @default(autoincrement())
  email       String   @unique
  username    String   @unique
  password    String   // bcrypt hashed
  role        UserRole @default(USER)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastLoginAt DateTime?

  // Relations
  forumPosts         ForumPost[]
  forumReplies       ForumReply[]
  eventRegistrations EventRegistration[]
}

enum UserRole {
  USER          // Basic user permissions
  MODERATOR     // Forum moderation
  ADMIN         // Event & user management
  SUPER_ADMIN   // Full system access
}
```

### Forum System

```prisma
model ForumCategory {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String
  icon        String   // Asset path
  order       Int      @default(0)
  postMinRole UserRole @default(USER)
  replyMinRole UserRole @default(USER)
  isActive    Boolean  @default(true)
  
  posts       ForumPost[]
}

model ForumPost {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   // Markdown content
  imageUrl  String?  // Optional image
  isPinned  Boolean  @default(false)
  isLocked  Boolean  @default(false)
  views     Int      @default(0)
  
  authorId   Int
  categoryId Int
  
  author   User          @relation(fields: [authorId], references: [id])
  category ForumCategory @relation(fields: [categoryId], references: [id])
  replies  ForumReply[]
}

model ForumReply {
  id      Int    @id @default(autoincrement())
  content String // Markdown content
  
  authorId Int
  postId   Int
  
  author User      @relation(fields: [authorId], references: [id])
  post   ForumPost @relation(fields: [postId], references: [id])
}
```

### Event System

```prisma
model Event {
  id              Int     @id @default(autoincrement())
  title           String
  description     String
  date            DateTime
  time            String
  location        String
  maxParticipants Int
  eventType       String  // 'heist', 'roleplay', 'pvp', etc.
  imageUrl        String?
  isFeatured      Boolean @default(false)
  isActive        Boolean @default(true)
  
  registrations EventRegistration[]
}

model EventRegistration {
  id      Int @id @default(autoincrement())
  userId  Int
  eventId Int
  
  user  User  @relation(fields: [userId], references: [id])
  event Event @relation(fields: [eventId], references: [id])
  
  @@unique([userId, eventId])
}
```

### Rules & Server Status

```prisma
model Rule {
  id          Int     @id @default(autoincrement())
  category    String  // 'general', 'roleplay', 'combat', etc.
  title       String
  description String
  severity    String  // 'low', 'medium', 'high', 'ban'
  punishment  String
  order       Int     @default(0)
  isActive    Boolean @default(true)
}

model ServerStatus {
  id                Int     @id @default(autoincrement())
  serverName        String
  serverDescription String
  serverIp          String
  serverPort        Int
  maxPlayers        Int
  currentPlayers    Int
  isOnline          Boolean
  lastUpdated       DateTime @default(now())
}
```

## 🔌 API Reference

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (3-20 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "username",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "username",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

### Forum Endpoints

#### GET /api/forum/categories
Get all active forum categories with post counts.

**Response:**
```json
[
  {
    "id": "1",
    "name": "General Discussion",
    "description": "General talk about the server",
    "icon": "/assets/star.png",
    "post_count": 15,
    "postMinRole": "USER",
    "replyMinRole": "USER"
  }
]
```

#### GET /api/forum/posts
Get all forum posts with author and category info.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Welcome to the Server!",
    "content": "Welcome everyone...",
    "imageUrl": "/assets/welcome.png",
    "author": "Admin",
    "category": "1",
    "category_name": "General Discussion",
    "created_at": "2024-01-15T10:30:00Z",
    "replies": 5,
    "views": 120,
    "is_pinned": true,
    "is_locked": false
  }
]
```

#### POST /api/forum/posts
Create a new forum post. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "My New Post",
  "content": "Post content in **markdown**",
  "categoryId": 1,
  "imageUrl": "https://example.com/image.jpg"
}
```

#### GET /api/forum/posts/:id
Get a specific forum post with full details.

**Response:**
```json
{
  "id": 1,
  "title": "Post Title",
  "content": "Full post content...",
  "imageUrl": "/assets/image.png",
  "author": "username",
  "author_id": 1,
  "category_name": "General Discussion",
  "created_at": "2024-01-15T10:30:00Z",
  "replies": 3,
  "views": 150,
  "is_pinned": false,
  "is_locked": false
}
```

#### GET /api/forum/posts/:id/replies
Get all replies for a specific forum post.

**Response:**
```json
[
  {
    "id": 1,
    "content": "Great post! Thanks for sharing.",
    "author": "username",
    "created_at": "2024-01-15T11:00:00Z"
  }
]
```

#### POST /api/forum/posts/:id/replies
Create a reply to a forum post. **Requires authentication.**

**Request Body:**
```json
{
  "content": "My reply content in **markdown**",
  "lockAfterReply": false
}
```

### Event Management

#### GET /api/events
Get all active events.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Valentine Bank Heist",
    "description": "Epic bank robbery event...",
    "date": "2024-02-14",
    "time": "20:00 EST",
    "location": "Valentine Bank",
    "max_participants": 20,
    "current_participants": 5,
    "event_type": "heist",
    "image_url": "/assets/bank.png",
    "is_featured": true
  }
]
```

#### POST /api/events
Create a new event. **Requires ADMIN+ role.**

**Request Body:**
```json
{
  "title": "New Event",
  "description": "Event description...",
  "date": "2024-02-20",
  "time": "19:00 EST",
  "location": "Strawberry",
  "maxParticipants": 15,
  "eventType": "roleplay",
  "imageUrl": "/assets/event.png",
  "isFeatured": false
}
```

#### POST /api/events/:id/register
Register for an event. **Requires authentication.**

**Response:**
```json
{
  "message": "Successfully registered for event"
}
```

### Administrative Endpoints

#### GET /api/rules
Get all server rules organized by category.

**Response:**
```json
[
  {
    "id": 1,
    "category": "general",
    "title": "No Cheating",
    "description": "Use of any cheats or exploits...",
    "severity": "ban",
    "punishment": "Permanent ban",
    "order": 1
  }
]
```

#### GET /api/server/status
Get real-time server status information.

**Response:**
```json
{
  "server_name": "Wild West RP Server",
  "server_description": "Authentic Wild West experience...",
  "server_ip": "127.0.0.1",
  "server_port": 30120,
  "max_players": 32,
  "current_players": 24,
  "is_online": true,
  "game_type": "RedM",
  "map_name": "New Austin",
  "last_updated": "2024-01-15T12:00:00Z"
}
```

#### GET /api/forum/stats
Get community statistics.

**Response:**
```json
{
  "total_posts": 150,
  "active_members": 45,
  "daily_posts": 8,
  "total_replies": 380
}
```

## 🎨 Frontend Components

### Page Components

#### HomePage (`/`)
- **Location**: `frontend/src/app/page.tsx`
- **Features**: Hero section, server status, feature showcase, recent updates
- **Dependencies**: LoadingScreen, Navigation, ServerStatus components

#### Forums (`/forums`)
- **Location**: `frontend/src/app/forums/page.tsx`
- **Features**: Category carousel, post creation, post listing, search/filter
- **State Management**: Local state for categories, posts, user authentication

#### Individual Post (`/forums/post/[id]`)
- **Location**: `frontend/src/app/forums/post/[id]/page.tsx`
- **Features**: Post display, markdown rendering, reply system
- **Dynamic Routing**: Uses Next.js dynamic routes with post ID parameter

#### Events (`/events`)
- **Location**: `frontend/src/app/events/page.tsx`
- **Features**: Event listing, registration, filtering by type
- **Admin Features**: Event creation and management for admin users

### Reusable Components

#### Navigation Component
```tsx
// frontend/src/components/Navigation.tsx
interface NavigationProps {
  // No props - reads auth state from localStorage
}

// Features:
// - Responsive navigation menu
// - Authentication state management
// - Role-based menu items
// - Wild West themed styling
```

#### LoadingScreen Component
```tsx
// frontend/src/components/LoadingScreen.tsx
interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

// Features:
// - Animated Wild West themed loading
// - Progress indication
// - Smooth transition to main content
```

#### ServerStatus Component
```tsx
// frontend/src/components/ServerStatus.tsx
// Features:
// - Real-time server status display
// - Player count with visual indicators
// - Connection information
// - Status indicators (online/offline)
```

### Styling System

#### Tailwind Configuration
```js
// tailwindcss configuration with custom Wild West theme
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Cinzel', 'serif'], // Western themed font
      },
      colors: {
        // Custom color palette for Wild West theme
      }
    }
  }
}
```

#### Global Styles
```css
/* frontend/src/app/globals.css */
/* Custom Wild West themed styles */
/* Paper texture backgrounds */
/* Typography customizations */
/* Animation utilities */
```

## 🔐 Authentication System

### JWT Token Structure

```typescript
interface JWTPayload {
  id: number;        // User ID
  email: string;     // User email
  role: UserRole;    // User role for permissions
  iat: number;       // Issued at timestamp
  exp: number;       // Expiration timestamp
}
```

### Authentication Middleware

```typescript
// backend/src/middleware/auth.ts
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  // JWT validation logic
  // Adds user info to request object
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Role-based access control
  };
};
```

### Frontend Authentication

```typescript
// Client-side authentication utilities
class AuthService {
  static getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  static getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  static hasRole(requiredRole: UserRole): boolean {
    // Role hierarchy checking logic
  }
}
```

### Password Security

```typescript
// Password hashing with bcrypt
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

## 💻 Development Guide

### Prerequisites

```bash
# Required software
bun >= 1.2.20    # JavaScript runtime and package manager
node >= 18       # Fallback Node.js version
git              # Version control
```

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd RedM-Website

# Backend setup
cd backend
bun install
cp .env.example .env
# Edit .env with your configuration

# Database setup
bunx prisma migrate dev --name init
bunx prisma generate

# Start backend
bun run dev

# Frontend setup (new terminal)
cd ../frontend
bun install

# Start frontend
bun run dev
```

### Environment Variables

```bash
# backend/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secure-secret-change-in-production"
PORT=3001
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"

# Production additions
# DATABASE_URL="postgresql://user:password@host:5432/database"
# REDIS_URL="redis://localhost:6379"
```

### Database Operations

```bash
# Generate Prisma client after schema changes
bunx prisma generate

# Create new migration
bunx prisma migrate dev --name migration_name

# Reset database (development only)
bunx prisma migrate reset

# View/edit database
bunx prisma studio

# Deploy migrations (production)
bunx prisma migrate deploy
```

### Code Style & Standards

```typescript
// TypeScript configuration
// Strict type checking enabled
// ESLint for code quality
// Prettier for formatting

// Example API endpoint structure
app.post('/api/endpoint', 
  authenticateToken,                    // Authentication middleware
  requireRole(['ADMIN']),              // Authorization middleware
  async (req: AuthRequest, res) => {   // Typed request handler
    try {
      // Input validation
      const { field } = req.body;
      if (!field) {
        return res.status(400).json({ error: 'Field required' });
      }
      
      // Business logic with Prisma
      const result = await prisma.model.create({
        data: { field }
      });
      
      // Consistent response format
      res.status(201).json({
        message: 'Success',
        data: result
      });
    } catch (error) {
      console.error('Endpoint error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
```

### Testing Strategy

```typescript
// Unit tests for utilities and pure functions
// Integration tests for API endpoints
// Component tests for React components
// E2E tests for critical user flows

// Example test structure
describe('Authentication', () => {
  it('should hash password correctly', async () => {
    const password = 'testpassword';
    const hashed = await hashPassword(password);
    const isValid = await comparePassword(password, hashed);
    expect(isValid).toBe(true);
  });
});
```

## 🚀 Deployment Guide

### Production Environment Setup

#### Backend Deployment

```bash
# Environment variables
NODE_ENV=production
JWT_SECRET=<secure-random-string>
DATABASE_URL=postgresql://user:password@host:5432/database
PORT=3001
FRONTEND_URL=https://yourdomain.com

# Build and start
cd backend
bun install --production
bunx prisma migrate deploy
bunx prisma generate
bun run start
```

#### Frontend Deployment

```bash
# Build for production
cd frontend
bun install
bun run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=.next

# Self-hosted with PM2
pm2 start "bun run start" --name "redm-frontend"
```

#### Database Migration

```sql
-- Migrate from SQLite to PostgreSQL
-- 1. Export data from SQLite
-- 2. Update DATABASE_URL in .env
-- 3. Run: bunx prisma migrate deploy
-- 4. Import data to PostgreSQL
```

#### Process Management with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
pm2 start "bun run start" --name "redm-backend" --cwd backend

# Start frontend (if self-hosting)
pm2 start "bun run start" --name "redm-frontend" --cwd frontend

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Docker Configuration

```dockerfile
# backend/Dockerfile
FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
RUN bunx prisma generate
EXPOSE 3001
CMD ["bun", "run", "start"]
```

```dockerfile
# frontend/Dockerfile
FROM oven/bun:1-alpine as builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/redm-website
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

### Security Checklist

- [ ] Change default JWT secret to secure random string
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure CORS for production domain
- [ ] Set up rate limiting middleware
- [ ] Enable security headers (Helmet.js)
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure automatic backups
- [ ] Update all dependencies to latest versions
- [ ] Implement proper error logging

## ⚙️ Customization

### Branding Customization

#### Replace Server Assets
```bash
# Replace these files with your server's branding
frontend/public/assets/star.png              # Main logo
frontend/public/assets/background_paper.png  # Paper texture
frontend/public/assets/divider_line.png      # Section dividers
```

#### Update Server Information
```typescript
// backend/index.ts - initializeDefaultData function
const defaultServerStatus = {
  serverName: 'Your Server Name',
  serverDescription: 'Your server description here',
  serverIp: 'your.server.ip',
  serverPort: 30120,
  maxPlayers: 32,
  // ... other settings
};
```

#### Theme Customization
```css
/* frontend/src/app/globals.css */
:root {
  --primary-color: #your-primary-color;
  --secondary-color: #your-secondary-color;
  --accent-color: #your-accent-color;
  --text-color: #your-text-color;
  --background-color: #your-background-color;
}
```

### Adding Custom Features

#### New Database Model
```prisma
// backend/prisma/schema.prisma
model CustomModel {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  authorId Int
  author   User @relation(fields: [authorId], references: [id])
  
  @@map("custom_models")
}

// Add to User model
model User {
  // ... existing fields
  customModels CustomModel[]
}
```

#### New API Endpoint
```typescript
// backend/index.ts
app.get('/api/custom', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const items = await prisma.customModel.findMany({
      where: { isActive: true },
      include: {
        author: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(items);
  } catch (error) {
    console.error('Custom endpoint error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/custom', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  async (req: AuthRequest, res) => {
    try {
      const { title, content } = req.body;
      const userId = req.user?.id;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content required' });
      }
      
      const item = await prisma.customModel.create({
        data: {
          title,
          content,
          authorId: userId!
        }
      });
      
      res.status(201).json({
        message: 'Item created successfully',
        data: item
      });
    } catch (error) {
      console.error('Custom creation error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }
);
```

#### New Frontend Page
```tsx
// frontend/src/app/custom/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface CustomItem {
  id: number;
  title: string;
  content: string;
  author: { username: string };
  createdAt: string;
}

export default function CustomPage() {
  const [items, setItems] = useState<CustomItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/custom');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'rgb(32, 32, 32)'}}>
      <Navigation />
      
      <main className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Custom Page</h1>
          
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : (
            <div className="grid gap-6">
              {items.map(item => (
                <div 
                  key={item.id}
                  className="p-6"
                  style={{
                    backgroundImage: 'url("/assets/background_paper.png")',
                    backgroundSize: '100% 100%'
                  }}
                >
                  <h2 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h2>
                  <p className="text-white mb-4">{item.content}</p>
                  <div className="text-sm text-white opacity-70">
                    By {item.author.username} on {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Error: Database connection failed
# Solution: Check DATABASE_URL and ensure database is running

# For SQLite
ls -la backend/prisma/dev.db  # Check file exists
bunx prisma studio           # Test connection

# For PostgreSQL
bunx prisma migrate deploy   # Apply pending migrations
```

#### Authentication Issues
```bash
# Error: JWT token invalid
# Check JWT_SECRET in .env file
echo $JWT_SECRET

# Clear browser localStorage for development
# In browser console:
localStorage.clear();
```

#### Build Errors
```bash
# Frontend build failures
cd frontend
rm -rf node_modules .next
bun install
bun run build

# Backend build issues
cd backend
rm -rf node_modules
bun install
bunx prisma generate
```

#### Permission Errors
```bash
# User cannot access admin features
# Check user role in database
bunx prisma studio
# Navigate to users table and verify role field
```

### Performance Issues

#### Slow Database Queries
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_forum_posts_category ON forum_posts(categoryId);
CREATE INDEX idx_forum_posts_author ON forum_posts(authorId);
CREATE INDEX idx_forum_replies_post ON forum_replies(postId);
CREATE INDEX idx_events_date ON events(date);
```

#### Frontend Performance
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// Implement pagination for large lists
const [page, setPage] = useState(1);
const itemsPerPage = 20;
const paginatedItems = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);
```

### Deployment Issues

#### SSL Certificate Setup
```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d yourdomain.com
```

#### Environment Variable Issues
```bash
# Verify environment variables are loaded
printenv | grep JWT_SECRET
printenv | grep DATABASE_URL
```

#### Port Conflicts
```bash
# Check what's running on ports
lsof -i :3000  # Frontend port
lsof -i :3001  # Backend port

# Kill processes if needed
kill -9 <PID>
```

### Monitoring & Logging

#### Application Logging
```typescript
// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Error logging
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`${new Date().toISOString()} ERROR:`, err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
```

#### Health Check Endpoint
```typescript
// Add health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed'
    });
  }
});
```

## 📝 Additional Resources

### Useful Commands Reference

```bash
# Development
bun run dev                 # Start development servers
bunx prisma studio         # Database browser
bun run lint               # Code linting

# Database Management
bunx prisma migrate dev    # Apply migrations
bunx prisma generate       # Generate client
bunx prisma migrate reset  # Reset database (dev only)
bunx prisma migrate deploy # Deploy migrations (prod)

# Production
bun run build             # Build for production
bun run start             # Start production server
pm2 status                # Check process status
pm2 logs redm-backend     # View logs
```

### Security Best Practices

1. **Environment Security**
   - Use strong, unique JWT secrets in production
   - Enable HTTPS for all production deployments
   - Configure proper CORS origins
   - Use environment variables for sensitive data

2. **Database Security**
   - Regular database backups
   - Use connection pooling for production
   - Monitor for suspicious queries
   - Keep database software updated

3. **Application Security**
   - Implement rate limiting
   - Validate all user inputs
   - Use parameterized queries (Prisma handles this)
   - Regular security audits of dependencies

### Performance Optimization Tips

1. **Frontend Optimization**
   - Implement lazy loading for large lists
   - Use React.memo for expensive components
   - Optimize images and assets
   - Enable compression in production

2. **Backend Optimization**
   - Add database indexes for frequent queries
   - Implement caching with Redis
   - Use database connection pooling
   - Monitor query performance

3. **Infrastructure Optimization**
   - Use CDN for static assets
   - Enable Gzip compression
   - Configure proper caching headers
   - Monitor server resources

*This documentation is maintained alongside the codebase. For questions or contributions, please refer to the project's GitHub repository.*