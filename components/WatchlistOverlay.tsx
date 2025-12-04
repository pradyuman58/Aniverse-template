
import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Ghost } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import AnimeCard from './AnimeCard';
import { Anime } from '../types';

interface WatchlistOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onPlay?: (anime: Anime) => void;
}

const WatchlistOverlay: React.FC<WatchlistOverlayProps> = ({ isOpen, onClose, onPlay }) => {
    const { watchlist } = useWatchlist();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                className="relative w-full max-w-6xl h-[85vh] bg-[#0f0f16] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-pink-900/20 to-transparent">
                    <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                            <Heart className="text-pink-500 fill-pink-500" /> My Watchlist
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">{watchlist.length} anime saved</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0a0a12]">
                    {watchlist.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                            <Ghost size={64} className="mb-4 text-purple-400" />
                            <p className="text-xl font-bold text-white">Your watchlist is empty.</p>
                            <p className="text-sm">Click the heart icon on any anime to save it here!</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-8 pb-12">
                            {watchlist.map((anime, index) => (
                                <AnimeCard key={`watchlist-${anime.id}`} anime={anime} index={index} onPlay={onPlay} />
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default WatchlistOverlay;
