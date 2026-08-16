export interface Tradition {
  id: number;
  name: string;
  name_ar?: string;
  name_ur?: string;
  slug: string;
  parent_id?: number | null;
  description?: string;
  sort_order: number;
}

export interface Category {
  id: number;
  name: string;
  name_ar?: string;
  name_ur?: string;
  slug: string;
  icon_name: string;
  description?: string;
  sort_order: number;
}

export interface Author {
  id: number;
  name: string;
  name_ar?: string;
  name_ur?: string;
  death_year_hijri?: string;
  bio?: string;
}

export interface BookSummary {
  id: number;
  title: string;
  title_ar?: string;
  title_ur?: string;
  slug: string;
  description?: string;
  language: string;
  publication_year?: string;
  cover_url?: string;
  copyright_status: string;
  is_readable: boolean;
  is_downloadable: boolean;
  featured: boolean;
  total_chapters: number;
  author?: Author;
  tradition?: Tradition;
  category?: Category;
  is_favorite: boolean;
  progress_percent: number;
  last_chapter: number;
}

export interface BookChapterSummary {
  id: number;
  chapter_number: number;
  title: string;
  title_ar?: string;
  title_ur?: string;
}

export interface BookChapterDetail extends BookChapterSummary {
  content_ar?: string;
  content_en?: string;
  content_ur?: string;
}

export interface BookSource {
  id: number;
  provider: string;
  web_url?: string;
  pdf_url?: string;
  can_host: boolean;
  can_download: boolean;
}

export interface BookDetail extends BookSummary {
  chapters: BookChapterSummary[];
  sources: BookSource[];
}

export interface Bookmark {
  id: number;
  book_id: number;
  book_title?: string;
  chapter_number: number;
  title: string;
  selected_text?: string;
  note?: string;
  created_at: string;
}

export interface UserLibraryData {
  continue_reading: BookSummary[];
  favorites: BookSummary[];
  bookmarks: Bookmark[];
}

export interface UserBookPreference {
  preferred_tradition_slug: string;
  reader_font_size: number;
  reader_theme: string;
}
