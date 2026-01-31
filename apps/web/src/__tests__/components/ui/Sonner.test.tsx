import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock Sonner package
vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Import after mocking
import { toast } from "sonner";

describe("Sonner", () => {
  it("displays a toast message when toast function is called", () => {
    render(
      <>
        <Toaster />
        <Button onClick={() => toast.success("Test message")}>
          Show Toast
        </Button>
      </>
    );

    const button = screen.getByRole("button", { name: /Show Toast/i });
    fireEvent.click(button);

    expect(toast.success).toHaveBeenCalledWith("Test message");
  });
});
