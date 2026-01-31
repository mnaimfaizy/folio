import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../../../components/ui/button";

describe("Button Component", () => {
  it("renders default button correctly", () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container).toMatchSnapshot();
  });

  it("renders different variants correctly", () => {
    const variants = [
      "default",
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link",
    ] as const;

    variants.forEach((variant) => {
      const { container } = render(
        <Button variant={variant}>Button {variant}</Button>
      );
      expect(container).toMatchSnapshot();
    });
  });

  it("renders different sizes correctly", () => {
    const sizes = ["default", "sm", "lg", "icon"] as const;

    sizes.forEach((size) => {
      const { container } = render(<Button size={size}>Button {size}</Button>);
      expect(container).toMatchSnapshot();
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <Button className="custom-class">Custom Button</Button>
    );
    expect(container).toMatchSnapshot();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders as a link when asChild is used with anchor", () => {
    const { container } = render(
      <Button asChild>
        <a href="https://example.com">Link Button</a>
      </Button>
    );
    expect(container).toMatchSnapshot();
    expect(container.querySelector("a")).toHaveAttribute(
      "href",
      "https://example.com"
    );
  });

  it("forwards props correctly", () => {
    const { container } = render(
      <Button disabled aria-label="Test Button" data-testid="test-button">
        Disabled Button
      </Button>
    );
    expect(container).toMatchSnapshot();
    expect(container.firstChild).toHaveAttribute("disabled", "");
    expect(container.firstChild).toHaveAttribute("aria-label", "Test Button");
    expect(container.firstChild).toHaveAttribute("data-testid", "test-button");
  });
});
