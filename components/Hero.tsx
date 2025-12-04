
import React from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Hash } from 'lucide-react';

interface HeroProps {
    onOpenTop100: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenTop100 }) => {
    const scrollToAi = () => {
        const el = document.getElementById('ai-recs');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    const scrollToRankings = () => {
        const el = document.getElementById('rankings');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Overlay Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
             <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-4 drop-shadow-2xl">
                ANI<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">VERSE</span>
             </h1>
        </motion.div>

        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 font-light"
        >
            Discover your next obsession in the 3rd Dimension.
        </motion.p>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col gap-4 items-center justify-center w-full max-w-sm mx-auto"
        >
            {/* Primary Action - Search Anime */}
            <button 
                onClick={scrollToAi}
                className="w-full group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(236,72,153,0.4)]"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors">
                    <Search size={20} className="stroke-[3px]" />
                    <span>Search Anime</span>
                </div>
            </button>

            {/* Secondary Action - Explore Rankings */}
            <button 
                onClick={scrollToRankings}
                className="w-full px-8 py-4 bg-[#12121f]/60 border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/10 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] transition-all backdrop-blur-sm flex items-center justify-center gap-2"
            >
                <TrendingUp size={20} />
                <span>Explore Anime</span>
            </button>
            
            {/* Tertiary Action - Top 100 Overlay */}
            <button 
                onClick={onOpenTop100}
                className="w-full px-8 py-3 bg-transparent border border-white/5 text-gray-400 font-semibold text-base rounded-full hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
            >
                <Hash size={16} />
                <span>Explore Top 100 List</span>
            </button>
        </motion.div>
      </div>
      
      {/* Decorative Gradient at bottom to blend into content */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default Hero;
