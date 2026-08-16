import { API_URL } from '../config/api';
import { 
  BookSummary, 
  BookDetail, 
  BookChapterDetail, 
  Tradition, 
  Category, 
  UserLibraryData, 
  UserBookPreference,
  Bookmark
} from '../types/books';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const booksApi = {
  // Fetch traditions
  getTraditions: async (): Promise<Tradition[]> => {
    try {
      const res = await fetch(`${API_URL}/books/traditions`);
      if (!res.ok) throw new Error('Failed to fetch traditions');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // Fetch categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await fetch(`${API_URL}/books/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // List books with search and filters
  getBooks: async (params?: {
    tradition?: string;
    category?: string;
    search?: string;
    featured?: boolean;
  }): Promise<BookSummary[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.tradition && params.tradition !== 'all') query.append('tradition', params.tradition);
      if (params?.category && params.category !== 'all') query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.featured !== undefined) query.append('featured', String(params.featured));

      const res = await fetch(`${API_URL}/books?${query.toString()}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch books');
      const data = await res.json();
      
      // Cache books summary in localStorage for offline access
      try {
        localStorage.setItem('619_cached_books', JSON.stringify(data));
      } catch (e) {}

      return data;
    } catch (e) {
      console.warn('Network error fetching books, falling back to cache', e);
      try {
        const cached = localStorage.getItem('619_cached_books');
        if (cached) return JSON.parse(cached);
      } catch (err) {}
      return [];
    }
  },

  // Get book detail
  getBookDetail: async (bookId: number): Promise<BookDetail | null> => {
    try {
      const res = await fetch(`${API_URL}/books/${bookId}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch book detail');
      const data = await res.json();
      try {
        localStorage.setItem(`619_book_detail_${bookId}`, JSON.stringify(data));
      } catch (e) {}
      return data;
    } catch (e) {
      console.warn('Network error fetching book detail, checking cache', e);
      try {
        const cached = localStorage.getItem(`619_book_detail_${bookId}`);
        if (cached) return JSON.parse(cached);
      } catch (err) {}
      return null;
    }
  },

  // Get chapter content
  getChapter: async (bookId: number, chapterNumber: number): Promise<BookChapterDetail | null> => {
    try {
      const res = await fetch(`${API_URL}/books/${bookId}/chapters/${chapterNumber}`);
      if (!res.ok) throw new Error('Failed to fetch chapter');
      const data = await res.json();
      // Cache chapter for offline reading
      try {
        localStorage.setItem(`619_chapter_${bookId}_${chapterNumber}`, JSON.stringify(data));
      } catch (e) {}
      return data;
    } catch (e) {
      console.warn('Offline reading fallback for chapter', e);
      try {
        const cached = localStorage.getItem(`619_chapter_${bookId}_${chapterNumber}`);
        if (cached) return JSON.parse(cached);
      } catch (err) {}
      return null;
    }
  },

  // Get user library (continue reading, favorites, bookmarks)
  getUserLibrary: async (): Promise<UserLibraryData> => {
    try {
      const res = await fetch(`${API_URL}/user/library`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch user library');
      const data = await res.json();
      try {
        localStorage.setItem('619_user_library', JSON.stringify(data));
      } catch (e) {}
      return data;
    } catch (e) {
      console.warn('Fallback to cached user library', e);
      try {
        const cached = localStorage.getItem('619_user_library');
        if (cached) return JSON.parse(cached);
      } catch (err) {}
      return { continue_reading: [], favorites: [], bookmarks: [] };
    }
  },

  // Toggle favorite
  toggleFavorite: async (bookId: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/user/books/${bookId}/favorite`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to toggle favorite');
      const data = await res.json();
      return data.is_favorite;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // Update reading progress
  updateProgress: async (bookId: number, chapterNumber: number, progressPercent: number, position = "0") => {
    try {
      await fetch(`${API_URL}/user/books/${bookId}/progress`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          chapter_number: chapterNumber,
          progress_percent: progressPercent,
          position: position
        })
      });
    } catch (e) {
      console.warn('Failed to sync reading progress online', e);
    }
  },

  // User tradition & reader preferences
  getUserPreferences: async (): Promise<UserBookPreference> => {
    try {
      const res = await fetch(`${API_URL}/user/preferences/books`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch user preferences');
      const data = await res.json();
      localStorage.setItem('619_book_pref_tradition', data.preferred_tradition_slug);
      return data;
    } catch (e) {
      const cached = localStorage.getItem('619_book_pref_tradition') || 'all';
      return { preferred_tradition_slug: cached, reader_font_size: 18, reader_theme: 'dark' };
    }
  },

  updateUserPreferences: async (pref: Partial<UserBookPreference>): Promise<UserBookPreference | null> => {
    try {
      if (pref.preferred_tradition_slug) {
        localStorage.setItem('619_book_pref_tradition', pref.preferred_tradition_slug);
      }
      const res = await fetch(`${API_URL}/user/preferences/books`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(pref)
      });
      if (!res.ok) throw new Error('Failed to update preferences');
      return await res.json();
    } catch (e) {
      console.warn('Offline preference update', e);
      return null;
    }
  },

  // Save Bookmark
  createBookmark: async (bookmark: { book_id: number; chapter_number: number; title: string; selected_text?: string; note?: string }): Promise<Bookmark | null> => {
    try {
      const res = await fetch(`${API_URL}/user/bookmarks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookmark)
      });
      if (!res.ok) throw new Error('Failed to create bookmark');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  deleteBookmark: async (bookmarkId: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/user/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};
