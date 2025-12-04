
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Anime } from '../types';
import { useAuth } from './AuthContext';

interface WatchlistContextType {
  watchlist: Anime[];
  addToWatchlist: (anime: Anime) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<Anime[]>([]);
  const { user } = useAuth();
  
  // Dynamic key based on user ID or 'guest'
  // This ensures that when a user logs in, we switch to their specific list.
  // Guests have their own persistent list.
  const STORAGE_KEY = user ? `aniverse_watchlist_${user.id}` : 'aniverse_watchlist_guest';

  // Load from local storage when Key changes (User login/logout)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load watchlist", e);
        setWatchlist([]);
      }
    } else {
        setWatchlist([]);
    }
  }, [STORAGE_KEY]);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist, STORAGE_KEY]);

  const addToWatchlist = (anime: Anime) => {
    setWatchlist(prev => {
      if (prev.some(a => a.id === anime.id)) return prev;
      return [anime, ...prev];
    });
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist(prev => prev.filter(a => a.id !== id));
  };

  const isInWatchlist = (id: string) => {
    return watchlist.some(a => a.id === id);
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
