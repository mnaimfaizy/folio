/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminService from "./adminService";
import api from "./api";

vi.mock("./api");

const mockApi = api as unknown as Record<string, any>;

describe("AdminService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllUsers returns users", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { users: [{ id: 1, name: "A" }] } });
    const users = await AdminService.getAllUsers();
    expect(users).toEqual([{ id: 1, name: "A" }]);
  });

  it("getUserById returns user detail", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { user: { id: 2, name: "B" } } });
    const user = await AdminService.getUserById(2);
    expect(user).toEqual({ id: 2, name: "B" });
  });

  it("createUser returns created user", async () => {
    mockApi.post = vi.fn().mockResolvedValue({
      data: { user: { id: 3, name: "C" }, message: "ok" },
    });
    const user = await AdminService.createUser({
      name: "C",
      email: "c@c.com",
      password: "pw",
    });
    expect(user).toEqual({ id: 3, name: "C" });
  });

  it("updateUser returns updated user", async () => {
    mockApi.put = vi.fn().mockResolvedValue({
      data: { user: { id: 4, name: "D" }, message: "ok" },
    });
    const user = await AdminService.updateUser(4, { name: "D" });
    expect(user).toEqual({ id: 4, name: "D" });
  });

  it("deleteUser returns message", async () => {
    mockApi.delete = vi
      .fn()
      .mockResolvedValue({ data: { message: "deleted" } });
    const res = await AdminService.deleteUser(5);
    expect(res).toEqual({ message: "deleted" });
  });

  it("changeUserPassword returns message", async () => {
    mockApi.post = vi.fn().mockResolvedValue({ data: { message: "changed" } });
    const res = await AdminService.changeUserPassword(6, "newpw");
    expect(res).toEqual({ message: "changed" });
  });

  it("getAllBooks returns books", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { books: [{ id: 1, title: "Book" }] } });
    const books = await AdminService.getAllBooks();
    expect(books).toEqual([{ id: 1, title: "Book" }]);
  });

  it("getBookById returns book", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { book: { id: 2, title: "Book2" } } });
    const book = await AdminService.getBookById(2);
    expect(book).toEqual({ id: 2, title: "Book2" });
  });

  it("createBook returns created book", async () => {
    mockApi.post = vi.fn().mockResolvedValue({
      data: { book: { id: 3, title: "Book3" }, message: "ok" },
    });
    const book = await AdminService.createBook({ title: "Book3" });
    expect(book).toEqual({ id: 3, title: "Book3" });
  });

  it("createBookByIsbn returns created book", async () => {
    mockApi.post = vi.fn().mockResolvedValue({
      data: { book: { id: 4, title: "Book4" }, message: "ok" },
    });
    const book = await AdminService.createBookByIsbn("isbn4");
    expect(book).toEqual({ id: 4, title: "Book4" });
  });

  it("updateBook returns updated book", async () => {
    mockApi.put = vi.fn().mockResolvedValue({
      data: { book: { id: 5, title: "Book5" }, message: "ok" },
    });
    const book = await AdminService.updateBook(5, { title: "Book5" });
    expect(book).toEqual({ id: 5, title: "Book5" });
  });

  it("deleteBook returns message", async () => {
    mockApi.delete = vi
      .fn()
      .mockResolvedValue({ data: { message: "deleted book" } });
    const res = await AdminService.deleteBook(6);
    expect(res).toEqual({ message: "deleted book" });
  });

  it("getAllAuthors returns authors", async () => {
    mockApi.get = vi
      .fn()
      .mockResolvedValue({ data: { authors: [{ id: 1, name: "Author" }] } });
    const authors = await AdminService.getAllAuthors();
    expect(authors).toEqual([{ id: 1, name: "Author" }]);
  });

  it("getAuthorById returns author and books", async () => {
    mockApi.get = vi.fn().mockResolvedValue({
      data: { author: { id: 2, name: "A2" }, books: [{ id: 1 }] },
    });
    const res = await AdminService.getAuthorById(2);
    expect(res).toEqual({ author: { id: 2, name: "A2" }, books: [{ id: 1 }] });
  });

  it("createAuthor returns created author", async () => {
    mockApi.post = vi.fn().mockResolvedValue({
      data: { author: { id: 3, name: "A3" }, message: "ok" },
    });
    const author = await AdminService.createAuthor({ name: "A3" });
    expect(author).toEqual({ id: 3, name: "A3" });
  });

  it("updateAuthor returns updated author", async () => {
    mockApi.put = vi.fn().mockResolvedValue({
      data: { author: { id: 4, name: "A4" }, message: "ok" },
    });
    const author = await AdminService.updateAuthor(4, { name: "A4" });
    expect(author).toEqual({ id: 4, name: "A4" });
  });

  it("deleteAuthor returns message", async () => {
    mockApi.delete = vi
      .fn()
      .mockResolvedValue({ data: { message: "deleted author" } });
    const res = await AdminService.deleteAuthor(5);
    expect(res).toEqual({ message: "deleted author" });
  });

  it("getAllReviews returns reviews", async () => {
    mockApi.get = vi.fn().mockResolvedValue({ data: [{ id: 1, rating: 5 }] });
    const reviews = await AdminService.getAllReviews();
    expect(reviews).toEqual([{ id: 1, rating: 5 }]);
  });

  it("getBookReviews returns reviews", async () => {
    mockApi.get = vi.fn().mockResolvedValue({ data: [{ id: 2, rating: 4 }] });
    const reviews = await AdminService.getBookReviews(2);
    expect(reviews).toEqual([{ id: 2, rating: 4 }]);
  });

  it("updateReview returns updated review", async () => {
    mockApi.put = vi.fn().mockResolvedValue({ data: { id: 3, rating: 3 } });
    const review = await AdminService.updateReview(3, { rating: 3 });
    expect(review).toEqual({ id: 3, rating: 3 });
  });

  it("deleteReview calls api.delete", async () => {
    mockApi.delete = vi.fn().mockResolvedValue({});
    await AdminService.deleteReview(4);
    expect(mockApi.delete).toHaveBeenCalledWith("/api/admin/reviews/4");
  });
});
