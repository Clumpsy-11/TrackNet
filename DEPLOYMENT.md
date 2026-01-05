# TrackNet Deployment Guide

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Seed the database with test data
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Test Credentials:**
- Email: `test@tracknet.com`
- Password: `password123`

## Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

> ⚠️ **Important**: Always use a strong, unique secret in production!

## Production Deployment

### Option 1: Deploy to Vercel (Recommended for MVP)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit - TrackNet MVP"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `JWT_SECRET`
   - Deploy

3. **Note about Database:**
   - SQLite doesn't work on Vercel (serverless)
   - For production on Vercel, switch to:
     - Vercel Postgres
     - PlanetScale (MySQL)
     - Supabase (PostgreSQL)
     - MongoDB Atlas

### Option 2: Deploy to VPS (DigitalOcean, AWS EC2, etc.)

1. **Setup Server:**
```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js (v20 or higher)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Deploy Application:**
```bash
# Clone repository
git clone YOUR_REPO_URL
cd tracknet

# Install dependencies
npm install

# Set environment variable
echo "JWT_SECRET=your-secret-key" > .env

# Seed database
npm run seed

# Build application
npm run build

# Start with PM2
pm2 start npm --name "tracknet" -- start
pm2 save
pm2 startup
```

3. **Setup Nginx (Reverse Proxy):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Enable HTTPS with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 3: Deploy to Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Deploy:
```bash
railway login
railway init
railway add
railway up
```

3. Add environment variables in Railway dashboard

### Option 4: Docker Deployment

1. **Create Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  tracknet:
    build: .
    ports:
      - "3000:3000"
    environment:
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./tracknet.db:/app/tracknet.db
    restart: unless-stopped
```

3. **Deploy:**
```bash
docker-compose up -d
```

## Database Migration for Production

If switching from SQLite to PostgreSQL:

1. **Install PostgreSQL adapter:**
```bash
npm install pg
npm install -D @types/pg
```

2. **Update lib/db.ts:**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
```

3. **Update queries** to use PostgreSQL syntax

## Arduino Device Configuration

For Arduino devices to send location data to your production server:

```cpp
String serverUrl = "https://your-domain.com/api/trucks/location";
// or
String serverUrl = "http://your-server-ip:3000/api/trucks/location";
```

### Testing Arduino Integration

```bash
# Simulate Arduino POST request
curl -X POST https://your-domain.com/api/trucks/location \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "TRUCK001",
    "latitude": 26.8532,
    "longitude": 89.3850
  }'
```

## Monitoring & Maintenance

### Check Application Status (PM2)
```bash
pm2 status
pm2 logs tracknet
pm2 restart tracknet
```

### Backup Database
```bash
# Backup SQLite database
cp tracknet.db tracknet.db.backup

# Automated daily backup
crontab -e
# Add: 0 2 * * * cp /path/to/tracknet.db /path/to/backups/tracknet-$(date +\%Y\%m\%d).db
```

### Monitor Logs
```bash
pm2 logs tracknet --lines 100
```

## Security Checklist

- [ ] Use strong JWT_SECRET in production
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Set up firewall (UFW or cloud provider firewall)
- [ ] Regular database backups
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Rate limiting on API endpoints (consider using rate-limiter-flexible)
- [ ] Monitor server resources
- [ ] Set up error tracking (Sentry, etc.)

## Performance Optimization

1. **Enable caching:**
```bash
# Install Redis for caching
sudo apt install redis-server
npm install redis
```

2. **Optimize map loading:**
   - Use CDN for Leaflet assets
   - Implement lazy loading for markers

3. **Database optimization:**
   - Add indexes on frequently queried columns
   - Implement connection pooling

## Troubleshooting

### Issue: "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Database locked errors
- Check if multiple processes are accessing the database
- Consider using WAL mode for SQLite:
```typescript
db.pragma('journal_mode = WAL');
```

### Issue: Map not loading
- Check browser console for errors
- Ensure Leaflet CSS is imported
- Verify OpenStreetMap tiles are accessible

## Scaling Considerations

For scaling beyond MVP:

1. **Database**: Migrate to PostgreSQL or MongoDB
2. **WebSockets**: Implement for real-time updates (Socket.io)
3. **Load Balancing**: Use Nginx or cloud load balancer
4. **Caching**: Implement Redis for truck locations
5. **CDN**: Use for static assets
6. **Monitoring**: Set up application monitoring (New Relic, DataDog)

## Support

For deployment issues:
1. Check logs: `pm2 logs tracknet`
2. Verify environment variables are set
3. Ensure all dependencies are installed
4. Check firewall/security group settings
5. Verify database file permissions

## Useful Links

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Deployment](https://vercel.com/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Let's Encrypt](https://letsencrypt.org/)
