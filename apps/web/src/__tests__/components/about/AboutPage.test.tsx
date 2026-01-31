import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AboutPage } from "../../../components/about/AboutPage";

// Mock the shared component to isolate the AboutPage tests
vi.mock("@/components/shared/BookSuggestionsComponent", () => ({
  BookSuggestionsComponent: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div data-testid="book-suggestions">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
}));

describe("AboutPage", () => {
  it("renders the main heading and description", () => {
    render(<AboutPage />);
    expect(
      screen.getByRole("heading", { name: /About Our Library/i, level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Discover how we've been serving readers and promoting literacy/i
      )
    ).toBeInTheDocument();
  });

  it("renders the Mission and Vision sections", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Our Mission/i)).toBeInTheDocument();
    expect(
      screen.getByText(/To inspire, educate, and empower our community/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Our Vision/i)).toBeInTheDocument();
    expect(
      screen.getByText(/To be a vibrant hub where knowledge, creativity/i)
    ).toBeInTheDocument();
  });

  it("renders the Library by the Numbers section with facts", () => {
    render(<AboutPage />);
    expect(
      screen.getByRole("heading", { name: /Library by the Numbers/i, level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText(/Books in Collection/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /50,000\+/i, level: 3 })
    ).toBeInTheDocument(); // Use getByRole for consistency
    expect(screen.getByText(/Active Members/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /12,000\+/i, level: 3 })
    ).toBeInTheDocument(); // Use getByRole for consistency
    expect(screen.getByText(/Years of Service/i)).toBeInTheDocument();
    // Fix: Use getByRole with appropriate level and escaped '+'
    expect(
      screen.getByRole("heading", { name: /30\+/i, level: 3 })
    ).toBeInTheDocument();
    expect(screen.getByText(/Community Awards/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /15/i, level: 3 })
    ).toBeInTheDocument(); // Use getByRole for consistency
  });

  it("renders the Our History section", () => {
    render(<AboutPage />);
    expect(
      screen.getByRole("heading", { name: /Our History/i, level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Founded in 1990, our library began as a small community/i
      )
    ).toBeInTheDocument();
  });

  it("renders the Library Team section with team members", () => {
    render(<AboutPage />);
    expect(
      screen.getByRole("heading", { name: /Our Library Team/i, level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
    expect(screen.getByText("Head Librarian")).toBeInTheDocument();
    expect(screen.getByText("David Chen")).toBeInTheDocument();
    expect(screen.getByText("Digital Resources Manager")).toBeInTheDocument();
    expect(screen.getByText("Maya Patel")).toBeInTheDocument();
    expect(screen.getByText("Community Outreach")).toBeInTheDocument();
    expect(screen.getByText("James Wilson")).toBeInTheDocument();
    expect(screen.getByText("Technical Services")).toBeInTheDocument();
  });

  it("renders the Programs & Services section", () => {
    render(<AboutPage />);
    expect(
      screen.getByRole("heading", { name: /Programs & Services/i, level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText("Reading Clubs")).toBeInTheDocument();
    expect(screen.getByText("Digital Literacy")).toBeInTheDocument();
    expect(screen.getByText("Academic Support")).toBeInTheDocument();
    expect(screen.getByText("Author Events")).toBeInTheDocument();
    expect(screen.getByText("Children's Programming")).toBeInTheDocument();
    expect(screen.getByText("Community Space")).toBeInTheDocument();
  });

  it("renders the BookSuggestionsComponent", () => {
    render(<AboutPage />);
    expect(screen.getByTestId("book-suggestions")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Discover Our Collection/i,
        level: 2,
      }) // Mocked component renders h2
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Browse some of our most popular titles/i)
    ).toBeInTheDocument();
  });
});
