import { Book, BookSearchParams, BookSearchResponse } from '../types/Book';

import api from './api';

export interface BooksResponse {
  books: Book[];
  message?: string;
}

export interface BookResponse {
  book: Book;
  message?: string;
}

export const bookService = {
  /**
   * Get all books with optional pagination
   */
  async getAllBooks(page?: number, limit?: number): Promise<BooksResponse> {
    try {
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page.toString());
      if (limit !== undefined) params.append('limit', limit.toString());

      const response = await api.get<BooksResponse>('/books', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  /**
   * Search books by query
   */
  async searchBooks(params: BookSearchParams): Promise<BookSearchResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('q', params.q);
      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());

      const response = await api.get<BookSearchResponse>('/books/search', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },

  /**
   * Get a book by ID
   */
  async getBookById(id: number): Promise<BookResponse> {
    try {
      const response = await api.get<BookResponse>(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get user's book collection
   */
  async getUserCollection(): Promise<BooksResponse> {
    try {
      const response = await api.get<BooksResponse>('/books/collection');
      return response.data;
    } catch (error) {
      console.error('Error fetching user collection:', error);
      throw error;
    }
  },

  /**
   * Add book to user's collection
   */
  async addToCollection(bookId: number): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/books/collection', { bookId });
      return response.data;
    } catch (error) {
      console.error('Error adding book to collection:', error);
      throw error;
    }
  },

  /**
   * Remove book from user's collection
   */
  async removeFromCollection(bookId: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/books/collection/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing book from collection:', error);
      throw error;
    }
  },
};
