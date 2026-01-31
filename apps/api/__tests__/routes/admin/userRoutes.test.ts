import express from "express";
import request from "supertest";
import * as userController from "../../../controllers/admin/userController";
import { authenticate, isAdmin } from "../../../middleware/auth";
import userRoutes from "../../../routes/admin/userRoutes";

// Mock the auth middleware
jest.mock("../../../middleware/auth", () => ({
  authenticate: jest.fn((req, res, next) => next()),
  isAdmin: jest.fn((req, res, next) => next()),
}));

// Mock the controllers
jest.mock("../../../controllers/admin/userController");

describe("Admin User Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/admin/users", userRoutes);

    // Reset all mocks
    jest.clearAllMocks();

    // Default implementation for mocked controller methods
    (userController.getAllUsers as jest.Mock).mockImplementation((req, res) => {
      res.status(200).json({ data: [], total: 0, page: 1, limit: 10 });
    });

    (userController.getUserById as jest.Mock).mockImplementation((req, res) => {
      res
        .status(200)
        .json({
          id: parseInt(req.params.id),
          name: "Test User",
          email: "test@example.com",
          role: "user",
        });
    });

    (userController.createUser as jest.Mock).mockImplementation((req, res) => {
      res.status(201).json({ id: 1, ...req.body });
    });

    (userController.updateUser as jest.Mock).mockImplementation((req, res) => {
      res.status(200).json({ id: parseInt(req.params.id), ...req.body });
    });

    (userController.deleteUser as jest.Mock).mockImplementation((req, res) => {
      res.status(200).json({ message: "User deleted successfully" });
    });

    (userController.changeUserPassword as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ message: "Password changed successfully" });
      }
    );
  });

  describe("GET /api/admin/users", () => {
    it("should get all users", async () => {
      const response = await request(app).get("/api/admin/users");
      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(userController.getAllUsers).toHaveBeenCalled();
      expect(response.body).toEqual({ data: [], total: 0, page: 1, limit: 10 });
    });
  });

  describe("GET /api/admin/users/:id", () => {
    it("should get user by ID", async () => {
      const response = await request(app).get("/api/admin/users/1");
      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(userController.getUserById).toHaveBeenCalled();
      expect(response.body).toEqual({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "user",
      });
    });
  });

  describe("POST /api/admin/users", () => {
    it("should create a new user", async () => {
      const userData = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        role: "user",
      };

      const response = await request(app)
        .post("/api/admin/users")
        .send(userData);

      expect(response.status).toBe(201);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(userController.createUser).toHaveBeenCalled();
      expect(response.body).toEqual({ id: 1, ...userData });
    });
  });

  describe("PUT /api/admin/users/:id", () => {
    it("should update a user", async () => {
      const updateData = {
        name: "Updated User",
        email: "updated@example.com",
        role: "admin",
      };

      const response = await request(app)
        .put("/api/admin/users/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(userController.updateUser).toHaveBeenCalled();
      expect(response.body).toEqual({ id: 1, ...updateData });
    });
  });

  describe("DELETE /api/admin/users/:id", () => {
    it("should delete a user", async () => {
      const response = await request(app).delete("/api/admin/users/1");

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(userController.deleteUser).toHaveBeenCalled();
      expect(response.body).toEqual({ message: "User deleted successfully" });
    });
  });

  describe("POST /api/admin/users/:id/change-password", () => {
    it("should change user password", async () => {
      const passwordData = {
        newPassword: "newpassword123",
      };

      const response = await request(app)
        .post("/api/admin/users/1/change-password")
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(userController.changeUserPassword).toHaveBeenCalled();
      expect(response.body).toEqual({
        message: "Password changed successfully",
      });
    });
  });
});
