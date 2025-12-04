'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Calendar } from 'lucide-react';

interface Props {
  sport: string;
  league: string;
  currentDate?: string;
  gameDates?: (string | { date?: string })[]; // Array of dates with games (YYYYMMDD format, ISO strings, or objects)
}

export function ScoreboardClient({ sport, league, currentDate, gameDates = [] }: Props) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Parse game dates to YYYYMMDD format for comparison
  const parsedGameDates = useMemo(() => {
    return gameDates.map((d) => {
      // Handle both string dates and object dates from ESPN API
      const dateStr = typeof d === 'string' ? d : (d as { date?: string })?.date || '';
      if (!dateStr) return '';

      if (dateStr.includes('T')) {
        // ISO format
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
      }
      return dateStr.replace(/-/g, '');
    }).filter(Boolean).sort();
  }, [gameDates]);

  // Parse the current date or use today
  const getDisplayDate = () => {
    if (currentDate && currentDate.length === 8) {
      const year = currentDate.slice(0, 4);
      const month = currentDate.slice(4, 6);
      const day = currentDate.slice(6, 8);
      return `${year}-${month}-${day}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getDisplayDate());

  const currentDateYYYYMMDD = selectedDate.replace(/-/g, '');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    const formattedDate = date.replace(/-/g, '');
    router.push(`/sport/${sport}/${league}?date=${formattedDate}`);
  };

  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    router.push(`/sport/${sport}/${league}`);
  };

  // Navigate to next/prev game date
  const navigateToGameDate = (direction: 'next' | 'prev') => {
    if (parsedGameDates.length === 0) {
      // Fallback to simple +/- 1 day if no calendar data
      const current = new Date(selectedDate);
      current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
      const newDate = current.toISOString().split('T')[0];
      setSelectedDate(newDate);
      router.push(`/sport/${sport}/${league}?date=${newDate.replace(/-/g, '')}`);
      return;
    }

    const currentIndex = parsedGameDates.indexOf(currentDateYYYYMMDD);

    if (direction === 'next') {
      // Find next date after current
      let nextDate: string | undefined;
      if (currentIndex === -1) {
        // Current date not in list, find nearest future date
        nextDate = parsedGameDates.find((d) => d > currentDateYYYYMMDD);
      } else if (currentIndex < parsedGameDates.length - 1) {
        nextDate = parsedGameDates[currentIndex + 1];
      }

      if (nextDate) {
        const formatted = `${nextDate.slice(0, 4)}-${nextDate.slice(4, 6)}-${nextDate.slice(6, 8)}`;
        setSelectedDate(formatted);
        router.push(`/sport/${sport}/${league}?date=${nextDate}`);
      }
    } else {
      // Find previous date before current
      let prevDate: string | undefined;
      if (currentIndex === -1) {
        // Current date not in list, find nearest past date
        prevDate = [...parsedGameDates].reverse().find((d) => d < currentDateYYYYMMDD);
      } else if (currentIndex > 0) {
        prevDate = parsedGameDates[currentIndex - 1];
      }

      if (prevDate) {
        const formatted = `${prevDate.slice(0, 4)}-${prevDate.slice(4, 6)}-${prevDate.slice(6, 8)}`;
        setSelectedDate(formatted);
        router.push(`/sport/${sport}/${league}?date=${prevDate}`);
      }
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Auto-refresh every 30 seconds for live games
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);

  // Check if navigation is available
  const hasPrevGame = parsedGameDates.length === 0 || parsedGameDates.some((d) => d < currentDateYYYYMMDD);
  const hasNextGame = parsedGameDates.length === 0 || parsedGameDates.some((d) => d > currentDateYYYYMMDD);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => navigateToGameDate('prev')}
            disabled={!hasPrevGame}
            className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous game day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="bg-transparent px-3 py-2 text-white text-center w-40"
          />
          <button
            onClick={() => navigateToGameDate('next')}
            disabled={!hasNextGame}
            className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next game day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={goToToday}
          className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Today
        </button>

        <button
          onClick={handleRefresh}
          className={`bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors ${
            refreshing ? 'opacity-50' : ''
          }`}
          disabled={refreshing}
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>

        {parsedGameDates.length > 0 && (
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
            title="Show game dates"
          >
            <Calendar className="w-5 h-5" />
          </button>
        )}

        <div className="text-gray-500 text-sm ml-auto hidden md:block">
          Auto-refreshes every 30s
        </div>
      </div>

      {/* Quick date picker for game dates */}
      {showCalendar && parsedGameDates.length > 0 && (
        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-3">Game Dates</h4>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {parsedGameDates.slice(-30).map((d) => {
              const formatted = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
              const isSelected = d === currentDateYYYYMMDD;
              const date = new Date(formatted);
              const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDate(formatted);
                    router.push(`/sport/${sport}/${league}?date=${d}`);
                    setShowCalendar(false);
                  }}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    isSelected
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
