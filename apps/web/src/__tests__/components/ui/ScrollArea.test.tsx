import { ScrollArea } from "@/components/ui/scroll-area";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("ScrollArea", () => {
  it("renders its children", () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div>Scrollable Content</div>
      </ScrollArea>
    );
    expect(screen.getByTestId("scroll-area")).toBeInTheDocument();
    expect(screen.getByText("Scrollable Content")).toBeInTheDocument();
  });
});
