# Production Deployment Guide

## 🚀 Production Setup Checklist

### 1. Environment Configuration

Copy the example environment file and configure for production:

```bash
cp backend/.env.example backend/.env
```

**Critical Environment Variables:**
```env
NODE_ENV=production
JWT_SECRET=your-super-secure-64-character-random-string-here
DATABASE_URL="postgresql://user:password@localhost:5432/redm_website"
FRONTEND_URL="https://your-domain.com"
```

### 2. Database Migration (PostgreSQL)

**Install PostgreSQL** and create database:
```sql
CREATE DATABASE redm_website;
CREATE USER redm_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE redm_website TO redm_user;
```

**Update Prisma schema** for PostgreSQL:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Run migrations:**
```bash
cd backend
bunx prisma migrate dev --name init
bunx prisma generate
```

### 3. SSL/HTTPS Configuration

**Option A: Reverse Proxy (Recommended)**
Use Nginx or Apache as reverse proxy with SSL certificate:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Option B: Direct HTTPS**
```javascript
// Add to backend/index.ts
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

https.createServer(options, app).listen(PORT, () => {
  logger.info(`HTTPS Server running on port ${PORT}`);
});
```

### 4. Security Hardening

**Update CORS origins:**
```typescript
// backend/src/middleware/security.ts
export const corsOptions = {
  origin: ['https://your-domain.com'],
  // ... rest of config
};
```

**Firewall Configuration:**
```bash
# Ubuntu/Debian
sudo ufw allow 22        # SSH
sudo ufw allow 80        # HTTP
sudo ufw allow 443       # HTTPS
sudo ufw enable
```

### 5. Process Management

**Install PM2:**
```bash
npm install -g pm2
```

**Create ecosystem file:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'redm-backend',
    script: './backend/index.ts',
    interpreter: 'bun',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }, {
    name: 'redm-frontend',
    script: 'bun',
    args: 'run start',
    cwd: './frontend',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

**Start services:**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 6. Monitoring & Logging

**Log Rotation:**
```bash
# Add to /etc/logrotate.d/redm-website
/path/to/redm-website/backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reload redm-backend
    endscript
}
```

**Health Monitoring:**
```bash
# Add cron job to check server health
*/5 * * * * curl -f http://localhost:3001/api/health || pm2 restart redm-backend
```

### 7. Performance Optimization

**Frontend Build:**
```bash
cd frontend
bun run build
```

**Database Optimization:**
```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON "User"(email);
CREATE INDEX idx_forum_posts_category ON "ForumPost"(category);
CREATE INDEX idx_events_date ON "Event"(date);
```

**Caching (Optional):**
```bash
# Install Redis
sudo apt install redis-server

# Configure Redis caching in backend
npm install redis
```

### 8. Backup Strategy

**Database Backup:**
```bash
#!/bin/bash
# backup-db.sh
pg_dump redm_website > /backup/redm_$(date +%Y%m%d_%H%M%S).sql
find /backup -name "redm_*.sql" -mtime +7 -delete
```

**File Backup:**
```bash
# Add to crontab
0 2 * * * /path/to/backup-db.sh
0 3 * * 0 tar -czf /backup/assets_$(date +%Y%m%d).tar.gz /path/to/assets/
```

### 9. Domain Configuration

**DNS Records:**
```
A     your-domain.com      → YOUR_SERVER_IP
CNAME www.your-domain.com  → your-domain.com
```

**Update Frontend URLs:**
Update all localhost references in frontend to your production domain.

### 10. Final Security Checklist

- [ ] JWT secret is 64+ characters random string
- [ ] Database user has minimal required permissions
- [ ] SSL certificate is properly configured
- [ ] Firewall is configured and active
- [ ] Log files have proper permissions
- [ ] Rate limiting is enabled
- [ ] CORS origins are restricted to your domain
- [ ] Server headers don't expose version info
- [ ] Database credentials are not in code
- [ ] Backup system is configured and tested

## 📊 Performance Expectations

With these optimizations, your website should handle:
- **5,000+ concurrent users**
- **Sub-200ms API response times**
- **99.9% uptime**
- **Secure against common attacks**

## 🆘 Troubleshooting

**Common Issues:**
1. **CORS errors**: Check FRONTEND_URL in .env
2. **Database connection**: Verify DATABASE_URL format
3. **SSL issues**: Check certificate paths and permissions
4. **Rate limiting too strict**: Adjust limits in security.ts
5. **Memory usage**: Monitor with `pm2 monit`

## 📞 Support

For issues with this production setup, check:
1. Application logs: `pm2 logs`
2. System logs: `/var/log/nginx/error.log`
3. Database logs: PostgreSQL error logs
4. Process status: `pm2 status`