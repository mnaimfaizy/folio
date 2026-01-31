import { StarRating } from "@/components/ui/star-rating";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("StarRating", () => {
  it("renders the correct number of stars", () => {
    render(<StarRating rating={3} maxRating={5} />); // Removed setRating and interactive for this test
    const filledStars = screen.getAllByTestId("filled-star");
    const emptyStars = screen.getAllByTestId("empty-star");
    expect(filledStars.length + emptyStars.length).toBe(5); // Check total stars
    expect(filledStars).toHaveLength(3); // Check filled stars based on rating
    expect(emptyStars).toHaveLength(2); // Check empty stars
  });

  it("calls setRating when a star is clicked", () => {
    const setRatingMock = vi.fn();
    render(
      <StarRating
        rating={0}
        maxRating={5}
        interactive
        onRatingChange={setRatingMock} // Use onRatingChange prop
      />
    );
    const stars = screen.getAllByRole("button"); // Should find buttons now
    expect(stars).toHaveLength(5); // Verify 5 interactive stars are found
    fireEvent.click(stars[2]); // Click the 3rd star (index 2, value 3)
    expect(setRatingMock).toHaveBeenCalledWith(3);
  });

  it("displays the correct initial rating", () => {
    render(<StarRating rating={4} maxRating={5} />); // Removed setRating and interactive
    const filledStars = screen.getAllByTestId("filled-star");
    const emptyStars = screen.getAllByTestId("empty-star");
    expect(filledStars).toHaveLength(4);
    expect(emptyStars).toHaveLength(1);
  });

  // Add a test for toggling off
  it("toggles rating off when clicking the currently selected star", () => {
    const setRatingMock = vi.fn();
    render(
      <StarRating
        rating={3} // Start with rating 3
        maxRating={5}
        interactive
        onRatingChange={setRatingMock}
      />
    );
    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[2]); // Click the 3rd star again (index 2, value 3)
    // Expect it to call with rating - 1 (which is 2) because it toggles off
    expect(setRatingMock).toHaveBeenCalledWith(2);
  });
});
