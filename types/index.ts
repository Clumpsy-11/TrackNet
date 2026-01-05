export interface User {
  id: number;
  email: string;
  password: string;
  createdAt: string;
}

export interface Truck {
  id: number;
  deviceId: string;
  latitude: number;
  longitude: number;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Route {
  id: number;
  truckId: number;
  waypoints: string;
  createdAt: string;
}

export interface LocationUpdate {
  deviceId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface AuthPayload {
  userId: number;
  email: string;
}
