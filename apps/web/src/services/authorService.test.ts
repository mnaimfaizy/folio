/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import authorService from "./authorService";

vi.mock("./api");
const mockApi = api as unknown as Record<string, any>;

describe("authorService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(authorService).toBeDefined();
  });

  it("getAuthors returns authors", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { authors: [{ id: 1, name: "A" }] } });
    const authors = await authorService.getAuthors();
    expect(authors).toEqual([{ id: 1, name: "A" }]);
  });

  it("getAuthors throws error on failure", async () => {
    mockApi.get = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(authorService.getAuthors()).rejects.toThrow("fail");
  });

  it("getAuthorById returns author with books", async () => {
    mockApi.get = vi.fn().mockResolvedValue({
      data: { author: { id: 2, name: "B" }, books: [{ id: 1 }] },
    });
    const author = await authorService.getAuthorById(2);
    expect(author).toEqual({ id: 2, name: "B", books: [{ id: 1 }] });
  });

  it("getAuthorById throws error on failure", async () => {
    mockApi.get = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(authorService.getAuthorById(2)).rejects.toThrow("fail");
  });

  it("getAuthorByName returns author with books", async () => {
    mockApi.get = vi.fn().mockResolvedValue({
      data: { author: { id: 3, name: "C" }, books: [{ id: 2 }] },
    });
    const author = await authorService.getAuthorByName("C");
    expect(author).toEqual({ id: 3, name: "C", books: [{ id: 2 }] });
  });

  it("getAuthorByName throws error on failure", async () => {
    mockApi.get = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(authorService.getAuthorByName("C")).rejects.toThrow("fail");
  });

  it("getAuthorInfo returns author info response", async () => {
    mockApi.get = vi.fn().mockResolvedValue({
      data: {
        author: {
          name: "D",
          birth_date: "2000",
          bio: "bio",
          photo_url: "url",
        },
        works: [],
      },
    });
    const info = await authorService.getAuthorInfo("D");
    expect(info).toEqual({
      author: { name: "D", birth_date: "2000", bio: "bio", photo_url: "url" },
      works: [],
    });
  });

  it("getAuthorInfo throws error on failure", async () => {
    mockApi.get = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(authorService.getAuthorInfo("D")).rejects.toThrow("fail");
  });

  it("createAuthor returns created author", async () => {
    mockApi.post = vi.fn().mockResolvedValue({ data: { id: 4, name: "E" } });
    const author = await authorService.createAuthor({ name: "E" });
    expect(author).toEqual({ id: 4, name: "E" });
  });

  it("createAuthor throws error on failure", async () => {
    mockApi.post = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(authorService.createAuthor({ name: "E" })).rejects.toThrow(
      "fail"
    );
  });

  it("updateAuthor returns updated author", async () => {
    mockApi.put = vi.fn().mockResolvedValue({ data: { id: 5, name: "F" } });
    const author = await authorService.updateAuthor(5, { name: "F" });
    expect(author).toEqual({ id: 5, name: "F" });
  });

  it("updateAuthor throws error on failure", async () => {
    mockApi.put = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(authorService.updateAuthor(5, { name: "F" })).rejects.toThrow(
      "fail"
    );
  });

  it("deleteAuthor calls api.delete", async () => {
    mockApi.delete = vi.fn().mockResolvedValue({});
    await authorService.deleteAuthor(6);
    expect(mockApi.delete).toHaveBeenCalledWith("/api/authors/6");
  });

  it("deleteAuthor throws error on failure", async () => {
    mockApi.delete = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(authorService.deleteAuthor(6)).rejects.toThrow("fail");
  });

  it("addBookToAuthor calls api.post", async () => {
    mockApi.post = vi.fn().mockResolvedValue({});
    await authorService.addBookToAuthor(1, 2, true);
    expect(mockApi.post).toHaveBeenCalledWith("/api/authors/book", {
      authorId: 1,
      bookId: 2,
      isPrimary: true,
    });
  });

  it("addBookToAuthor calls api.post with default isPrimary=false", async () => {
    mockApi.post = vi.fn().mockResolvedValue({});
    await authorService.addBookToAuthor(1, 2);
    expect(mockApi.post).toHaveBeenCalledWith("/api/authors/book", {
      authorId: 1,
      bookId: 2,
      isPrimary: false,
    });
  });

  it("addBookToAuthor throws error on failure", async () => {
    mockApi.post = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(authorService.addBookToAuthor(1, 2)).rejects.toThrow("fail");
  });

  it("removeBookFromAuthor calls api.delete", async () => {
    mockApi.delete = vi.fn().mockResolvedValue({});
    await authorService.removeBookFromAuthor(1, 2);
    expect(mockApi.delete).toHaveBeenCalledWith("/api/authors/1/book/2");
  });

  it("removeBookFromAuthor throws error on failure", async () => {
    mockApi.delete = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(authorService.removeBookFromAuthor(1, 2)).rejects.toThrow(
      "fail"
    );
  });
});
