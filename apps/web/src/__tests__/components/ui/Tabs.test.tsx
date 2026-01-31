import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Tabs", () => {
  it("renders tabs structure", () => {
    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account content</TabsContent>
        <TabsContent value="password">Password content</TabsContent>
      </Tabs>
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /password/i })).toBeInTheDocument();
    expect(screen.getByText("Account content")).toBeInTheDocument();
    // Initially, only the default tab content should be visible
    expect(screen.queryByText("Password content")).not.toBeInTheDocument();
  });
});
