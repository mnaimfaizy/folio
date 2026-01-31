import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

describe("Select", () => {
  beforeAll(() => {
    // Mock scrollIntoView since jsdom doesn't implement it
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders select trigger and opens content on click", async () => {
    const { baseElement } = render(
      <Select defaultValue="apple">
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByTestId("select-trigger");
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();

    // Content should not be visible initially
    expect(screen.queryByText("Banana")).not.toBeInTheDocument();

    // Click the trigger to open the dropdown
    await act(async () => {
      fireEvent.click(trigger);
    });

    // Content should be visible after click - check in baseElement since it's rendered in a portal
    expect(baseElement.querySelector('[role="listbox"]')).toBeInTheDocument();
    expect(baseElement.querySelector('[role="listbox"]')).toBeVisible();
    expect(baseElement.querySelector('[role="listbox"]')).toHaveTextContent(
      "Apple"
    );
    expect(baseElement.querySelector('[role="listbox"]')).toHaveTextContent(
      "Banana"
    );
    expect(baseElement.querySelector('[role="listbox"]')).toHaveTextContent(
      "Fruits"
    );
  });
});
