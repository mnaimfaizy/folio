import api from './api';

// Types for API requests and responses
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends User {
  books: Book[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  email_verified?: boolean;
  sendVerificationEmail?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  email_verified?: boolean;
}

// Book interfaces
export interface Book {
  id: number;
  title: string;
  isbn: string | null;
  isbn10?: string | null;
  isbn13?: string | null;
  publishYear: number | null;
  author: string | null;
  cover: string | null;
  coverKey?: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  authors?: Author[];
}

export interface CreateBookRequest {
  title: string;
  isbn?: string;
  isbn10?: string;
  isbn13?: string;
  publishYear?: number;
  author?: string;
  cover?: string;
  coverKey?: string;
  description?: string;
  authors?: { name: string; id?: number }[];
  addToCollection?: boolean;
}

export interface UpdateBookRequest {
  title?: string;
  isbn?: string;
  isbn10?: string;
  isbn13?: string;
  publishYear?: number;
  author?: string;
  cover?: string;
  coverKey?: string;
  description?: string;
  authors?: { name: string; id?: number }[];
}

export type ExternalSource =
  | 'openlibrary'
  | 'googlebooks'
  | 'isbndb'
  | 'loc'
  | 'wikidata'
  | 'worldcat';

export type ExternalSearchType = 'title' | 'author' | 'isbn';

export interface ExternalBookResult {
  source: ExternalSource;
  title: string;
  authors: string[];
  isbn?: string;
  isbn10?: string;
  isbn13?: string;
  publishYear?: number;
  cover?: string;
  description?: string;
}

// Author interfaces
export interface Author {
  id: number;
  name: string;
  biography: string | null;
  birth_date: string | null;
  photo_url: string | null;
  createdAt: string;
  updatedAt: string;
  book_count?: number;
}

export interface CreateAuthorRequest {
  name: string;
  biography?: string;
  birth_date?: string;
  photo_url?: string;
}

export interface UpdateAuthorRequest {
  name?: string;
  biography?: string;
  birth_date?: string;
  photo_url?: string;
}

// Review interfaces
export interface Review {
  id: number;
  bookId: number;
  userId: number | null;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  book_title?: string;
  user_name?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

// Site Settings interfaces
export interface FooterLink {
  label: string;
  url: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SiteSettings {
  id: number;
  show_about_page: boolean;
  show_contact_page: boolean;
  site_name: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  seo_keywords: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_image_url: string | null;
  footer_text: string;
  footer_links: FooterLink[];
  social_links: SocialLink[];
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_form_enabled: boolean;
  smtp_enabled: boolean;
  smtp_from_name: string;
  smtp_from_email: string | null;
  email_test_rate_limit: number;
  email_test_count: number;
  email_test_reset_at: string;
  mobile_app_enabled: boolean;
  mobile_api_base_url: string | null;
  mobile_app_store_url: string | null;
  mobile_play_store_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateSiteSettingsRequest {
  show_about_page?: boolean;
  show_contact_page?: boolean;
  site_name?: string;
  site_description?: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  seo_keywords?: string | null;
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  hero_image_url?: string | null;
  footer_text?: string;
  footer_links?: FooterLink[];
  social_links?: SocialLink[];
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_address?: string | null;
  contact_form_enabled?: boolean;
  smtp_enabled?: boolean;
  smtp_from_name?: string;
  smtp_from_email?: string | null;
  email_test_rate_limit?: number;
  mobile_app_enabled?: boolean;
  mobile_api_base_url?: string | null;
  mobile_app_store_url?: string | null;
  mobile_play_store_url?: string | null;
}

export interface TestEmailResponse {
  message: string;
  sentTo?: string;
  remainingTests?: number;
  resetAt?: string;
  limit?: number;
}

const AdminService = {
  // User management
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<{ users: User[] }>('/api/admin/users');
    return response.data.users;
  },

  getUserById: async (id: number): Promise<UserDetail> => {
    const response = await api.get<{ user: UserDetail }>(
      `/api/admin/users/${id}`,
    );
    return response.data.user;
  },

  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post<{ user: User; message: string }>(
      '/api/admin/users',
      userData,
    );
    return response.data.user;
  },

  updateUser: async (
    id: number,
    userData: UpdateUserRequest,
  ): Promise<User> => {
    const response = await api.put<{ user: User; message: string }>(
      `/api/admin/users/${id}`,
      userData,
    );
    return response.data.user;
  },

  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/api/admin/users/${id}`,
    );
    return response.data;
  },

  changeUserPassword: async (
    id: number,
    newPassword: string,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/api/admin/users/${id}/change-password`,
      { newPassword },
    );
    return response.data;
  },

  // Book management
  getAllBooks: async (): Promise<Book[]> => {
    const response = await api.get<{ books: Book[] }>('/api/admin/books');
    return response.data.books;
  },

  getBookById: async (id: number): Promise<Book> => {
    const response = await api.get<{ book: Book }>(`/api/admin/books/${id}`);
    return response.data.book;
  },

  createBook: async (bookData: CreateBookRequest): Promise<Book> => {
    const response = await api.post<{ book: Book; message: string }>(
      '/api/admin/books',
      bookData,
    );
    return response.data.book;
  },

  createBookByIsbn: async (isbn: string): Promise<Book> => {
    const response = await api.post<{ book: Book; message: string }>(
      '/api/admin/books/isbn',
      { isbn },
    );
    return response.data.book;
  },

  updateBook: async (
    id: number,
    bookData: UpdateBookRequest,
  ): Promise<Book> => {
    const response = await api.put<{ book: Book; message: string }>(
      `/api/admin/books/${id}`,
      bookData,
    );
    return response.data.book;
  },

  deleteBook: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/api/admin/books/${id}`,
    );
    return response.data;
  },

  searchExternalBooks: async (
    source: ExternalSource,
    query: string,
    type: ExternalSearchType,
  ): Promise<ExternalBookResult[]> => {
    const response = await api.get<{ results: ExternalBookResult[] }>(
      '/api/admin/books/external/search',
      {
        params: { source, query, type },
      },
    );
    return response.data.results || [];
  },

  // Author management
  getAllAuthors: async (): Promise<Author[]> => {
    const response = await api.get<{ authors: Author[] }>('/api/admin/authors');
    return response.data.authors;
  },

  getAuthorById: async (
    id: number,
  ): Promise<{ author: Author; books: Book[] }> => {
    const response = await api.get<{ author: Author; books: Book[] }>(
      `/api/admin/authors/${id}`,
    );
    return response.data;
  },

  createAuthor: async (authorData: CreateAuthorRequest): Promise<Author> => {
    const response = await api.post<{ author: Author; message: string }>(
      '/api/admin/authors',
      authorData,
    );
    return response.data.author;
  },

  updateAuthor: async (
    id: number,
    authorData: UpdateAuthorRequest,
  ): Promise<Author> => {
    const response = await api.put<{ author: Author; message: string }>(
      `/api/admin/authors/${id}`,
      authorData,
    );
    return response.data.author;
  },

  deleteAuthor: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/api/admin/authors/${id}`,
    );
    return response.data;
  },

  // Review management
  getAllReviews: async (): Promise<Review[]> => {
    const response = await api.get<Review[]>('/api/admin/reviews');
    return response.data;
  },

  getBookReviews: async (bookId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(
      `/api/admin/reviews/book/${bookId}`,
    );
    return response.data;
  },

  updateReview: async (
    reviewId: number,
    reviewData: UpdateReviewRequest,
  ): Promise<Review> => {
    const response = await api.put<Review>(
      `/api/admin/reviews/${reviewId}`,
      reviewData,
    );
    return response.data;
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    await api.delete(`/api/admin/reviews/${reviewId}`);
  },

  // Settings management
  getSettings: async (): Promise<SiteSettings> => {
    const response = await api.get<{ settings: SiteSettings }>(
      '/api/admin/settings',
    );
    return response.data.settings;
  },

  updateSettings: async (
    settingsData: UpdateSiteSettingsRequest,
  ): Promise<SiteSettings> => {
    const response = await api.put<{ settings: SiteSettings; message: string }>(
      '/api/admin/settings',
      settingsData,
    );
    return response.data.settings;
  },

  sendTestEmail: async (): Promise<TestEmailResponse> => {
    const response = await api.post<TestEmailResponse>(
      '/api/admin/settings/test-email',
    );
    return response.data;
  },
};

export default AdminService;
