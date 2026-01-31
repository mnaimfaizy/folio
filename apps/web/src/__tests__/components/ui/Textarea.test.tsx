import { Textarea } from "@/components/ui/textarea";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Textarea", () => {
  it("renders without crashing", () => {
    render(<Textarea placeholder="Test Textarea" />);
    const textarea = screen.getByPlaceholderText("Test Textarea");
    expect(textarea).toBeInTheDocument();
  });
});
