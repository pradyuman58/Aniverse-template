
import React, { useEffect, useState, useRef } from 'react';
import { Rocket, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTopUpcoming } from '../services/animeApi';
import { Anime } from '../types';
import AnimeCard from './AnimeCard';

interface TopUpcomingSectionProps {
    onPlay?: (anime: Anime) => void;
}

const TopUpcomingSection: React.FC<TopUpcomingSectionProps> = ({ onPlay }) => {
    const [list, setList] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getTopUpcoming();
                setList(data);
            } catch (error) {
                console.error("Failed to fetch upcoming", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="relative z-10 container mx-auto py-12">
             <div className="px-4 mb-6">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
                    <Rocket className="text-orange-500" size={32} />
                    Top Upcoming
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={14} />
                    <span>The most anticipated releases</span>
                </div>
             </div>
             
             <AnimatePresence>
                 {loading ? (
                    <div className="h-64 flex items-center justify-center text-orange-500">
                        <div className="flex flex-col items-center gap-2">
                            <Rocket className="animate-bounce" size={32} />
                            <span className="animate-pulse text-sm">Loading hype meter...</span>
                        </div>
                    </div>
                 ) : (
                    <div 
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto pb-12 pt-4 px-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {list.map((anime, idx) => (
                            <div key={`upcoming-${anime.id}-${idx}`} className="snap-center flex-shrink-0">
                                <AnimeCard anime={anime} index={idx} onPlay={onPlay} />
                            </div>
                        ))}
                    </div>
                 )}
             </AnimatePresence>
        </div>
    );
};

export default TopUpcomingSection;
