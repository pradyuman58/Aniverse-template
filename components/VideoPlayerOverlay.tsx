
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Server, MonitorPlay, ChevronLeft, ChevronRight, SkipForward, PlayCircle } from 'lucide-react';
import { Anime } from '../types';
import { searchRemoteAnime, getAnimeEpisodes, getStreamUrl, StreamEpisode, saveWatchProgress } from '../services/streamingService';
import CommentsSection from './CommentsSection';
import RecommendedForYouSection from './RecommendedForYouSection';
import { useAuth } from '../context/AuthContext';

interface VideoPlayerOverlayProps {
    anime: Anime | null;
    onClose: () => void;
    onPlay?: (anime: Anime) => void;
}

const VideoPlayerOverlay: React.FC<VideoPlayerOverlayProps> = ({ anime, onClose, onPlay }) => {
    const [loading, setLoading] = useState(true);
    const [episodes, setEpisodes] = useState<StreamEpisode[]>([]);
    const [currentEpisode, setCurrentEpisode] = useState<StreamEpisode | null>(null);
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [provider, setProvider] = useState<string>('server1');
    const [autoPlay, setAutoPlay] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (anime) {
            initPlayer();
        }
    }, [anime, provider]);

    const initPlayer = async () => {
        if (!anime) return;

        setLoading(true);
        setEpisodes([]);
        setEmbedUrl(null);
        setCurrentEpisode(null);
        
        try {
            const remoteAnime = await searchRemoteAnime(anime.title, provider);
            if (remoteAnime) {
                const epList = await getAnimeEpisodes(remoteAnime.id, provider);
                setEpisodes(epList);
                if (epList.length > 0) {
                    loadEpisode(epList[0]);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadEpisode = async (episode: StreamEpisode) => {
        setCurrentEpisode(episode);
        setLoading(true);
        
        if (anime) {
            // SAVE PROGRESS automatically
            saveWatchProgress(anime, episode.number, user?.id);
        }

        const url = await getStreamUrl(episode.id, provider);
        setEmbedUrl(url); 
        setLoading(false);
    };

    // Navigation Logic
    const currentIndex = episodes.findIndex(ep => ep.id === currentEpisode?.id);
    const hasNext = currentIndex !== -1 && currentIndex < episodes.length - 1;
    const hasPrev = currentIndex > 0;

    const playNext = () => {
        if (hasNext) {
            loadEpisode(episodes[currentIndex + 1]);
        }
    };

    const playPrev = () => {
        if (hasPrev) {
            loadEpisode(episodes[currentIndex - 1]);
        }
    };

    if (!anime) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md">
             {/* Header */}
             <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button 
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <div>
                        <h2 className="text-white font-bold text-lg md:text-xl truncate max-w-md md:max-w-2xl leading-none">
                            {anime.title}
                        </h2>
                        {currentEpisode && (
                            <span className="text-purple-400 text-sm font-mono">
                                Playing Episode {currentEpisode.number}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 bg-black/50 p-1 rounded-lg border border-white/10 pointer-events-auto">
                    <button 
                        onClick={() => setProvider('server1')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${provider === 'server1' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Server size={12} /> Server 1
                    </button>
                    <button 
                        onClick={() => setProvider('server2')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${provider === 'server2' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Server size={12} /> Server 2
                    </button>
                </div>
             </div>

             <div className="w-full h-full flex flex-col md:flex-row pt-20 pb-4 px-4 gap-4 overflow-hidden">
                 {/* Left Column */}
                 <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                     <div className="relative w-full aspect-video bg-[#050508] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center group shadow-2xl shrink-0">
                        {loading ? (
                            <div className="flex flex-col items-center gap-4 text-purple-400">
                                <Loader2 className="w-12 h-12 animate-spin" />
                                <span className="animate-pulse font-mono">Loading Stream...</span>
                            </div>
                        ) : embedUrl ? (
                            <iframe 
                                src={embedUrl} 
                                className="w-full h-full"
                                allowFullScreen
                                title="Player"
                            />
                        ) : (
                            <div className="text-center p-8 max-w-lg">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MonitorPlay className="w-10 h-10 text-gray-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Video Player Template</h3>
                                <p className="text-gray-400 mb-6">
                                    This is a template overlay. No streaming content is connected by default. 
                                    Integrate your own API in <code>services/streamingService.ts</code>.
                                </p>
                            </div>
                        )}
                     </div>

                     {/* Controls Bar */}
                     <div className="flex items-center justify-between bg-[#1a1a2e] p-3 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAutoPlay(!autoPlay)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${autoPlay ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-400 border border-white/5'}`}
                            >
                                <PlayCircle size={14} />
                                Auto-play: {autoPlay ? 'ON' : 'OFF'}
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={playPrev}
                                disabled={!hasPrev || loading}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-sm font-bold text-white border border-white/5"
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <button
                                onClick={playNext}
                                disabled={!hasNext || loading}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-600 transition-all text-sm font-bold text-white shadow-lg"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                     </div>

                     {/* Recommended For You */}
                     <RecommendedForYouSection animeId={anime.id} onPlay={onPlay} />

                     {/* Comments Section */}
                     <CommentsSection animeId={anime.id} />
                 </div>

                 {/* Right Column: Episode List */}
                 <div className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-[#0f0f16] rounded-xl border border-white/10 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h3 className="font-bold text-white">Episodes</h3>
                        <p className="text-xs text-gray-400 mt-1">{episodes.length} Episodes available</p>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {loading && episodes.length === 0 ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-500" /></div>
                        ) : (
                            <div className="grid grid-cols-4 md:grid-cols-3 gap-2">
                                {episodes.map((ep) => (
                                    <button
                                        key={ep.id}
                                        onClick={() => loadEpisode(ep)}
                                        className={`p-2 rounded-lg text-sm font-bold transition-all ${currentEpisode?.id === ep.id ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {ep.number}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                 </div>
             </div>
        </div>
    );
};

export default VideoPlayerOverlay;
