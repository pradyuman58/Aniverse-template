
import React, { useState, useEffect, useRef } from 'react';
import { Anime } from '../types';
import AnimeCard from './AnimeCard';
import { CalendarDays, Clock, Loader2, BarChart2, TrendingUp, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSchedule } from '../services/animeApi';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

type SortOption = 'popularity' | 'score' | 'time';

interface DailyReleaseSectionProps {
    onPlay?: (anime: Anime) => void;
}

const DailyReleaseSection: React.FC<DailyReleaseSectionProps> = ({ onPlay }) => {
    const [activeDay, setActiveDay] = useState<string>('');
    const [animeList, setAnimeList] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortOption>('popularity');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Initialize with current Local day
    useEffect(() => {
        const date = new Date();
        const todayIndex = date.getDay(); // 0 = Sunday, 1 = Monday... (Local Time)
        // Map 0 (Sunday) to index 6 in our array (which is mon-sun), others to index - 1
        const mappedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
        setActiveDay(days[mappedIndex]);
    }, []);

    // Fetch data when activeDay changes
    useEffect(() => {
        if (!activeDay) return;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getSchedule(activeDay);
                setAnimeList(data);
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollLeft = 0;
                }
            } catch (error) {
                console.error("Failed to fetch schedule", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeDay]);

    // Sorting Logic
    const sortedList = [...animeList].sort((a, b) => {
        if (sortBy === 'popularity') {
            return (b.members || 0) - (a.members || 0);
        } else if (sortBy === 'score') {
            const scoreA = typeof a.rating === 'number' ? a.rating : parseFloat(a.rating as string) || 0;
            const scoreB = typeof b.rating === 'number' ? b.rating : parseFloat(b.rating as string) || 0;
            return scoreB - scoreA;
        } else if (sortBy === 'time') {
            // Sort by broadcastTime string (e.g. "23:00")
            // Empty times go to the end
            if (!a.broadcastTime) return 1;
            if (!b.broadcastTime) return -1;
            return a.broadcastTime.localeCompare(b.broadcastTime);
        }
        return 0;
    });

    const sortOptions: { id: SortOption; label: string; icon: React.ReactNode }[] = [
        { id: 'popularity', label: 'Popularity', icon: <TrendingUp size={14} /> },
        { id: 'score', label: 'Score', icon: <Star size={14} /> },
        { id: 'time', label: 'Time', icon: <Clock size={14} /> },
    ];

    return (
        <div className="relative z-10 container mx-auto py-12">
             <div className="px-4 flex flex-col gap-6 mb-8">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
                            <CalendarDays className="text-cyan-500" size={32} />
                            Daily Releases
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock size={14} />
                            <span>Schedule synced to your local day</span>
                        </div>
                    </div>

                    <div className="w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md min-w-max">
                            {days.map((day) => (
                                <button 
                                    key={day}
                                    onClick={() => setActiveDay(day)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeDay === day ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    {day.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <BarChart2 size={12} /> Sort By:
                    </span>
                    <div className="flex bg-black/20 rounded-lg p-0.5 border border-white/5">
                        {sortOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setSortBy(opt.id)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${sortBy === opt.id ? 'bg-white/10 text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {opt.icon}
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
             </div>
             
             <AnimatePresence mode="wait">
                 {loading ? (
                     <motion.div 
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-80 w-full flex items-center justify-center flex-col gap-4"
                     >
                         <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                         <span className="text-cyan-300 text-sm font-mono animate-pulse">Checking satellite feed...</span>
                     </motion.div>
                 ) : (
                     <motion.div 
                        key={`${activeDay}-${sortBy}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                     >
                        {sortedList.length > 0 ? (
                            <div 
                                ref={scrollContainerRef}
                                className="flex gap-6 overflow-x-auto pb-12 pt-4 px-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {sortedList.map((anime, idx) => (
                                    <div key={`daily-${anime.id}-${idx}`} className="snap-center flex-shrink-0">
                                        <AnimeCard anime={anime} index={idx} onPlay={onPlay} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500 border border-white/5 rounded-xl bg-white/5 mx-4">
                                <p>No scheduled releases found for this day.</p>
                            </div>
                        )}
                     </motion.div>
                 )}
             </AnimatePresence>
        </div>
    );
};

export default DailyReleaseSection;
