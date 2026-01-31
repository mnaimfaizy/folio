import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Determine if running in Docker
const isRunningInDocker = process.env.RUNNING_IN_DOCKER === "true";

const config = {
  // Server configuration
  port: process.env.PORT || 3000,

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "default_jwt_secret",
    expiresIn: "24h", // Token expiry time
  },

  // Password reset configuration
  resetPassword: {
    expiryTime: parseInt(process.env.RESET_PASSWORD_EXPIRY || "3600000"), // Default: 1 hour
  },

  // Open Library API (for fetching book details by ISBN)
  openLibrary: {
    baseUrl: "https://openlibrary.org/api",
  },

  // Email configuration
  email: {
    host:
      process.env.SMTP_HOST || (isRunningInDocker ? "mailhog" : "localhost"),
    port: parseInt(process.env.SMTP_PORT || "1025"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || "library@example.com",
    service: process.env.EMAIL_SERVICE || "",
  },

  // Frontend URL for email links
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

export default config;
