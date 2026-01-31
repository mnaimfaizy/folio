import path from "path";
import sqlite from "sqlite";
import sqlite3 from "sqlite3";
import { connectDatabase } from "../../db/database";
import { UserRole } from "../../models/User";

// Mock dependencies
jest.mock("sqlite", () => ({
  open: jest.fn(),
}));

jest.mock("sqlite3", () => ({
  Database: jest.fn(),
}));

jest.mock("path", () => ({
  join: jest.fn(),
}));

describe("Database Module", () => {
  const mockDb = {
    exec: jest.fn().mockResolvedValue(undefined),
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
    close: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Use imported modules instead of require()
    (path.join as jest.Mock).mockReturnValue(":memory:");
    (sqlite.open as jest.Mock).mockResolvedValue(mockDb);
  });

  describe("connectDatabase", () => {
    it("should connect to SQLite database successfully", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Mock table_info response showing that role column exists
      mockDb.all.mockResolvedValueOnce([
        { name: "id" },
        { name: "name" },
        { name: "email" },
        { name: "password" },
        { name: "role" },
      ]);

      // Mock empty existing books
      mockDb.all.mockResolvedValueOnce([]);

      const db = await connectDatabase();

      expect(sqlite.open).toHaveBeenCalledWith({
        filename: ":memory:",
        driver: sqlite3.Database,
      });

      expect(mockDb.exec).toHaveBeenCalledTimes(1);
      expect(mockDb.exec).toHaveBeenCalledWith(
        expect.stringContaining("CREATE TABLE IF NOT EXISTS users")
      );

      expect(consoleSpy).toHaveBeenCalledWith("Connected to SQLite database");
      expect(consoleSpy).toHaveBeenCalledWith("Database tables initialized");

      expect(db).toBe(mockDb);

      consoleSpy.mockRestore();
    });

    it("should add role column if it doesn't exist", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Mock table_info response showing that role column doesn't exist
      mockDb.all.mockResolvedValueOnce([
        { name: "id" },
        { name: "name" },
        { name: "email" },
        { name: "password" },
      ]);

      // Mock empty existing books
      mockDb.all.mockResolvedValueOnce([]);

      await connectDatabase();

      expect(mockDb.exec).toHaveBeenCalledWith(
        expect.stringContaining(
          `ALTER TABLE users ADD COLUMN role TEXT DEFAULT '${UserRole.USER}'`
        )
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Added role column to users table"
      );

      consoleSpy.mockRestore();
    });

    it("should migrate authors from books table", async () => {
      // Mock table_info response showing that role column exists
      mockDb.all.mockResolvedValueOnce([
        { name: "id" },
        { name: "name" },
        { name: "email" },
        { name: "password" },
        { name: "role" },
      ]);

      // Mock existing books with authors
      mockDb.all.mockResolvedValueOnce([
        { id: 1, author: "Author One" },
        { id: 2, author: "Author Two, Author Three" },
      ]);

      // First author lookup (not found)
      mockDb.get.mockResolvedValueOnce(null);
      // Insert first author result
      mockDb.run.mockResolvedValueOnce({ lastID: 101 });
      // Insert author-book relation
      mockDb.run.mockResolvedValueOnce({});

      // Second author lookup (not found)
      mockDb.get.mockResolvedValueOnce(null);
      // Insert second author result
      mockDb.run.mockResolvedValueOnce({ lastID: 102 });
      // Insert author-book relation
      mockDb.run.mockResolvedValueOnce({});

      // Third author lookup (exists)
      mockDb.get.mockResolvedValueOnce({ id: 103 });
      // Insert author-book relation
      mockDb.run.mockResolvedValueOnce({});

      await connectDatabase();

      // Verify first author was created and linked
      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT id FROM authors WHERE name = ?",
        ["Author One"]
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO authors (name) VALUES (?)",
        ["Author One"]
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT OR IGNORE INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
        [101, 1, 1]
      );

      // Verify second author was created and linked as primary
      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT id FROM authors WHERE name = ?",
        ["Author Two"]
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO authors (name) VALUES (?)",
        ["Author Two"]
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT OR IGNORE INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
        [102, 2, 1]
      );

      // Verify third author was looked up and linked as non-primary
      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT id FROM authors WHERE name = ?",
        ["Author Three"]
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT OR IGNORE INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
        [103, 2, 0]
      );
    });

    it("should handle database connection errors", async () => {
      const mockError = new Error("Connection failed");
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      (sqlite.open as jest.Mock).mockRejectedValue(mockError);

      await expect(connectDatabase()).rejects.toThrow("Connection failed");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Database connection error:",
        mockError
      );

      consoleSpy.mockRestore();
    });

    it("should handle author migration errors", async () => {
      // Mock table_info response showing that role column exists
      mockDb.all.mockResolvedValueOnce([{ name: "role" }]);

      // Mock existing books with authors
      mockDb.all.mockResolvedValueOnce([{ id: 1, author: "Test Author" }]);

      // Author lookup (not found)
      mockDb.get.mockResolvedValueOnce(null);
      // Insert author result with no lastID (error case)
      mockDb.run.mockResolvedValueOnce({ lastID: null });

      await expect(connectDatabase()).rejects.toThrow(
        "Failed to insert author"
      );
    });
  });
});
