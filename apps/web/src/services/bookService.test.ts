/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import BookService from "./bookService";

vi.mock("./api");
const mockApi = api as unknown as Record<string, any>;

describe("BookService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllBooks returns books", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { books: [{ id: 1, title: "A" }] } });
    const books = await BookService.getAllBooks();
    expect(books).toEqual([{ id: 1, title: "A" }]);
  });

  it("getAllBooks returns empty array when no books property", async () => {
    mockApi.get = vi.fn().mockResolvedValue({ data: {} });
    const books = await BookService.getAllBooks();
    expect(books).toEqual([]);
  });

  it("getBookById returns book", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { book: { id: 2, title: "B" } } });
    const book = await BookService.getBookById(2);
    expect(book).toEqual({ id: 2, title: "B" });
  });

  it("getBookById returns null on error", async () => {
    mockApi.get = vi.fn().mockRejectedValue(new Error("fail"));
    const book = await BookService.getBookById(2);
    expect(book).toBeNull();
  });

  it("checkBookExists returns true for matching ISBN", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { books: [{ isbn: "123" }] } });
    BookService.getAllBooks = vi.fn().mockResolvedValue([{ isbn: "123" }]);
    const exists = await BookService.checkBookExists({
      isbn: "123",
      title: "T",
      author: "A",
    });
    expect(exists).toBe(true);
  });

  it("checkBookExists returns true for matching title and author in authors array", async () => {
    BookService.getAllBooks = vi.fn().mockResolvedValue([
      {
        title: "Test Book",
        authors: [{ name: "John Doe", is_primary: true }],
      },
    ]);

    const exists = await BookService.checkBookExists({
      title: "test book",
      authors: [{ name: "John Doe" }],
      author: "John Doe",
    });

    expect(exists).toBe(true);
  });

  it("checkBookExists returns true for matching title and author string", async () => {
    BookService.getAllBooks = vi.fn().mockResolvedValue([
      {
        title: "Test Book",
        author: "Jane Smith",
      },
    ]);

    const exists = await BookService.checkBookExists({
      title: "test book",
      author: "Jane Smith",
    });

    expect(exists).toBe(true);
  });

  it("checkBookExists returns false when books have different authors", async () => {
    BookService.getAllBooks = vi.fn().mockResolvedValue([
      {
        title: "Test Book",
        author: "Different Author",
      },
    ]);

    const exists = await BookService.checkBookExists({
      title: "test book",
      author: "Jane Smith",
    });

    expect(exists).toBe(false);
  });

  it("checkBookExists returns false on error", async () => {
    BookService.getAllBooks = vi.fn().mockRejectedValue(new Error("fail"));

    const exists = await BookService.checkBookExists({
      title: "Test Book",
      author: "Author",
    });

    expect(exists).toBe(false);
  });

  it("createBook returns created book", async () => {
    mockApi.post = vi
      .fn()
      .mockResolvedValue({ data: { book: { id: 3, title: "C" } } });
    const book = await BookService.createBook({
      title: "C",
      isbn: "",
      author: "",
      cover: "",
    });
    expect(book).toEqual({ id: 3, title: "C" });
  });

  it("createBook with addToCollection parameter", async () => {
    mockApi.post = vi
      .fn()
      .mockResolvedValue({ data: { book: { id: 3, title: "C" } } });

    await BookService.createBook(
      {
        title: "C",
        isbn: "",
        author: "",
        cover: "",
      },
      true
    );

    expect(mockApi.post).toHaveBeenCalledWith("/api/books", {
      title: "C",
      isbn: "",
      author: "",
      cover: "",
      addToCollection: true,
    });
  });

  it("createBook returns null on error", async () => {
    mockApi.post = vi.fn().mockRejectedValue(new Error("fail"));
    const book = await BookService.createBook({
      title: "C",
      isbn: "",
      author: "",
      cover: "",
    });
    expect(book).toBeNull();
  });

  it("updateBook returns updated book", async () => {
    mockApi.put = vi
      .fn()
      .mockResolvedValue({ data: { book: { id: 4, title: "D" } } });
    const book = await BookService.updateBook(4, { title: "D" });
    expect(book).toEqual({ id: 4, title: "D" });
  });

  it("updateBook returns null on error", async () => {
    mockApi.put = vi.fn().mockRejectedValue(new Error("fail"));
    const book = await BookService.updateBook(4, { title: "D" });
    expect(book).toBeNull();
  });

  it("deleteBook returns true on success", async () => {
    mockApi.delete = vi.fn().mockResolvedValue({});
    const res = await BookService.deleteBook(5);
    expect(res).toBe(true);
  });

  it("deleteBook returns false on error", async () => {
    mockApi.delete = vi.fn().mockRejectedValue(new Error("fail"));
    const res = await BookService.deleteBook(5);
    expect(res).toBe(false);
  });

  it("searchBooks returns books", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { books: [{ id: 6, title: "E" }] } });
    const books = await BookService.searchBooks("E");
    expect(books).toEqual([{ id: 6, title: "E" }]);
  });

  it("searchBooks returns [] on error", async () => {
    mockApi.get = vi.fn().mockRejectedValue(new Error("fail"));
    const books = await BookService.searchBooks("E");
    expect(books).toEqual([]);
  });

  it("searchOpenLibrary returns data", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { books: [{ title: "F" }] } });
    const res = await BookService.searchOpenLibrary("F", "title");
    expect(res).toEqual({ books: [{ title: "F" }] });
  });

  it("addBookFromOpenLibrary returns created book", async () => {
    mockApi.post = vi
      .fn()
      .mockResolvedValue({ data: { book: { id: 7, title: "G" } } });
    const book = await BookService.addBookFromOpenLibrary({
      title: "G",
      author: "A",
      isbn: "",
      cover: "",
    });
    expect(book).toEqual({ id: 7, title: "G" });
  });

  it("addBookFromOpenLibrary handles complex data safely", async () => {
    mockApi.post = vi
      .fn()
      .mockResolvedValue({ data: { book: { id: 7, title: "Complex Book" } } });

    const book = await BookService.addBookFromOpenLibrary({
      title: "Complex Book",
      author: "Complex Author",
      description: "A complex description object",
      firstPublishYear: 2020,
      publishYear: undefined,
      isbn: undefined,
      cover: undefined,
    });

    expect(book).toEqual({ id: 7, title: "Complex Book" });
    expect(mockApi.post).toHaveBeenCalled();

    // Verify the object sent to API was properly processed
    const apiArg = mockApi.post.mock.calls[0][1];
    expect(apiArg.title).toBe("Complex Book");
    expect(apiArg.author).toBe("Complex Author");
    expect(Array.isArray(apiArg.authors)).toBe(true);
    expect(apiArg.publishYear).toBe(2020);
  });

  it("addBookFromOpenLibrary handles null authors with default name", async () => {
    mockApi.post = vi
      .fn()
      .mockResolvedValue({ data: { book: { id: 8, title: "No Author" } } });

    const book = await BookService.addBookFromOpenLibrary({
      title: "No Author",
      author: "Unknown Author",
      authors: [],
      cover: "",
    });

    expect(book).toEqual({ id: 8, title: "No Author" });
    expect(mockApi.post).toHaveBeenCalled();

    const apiArg = mockApi.post.mock.calls[0][1];
    expect(apiArg.author).toBe("Unknown Author");
    expect(apiArg.authors).toBeDefined();
    expect(apiArg.authors.length).toBeGreaterThan(0);
    expect(apiArg.authors[0].name).toBe("Unknown Author");
  });

  it("addBookFromOpenLibrary with addToCollection parameter", async () => {
    mockApi.post = vi.fn().mockResolvedValue({ data: { book: { id: 9 } } });

    await BookService.addBookFromOpenLibrary(
      {
        title: "Collection Book",
        author: "Author",
      },
      true
    );

    expect(mockApi.post).toHaveBeenCalled();
    expect(mockApi.post.mock.calls[0][1].addToCollection).toBe(true);
  });

  it("addBookFromOpenLibrary handles array authors", async () => {
    mockApi.post = vi.fn().mockResolvedValue({ data: { book: { id: 10 } } });

    await BookService.addBookFromOpenLibrary({
      title: "Multi-Author Book",
      authors: [{ name: "Author 1" }, { name: "Author 2" }],
      author: "",
    });

    expect(mockApi.post).toHaveBeenCalled();
    const apiArg = mockApi.post.mock.calls[0][1];
    expect(apiArg.authors.length).toBe(2);
    expect(apiArg.author).toBe("Author 1, Author 2");
  });

  it("addBookFromOpenLibrary returns null on error", async () => {
    mockApi.post = vi.fn().mockRejectedValue(new Error("fail"));
    const book = await BookService.addBookFromOpenLibrary({
      title: "G",
      author: "A",
      isbn: "",
      cover: "",
    });
    expect(book).toBeNull();
  });

  it("getUserCollection returns books", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { books: [{ id: 8, title: "H" }] } });
    const books = await BookService.getUserCollection();
    expect(books).toEqual([{ id: 8, title: "H" }]);
  });

  it("getUserCollection returns [] on error", async () => {
    mockApi.get = vi.fn().mockRejectedValue(new Error("fail"));
    const books = await BookService.getUserCollection();
    expect(books).toEqual([]);
  });

  it("addToUserCollection returns true on success", async () => {
    mockApi.post = vi.fn().mockResolvedValue({});
    const res = await BookService.addToUserCollection(1);
    expect(res).toBe(true);
  });

  it("addToUserCollection returns false on error", async () => {
    mockApi.post = vi.fn().mockRejectedValue(new Error("fail"));
    const res = await BookService.addToUserCollection(1);
    expect(res).toBe(false);
  });

  it("removeFromUserCollection returns true on success", async () => {
    mockApi.delete = vi.fn().mockResolvedValue({});
    const res = await BookService.removeFromUserCollection(1);
    expect(res).toBe(true);
  });

  it("removeFromUserCollection returns false on error", async () => {
    mockApi.delete = vi.fn().mockRejectedValue(new Error("fail"));
    const res = await BookService.removeFromUserCollection(1);
    expect(res).toBe(false);
  });

  it("isBookInUserCollection returns true if book exists", async () => {
    BookService.getUserCollection = vi.fn().mockResolvedValue([{ id: 1 }]);
    const res = await BookService.isBookInUserCollection(1);
    expect(res).toBe(true);
  });

  it("isBookInUserCollection returns false if not exists", async () => {
    BookService.getUserCollection = vi.fn().mockResolvedValue([{ id: 2 }]);
    const res = await BookService.isBookInUserCollection(1);
    expect(res).toBe(false);
  });

  it("isBookInUserCollection returns false on error", async () => {
    BookService.getUserCollection = vi
      .fn()
      .mockRejectedValue(new Error("fail"));
    const res = await BookService.isBookInUserCollection(1);
    expect(res).toBe(false);
  });
});
