
const BASE_URL = 'https://api.jikan.moe/v4';

// Rate limiting queue system (Jikan allows ~3-4 req/sec)
const queue: (() => Promise<any>)[] = [];
let processing = false;

const processQueue = async () => {
  if (processing) return;
  processing = true;
  while (queue.length > 0) {
    const fn = queue.shift();
    if (fn) {
      await fn();
      await new Promise(r => setTimeout(r, 400)); // Increased delay slightly for safety
    }
  }
  processing = false;
};

const fetchJikan = async (endpoint: string) => {
  return new Promise<any>((resolve, reject) => {
    queue.push(async () => {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) {
           // If rate limited, just retry once after a longer delay or throw
           if (response.status === 429) {
               await new Promise(r => setTimeout(r, 1500));
               const retry = await fetch(`${BASE_URL}${endpoint}`);
               if (!retry.ok) throw new Error('API Rate Limit');
               const data = await retry.json();
               resolve(data);
               return;
           }
           throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        resolve(data);
      } catch (e) {
        console.warn("Jikan API Error", e);
        // Don't reject purely on console warn, but we need to handle network failure
        reject(e); 
      }
    });
    processQueue();
  });
};

export const mapJikanToAnime = (item: any): any => ({
  id: item.mal_id.toString(),
  mal_id: item.mal_id,
  title: item.title_english || item.title,
  rating: item.score || 'N/A',
  genres: item.genres?.map((g: any) => g.name) || [],
  description: item.synopsis || 'No description available.',
  imageUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
  year: item.year,
  episodes: item.episodes,
  rank: item.rank,
  status: item.status,
  members: item.members, // Added members count for popularity context
  broadcastTime: item.broadcast?.time || null,
  airedString: item.aired?.string || null,
  airedFrom: item.aired?.from || null
});

// Helper to get current day in JST
export const getCurrentJSTDay = () => {
  const date = new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstDate = new Date(utc + jstOffset);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[jstDate.getDay()];
};

export const genreOptions = [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Adventure' },
    { id: 4, name: 'Comedy' },
    { id: 8, name: 'Drama' },
    { id: 10, name: 'Fantasy' },
    { id: 14, name: 'Horror' },
    { id: 7, name: 'Mystery' },
    { id: 22, name: 'Romance' },
    { id: 24, name: 'Sci-Fi' },
    { id: 36, name: 'Slice of Life' },
    { id: 30, name: 'Sports' },
    { id: 37, name: 'Supernatural' },
    { id: 18, name: 'Mecha' },
    { id: 40, name: 'Psychological' },
    { id: 27, name: 'Shounen' },
    { id: 42, name: 'Seinen' },
    { id: 25, name: 'Shoujo' }
];

// Helper to construct genre query
const getGenreQuery = (genres: number[]) => genres.length > 0 ? `&genres=${genres.join(',')}` : '';

// "Most Favorite" - Top Rated by Score (All Time)
export const getTopAnime = async (page = 1, genres: number[] = []) => {
  if (genres.length > 0) {
      // Switch to search endpoint for filtering
      return fetchJikan(`/anime?order_by=score&sort=desc&page=${page}${getGenreQuery(genres)}`)
        .then(d => d.data.map(mapJikanToAnime));
  }
  const data = await fetchJikan(`/top/anime?page=${page}`);
  return data.data.map(mapJikanToAnime);
};

// "Most Popular" - All time popularity by members
export const getPopularAnime = async (page = 1, genres: number[] = []) => {
  if (genres.length > 0) {
      return fetchJikan(`/anime?order_by=members&sort=desc&page=${page}${getGenreQuery(genres)}`)
        .then(d => d.data.map(mapJikanToAnime));
  }
  const data = await fetchJikan(`/top/anime?filter=bypopularity&page=${page}`);
  return data.data.map(mapJikanToAnime);
};

// "Trending" - Top Airing by Popularity (Active Watchers)
export const getTrendingAnime = async (page = 1, genres: number[] = []) => {
    if (genres.length > 0) {
        return fetchJikan(`/anime?status=airing&order_by=members&sort=desc&page=${page}${getGenreQuery(genres)}`)
          .then(d => d.data.map(mapJikanToAnime));
    }
    const data = await fetchJikan(`/top/anime?filter=airing&type=tv&order_by=popularity&sort=asc&page=${page}`);
    return data.data.map(mapJikanToAnime);
};

// "Top Airing" - Top Airing by Score (Quality)
export const getTopAiring = async (page = 1, genres: number[] = []) => {
    if (genres.length > 0) {
        return fetchJikan(`/anime?status=airing&order_by=score&sort=desc&page=${page}${getGenreQuery(genres)}`)
          .then(d => d.data.map(mapJikanToAnime));
    }
    const data = await fetchJikan(`/top/anime?filter=airing&order_by=score&sort=desc&page=${page}`);
    return data.data.map(mapJikanToAnime);
};

// "Latest Completed" - Recently finished airing
export const getLatestCompleted = async (page = 1, genres: number[] = []) => {
    const data = await fetchJikan(`/anime?status=complete&order_by=end_date&sort=desc&min_score=6.5&page=${page}&limit=24${getGenreQuery(genres)}`);
    return data.data.map(mapJikanToAnime);
};

// "Top Upcoming"
export const getTopUpcoming = async (page = 1, genres: number[] = []) => {
    if (genres.length > 0) {
         return fetchJikan(`/anime?status=upcoming&order_by=members&sort=desc&page=${page}${getGenreQuery(genres)}`)
        .then(d => d.data.map(mapJikanToAnime));
    }
    const data = await fetchJikan(`/top/anime?filter=upcoming&page=${page}`);
    return data.data.map(mapJikanToAnime);
};

// "Movies"
export const getMovies = async (page = 1, genres: number[] = []) => {
  if (genres.length > 0) {
      return fetchJikan(`/anime?type=movie&order_by=score&sort=desc&page=${page}${getGenreQuery(genres)}`)
        .then(d => d.data.map(mapJikanToAnime));
  }
  const data = await fetchJikan(`/top/anime?type=movie&page=${page}`);
  return data.data.map(mapJikanToAnime);
};

// "Schedule" - Daily Releases
export const getSchedule = async (day: string, page = 1) => {
    const data = await fetchJikan(`/schedules?filter=${day}&page=${page}`);
    return data.data.map(mapJikanToAnime);
};

// Single Search (Legacy)
export const searchAnime = async (query: string) => {
  const data = await fetchJikan(`/anime?q=${encodeURIComponent(query)}&limit=1`);
  return data.data?.[0] ? mapJikanToAnime(data.data[0]) : null;
};

// List Search (New standard search)
export const searchAnimeList = async (query: string, page = 1) => {
    const data = await fetchJikan(`/anime?q=${encodeURIComponent(query)}&limit=12&page=${page}`);
    return data.data.map(mapJikanToAnime);
};

// Recommendations
export const getRecommendations = async (id: string) => {
    const data = await fetchJikan(`/anime/${id}/recommendations`);
    // Jikan returns array of { entry: { mal_id, title, images... }, ... }
    return data.data.map((item: any) => ({
        id: item.entry.mal_id.toString(),
        mal_id: item.entry.mal_id,
        title: item.entry.title,
        rating: '?', 
        genres: [], 
        description: 'Recommended based on your selection.',
        imageUrl: item.entry.images?.jpg?.large_image_url || item.entry.images?.jpg?.image_url,
        episodes: null,
        status: 'Unknown'
    })).slice(0, 10);
};
