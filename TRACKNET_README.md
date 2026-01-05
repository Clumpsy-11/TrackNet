# TrackNet - Garbage Truck Tracking System

A real-time garbage truck tracking application for Phuentsholing built with Next.js 16, TypeScript, and OpenStreetMap.

## Features

- ✅ User authentication (JWT-based)
- ✅ Real-time truck location tracking
- ✅ Interactive OpenStreetMap with Leaflet.js
- ✅ Responsive design for web and mobile
- ✅ Arduino/GPS device integration
- ✅ Automatic map updates every 5 seconds
- ✅ Route API scaffolded for future expansion

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Maps**: Leaflet.js + OpenStreetMap
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

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
    "email": "user@example.com"
  }
}
```

### Trucks

#### Get All Trucks (Protected)
```http
GET /api/trucks
Authorization: Bearer <token>
```

**Response:**
```json
{
  "trucks": [
    {
      "id": 1,
      "deviceId": "TRUCK001",
      "latitude": 26.8532,
      "longitude": 89.3850,
      "lastUpdated": "2024-01-05T10:30:00.000Z",
      "status": "active"
    }
  ],
  "count": 1
}
```

#### Update Truck Location (Arduino/GPS Device)
```http
POST /api/trucks/location
Content-Type: application/json

{
  "deviceId": "TRUCK001",
  "latitude": 26.8532,
  "longitude": 89.3850,
  "timestamp": "2024-01-05T10:30:00.000Z"
}
```

**Response:**
```json
{
  "message": "Location updated successfully",
  "deviceId": "TRUCK001",
  "latitude": 26.8532,
  "longitude": 89.3850
}
```

### Routes (Scaffolded for Future)

#### Get All Routes
```http
GET /api/routes
Authorization: Bearer <token>
```

#### Create Route
```http
POST /api/routes
Authorization: Bearer <token>
Content-Type: application/json

{
  "truckId": 1,
  "waypoints": [[26.8532, 89.3850], [26.8600, 89.3900]]
}
```

## Arduino Integration

### Hardware Setup

1. **Components Needed:**
   - Arduino Uno/Mega
   - GPS Module (e.g., NEO-6M)
   - GSM Module (e.g., SIM800L or SIM900)
   - Power supply

2. **Connections:**
   - Connect GPS TX to Arduino RX
   - Connect GPS RX to Arduino TX
   - Connect GSM module to Arduino serial pins
   - Ensure proper power supply to all modules

### Arduino Code Example

```cpp
#include <SoftwareSerial.h>
#include <TinyGPS++.h>

// GPS Module
SoftwareSerial gpsSerial(4, 3); // RX, TX
TinyGPSPlus gps;

// GSM Module
SoftwareSerial gsmSerial(7, 8); // RX, TX

String deviceId = "TRUCK001";
String serverUrl = "http://your-server.com/api/trucks/location";

void setup() {
  Serial.begin(9600);
  gpsSerial.begin(9600);
  gsmSerial.begin(9600);
  
  delay(1000);
  initGSM();
}

void loop() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
    
    if (gps.location.isUpdated()) {
      float latitude = gps.location.lat();
      float longitude = gps.location.lng();
      
      sendLocationToServer(latitude, longitude);
      
      delay(30000); // Send update every 30 seconds
    }
  }
}

void initGSM() {
  gsmSerial.println("AT");
  delay(1000);
  gsmSerial.println("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"");
  delay(1000);
  gsmSerial.println("AT+SAPBR=3,1,\"APN\",\"your_apn\"");
  delay(1000);
  gsmSerial.println("AT+SAPBR=1,1");
  delay(2000);
}

void sendLocationToServer(float lat, float lng) {
  String jsonData = "{";
  jsonData += "\"deviceId\":\"" + deviceId + "\",";
  jsonData += "\"latitude\":" + String(lat, 6) + ",";
  jsonData += "\"longitude\":" + String(lng, 6) + ",";
  jsonData += "\"timestamp\":\"2024-01-05T10:30:00.000Z\"";
  jsonData += "}";
  
  gsmSerial.println("AT+HTTPINIT");
  delay(1000);
  gsmSerial.println("AT+HTTPPARA=\"URL\",\"" + serverUrl + "\"");
  delay(1000);
  gsmSerial.println("AT+HTTPPARA=\"CONTENT\",\"application/json\"");
  delay(1000);
  gsmSerial.println("AT+HTTPDATA=" + String(jsonData.length()) + ",10000");
  delay(1000);
  gsmSerial.println(jsonData);
  delay(1000);
  gsmSerial.println("AT+HTTPACTION=1"); // POST request
  delay(5000);
  gsmSerial.println("AT+HTTPTERM");
  delay(1000);
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Trucks Table
```sql
CREATE TABLE trucks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deviceId TEXT UNIQUE NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active'
);
```

### Routes Table (Scaffolded)
```sql
CREATE TABLE routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  truckId INTEGER NOT NULL,
  waypoints TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (truckId) REFERENCES trucks(id)
);
```

## Project Structure

```
/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── trucks/
│   │   │   ├── route.ts
│   │   │   └── location/route.ts
│   │   └── routes/
│   │       └── route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Map.tsx
├── lib/
│   ├── auth.ts
│   └── db.ts
├── types/
│   └── index.ts
└── tracknet.db (generated)
```

## Environment Variables

Create a `.env` file for production:

```env
JWT_SECRET=your-secret-key-here-change-in-production
```

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Route planning and optimization
- [ ] Historical tracking data
- [ ] Notifications system
- [ ] Driver mobile app
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Geofencing alerts

## Testing

### Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Truck Location Update
```bash
curl -X POST http://localhost:3000/api/trucks/location \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"TRUCK001","latitude":26.8532,"longitude":89.3850}'
```

### Test Get Trucks (with token)
```bash
curl -X GET http://localhost:3000/api/trucks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Deploy to Custom Server
1. Build the project: `npm run build`
2. Copy files to server
3. Install dependencies: `npm install --production`
4. Start: `npm start`
5. Use PM2 for process management

## License

MIT License - Built for Phuentsholing Municipality

## Support

For issues or questions, please contact the development team.
