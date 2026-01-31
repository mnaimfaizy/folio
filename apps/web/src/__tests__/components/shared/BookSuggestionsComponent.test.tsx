import { BookSuggestionsComponent } from "@/components/shared/BookSuggestionsComponent";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

describe("BookSuggestionsComponent", () => {
  it("renders without crashing", () => {
    render(
      <BrowserRouter>
        <BookSuggestionsComponent />
      </BrowserRouter>
    );

    // Check for default title and description
    expect(screen.getByText("Recommended Books")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Explore staff picks and highly rated books from our collection"
      )
    ).toBeInTheDocument();
  });
});
