
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ThumbsUp, User } from 'lucide-react';
import { Comment, getComments, saveComment } from '../services/streamingService';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentsSectionProps {
    animeId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ animeId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        setComments(getComments(animeId));
    }, [animeId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const comment = saveComment(animeId, newComment);
        if (comment) {
            setComments(prev => [comment, ...prev]);
            setNewComment('');
        }
    };

    const formatTime = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <div className="bg-[#0f0f16] rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6 text-white">
                <MessageSquare className="text-purple-500" size={20} />
                <h3 className="font-bold text-lg">Comments</h3>
                <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-gray-400">
                    {comments.length}
                </span>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                    <User size={20} className="text-purple-400" />
                </div>
                <div className="flex-1 relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Join the discussion..."
                        className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 min-h-[80px] resize-none transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute bottom-3 right-3 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-all"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="flex flex-col gap-6">
                <AnimatePresence initial={false}>
                    {comments.map((comment) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 group"
                        >
                            <img
                                src={comment.avatar}
                                alt={comment.username}
                                className="w-10 h-10 rounded-full bg-white/5 object-cover border border-white/5"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm text-white hover:text-purple-400 transition-colors cursor-pointer">
                                        {comment.username}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatTime(comment.timestamp)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed mb-2">
                                    {comment.content}
                                </p>
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-pink-400 transition-colors group/like">
                                        <ThumbsUp size={12} className="group-hover/like:stroke-pink-400" />
                                        <span>{comment.likes}</span>
                                    </button>
                                    <button className="text-xs text-gray-500 hover:text-white transition-colors">
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CommentsSection;
