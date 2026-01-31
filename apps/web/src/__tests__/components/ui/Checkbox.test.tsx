import { Checkbox } from "@/components/ui/checkbox";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Checkbox", () => {
  it("renders without crashing", () => {
    render(<Checkbox id="test-checkbox" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("can be checked", () => {
    render(<Checkbox id="test-checkbox" defaultChecked />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });
});
