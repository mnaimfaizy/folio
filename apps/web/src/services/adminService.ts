import api from "./api";

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
  publishYear: number | null;
  author: string | null;
  cover: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  authors?: Author[];
}

export interface CreateBookRequest {
  title: string;
  isbn?: string;
  publishYear?: number;
  author?: string;
  cover?: string;
  description?: string;
  authors?: { name: string; id?: number }[];
  addToCollection?: boolean;
}

export interface UpdateBookRequest {
  title?: string;
  isbn?: string;
  publishYear?: number;
  author?: string;
  cover?: string;
  description?: string;
  authors?: { name: string; id?: number }[];
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

const AdminService = {
  // User management
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<{ users: User[] }>("/api/admin/users");
    return response.data.users;
  },

  getUserById: async (id: number): Promise<UserDetail> => {
    const response = await api.get<{ user: UserDetail }>(
      `/api/admin/users/${id}`
    );
    return response.data.user;
  },

  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post<{ user: User; message: string }>(
      "/api/admin/users",
      userData
    );
    return response.data.user;
  },

  updateUser: async (
    id: number,
    userData: UpdateUserRequest
  ): Promise<User> => {
    const response = await api.put<{ user: User; message: string }>(
      `/api/admin/users/${id}`,
      userData
    );
    return response.data.user;
  },

  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/api/admin/users/${id}`
    );
    return response.data;
  },

  changeUserPassword: async (
    id: number,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/api/admin/users/${id}/change-password`,
      { newPassword }
    );
    return response.data;
  },

  // Book management
  getAllBooks: async (): Promise<Book[]> => {
    const response = await api.get<{ books: Book[] }>("/api/admin/books");
    return response.data.books;
  },

  getBookById: async (id: number): Promise<Book> => {
    const response = await api.get<{ book: Book }>(`/api/admin/books/${id}`);
    return response.data.book;
  },

  createBook: async (bookData: CreateBookRequest): Promise<Book> => {
    const response = await api.post<{ book: Book; message: string }>(
      "/api/admin/books",
      bookData
    );
    return response.data.book;
  },

  createBookByIsbn: async (isbn: string): Promise<Book> => {
    const response = await api.post<{ book: Book; message: string }>(
      "/api/admin/books/isbn",
      { isbn }
    );
    return response.data.book;
  },

  updateBook: async (
    id: number,
    bookData: UpdateBookRequest
  ): Promise<Book> => {
    const response = await api.put<{ book: Book; message: string }>(
      `/api/admin/books/${id}`,
      bookData
    );
    return response.data.book;
  },

  deleteBook: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/api/admin/books/${id}`
    );
    return response.data;
  },

  // Author management
  getAllAuthors: async (): Promise<Author[]> => {
    const response = await api.get<{ authors: Author[] }>("/api/admin/authors");
    return response.data.authors;
  },

  getAuthorById: async (
    id: number
  ): Promise<{ author: Author; books: Book[] }> => {
    const response = await api.get<{ author: Author; books: Book[] }>(
      `/api/admin/authors/${id}`
    );
    return response.data;
  },

  createAuthor: async (authorData: CreateAuthorRequest): Promise<Author> => {
    const response = await api.post<{ author: Author; message: string }>(
      "/api/admin/authors",
      authorData
    );
    return response.data.author;
  },

  updateAuthor: async (
    id: number,
    authorData: UpdateAuthorRequest
  ): Promise<Author> => {
    const response = await api.put<{ author: Author; message: string }>(
      `/api/admin/authors/${id}`,
      authorData
    );
    return response.data.author;
  },

  deleteAuthor: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/api/admin/authors/${id}`
    );
    return response.data;
  },

  // Review management
  getAllReviews: async (): Promise<Review[]> => {
    const response = await api.get<Review[]>("/api/admin/reviews");
    return response.data;
  },

  getBookReviews: async (bookId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(
      `/api/admin/reviews/book/${bookId}`
    );
    return response.data;
  },

  updateReview: async (
    reviewId: number,
    reviewData: UpdateReviewRequest
  ): Promise<Review> => {
    const response = await api.put<Review>(
      `/api/admin/reviews/${reviewId}`,
      reviewData
    );
    return response.data;
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    await api.delete(`/api/admin/reviews/${reviewId}`);
  },
};

export default AdminService;
