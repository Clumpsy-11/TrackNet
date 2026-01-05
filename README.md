# TrackNet - Phuentsholing Garbage Truck Tracking System

A modern, real-time garbage truck tracking application built with Next.js 16, TypeScript, and OpenStreetMap integration.

## Overview

TrackNet is an MVP (Minimum Viable Product) designed to track garbage collection trucks in Phuentsholing in real-time. The system allows authorized users to monitor truck locations on an interactive map and supports direct integration with GPS-enabled Arduino devices mounted on trucks.

## Key Features

- 🔐 **User Authentication** - Secure JWT-based login and registration
- 🗺️ **Live Map Tracking** - Real-time truck locations on OpenStreetMap
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🚛 **Arduino Integration** - Direct support for GPS/GSM hardware modules
- ⚡ **Real-time Updates** - Automatic refresh every 5 seconds
- 🎯 **Clean UI** - Minimalist design with Tailwind CSS v4
- 📡 **RESTful API** - Well-documented endpoints for all operations

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## Documentation

For detailed documentation including:
- API endpoint specifications
- Arduino hardware setup and code
- Database schema
- Deployment instructions
- Testing examples

Please see [TRACKNET_README.md](./TRACKNET_README.md)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Maps**: Leaflet.js + OpenStreetMap
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT + bcryptjs
- **API**: Next.js API Routes

## Project Structure

```
tracknet/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── dashboard/   # Main tracking interface
│   ├── login/       # Authentication pages
│   └── register/
├── components/       # React components
├── lib/             # Utilities (auth, database)
├── types/           # TypeScript definitions
└── public/          # Static assets
```

## Environment Variables

```env
JWT_SECRET=your-secret-key-here
```

## Default Map Location

The map is centered on Phuentsholing, Bhutan:
- Latitude: 26.8532
- Longitude: 89.3850

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/trucks` - Get all active trucks (protected)
- `POST /api/trucks/location` - Update truck location (Arduino)
- `GET /api/routes` - Get routes (scaffolded)
- `POST /api/routes` - Create route (scaffolded)

## Contributing

This is an MVP for the Phuentsholing municipality. Future enhancements include:
- Route planning and optimization
- WebSocket support for instant updates
- Historical tracking data
- Analytics dashboard
- Mobile app for drivers
- Notifications system

## License

MIT License

## Support

For questions or issues, please refer to the detailed documentation in TRACKNET_README.md
