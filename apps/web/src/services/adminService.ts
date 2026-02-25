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

export interface BookAuthor {
  id?: number;
  name: string;
  is_primary?: boolean;
}

// Book interfaces
export interface Book {
  id: number;
  title: string;
  isbn: string | null;
  isbn10?: string | null;
  isbn13?: string | null;
  publishYear: number | null;
  pages?: number | null;
  genre?: string | null;
  author: string | null;
  cover: string | null;
  coverKey?: string | null;
  description: string | null;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  authors?: BookAuthor[];
}

export interface CreateBookRequest {
  title: string;
  isbn?: string;
  isbn10?: string;
  isbn13?: string;
  publishYear?: number;
  pages?: number;
  genre?: string;
  author?: string;
  cover?: string;
  coverKey?: string;
  description?: string;
  authors?: BookAuthor[];
  addToCollection?: boolean;
  featured?: boolean;
}

export interface UpdateBookRequest {
  title?: string;
  isbn?: string;
  isbn10?: string;
  isbn13?: string;
  publishYear?: number;
  pages?: number;
  genre?: string;
  author?: string;
  cover?: string;
  coverKey?: string;
  description?: string;
  authors?: BookAuthor[];
  featured?: boolean;
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
  pages?: number;
  genre?: string;
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
  alternate_names?: string[];
  force?: boolean;
}

export interface UpdateAuthorRequest {
  name?: string;
  biography?: string;
  birth_date?: string;
  photo_url?: string;
  alternate_names?: string[];
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

export type UsageProfile = 'single_user' | 'library' | 'showcase';

export interface SiteSettings {
  id: number;
  usage_profile: UsageProfile;
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
  loans_enabled: boolean;
  max_concurrent_loans: number;
  default_loan_duration_days: number;
  mobile_app_enabled: boolean;
  mobile_api_base_url: string | null;
  mobile_app_store_url: string | null;
  mobile_play_store_url: string | null;

  // Statistics (Landing Page)
  stat_total_books: string;
  stat_total_ebooks: string;
  stat_active_members: string;
  stat_online_access: string;

  // Trust indicators (Landing Page)
  stat_active_readers: string;
  stat_books_display: string;
  stat_rating: string;

  // About Page - Library Stats
  about_books_collection: string;
  about_active_members: string;
  about_years_service: string;
  about_community_awards: string;

  // About Page - Mission & Vision
  about_mission_text: string;
  about_vision_text: string;

  // About Page - History
  about_history_text: string;

  // About Page - Team Members
  about_team_members: TeamMember[];

  // About Page - Programs & Services
  about_programs: Program[];

  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  bgColor: string;
  description: string;
}

export interface Program {
  title: string;
  icon: string;
  description: string;
}

export interface UpdateSiteSettingsRequest {
  usage_profile?: UsageProfile;
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
  loans_enabled?: boolean;
  max_concurrent_loans?: number;
  default_loan_duration_days?: number;
  mobile_app_enabled?: boolean;
  mobile_api_base_url?: string | null;
  mobile_app_store_url?: string | null;
  mobile_play_store_url?: string | null;

  // Statistics (Landing Page)
  stat_total_books?: string;
  stat_total_ebooks?: string;
  stat_active_members?: string;
  stat_online_access?: string;

  // Trust indicators (Landing Page)
  stat_active_readers?: string;
  stat_books_display?: string;
  stat_rating?: string;

  // About Page - Library Stats
  about_books_collection?: string;
  about_active_members?: string;
  about_years_service?: string;
  about_community_awards?: string;

  // About Page - Mission & Vision
  about_mission_text?: string;
  about_vision_text?: string;

  // About Page - History
  about_history_text?: string;

  // About Page - Team Members
  about_team_members?: TeamMember[];

