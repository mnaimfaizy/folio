import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AdminDashboard } from "../../../components/admin/AdminDashboard";

describe("AdminDashboard", () => {
  it("should render the admin dashboard with correct title", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Check that the title is rendered
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("should render all admin modules", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Check that all module titles are rendered
    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(screen.getByText("Book Management")).toBeInTheDocument();
    expect(screen.getByText("Author Management")).toBeInTheDocument();
    expect(screen.getByText("Review Management")).toBeInTheDocument();
    expect(screen.getByText("System Settings")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("should render module descriptions", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Check that module descriptions are rendered
    expect(
      screen.getByText("Manage system users, roles, and permissions")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add, edit, and delete books in the catalog")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Manage author information and book relationships")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Moderate book reviews and ratings")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Configure application settings")
    ).toBeInTheDocument();
    expect(
      screen.getByText("View usage statistics and reports")
    ).toBeInTheDocument();
  });

  it("should have correct links for each module", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Get links by their associated text and check href attributes
    const userManagementLink = screen.getByText("User Management").closest("a");
    const bookManagementLink = screen.getByText("Book Management").closest("a");
    const authorManagementLink = screen
      .getByText("Author Management")
      .closest("a");
    const reviewManagementLink = screen
      .getByText("Review Management")
      .closest("a");
    const systemSettingsLink = screen.getByText("System Settings").closest("a");
    const analyticsLink = screen.getByText("Analytics").closest("a");

    expect(userManagementLink).toHaveAttribute("href", "/admin/users");
    expect(bookManagementLink).toHaveAttribute("href", "/books");
    expect(authorManagementLink).toHaveAttribute("href", "/authors");
    expect(reviewManagementLink).toHaveAttribute("href", "/admin/reviews");
    expect(systemSettingsLink).toHaveAttribute("href", "/admin/settings");
    expect(analyticsLink).toHaveAttribute("href", "/admin/analytics");
  });

  it("should render icons for each module", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Check that each module card has an icon
    // We can't directly test the specific icons, but we can check that they exist
    const cards = screen.getAllByRole("link");

    cards.forEach((card) => {
      // Each card should contain an SVG icon
      const svg = card.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  it("should have the correct number of modules", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // There should be exactly 6 module cards
    const cards = screen.getAllByRole("link");
    expect(cards).toHaveLength(6);
  });

  it("should apply the correct color styles to each module", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Get the link elements first
    const userManagementLink = screen.getByRole("link", {
      name: /User Management/i,
    });
    const bookManagementLink = screen.getByRole("link", {
      name: /Book Management/i,
    });
    const authorManagementLink = screen.getByRole("link", {
      name: /Author Management/i,
    });
    const reviewManagementLink = screen.getByRole("link", {
      name: /Review Management/i,
    });
    const systemSettingsLink = screen.getByRole("link", {
      name: /System Settings/i,
    });
    const analyticsLink = screen.getByRole("link", { name: /Analytics/i });

    // Find the Card element (div) inside each link and check its class
    // The Card component renders a div, which holds the color classes
    expect(userManagementLink.querySelector("div")).toHaveClass(/blue/);
    expect(bookManagementLink.querySelector("div")).toHaveClass(/green/);
    expect(authorManagementLink.querySelector("div")).toHaveClass(/purple/);
    expect(reviewManagementLink.querySelector("div")).toHaveClass(/amber/);
    expect(systemSettingsLink.querySelector("div")).toHaveClass(/gray/);
    expect(analyticsLink.querySelector("div")).toHaveClass(/indigo/);
  });

  it("renders the dashboard title", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("renders all admin module cards", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    const modules = [
      "User Management",
      "Book Management",
      "Author Management",
      "Review Management",
      "System Settings",
      "Analytics",
    ];
    modules.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renders correct descriptions for each module", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    const descriptions = [
      "Manage system users, roles, and permissions",
      "Add, edit, and delete books in the catalog",
      "Manage author information and book relationships",
      "Moderate book reviews and ratings",
      "Configure application settings",
      "View usage statistics and reports",
    ];
    descriptions.forEach((desc) => {
      expect(screen.getByText(desc)).toBeInTheDocument();
    });
  });

  it("renders a link for each module", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    const links = [
      { href: "/admin/users", name: /User Management/i },
      { href: "/books", name: /Book Management/i },
      { href: "/authors", name: /Author Management/i },
      { href: "/admin/reviews", name: /Review Management/i },
      { href: "/admin/settings", name: /System Settings/i },
      { href: "/admin/analytics", name: /Analytics/i },
    ];
    links.forEach(({ href, name }) => {
      // Find the link by its accessible name (module title)
      const linkElement = screen.getByRole("link", { name: name });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute("href", href);
    });
  });

  it("renders an icon for each module", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    // There should be 6 SVG icons (one for each module)
    expect(document.querySelectorAll("svg").length).toBeGreaterThanOrEqual(6);
  });
});
