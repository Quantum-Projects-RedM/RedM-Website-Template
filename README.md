# 🤠 Wild West RP - RedM Community Website

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)

> **Experience the authentic Wild West in Red Dead Redemption 2 roleplay like never before**

A comprehensive community website for RedM servers featuring authentic Wild West aesthetics, advanced forum system, event management, and complete administrative tools.

## ✨ Key Features

### 🎨 **Authentic Wild West Experience**
- **Premium Western Design**: Custom RDR2-themed UI with period-appropriate assets and typography
- **Immersive Aesthetics**: Weathered paper textures, vintage styling, and Cinzel serif fonts
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion powered transitions for professional feel

### 👥 **Advanced Community Management**
- **Multi-Tier Forum System**: Organized categories with role-based permissions
- **Event Management**: Complete event lifecycle with registration and capacity management
- **User Roles**: Hierarchical permission system (User → Moderator → Admin → Super Admin)
- **Real-Time Features**: Live server status, player counts, and forum statistics

### 🛡️ **Security & Performance**
- **Enterprise-Grade Security**: JWT authentication, role-based access control, input validation, rate limiting
- **High Performance**: Built on Bun runtime with Next.js optimization
- **Modern Tech Stack**: TypeScript, Prisma ORM, SQLite/PostgreSQL database
- **Scalable Architecture**: Designed to handle large communities efficiently
- **Production Ready**: Comprehensive security headers, logging, and monitoring

## 🎮 What Your Community Gets

### **For Server Owners & Administrators**

#### 📊 **Complete Admin Dashboard**
- **Event Management**: Create, edit, and manage server events with registration tracking
- **Rule Administration**: Comprehensive rule system with categories and severity levels
- **Forum Moderation**: Pin posts, lock discussions, manage categories with permissions
- **User Management**: Role assignment, user status control, and activity monitoring
- **Server Integration**: Real-time server status with player count tracking

#### 🎯 **Advanced Event System**
- **Event Types**: Heists, Roleplay scenarios, PvP events, Community gatherings
- **Registration Management**: Participant limits, waitlists, and registration tracking
- **Event Promotion**: Featured events, custom images, and detailed descriptions
- **Admin Tools**: Full CRUD operations with participant management

#### 📜 **Professional Rule Management**
- **Categorized Rules**: General, Roleplay, Combat, Economy, Community sections
- **Severity Levels**: Clear punishment guidelines (Low → Medium → High → Ban)
- **Easy Updates**: Real-time rule modifications without server downtime
- **Visual Organization**: Color-coded severity and organized display

### **For Community Members**

#### 💬 **Comprehensive Forum System**
- **Rich Text Posts**: Full markdown support with images and formatting
- **Threaded Discussions**: Organized replies with proper threading
- **Category Organization**: Dedicated spaces for different discussion types
- **Post Interaction**: Views tracking, reply counts, and engagement metrics
- **Search & Filter**: Find content quickly with advanced filtering

#### 🎪 **Community Events**
- **Easy Registration**: One-click event sign-up with confirmation
- **Event Details**: Complete information including location, time, and requirements
- **Participation Tracking**: See who's attending and available spots
- **Event History**: Browse past events and achievements

#### 🔐 **User Accounts & Profiles**
- **Secure Authentication**: Email-based registration with secure passwords
- **Profile Management**: Update information and track participation
- **Role Recognition**: Visual indicators for staff and veteran members
- **Activity Tracking**: Posts, replies, and event participation history

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Bun + Express.js + Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Authentication**: JWT with bcrypt password hashing
- **Styling**: Custom Wild West theme with responsive design

## 🚀 Quick Start

```bash
# Download and extract, then:
cd redm-website

# Backend setup
cd backend && bun install
bunx prisma migrate dev && bun run dev

# Opens database browser
bunx prisma studio

# Frontend setup (new terminal)
cd frontend && bun install && bun run dev
```