  // About Page - Programs & Services
  about_programs?: Program[];
}

export interface TestEmailResponse {
  message: string;
  sentTo?: string;
  remainingTests?: number;
  resetAt?: string;
  limit?: number;
}

export interface AdminBookRequest {
  id: number;
  requested_title: string | null;
  requested_author: string | null;
  requested_isbn: string | null;
  request_key: string;
  status: 'OPEN' | 'FULFILLED_AUTO' | 'FULFILLED_MANUAL';
  requested_by_name: string;
  requested_by_email: string;
  matched_book_id: number | null;
  matched_book_title?: string | null;
  note?: string | null;
  fulfillment_note?: string | null;
  created_at: string;
  fulfilled_at?: string | null;
}

export interface BookRequestAnalyticsItem {
  request_key: string;
  label: string;
  requested_title: string | null;
  requested_author: string | null;
  requested_isbn: string | null;
  total_requests: number;
  open_requests: number;
  fulfilled_requests: number;
}

export interface AdminLoan {
  id: number;
  user_id: number;
  book_id: number;
  borrowed_at: string;
  due_date: string;
  approved_at?: string | null;
  rejected_at?: string | null;
  reviewed_by_user_id?: number | null;
  rejection_reason?: string | null;
  returned_at?: string | null;
  lost_at?: string | null;
  status: 'PENDING' | 'ACTIVE' | 'OVERDUE' | 'RETURNED' | 'LOST' | 'REJECTED';
  penalty_amount?: number | null;
  admin_note?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  book_title?: string | null;
  book_author?: string | null;
}

export interface LoanReminderProcessResult {
  message: string;
  checkedCount: number;
  sentCount: number;
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

  deleteCoverUpload: async (key: string): Promise<void> => {
    await api.delete('/api/admin/books/cover', {
      params: { key },
    });
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

  toggleFeatured: async (id: number, featured: boolean): Promise<Book> => {
    const response = await api.patch<{ book: Book; message: string }>(
      `/api/admin/books/${id}/featured`,
      { featured },
    );
    return response.data.book;
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

  getUniqueGenres: async (): Promise<string[]> => {
    const response = await api.get<{ genres: string[] }>(
      '/api/admin/books/genres',
    );
    return response.data.genres || [];
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

  getBookRequests: async (): Promise<AdminBookRequest[]> => {
    const response = await api.get<{ requests: AdminBookRequest[] }>(
      '/api/admin/requests',
    );
    return response.data.requests;
  },

  getBookRequestAnalytics: async (): Promise<BookRequestAnalyticsItem[]> => {
    const response = await api.get<{ items: BookRequestAnalyticsItem[] }>(
      '/api/admin/requests/analytics',
    );
    return response.data.items;
  },

  markBookRequestFulfilled: async (
    requestId: number,
    payload?: { bookId?: number; note?: string },
  ): Promise<void> => {
    await api.post(`/api/admin/requests/${requestId}/fulfill`, payload || {});
  },

  fulfillRequestsByBook: async (
    bookId: number,
  ): Promise<{ fulfilledCount: number }> => {
    const response = await api.post<{ fulfilledCount: number }>(
      `/api/admin/requests/fulfill-by-book/${bookId}`,
    );
    return response.data;
  },

  getAllLoans: async (
    status?:
      | 'PENDING'
      | 'ACTIVE'
      | 'OVERDUE'
      | 'RETURNED'
      | 'LOST'
      | 'REJECTED',
  ): Promise<AdminLoan[]> => {
    const response = await api.get<{ loans: AdminLoan[] }>('/api/admin/loans', {
      params: status ? { status } : undefined,
    });
    return response.data.loans;
  },

  markLoanAsLost: async (
    loanId: number,
    payload?: { penaltyAmount?: number; note?: string },
  ): Promise<void> => {
    await api.post(`/api/admin/loans/${loanId}/lost`, payload || {});
  },

  processLoanReminders: async (): Promise<LoanReminderProcessResult> => {
    const response = await api.post<LoanReminderProcessResult>(
      '/api/admin/loans/process-reminders',
    );
    return response.data;
  },

  approveLoanRequest: async (loanId: number): Promise<void> => {
    await api.post(`/api/admin/loans/${loanId}/approve`);
  },

  rejectLoanRequest: async (
    loanId: number,
    payload?: { reason?: string },
  ): Promise<void> => {
    await api.post(`/api/admin/loans/${loanId}/reject`, payload || {});
  },
};

export default AdminService;
