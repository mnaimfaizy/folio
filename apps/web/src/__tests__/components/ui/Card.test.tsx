import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Card Component", () => {
  it("renders the Card component with all parts", () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Card Title</CardTitle>
          <CardDescription data-testid="card-description">
            Card Description
          </CardDescription>
        </CardHeader>
        <CardContent data-testid="card-content">
          <p>Card Content</p>
        </CardContent>
        <CardFooter data-testid="card-footer">
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-title")).toHaveTextContent("Card Title");
    expect(screen.getByTestId("card-description")).toHaveTextContent(
      "Card Description"
    );
    expect(screen.getByTestId("card-content")).toHaveTextContent(
      "Card Content"
    );
    expect(screen.getByTestId("card-footer")).toHaveTextContent("Card Footer");
  });
});
