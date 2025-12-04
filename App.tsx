
import React, { Suspense, useState } from 'react';
import ThreeBackground from './components/ThreeBackground';
import Hero from './components/Hero';
import RecommendationSection from './components/RecommendationSection';
import TopLists from './components/TopLists';
import DailyReleaseSection from './components/DailyReleaseSection';
import RecentlyWatchedSection from './components/RecentlyWatchedSection';
import TopUpcomingSection from './components/TopUpcomingSection';
import Top100Overlay from './components/Top100Overlay';
import WatchlistOverlay from './components/WatchlistOverlay';
import VideoPlayerOverlay from './components/VideoPlayerOverlay';
import AuthModal from './components/AuthModal';
import { Loader2, Flame, Heart, LogIn, User as UserIcon, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { WatchlistProvider, useWatchlist } from './context/WatchlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Anime } from './types';

const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
    <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
  </div>
);

const Navbar = ({ onOpenWatchlist, onOpenAuth }: { onOpenWatchlist: () => void, onOpenAuth: () => void }) => {
    const { watchlist } = useWatchlist();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
            <div className="text-xl font-bold tracking-widest text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-sm">AV</span>
                </div>
                AniVerse
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-300">
                    <a href="#" className="hover:text-white transition-colors">Home</a>
                    <a href="#" className="hover:text-white transition-colors">Seasonal</a>
                    <a href="#" className="hover:text-white transition-colors">Manga</a>
                </div>
                
                <button 
                    onClick={onOpenWatchlist}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-pink-500 transition-all group"
                >
                    <Heart size={16} className="text-pink-500 group-hover:fill-pink-500 transition-all" />
                    <span className="text-sm font-bold hidden sm:inline">Watchlist</span>
                    {watchlist.length > 0 && (
                        <span className="ml-1 bg-pink-600 text-[10px] px-1.5 py-0.5 rounded-full text-white">
                            {watchlist.length}
                        </span>
                    )}
                </button>

                {/* Login / User Profile */}
                {user ? (
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
                        >
                            <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full bg-purple-600" />
                            <span className="text-sm font-bold truncate max-w-[100px]">{user.name}</span>
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1"
                                >
                                    <div className="px-4 py-2 border-b border-white/5">
                                        <p className="text-xs text-gray-400">Signed in as</p>
                                        <p className="text-sm font-bold text-white truncate">{user.email}</p>
                                    </div>
                                    <button 
                                        onClick={() => { logout(); setShowUserMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                                    >
                                        <LogOut size={14} /> Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <button 
                        onClick={onOpenAuth}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-purple-600 text-white font-bold text-sm hover:bg-purple-500 transition-all shadow-lg hover:shadow-purple-500/30"
                    >
                        <LogIn size={16} />
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
};

const Footer = () => (
    <footer className="relative z-10 border-t border-white/5 bg-black py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">AniVerse 3D</h3>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                The most immersive anime discovery platform on the web. Powered by Gemini AI and Three.js.
            </p>
            <div className="flex justify-center gap-6 text-gray-400">
                <a href="#" className="hover:text-pink-500 transition-colors">Twitter</a>
                <a href="#" className="hover:text-pink-500 transition-colors">Discord</a>
                <a href="#" className="hover:text-pink-500 transition-colors">Github</a>
            </div>
            <p className="mt-8 text-xs text-gray-700">© 2024 AniVerse. All rights reserved.</p>
        </div>
    </footer>
);

const trendingAnime = [
    "Solo Leveling",
    "Frieren: Beyond Journey's End",
    "Jujutsu Kaisen",
    "One Piece",
    "Bleach: Thousand-Year Blood War",
    "Demon Slayer",
    "Chainsaw Man"
];

const AppContent: React.FC = () => {
  const [showTop100, setShowTop100] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [playingAnime, setPlayingAnime] = useState<Anime | null>(null);

  const handlePlay = (anime: Anime) => {
      setPlayingAnime(anime);
      setShowTop100(false);
      setShowWatchlist(false);
  };

  return (
    <div className="min-h-screen text-white relative selection:bg-pink-500 selection:text-white">
      <Suspense fallback={<Loader />}>
        <ThreeBackground />
      </Suspense>

      <Navbar 
        onOpenWatchlist={() => setShowWatchlist(true)} 
        onOpenAuth={() => setShowAuthModal(true)}
      />
      
      <main>
        <Hero onOpenTop100={() => setShowTop100(true)} />
        
        <div className="relative z-10 w-full bg-[#0a0a12]/80 backdrop-blur-md border-y border-white/5 py-4 overflow-hidden">
             <div className="container mx-auto px-4 flex items-center gap-4 text-sm text-gray-400">
                <Flame className="text-orange-500 w-4 h-4 animate-pulse flex-shrink-0" />
                <span className="font-bold text-white uppercase tracking-wider whitespace-nowrap">Trending Now:</span>
                <div className="flex gap-6 overflow-x-auto no-scrollbar whitespace-nowrap mask-linear-fade">
                    {trendingAnime.map((anime) => (
                        <span 
                            key={anime}
                            className="hover:text-pink-400 transition-colors cursor-default"
                        >
                            {anime}
                        </span>
                    ))}
                </div>
             </div>
        </div>

        <TopLists onPlay={handlePlay} />
        
        <DailyReleaseSection onPlay={handlePlay} />
        
        <RecentlyWatchedSection onPlay={handlePlay} />

        <TopUpcomingSection onPlay={handlePlay} />

        <div className="my-20 border-t border-white/5" />

        <RecommendationSection onPlay={handlePlay} />
      </main>

      <Footer />

      <AnimatePresence>
          {showTop100 && (
              <Top100Overlay 
                isOpen={showTop100} 
                onClose={() => setShowTop100(false)} 
                onPlay={handlePlay}
              />
          )}
          {showWatchlist && (
              <WatchlistOverlay 
                isOpen={showWatchlist} 
                onClose={() => setShowWatchlist(false)} 
                onPlay={handlePlay}
              />
          )}
          {showAuthModal && (
              <AuthModal 
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
              />
          )}
          {playingAnime && (
              <VideoPlayerOverlay 
                anime={playingAnime} 
                onClose={() => setPlayingAnime(null)} 
                onPlay={handlePlay}
              />
          )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <WatchlistProvider>
                <AppContent />
            </WatchlistProvider>
        </AuthProvider>
    );
};

export default App;
