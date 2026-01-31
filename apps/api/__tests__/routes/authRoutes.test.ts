import express from "express";
import request from "supertest";
import { authenticate } from "../../middleware/auth";
import authRoutes from "../../routes/authRoutes";

// Mock the authentication middleware
jest.mock("../../middleware/auth", () => ({
  authenticate: jest.fn((req, res, next) => next()),
}));

// Mock the auth controllers
jest.mock("../../controllers/authController", () => ({
  login: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked login success" })
  ),
  register: jest.fn((req, res) =>
    res.status(201).json({ message: "Mocked register success" })
  ),
  logout: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked logout success" })
  ),
  verifyEmail: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked verify success" })
  ),
  requestPasswordReset: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked password reset request success" })
  ),
  resetPassword: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked reset success" })
  ),
  changePassword: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked password change success" })
  ),
  updateUser: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked profile update success" })
  ),
  resendVerification: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked resend verification success" })
  ),
  deleteUser: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked delete user success" })
  ),
}));

describe("Auth Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
  });

  describe("POST /api/auth/login", () => {
    it("should route to login controller", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@example.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked login success");
    });
  });

  describe("POST /api/auth/register", () => {
    it("should route to register controller", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "new@example.com",
          password: "password123",
          name: "New User",
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Mocked register success");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should route to logout controller", async () => {
      const response = await request(app).post("/api/auth/logout").send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked logout success");
    });
  });

  describe("GET /api/auth/verify-email/:token", () => {
    it("should route to verify email controller", async () => {
      const response = await request(app)
        .get("/api/auth/verify-email/test-token")
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked verify success");
    });
  });

  describe("POST /api/auth/request-password-reset", () => {
    it("should route to request password reset controller", async () => {
      const response = await request(app)
        .post("/api/auth/request-password-reset")
        .send({ email: "user@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Mocked password reset request success"
      );
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should route to reset password controller", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "reset-token", password: "newPassword123" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked reset success");
    });
  });

  describe("POST /api/auth/change-password", () => {
    it("should route to change password controller and use authentication middleware", async () => {
      const response = await request(app)
        .post("/api/auth/change-password")
        .send({ currentPassword: "old", newPassword: "new" });

      expect(authenticate).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked password change success");
    });
  });

  describe("PUT /api/auth/update-profile", () => {
    it("should route to update profile controller and use authentication middleware", async () => {
      const response = await request(app)
        .put("/api/auth/update-profile")
        .send({ name: "Updated Name" });

      expect(authenticate).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked profile update success");
    });
  });

  describe("POST /api/auth/resend-verification", () => {
    it("should route to resend verification controller", async () => {
      const response = await request(app)
        .post("/api/auth/resend-verification")
        .send({ email: "user@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked resend verification success");
    });
  });

  describe("DELETE /api/auth/delete-account", () => {
    it("should route to delete account controller and use authentication middleware", async () => {
      const response = await request(app)
        .delete("/api/auth/delete-account")
        .send();

      expect(authenticate).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked delete user success");
    });
  });
});
