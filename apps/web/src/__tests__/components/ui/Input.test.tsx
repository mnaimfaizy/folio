import { Input } from "@/components/ui/input";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Input", () => {
  it("renders without crashing", () => {
    render(<Input type="text" placeholder="Test Input" />);
    const input = screen.getByPlaceholderText("Test Input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });
});
