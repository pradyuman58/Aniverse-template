
import React, { useState } from 'react';
import { searchAnimeList } from '../services/animeApi';
import { Anime } from '../types';
import AnimeCard from './AnimeCard';
import { Search, Loader2, AlertTriangle, Database } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendationSectionProps {
    onPlay?: (anime: Anime) => void;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({ onPlay }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Anime[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setResults([]);
    setError(null);

    try {
      const data = await searchAnimeList(prompt);
      if (data.length === 0) {
          throw new Error("No anime found matching your query.");
      }
      setResults(data);
    } catch (err: any) {
      console.error("Failed to fetch", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 container mx-auto px-4 py-16" id="ai-recs">
      <div className="text-center mb-12">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-900/30 border border-blue-500/50 text-blue-300 mb-4"
        >
            <Database size={16} />
            <span className="text-sm font-semibold uppercase tracking-widest">Anime Database</span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4">
          Search Anime
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Search through our massive database to find your favorite series, movies, and OVAs.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-16 relative">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
          <div className="relative flex bg-[#12121f] rounded-lg overflow-hidden border border-white/10">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'One Piece', 'Attack on Titan'..."
              className="w-full bg-transparent px-6 py-4 text-white placeholder-gray-500 outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 bg-white/5 hover:bg-white/10 border-l border-white/10 text-white transition-colors disabled:opacity-50 min-w-[80px] flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
            </button>
          </div>
        </form>
        {error && (
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
                <div className="flex items-center gap-2 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="flex flex-wrap justify-center gap-8 md:gap-10 pb-12">
          {results.map((anime, index) => (
            <AnimeCard key={anime.id || index} anime={anime} index={index} onPlay={onPlay} />
          ))}
        </div>
      )}

      {hasSearched && !isLoading && !error && results.length === 0 && (
        <div className="text-center text-gray-500 py-12 bg-white/5 rounded-xl border border-white/5">
          <p className="text-lg">No results found.</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationSection;
