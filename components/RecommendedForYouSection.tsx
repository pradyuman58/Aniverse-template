
import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { getRecommendations } from '../services/animeApi';
import { Anime } from '../types';
import AnimeCard from './AnimeCard';
import { motion } from 'framer-motion';

interface RecommendedForYouSectionProps {
    animeId: string;
    onPlay?: (anime: Anime) => void;
}

const RecommendedForYouSection: React.FC<RecommendedForYouSectionProps> = ({ animeId, onPlay }) => {
    const [list, setList] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRecs = async () => {
            setLoading(true);
            try {
                const data = await getRecommendations(animeId);
                setList(data);
            } catch (e) {
                console.error("Failed to load recommendations", e);
            } finally {
                setLoading(false);
            }
        };
        fetchRecs();
    }, [animeId]);

    if (!loading && list.length === 0) return null;

    return (
        <div className="mt-6 mb-8 border-b border-white/5 pb-8">
             <div className="flex items-center gap-2 mb-4 text-white px-1">
                <Sparkles className="text-yellow-400" size={20} />
                <h3 className="font-bold text-lg">Recommended For You</h3>
            </div>
            
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-purple-500" />
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
                    {list.map((anime, idx) => (
                        <div key={`rec-${anime.id}`} className="flex-shrink-0 snap-start">
                            <AnimeCard 
                                anime={anime} 
                                index={idx} 
                                onPlay={onPlay} 
                                className="!w-[160px] !h-[240px] sm:!w-[180px] sm:!h-[270px]" // Override size for compact view in overlay
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecommendedForYouSection;
