import nodemailer from "nodemailer";
import config from "../../config/config";
import { EmailService } from "../../utils/emailService";

// Define interfaces for properly typing the config and other objects
interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  service?: string;
}

interface Config {
  email: EmailConfig;
  frontendUrl: string;
}

// Mock dependencies
jest.mock("nodemailer");
jest.mock("../../config/config", () => ({
  email: {
    host: "test-host",
    port: 587,
    user: "test-user",
    password: "test-password",
    from: "test@example.com",
  },
  frontendUrl: "http://localhost:3000",
}));

describe("EmailService", () => {
  let emailService: EmailService;
  const mockTransporter = {
    sendMail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    emailService = new EmailService();
  });

  describe("constructor", () => {
    it("should create a transport with auth when credentials are provided", () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: config.email.host,
        port: config.email.port,
        secure: false,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
    });

    it("should create a transport without auth when credentials are missing", () => {
      // Temporarily override config to test this scenario
      const originalUser = config.email.user;
      const typedConfig = config as Config;
      typedConfig.email.user = "";

      new EmailService();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: config.email.host,
        port: config.email.port,
        secure: false,
      });

      // Restore the original config
      typedConfig.email.user = originalUser;
    });
  });

  describe("sendEmail", () => {
    it("should send an email successfully", async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: "test-message-id",
      });

      const options = {
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      };

      const result = await emailService.sendEmail(options);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: config.email.from,
        ...options,
      });
      expect(result).toBe(true);
    });

    it("should handle email sending failures", async () => {
      const mockError = new Error("Failed to send email");
      mockTransporter.sendMail.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const options = {
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      };

      const result = await emailService.sendEmail(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Email sending failed:",
        mockError
      );
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe("sendVerificationEmail", () => {
    it("should send a verification email with the correct content", async () => {
      const sendEmailSpy = jest
        .spyOn(emailService, "sendEmail")
        .mockResolvedValue(true);
      const email = "user@example.com";
      const token = "verification-token";
      const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;

      const result = await emailService.sendVerificationEmail(email, token);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: email,
        subject: "Email Verification - Library API",
        html: expect.stringContaining(verificationUrl),
      });
      expect(result).toBe(true);
    });

    it("should handle verification email failures", async () => {
      const sendEmailSpy = jest
        .spyOn(emailService, "sendEmail")
        .mockResolvedValue(false);
      const email = "user@example.com";
      const token = "verification-token";

      const result = await emailService.sendVerificationEmail(email, token);

      expect(sendEmailSpy).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