**Access**: [Website](http://localhost:3000) | [API](http://localhost:3001) | [Database](http://localhost:5555)

> **Need help?** See [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed setup guide

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **User** | View content, create posts, reply, register for events |
| **Moderator** | + Delete posts, pin/lock discussions |
| **Admin** | + Create events, manage users, admin panel |
| **Super Admin** | + Rule management, server configuration |

## 🔌 API Endpoints

### Core Features
- **Authentication**: Register, login, profile management
- **Forums**: Categories, posts, replies with moderation
- **Events**: CRUD operations with registration system
- **Rules**: Categorized rule management (admin only)
- **Server**: Real-time status integration
- **Stats**: Community analytics and metrics

> See [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed API reference

## ⚙️ Customization

### Server Branding
- Replace `frontend/public/assets/star.png` with your logo
- Update server info in `backend/index.ts`
- Modify colors in `frontend/src/app/globals.css`

### Adding Features
- API endpoints: `backend/index.ts`
- Database schema: `backend/prisma/schema.prisma`
- Frontend pages: `frontend/src/app/`

> Full customization guide in [DOCUMENTATION.md](./DOCUMENTATION.md)

## 🚀 Production Deployment

### Environment
```env
NODE_ENV=production
JWT_SECRET=secure-random-string
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Deploy Steps
1. **Backend**: `bunx prisma migrate deploy` → `pm2 start`
2. **Frontend**: `bun run build` → Deploy to Vercel/Netlify
3. **Database**: Migrate from SQLite to PostgreSQL

> See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for detailed production deployment guide

### Scaling
- **Small**: PostgreSQL + single server
- **Large**: PostgreSQL + Redis + load balancer

## ⚡ Performance

### Built-in Optimizations
- Next.js image optimization and code splitting
- Database indexing and efficient queries
- Browser caching and CDN-ready assets

### Production Scaling
- PostgreSQL for database
- Redis for caching
- CDN for static assets
- Application monitoring

## 🔒 Security

### Built-in Security Features
- **Authentication**: JWT tokens with bcrypt password hashing
- **Authorization**: Role-based access control system
- **Input Protection**: Comprehensive validation and sanitization
- **Rate Limiting**: Multiple tiers (auth, API, general, post limits)
- **Security Headers**: Helmet.js with CSP, HSTS, XSS protection
- **CORS Protection**: Configurable origins for development/production
- **Logging**: Security events and comprehensive audit trail

### Production Security Checklist
- [x] JWT secret changed to secure random string
- [x] Rate limiting enabled with appropriate thresholds
- [x] Input validation and sanitization implemented
- [x] Security headers configured
- [ ] HTTPS enabled with SSL certificate
- [ ] Firewall configured and active
- [ ] Regular security updates scheduled

## 📝 Scripts

```bash
# Backend
bun run dev              # Development server
bun run start            # Production server
bunx prisma studio       # Database browser
bunx prisma migrate dev  # Apply migrations

# Frontend  
bun run dev              # Development with hot reload
bun run build            # Production build
bun run lint             # Code linting
```

## 🎪 Features Showcase

### Forums
- Rich markdown editor with live preview
- Category management with role permissions  
- Moderation tools (pin, lock, delete)
- Real-time statistics and metrics

### Events
- Multiple event types (Heist, PvP, Community, etc.)
- Registration system with capacity limits
- Featured events and custom imagery
- Attendance tracking and history

### Administration  
- Complete user role management
- Content moderation dashboard
- Community analytics and insights
- Real-time server status integration

## 🎆 Support

- **Documentation**: See [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Issues**: GitHub issue tracker for bugs and features
- **Community**: Connect with other RedM server owners
- **Contributing**: Fork, improve, and submit pull requests welcome

## 🎆 Why Choose This?

### Professional Quality
- Enterprise-grade code architecture
- Modern tech stack with TypeScript
- Scalable from 10 to 1000+ members
- Mobile-responsive design

### Complete Solution  
- Forums, events, rules, and admin tools
- Role-based user management
- Real-time server integration
- Authentic Wild West theming

## 📄 License

MIT License - Free for commercial and personal use.

## 🌟 Get Started

```bash
# Download and extract, then follow setup guide above
```

*Made with ❤️ for the RedM community by Quantum Projects*

**"Honor among thieves, law in the land"**

---

## 💼 Custom Website Development

Need a custom website for your RedM/FiveM server? I offer professional website development services!

**🎯 What I can build for you:**
- Custom RedM/FiveM community websites
- Admin dashboards and management panels
- Player statistics and leaderboards
- Custom forum systems
- Integration with your server resources
- Mobile-responsive designs
- Production deployment and hosting setup

**📞 Get in touch:**
- **Discord**: [Join my server](https://discord.gg/kJ8ZrGM8TS) for website commissions
- **Support the project**: [Buy me a coffee](https://buymeacoffee.com/quantumprojects) ☕

*Professional, reliable, and tailored to your community's needs!*
