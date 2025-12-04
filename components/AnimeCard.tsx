
import React from 'react';
import { Anime } from '../types';
import { Star, Hash, Target, Clock, Heart, Tv, Calendar, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWatchlist } from '../context/WatchlistContext';

interface AnimeCardProps {
  anime: Anime;
  index: number;
  className?: string;
  onPlay?: (anime: Anime) => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, index, className, onPlay }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const isBookmarked = isInWatchlist(anime.id);

  const toggleWatchlist = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (isBookmarked) {
          removeFromWatchlist(anime.id);
      } else {
          addToWatchlist(anime);
      }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onPlay) {
          onPlay(anime);
      }
  };

  const formatBroadcastTime = (time: string) => {
    try {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setUTCHours(hours - 9);
        date.setUTCMinutes(minutes);
        date.setUTCSeconds(0);
        date.setUTCMilliseconds(0);

        const localTime = new Intl.DateTimeFormat('default', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(date);

        const timeZoneName = new Intl.DateTimeFormat('default', {
            timeZoneName: 'short'
        }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || '';

        return `${localTime} ${timeZoneName}`;
    } catch (e) {
        return `${time} JST`;
    }
  };

  // Calculate estimated current episode
  const getEstimatedEpisode = () => {
    if (!anime.airedFrom || anime.status !== 'Currently Airing') return null;
    
    const start = new Date(anime.airedFrom);
    const now = new Date();
    
    // Check if start date is valid
    if (isNaN(start.getTime())) return null;

    const diffInMs = now.getTime() - start.getTime();
    if (diffInMs < 0) return 1; // Hasn't started but marked airing? Assume EP 1

    // Add 1 because if 0 weeks passed, we are on Ep 1
    const currentEp = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7)) + 1;
    
    if (anime.episodes && currentEp > anime.episodes) return anime.episodes;
    
    return currentEp;
  };

  const currentEpisode = getEstimatedEpisode();
  const isUpcoming = anime.status === "Not yet aired";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative h-[300px] w-[200px] sm:h-[340px] sm:w-[230px] flex-shrink-0 perspective-1000 z-0 hover:z-50 ${className || ''}`}
    >
      <div className={`relative w-full h-full duration-500 transition-all transform-gpu group-hover:scale-[1.05] group-hover:-translate-y-2`}>
        {/* Glow Effect */}
        <div className={`absolute -inset-0.5 rounded-xl blur opacity-0 group-hover:opacity-60 transition duration-500 ${anime.isTarget ? 'bg-gradient-to-br from-green-500 to-cyan-500 opacity-30' : 'bg-gradient-to-br from-purple-600 to-pink-600'}`}></div>
        
        {/* Card Content */}
        <div className={`relative w-full h-full bg-[#0f0f16] rounded-xl overflow-hidden shadow-xl border flex flex-col ${anime.isTarget ? 'border-green-500/50' : 'border-white/10'}`}>
          {/* Image Section */}
          <div className="relative h-[68%] w-full overflow-hidden bg-gray-900 group-hover:shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
             {/* Badge Container - Z-Index 30 to stay above overlay */}
             <div className="absolute top-0 right-0 z-30 p-2 flex flex-col gap-1.5 items-end pointer-events-none">
                 {/* Watchlist Button */}
                 <button
                    onClick={toggleWatchlist}
                    className={`pointer-events-auto p-1.5 rounded-lg backdrop-blur-md transition-all duration-200 border border-white/10 shadow-lg group/btn hover:scale-110 active:scale-95 ${isBookmarked ? 'bg-pink-600 text-white' : 'bg-black/60 text-white hover:bg-pink-600'}`}
                    title={isBookmarked ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                    <Heart size={14} className={isBookmarked ? "fill-current" : "group-hover/btn:fill-current transition-all"} />
                </button>

                 {/* Target Badge */}
                 {anime.isTarget && (
                    <div className="bg-green-600/90 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10 shadow-lg">
                        <Target className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase">Result</span>
                    </div>
                 )}
                 {/* Rating Badge */}
                 <div className="bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-white/10 shadow-lg">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-white">{anime.rating}</span>
                 </div>
                 {/* Rank Badge */}
                 {anime.rank && !anime.isTarget && (
                    <div className="bg-purple-600/90 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-white/10 shadow-lg">
                        <Hash className="w-2.5 h-2.5 text-white" />
                        <span className="text-[10px] font-bold text-white">{anime.rank}</span>
                    </div>
                 )}
             </div>

             {/* Broadcast Time / Release Date Badge */}
             {isUpcoming && anime.airedString ? (
                 <div className="absolute top-0 left-0 z-30 p-2 pointer-events-none">
                     <div className="bg-orange-600/90 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/10 shadow-lg">
                        <Calendar className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide whitespace-nowrap">{anime.airedString}</span>
                     </div>
                 </div>
             ) : anime.broadcastTime && (
                 <div className="absolute top-0 left-0 z-30 p-2 pointer-events-none flex flex-col gap-1">
                     <div className="bg-cyan-600/90 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/10 shadow-lg group-hover:bg-cyan-600 group-hover:border-cyan-400 transition-colors">
                        <Clock className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide whitespace-nowrap">{formatBroadcastTime(anime.broadcastTime)}</span>
                     </div>
                     {/* Current Episode Badge for Daily/Airing Anime */}
                     {currentEpisode && (
                        <div className="bg-pink-600/90 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/10 shadow-lg animate-pulse">
                            <Play className="w-3 h-3 text-white fill-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wide whitespace-nowrap">EP {currentEpisode}</span>
                        </div>
                     )}
                 </div>
             )}
             
             {/* Watch Overlay */}
             <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 cursor-pointer" onClick={handlePlayClick}>
                {/* Primary Watch Button (Internal) */}
                <button 
                    onClick={handlePlayClick}
                    className="transform scale-95 hover:scale-105 transition-all duration-200 rounded-full px-5 py-3 shadow-xl flex items-center gap-2 justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold border border-white/10 mb-2 group/play"
                >
                   <Tv size={18} className="fill-white/20" />
                   <span>WATCH NOW</span>
                </button>
             </div>

            <img 
              src={anime.imageUrl} 
              alt={anime.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0f0f16] to-transparent pointer-events-none" />
          </div>

          {/* Text Section */}
          <div className="p-3 flex-1 flex flex-col relative z-10 -mt-6 pointer-events-none">
            <h3 className={`text-sm sm:text-base font-bold text-white line-clamp-2 leading-tight transition-colors drop-shadow-md min-h-[2.5rem] ${anime.isTarget ? 'text-green-400 group-hover:text-green-300' : 'group-hover:text-pink-400'}`}>
                {anime.title}
            </h3>
            
            <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                {anime.genres.slice(0, 2).map((g) => (
                    <span key={g} className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-gray-300 border border-white/5">
                        {g}
                    </span>
                ))}
                {anime.episodes && (
                    <span className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {anime.episodes} EP
                    </span>
                )}
            </div>
            
            <div className="flex-1 overflow-hidden relative">
                <p className="text-[9px] sm:text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                    {anime.description}
                </p>
                {anime.reason && (
                    <div className="mt-1 pt-1 border-t border-white/10">
                        <p className={`text-[8px] sm:text-[9px] italic ${anime.isTarget ? 'text-green-300' : 'text-purple-300'}`}>
                            <span className="font-bold">AI:</span> {anime.reason}
                        </p>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimeCard;
