import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Truck } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { deviceId, latitude, longitude } = await request.json();

    if (!deviceId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'deviceId, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'latitude and longitude must be numbers' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    const existingTruck = db.prepare('SELECT id FROM trucks WHERE deviceId = ?').get(deviceId) as Truck | undefined;

    if (existingTruck) {
      db.prepare(
        'UPDATE trucks SET latitude = ?, longitude = ?, lastUpdated = CURRENT_TIMESTAMP WHERE deviceId = ?'
      ).run(latitude, longitude, deviceId);
    } else {
      db.prepare(
        'INSERT INTO trucks (deviceId, latitude, longitude, status) VALUES (?, ?, ?, ?)'
      ).run(deviceId, latitude, longitude, 'active');
    }

    return NextResponse.json({
      message: 'Location updated successfully',
      deviceId,
      latitude,
      longitude,
    });
  } catch (error) {
    console.error('Location update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
