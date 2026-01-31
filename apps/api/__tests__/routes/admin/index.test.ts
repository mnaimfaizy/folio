import express from "express";
import request from "supertest";
import adminRouter from "../../../routes/admin";

// Mock the sub-routers in a way that properly satisfies TypeScript's type requirements
jest.mock("../../../routes/admin/userRoutes", () => {
  const router = express.Router();
  // Handlers must return void to satisfy TypeScript's RequestHandler type
  router.get("/test", (_, res) => {
    res.status(200).json({ route: "admin/users" });
    // No return statement, which makes it return void
  });
  return router;
});

jest.mock("../../../routes/admin/bookRoutes", () => {
  const router = express.Router();
  router.get("/test", (_, res) => {
    res.status(200).json({ route: "admin/books" });
  });
  return router;
});

jest.mock("../../../routes/admin/authorRoutes", () => {
  const router = express.Router();
  router.get("/test", (_, res) => {
    res.status(200).json({ route: "admin/authors" });
  });
  return router;
});

jest.mock("../../../routes/admin/reviewRoutes", () => {
  const router = express.Router();
  router.get("/test", (_, res) => {
    res.status(200).json({ route: "admin/reviews" });
  });
  return router;
});

describe("Admin Router", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use("/api/admin", adminRouter);
  });

  describe("Route Mounting", () => {
    it("should properly mount the user routes", async () => {
      const response = await request(app).get("/api/admin/users/test");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ route: "admin/users" });
    });

    it("should properly mount the book routes", async () => {
      const response = await request(app).get("/api/admin/books/test");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ route: "admin/books" });
    });

    it("should properly mount the author routes", async () => {
      const response = await request(app).get("/api/admin/authors/test");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ route: "admin/authors" });
    });

    it("should properly mount the review routes", async () => {
      const response = await request(app).get("/api/admin/reviews/test");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ route: "admin/reviews" });
    });
  });
});
