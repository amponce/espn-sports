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

// Get nearby game dates centered around current date
function getNearbyDates(allDates: string[], currentDate: string): string[] {
  const currentIndex = allDates.indexOf(currentDate);
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

  // Find dates around the current selection
  let startIndex: number;
  let endIndex: number;

  if (currentIndex === -1) {
    // Current date not in list, find nearest future dates
    const futureIndex = allDates.findIndex(d => d >= today);
    if (futureIndex === -1) {
      // All dates are in the past, show last 7
      startIndex = Math.max(0, allDates.length - 7);
      endIndex = allDates.length;
    } else {
      // Show 3 past, current position, and 3 future
      startIndex = Math.max(0, futureIndex - 3);
      endIndex = Math.min(allDates.length, futureIndex + 4);
    }
  } else {
    // Show 3 before and 3 after current selection
    startIndex = Math.max(0, currentIndex - 3);
    endIndex = Math.min(allDates.length, currentIndex + 4);
  }

  return allDates.slice(startIndex, endIndex);
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center bg-neutral-900 rounded-lg border border-neutral-800">
          <button
            onClick={() => navigateToGameDate('prev')}
            disabled={!hasPrevGame}
            className="p-2.5 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-lg border-r border-neutral-800"
            title="Previous game day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="bg-transparent px-3 py-2 text-white text-center w-36 text-sm border-none focus:outline-none"
          />
          <button
            onClick={() => navigateToGameDate('next')}
            disabled={!hasNextGame}
            className="p-2.5 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-lg border-l border-neutral-800"
            title="Next game day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={goToToday}
          className="btn-primary text-sm"
        >
          Today
        </button>

        <button
          onClick={handleRefresh}
          className={`btn-secondary p-2.5 ${refreshing ? 'opacity-50' : ''}`}
          disabled={refreshing}
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>

        {parsedGameDates.length > 0 && (
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`btn-secondary p-2.5 ${showCalendar ? 'bg-neutral-700 border-neutral-600' : ''}`}
            title={showCalendar ? 'Hide game dates' : 'Show all game dates'}
          >
            <Calendar className="w-4 h-4" />
          </button>
        )}

        <div className="text-neutral-600 text-xs ml-auto hidden md:block">
          {parsedGameDates.length > 0
            ? `${parsedGameDates.length} game days • Auto-refresh 30s`
            : 'Auto-refreshes every 30s'
          }
        </div>
      </div>

      {/* Nearby game dates - always show a few */}
      {parsedGameDates.length > 0 && (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs text-neutral-600 whitespace-nowrap">Jump to:</span>
          {getNearbyDates(parsedGameDates, currentDateYYYYMMDD).map((d) => {
            const formatted = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
            const isSelected = d === currentDateYYYYMMDD;
            const date = new Date(formatted);
            const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const isToday = d === today;
            const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <button
                key={d}
                onClick={() => {
                  setSelectedDate(formatted);
                  router.push(`/sport/${sport}/${league}?date=${d}`);
                }}
                className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-red-600 text-white'
                    : isToday
                    ? 'bg-green-900/50 text-green-400 hover:bg-green-900'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                {isToday ? `Today` : label}
              </button>
            );
          })}
        </div>
      )}

      {/* Full calendar - expandable */}
      {showCalendar && parsedGameDates.length > 0 && (
        <div className="mt-3 bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <h4 className="text-xs text-neutral-500 mb-3 font-medium uppercase tracking-wider">All Game Dates</h4>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {parsedGameDates.map((d) => {
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
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-red-600 text-white'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white'
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
