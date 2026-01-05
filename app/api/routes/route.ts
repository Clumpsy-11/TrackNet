import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { Route } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const routes = db.prepare('SELECT * FROM routes').all() as Route[];

    return NextResponse.json({
      routes,
      count: routes.length,
      message: 'Routes API - Scaffolded for future implementation',
    });
  } catch (error) {
    console.error('Get routes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { truckId, waypoints } = await request.json();

    if (!truckId || !waypoints) {
      return NextResponse.json(
        { error: 'truckId and waypoints are required' },
        { status: 400 }
      );
    }

    const waypointsString = typeof waypoints === 'string' ? waypoints : JSON.stringify(waypoints);

    const result = db.prepare(
      'INSERT INTO routes (truckId, waypoints) VALUES (?, ?)'
    ).run(truckId, waypointsString);

    return NextResponse.json(
      {
        message: 'Route created successfully (scaffolded)',
        route: {
          id: result.lastInsertRowid,
          truckId,
          waypoints: waypointsString,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
