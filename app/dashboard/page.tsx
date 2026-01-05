'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Truck } from '@/types';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <div className="text-zinc-600 dark:text-zinc-400">Loading map...</div>
    </div>
  ),
});

export default function DashboardPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    let isSubscribed = true;

    const fetchTrucks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/trucks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!res.ok) {
          if (isSubscribed) {
            setError('Failed to fetch trucks');
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        if (isSubscribed) {
          setTrucks(data.trucks);
          setLoading(false);
        }
      } catch {
        if (isSubscribed) {
          setError('Network error');
          setLoading(false);
        }
      }
    };

    fetchTrucks();
    const interval = setInterval(fetchTrucks, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleRetry = () => {
    setError('');
    setLoading(true);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-xl text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-black">
      <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">TrackNet</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Phuentsholing Garbage Truck Tracking
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {trucks.length} Active Truck{trucks.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Updates every 5 seconds
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg h-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : trucks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-zinc-400 dark:text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                  No active trucks at the moment
                </p>
                <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">
                  Trucks will appear here once they start sending location data
                </p>
              </div>
            </div>
          ) : (
            <Map trucks={trucks} />
          )}
        </div>
      </main>
    </div>
  );
}
