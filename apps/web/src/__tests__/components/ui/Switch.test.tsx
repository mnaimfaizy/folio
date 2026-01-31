import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Switch", () => {
  it("renders without crashing", () => {
    render(
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>
    );
    const switchControl = screen.getByRole("switch");
    expect(switchControl).toBeInTheDocument();
    expect(screen.getByLabelText("Airplane Mode")).toBeInTheDocument();
  });
});
