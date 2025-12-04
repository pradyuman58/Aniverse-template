
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Hash, Loader2, Play, Tv } from 'lucide-react';
import { getTopAnime } from '../services/animeApi';
import { Anime } from '../types';

interface Top100OverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onPlay?: (anime: Anime) => void;
}

const Top100Overlay: React.FC<Top100OverlayProps> = ({ isOpen, onClose, onPlay }) => {
    const [list, setList] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && list.length === 0) {
            fetchTop100();
        }
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const fetchTop100 = async () => {
        setLoading(true);
        try {
            // Fetch first 4 pages for top 100
            const p1 = await getTopAnime(1);
            setList(prev => [...prev, ...p1]);
            const p2 = await getTopAnime(2);
            setList(prev => { const ids = new Set(prev.map(a => a.id)); return [...prev, ...p2.filter(a => !ids.has(a.id))]; });
            const p3 = await getTopAnime(3);
             setList(prev => { const ids = new Set(prev.map(a => a.id)); return [...prev, ...p3.filter(a => !ids.has(a.id))]; });
             const p4 = await getTopAnime(4);
             setList(prev => { const ids = new Set(prev.map(a => a.id)); return [...prev, ...p4.filter(a => !ids.has(a.id))]; });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                className="relative w-full max-w-5xl h-[90vh] bg-[#0f0f16] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-transparent">
                    <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-2">
                            <Hash className="text-purple-500" /> Top 100 Anime
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Global Rankings • Real-time Data</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white">
                        <X size={24} />
                    </button>
                </div>
                <div ref={containerRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {list.length === 0 && loading ? (
                         <div className="flex h-full items-center justify-center flex-col gap-4 text-gray-500">
                             <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                             <p>Loading the best anime...</p>
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {list.map((anime, index) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    key={`${anime.id}-${index}`}
                                    className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group"
                                >
                                    <div className="w-12 text-center flex-shrink-0">
                                        <span className={`text-2xl font-black ${index < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                            #{anime.rank || index + 1}
                                        </span>
                                    </div>
                                    <div className="w-16 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-800 relative group-poster">
                                        <img src={anime.imageUrl} alt={anime.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" loading="lazy" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-white truncate group-hover:text-pink-400 transition-colors">
                                            {anime.title}
                                        </h3>
                                        <div className="flex gap-2 text-xs text-gray-400 mt-1">
                                            <span>{anime.year || 'Unknown'}</span>
                                            <span>•</span>
                                            <span>{anime.episodes ? `${anime.episodes} eps` : 'TV'}</span>
                                            <span>•</span>
                                            <span className="truncate">{anime.genres.slice(0, 3).join(', ')}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Watch Now Button */}
                                        <button 
                                            onClick={() => onPlay && onPlay(anime)}
                                            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
                                        >
                                            <Tv size={16} />
                                            <span>Watch</span>
                                        </button>
                                    </div>
                                    <div className="w-20 text-right flex-shrink-0 border-l border-white/10 pl-4 hidden sm:block">
                                        <div className="flex items-center justify-end gap-1 text-yellow-400 font-bold text-xl">
                                            <Star className="w-5 h-5 fill-current" />
                                            {anime.rating}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Score</p>
                                    </div>
                                </motion.div>
                            ))}
                            {loading && list.length > 0 && (
                                <div className="py-4 text-center text-gray-400 flex justify-center items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading more...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Top100Overlay;
