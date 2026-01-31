import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FooterComponent } from "../../../components/shared/FooterComponent";

// Mock dependencies
vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid={`link-${to.replace(/\//g, "-")}`}>
      {children}
    </a>
  ),
}));

// Mock date to ensure stable currentYear value in tests
const mockDate = new Date("2025-04-15");
vi.spyOn(global, "Date").mockImplementation(() => mockDate);

describe("FooterComponent", () => {
  it("renders logo and about text", () => {
    render(<FooterComponent />);

    // Check logo and title
    expect(screen.getByText("Library Management")).toBeInTheDocument();
    expect(screen.getByText(/Your one-stop solution/)).toBeInTheDocument();
  });

  it("renders quick links section", () => {
    render(<FooterComponent />);

    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByTestId("link--")).toBeInTheDocument(); // Home
    expect(screen.getByTestId("link--books")).toBeInTheDocument();
    expect(screen.getByTestId("link--about")).toBeInTheDocument();
    expect(screen.getByTestId("link--contact")).toBeInTheDocument();
  });

  it("renders help and support section", () => {
    render(<FooterComponent />);

    expect(screen.getByText("Help & Support")).toBeInTheDocument();
    expect(screen.getByTestId("link--faq")).toBeInTheDocument();
    expect(screen.getByTestId("link--terms")).toBeInTheDocument();
    expect(screen.getByTestId("link--privacy")).toBeInTheDocument();
    expect(screen.getByTestId("link--support")).toBeInTheDocument();
  });

  it("renders social media links", () => {
    render(<FooterComponent />);

    expect(screen.getByText("Connect With Us")).toBeInTheDocument();

    // Check all social links
    const socialLinks = screen.getAllByRole("link");
    const socialUrls = socialLinks
      .filter((link) => link.getAttribute("href")?.includes("http"))
      .map((link) => link.getAttribute("href"));

    expect(socialUrls).toContain("https://facebook.com");
    expect(socialUrls).toContain("https://twitter.com");
    expect(socialUrls).toContain("https://instagram.com");
    expect(socialUrls).toContain("https://github.com");
  });

  it("renders newsletter subscription form", () => {
    render(<FooterComponent />);

    expect(screen.getByText("Subscribe to our newsletter")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your email")).toBeInTheDocument();
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  it("renders copyright with current year", () => {
    render(<FooterComponent />);

    expect(
      screen.getByText("© 2025 Library Management System. All rights reserved.")
    ).toBeInTheDocument();
  });
});
