import api from "./api";

export interface Author {
  id?: number;
  name: string;
  biography?: string;
  birth_date?: string;
  photo_url?: string;
  book_count?: number;
  is_primary?: boolean;
}

export interface AuthorWithBooks extends Author {
  books?: Array<{
    id: number;
    title: string;
    isbn: string;
    published_date: string;
    cover_image_url: string;
  }>;
}

export interface AuthorInfoResponse {
  author: {
    name: string;
    birth_date: string;
    bio: string;
    photo_url: string;
  };
  works: Array<{
    title: string;
    published_date: string;
    cover_image_url: string;
  }>;
}

export const authorService = {
  /**
   * Get all authors with book count
   */
  getAuthors: async (): Promise<Author[]> => {
    try {
      const response = await api.get("/api/authors");
      return response.data.authors;
    } catch (error) {
      console.error("Error fetching all authors:", error);
      throw error;
    }
  },

  /**
   * Get author by ID with their books
   */
  getAuthorById: async (id: number): Promise<AuthorWithBooks> => {
    try {
      const response = await api.get(`/api/authors/id/${id}`);
      return {
        ...response.data.author,
        books: response.data.books,
      };
    } catch (error) {
      console.error(`Error fetching author with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get author by name with their books
   */
  getAuthorByName: async (name: string): Promise<AuthorWithBooks> => {
    try {
      const response = await api.get(
        `/api/authors/name/${encodeURIComponent(name)}`
      );
      return {
        ...response.data.author,
        books: response.data.books,
      };
    } catch (error) {
      console.error(`Error fetching author with name ${name}:`, error);
      throw error;
    }
  },

  /**
   * Get author info from OpenLibrary
   */
  getAuthorInfo: async (authorName: string): Promise<AuthorInfoResponse> => {
    try {
      const response = await api.get(`/api/authors/info`, {
        params: { authorName: encodeURIComponent(authorName) },
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching author info from OpenLibrary for ${authorName}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Create a new author
   */
  createAuthor: async (author: Author): Promise<Author> => {
    try {
      const response = await api.post("/api/authors", author);
      return response.data;
    } catch (error) {
      console.error("Error creating new author:", error);
      throw error;
    }
  },

  /**
   * Update an author
   */
  updateAuthor: async (id: number, author: Author): Promise<Author> => {
    try {
      const response = await api.put(`/api/authors/${id}`, author);
      return response.data;
    } catch (error) {
      console.error(`Error updating author with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an author
   */
  deleteAuthor: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/authors/${id}`);
    } catch (error) {
      console.error(`Error deleting author with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a book to an author
   */
  addBookToAuthor: async (
    authorId: number,
    bookId: number,
    isPrimary: boolean = false
  ): Promise<void> => {
    try {
      await api.post(`/api/authors/book`, {
        authorId,
        bookId,
        isPrimary,
      });
    } catch (error) {
      console.error(
        `Error adding book ${bookId} to author ${authorId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Remove a book from an author
   */
  removeBookFromAuthor: async (
    authorId: number,
    bookId: number
  ): Promise<void> => {
    try {
      await api.delete(`/api/authors/${authorId}/book/${bookId}`);
    } catch (error) {
      console.error(
        `Error removing book ${bookId} from author ${authorId}:`,
        error
      );
      throw error;
    }
  },
};

export default authorService;
