
import React, { useEffect, useState, useRef } from 'react';
import { History, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWatchHistory, WatchHistoryItem } from '../services/streamingService';
import { Anime } from '../types';

interface RecentlyWatchedSectionProps {
    onPlay?: (anime: Anime) => void;
}

const RecentlyWatchedSection: React.FC<RecentlyWatchedSectionProps> = ({ onPlay }) => {
    const [history, setHistory] = useState<WatchHistoryItem[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load history on mount
        const items = getWatchHistory();
        setHistory(items);
        
        // Listen for storage events (in case updated in another tab/component)
        const handleStorageChange = () => {
             setHistory(getWatchHistory());
        };
        window.addEventListener('storage', handleStorageChange);
        // Custom event dispatching could be added here for same-page updates if needed
        
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Also poll/check periodically or when component becomes visible if needed, 
    // but for now relying on mount/update. 
    // Ideally VideoPlayer triggers a re-fetch in parent, but component state is isolated.
    // We can just re-fetch every few seconds or on interaction.
    useEffect(() => {
        const interval = setInterval(() => {
            const items = getWatchHistory();
            if (JSON.stringify(items) !== JSON.stringify(history)) {
                setHistory(items);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [history]);


    if (history.length === 0) return null;

    const handleItemClick = (item: WatchHistoryItem) => {
        if (onPlay) {
            // Reconstruct a minimal Anime object
            const anime: Anime = {
                id: item.animeId,
                title: item.animeTitle,
                imageUrl: item.animeImage,
                rating: '?', // Not stored in history
                genres: [],
                description: '',
            };
            onPlay(anime);
        }
    };

    return (
        <div className="relative z-10 container mx-auto py-8">
             <div className="px-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3">
                    <History className="text-purple-500" size={28} />
                    Continue Watching
                </h2>
                <p className="text-sm text-gray-400">Pick up where you left off</p>
             </div>
             
             <div 
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-8 pt-2 px-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {history.map((item, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={`${item.animeId}-${item.timestamp}`} 
                        className="snap-center flex-shrink-0 group relative w-[160px] h-[240px] rounded-xl overflow-hidden cursor-pointer border border-white/10"
                        onClick={() => handleItemClick(item)}
                    >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                        <img 
                            src={item.animeImage} 
                            alt={item.animeTitle} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-[1px]">
                            <PlayCircle size={40} className="text-white drop-shadow-lg" />
                        </div>

                        {/* Progress Badge */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
                            <h4 className="text-white font-bold text-sm truncate">{item.animeTitle}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    EP {item.episodeNumber}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                            {/* Fake progress bar */}
                            <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-purple-500 w-3/4" /> 
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default RecentlyWatchedSection;
