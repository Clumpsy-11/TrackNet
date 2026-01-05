'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck } from '@/types';

interface MapProps {
  trucks: Truck[];
}

export default function Map({ trucks }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([26.8532, 89.3850], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;

    markersRef.current.clearLayers();

    const truckIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    trucks.forEach((truck) => {
      const marker = L.marker([truck.latitude, truck.longitude], { icon: truckIcon });
      
      const lastUpdated = new Date(truck.lastUpdated).toLocaleString();
      marker.bindPopup(`
        <div style="font-family: sans-serif;">
          <strong>Truck ${truck.deviceId}</strong><br/>
          Status: <span style="color: ${truck.status === 'active' ? 'green' : 'orange'};">${truck.status}</span><br/>
          Last Updated: ${lastUpdated}
        </div>
      `);

      marker.addTo(markersRef.current!);
    });

    if (trucks.length > 0) {
      const bounds = L.latLngBounds(trucks.map(t => [t.latitude, t.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [trucks]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
