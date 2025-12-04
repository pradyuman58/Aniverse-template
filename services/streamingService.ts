
// TEMPLATE SERVICE: STREAMING INTEGRATION
// ==========================================

export interface StreamEpisode {
    id: string;
    number: number;
    url?: string;
    title?: string;
}

export interface StreamResult {
    id: string;
    title: string;
    url?: string;
    image?: string;
    releaseDate?: string;
    type?: string;
}

export interface WatchHistoryItem {
    animeId: string;
    animeTitle: string;
    animeImage: string;
    episodeNumber: number;
    timestamp: number;
}

export interface Comment {
    id: string;
    userId: string;
    username: string;
    avatar: string;
    content: string;
    timestamp: number;
    likes: number;
}

// Helper to switch keys based on login state
const getHistoryKey = (userId?: string) => userId ? `aniverse_history_${userId}` : 'aniverse_history_guest';
const COMMENTS_KEY = 'aniverse_comments';

// Save progress to local storage (User Specific)
export const saveWatchProgress = (anime: any, episodeNumber: number, userId?: string) => {
    try {
        const key = getHistoryKey(userId);
        const historyStr = localStorage.getItem(key);
        let history: WatchHistoryItem[] = historyStr ? JSON.parse(historyStr) : [];

        // Remove existing entry for this anime to bump it to top
        history = history.filter(h => h.animeId !== anime.id);

        history.unshift({
            animeId: anime.id,
            animeTitle: anime.title,
            animeImage: anime.imageUrl,
            episodeNumber: episodeNumber,
            timestamp: Date.now()
        });

        // Limit history size
        if (history.length > 20) history = history.slice(0, 20);

        localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {
        console.error("Failed to save history", e);
    }
};

// Retrieve history (User Specific)
export const getWatchHistory = (userId?: string): WatchHistoryItem[] => {
    try {
        const key = getHistoryKey(userId);
        const history = localStorage.getItem(key);
        return history ? JSON.parse(history) : [];
    } catch (e) {
        return [];
    }
};

export const getComments = (animeId: string): Comment[] => {
    try {
        const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
        const animeComments = allComments[animeId] || [];
        if (animeComments.length === 0) return generateMockComments();
        return animeComments;
    } catch (e) {
        return generateMockComments();
    }
};

export const saveComment = (animeId: string, content: string, user?: { id: string, name: string, avatar: string }) => {
    try {
        const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
        const animeComments = allComments[animeId] || [];
        
        const newComment: Comment = {
            id: Date.now().toString(),
            userId: user?.id || 'guest',
            username: user?.name || 'Guest',
            avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest`,
            content: content,
            timestamp: Date.now(),
            likes: 0
        };

        allComments[animeId] = [newComment, ...animeComments];
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
        return newComment;
    } catch (e) {
        console.error("Failed to save comment", e);
        return null;
    }
};

const generateMockComments = (): Comment[] => {
    return [
        {
            id: '1',
            userId: 'user-1',
            username: 'AnimeFan99',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            content: 'This episode was absolutely insane! The animation quality is top tier.',
            timestamp: Date.now() - 3600000,
            likes: 45
        },
        {
            id: '2',
            userId: 'user-2',
            username: 'MangaReader',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
            content: 'Wait until the next arc, it gets even better.',
            timestamp: Date.now() - 7200000,
            likes: 12
        }
    ];
};

// TEMPLATE: Mock Streaming Functions
export const searchRemoteAnime = async (query: string, provider = 'default'): Promise<StreamResult | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id: 'mock-anime-id', title: query, type: 'TV' });
        }, 500);
    });
};

export const getAnimeEpisodes = async (id: string, provider = 'default'): Promise<StreamEpisode[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const episodes = Array.from({ length: 24 }, (_, i) => ({
                id: `episode-${i + 1}`,
                number: i + 1,
                title: `Episode ${i + 1}`
            }));
            resolve(episodes);
        }, 500);
    });
};

export const getStreamUrl = async (episodeId: string, provider = 'default'): Promise<string | null> => {
    return new Promise((resolve) => {
        setTimeout(() => { resolve(null); }, 500);
    });
};
