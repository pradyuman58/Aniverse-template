
import React, { useState, useEffect, useRef } from 'react';
import { Anime } from '../types';
import AnimeCard from './AnimeCard';
import { Trophy, TrendingUp, Film, Loader2, Plus, Globe, Zap, CheckCircle, Heart, Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getTopAnime, 
    getPopularAnime, 
    getMovies, 
    getTopAiring, 
    getTrendingAnime, 
    getLatestCompleted,
    genreOptions
} from '../services/animeApi';

type TabType = 'trending' | 'most_popular' | 'most_favorite' | 'top_airing' | 'completed' | 'movies';

const GenreDropdown = ({ selected, onChange }: { selected: number[], onChange: (ids: number[]) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleGenre = (id: number) => {
        if (selected.includes(id)) {
            onChange(selected.filter(g => g !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 border ${isOpen || selected.length > 0 ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
                <Filter size={16} />
                <span>Filter</span>
                {selected.length > 0 && (
                    <span className="bg-white text-purple-600 text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {selected.length}
                    </span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-72 md:w-96 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 p-4"
                    >
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                            <h3 className="text-white font-bold text-sm">Select Genres</h3>
                            {selected.length > 0 && (
                                <button 
                                    onClick={() => onChange([])} 
                                    className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1"
                                >
                                    <X size={12} /> Clear All
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {genreOptions.map((genre) => {
                                const isSelected = selected.includes(genre.id);
                                return (
                                    <button
                                        key={genre.id}
                                        onClick={() => toggleGenre(genre.id)}
                                        className={`text-xs px-2 py-2 rounded-md transition-all text-left truncate flex items-center gap-2 ${isSelected ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-white' : 'bg-transparent border border-gray-500'}`} />
                                        {genre.name}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface TopListsProps {
    onPlay?: (anime: Anime) => void;
}

const TopLists: React.FC<TopListsProps> = ({ onPlay }) => {
    const [activeTab, setActiveTab] = useState<TabType>('trending');
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [animeList, setAnimeList] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Reset list when tab or genres change
    useEffect(() => {
        setAnimeList([]);
        setPage(1);
        fetchData(1, activeTab, selectedGenres, true);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
        }
    }, [activeTab, selectedGenres]);

    const fetchData = async (pageNum: number, tab: TabType, genres: number[], isReset: boolean) => {
        if (isReset) setLoading(true);
        else setLoadingMore(true);

        try {
            let data: Anime[] = [];
            switch (tab) {
                case 'trending':
                    data = await getTrendingAnime(pageNum, genres);
                    break;
                case 'most_popular':
                    data = await getPopularAnime(pageNum, genres);
                    break;
                case 'most_favorite':
                    data = await getTopAnime(pageNum, genres);
                    break;
                case 'top_airing':
                    data = await getTopAiring(pageNum, genres);
                    break;
                case 'completed':
                    data = await getLatestCompleted(pageNum, genres);
                    break;
                case 'movies':
                    data = await getMovies(pageNum, genres);
                    break;
            }
            
            setAnimeList(prev => isReset ? data : [...prev, ...data]);
        } catch (error) {
            console.error("Failed to fetch top lists", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchData(nextPage, activeTab, selectedGenres, false);
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode; color?: string }[] = [
        { id: 'trending', label: 'Trending', icon: <Zap size={16} />, color: 'text-orange-400' },
        { id: 'most_popular', label: 'Most Popular', icon: <Globe size={16} />, color: 'text-green-400' },
        { id: 'most_favorite', label: 'Most Favorite', icon: <Heart size={16} />, color: 'text-pink-400' },
        { id: 'top_airing', label: 'Top Airing', icon: <Trophy size={16} />, color: 'text-yellow-400' },
        { id: 'completed', label: 'Completed', icon: <CheckCircle size={16} />, color: 'text-cyan-400' },
        { id: 'movies', label: 'Movies', icon: <Film size={16} /> },
    ];

    return (
        <div id="rankings" className="relative z-10 container mx-auto py-12">
             <div className="px-4 flex flex-col gap-6 mb-8">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                            <TrendingUp className="text-pink-500" size={32} />
                            Rankings
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wide text-gray-300">
                                Global Charts
                            </span>
                            <span>Top anime & trending stats</span>
                        </div>
                    </div>
                    
                    {/* Genre Filter - Visible on Desktop/Mobile */}
                    <div className="hidden md:block">
                        <GenreDropdown selected={selectedGenres} onChange={setSelectedGenres} />
                    </div>
                </div>

                {/* Mobile Filter & Tabs Row */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Mobile Filter Button (Only shows on small screens) */}
                    <div className="md:hidden self-end">
                        <GenreDropdown selected={selectedGenres} onChange={setSelectedGenres} />
                    </div>

                    <div className="w-full overflow-x-auto pb-2 md:pb-0">
                        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md min-w-max">
                            {tabs.map((tab) => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <span className={activeTab === tab.id ? 'text-white' : tab.color || ''}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
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
                         <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                         <span className="text-purple-300 text-sm font-mono animate-pulse">Loading filtered charts...</span>
                     </motion.div>
                 ) : (
                     <motion.div 
                        key={`${activeTab}-${selectedGenres.join(',')}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                     >
                        {/* Horizontal Scroll Container */}
                        <div 
                            ref={scrollContainerRef}
                            className="flex gap-6 overflow-x-auto pb-12 pt-4 px-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {animeList.length > 0 ? animeList.map((anime, idx) => (
                                <div key={`${activeTab}-${anime.id}-${idx}`} className="snap-center flex-shrink-0">
                                    <AnimeCard anime={anime} index={idx} onPlay={onPlay} />
                                </div>
                            )) : (
                                <div className="w-full flex flex-col items-center justify-center py-20 text-gray-500 border border-white/5 rounded-2xl bg-white/5 mx-4">
                                    <p className="text-lg font-bold text-gray-400">No anime found matching filters.</p>
                                    <button 
                                        onClick={() => setSelectedGenres([])} 
                                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                                    >
                                        Clear Genres
                                    </button>
                                </div>
                            )}
                            
                            {/* Load More Button as the last card */}
                            {animeList.length > 0 && (
                                <div className="flex-shrink-0 w-[200px] h-[300px] sm:w-[230px] sm:h-[340px] flex items-center justify-center snap-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="group relative w-full h-full rounded-xl bg-[#1a1a2e]/50 border-2 border-dashed border-white/10 hover:border-pink-500 transition-all flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white"
                                    >
                                        {loadingMore ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <Plus size={32} />
                                        )}
                                        <span className="font-bold text-sm">Load More</span>
                                    </button>
                                </div>
                            )}
                        </div>
                     </motion.div>
                 )}
             </AnimatePresence>
        </div>
    );
};

export default TopLists;
