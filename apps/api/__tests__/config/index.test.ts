import { config } from "../../config";

describe("Config Module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Save original environment and reset for tests
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment after all tests
    process.env = originalEnv;
  });

  describe("Email Configuration", () => {
    it("should provide default values when environment variables are not set", () => {
      // Clear relevant environment variables
      delete process.env.EMAIL_SERVICE;
      delete process.env.EMAIL_HOST;
      delete process.env.EMAIL_PORT;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASSWORD;
      delete process.env.EMAIL_FROM;

      // Re-import the config to get fresh values
      jest.isolateModules(async () => {
        const configModule = await import("../../config");
        expect(configModule.config.email.service).toBe("gmail");
        expect(configModule.config.email.port).toBe(587);
        expect(configModule.config.email.user).toBe("");
        expect(configModule.config.email.password).toBe("");
        expect(configModule.config.email.from).toBe("noreply@library-api.com");
      });
    });

    it("should use environment variables when provided", () => {
      // Set environment variables
      process.env.EMAIL_SERVICE = "mailgun";
      process.env.EMAIL_HOST = "smtp.mailgun.org";
      process.env.EMAIL_PORT = "465";
      process.env.EMAIL_USER = "testuser";
      process.env.EMAIL_PASSWORD = "testpass";
      process.env.EMAIL_FROM = "library@example.com";

      // Re-import the config to get fresh values
      jest.isolateModules(async () => {
        const configModule = await import("../../config");
        expect(configModule.config.email.service).toBe("mailgun");
        expect(configModule.config.email.host).toBe("smtp.mailgun.org");
        expect(configModule.config.email.port).toBe(465);
        expect(configModule.config.email.user).toBe("testuser");
        expect(configModule.config.email.password).toBe("testpass");
        expect(configModule.config.email.from).toBe("library@example.com");
      });
    });
  });

  describe("Frontend URL Configuration", () => {
    it("should provide default frontend URL when environment variable is not set", () => {
      delete process.env.FRONTEND_URL;

      jest.isolateModules(async () => {
        const configModule = await import("../../config");
        expect(configModule.config.frontendUrl).toBe("http://localhost:3000");
      });
    });

    it("should use environment variable for frontend URL when provided", () => {
      process.env.FRONTEND_URL = "https://library.example.com";

      jest.isolateModules(async () => {
        const configModule = await import("../../config");
        expect(configModule.config.frontendUrl).toBe(
          "https://library.example.com"
        );
      });
    });
  });

  // Verify the current imported config object has expected structure
  it("should export config object with correct structure", () => {
    expect(config).toHaveProperty("email");
    expect(config).toHaveProperty("frontendUrl");
    expect(config.email).toHaveProperty("service");
    expect(config.email).toHaveProperty("host");
    expect(config.email).toHaveProperty("port");
    expect(config.email).toHaveProperty("user");
    expect(config.email).toHaveProperty("password");
    expect(config.email).toHaveProperty("from");
  });
});
