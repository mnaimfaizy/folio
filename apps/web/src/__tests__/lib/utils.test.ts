import { describe, expect, it } from "vitest";
import { cn } from "../../lib/utils";

describe("Utility functions", () => {
  describe("cn function", () => {
    it("merges class names correctly", () => {
      expect(cn("text-red-500", "bg-blue-200")).toBe(
        "text-red-500 bg-blue-200"
      );
    });

    it("removes duplicate classes", () => {
      expect(cn("text-red-500", "text-red-500")).toBe("text-red-500");
    });

    it("handles conditional classes", () => {
      const condition = true;
      expect(cn("base-class", condition && "conditional-class")).toBe(
        "base-class conditional-class"
      );
    });

    it("handles falsy values", () => {
      const condition = false;
      expect(cn("base-class", condition && "conditional-class")).toBe(
        "base-class"
      );
    });

    it("handles undefined and null values", () => {
      expect(cn("base-class", undefined, null, "valid-class")).toBe(
        "base-class valid-class"
      );
    });

    it("handles Tailwind conflicts correctly", () => {
      // The latter class should override the former when they conflict
      expect(cn("p-2", "p-4")).toBe("p-4");

      // We need to adapt the test to how twMerge actually works
      // It will preserve the order of non-conflicting classes
      const result = cn("text-sm text-gray-500", "text-lg");
      // Check that both the expected classes are in the result
      expect(result).toContain("text-lg");
      expect(result).toContain("text-gray-500");
      // Make sure text-sm is not in the result since it conflicts with text-lg
      expect(result).not.toContain("text-sm");
    });

    it("handles complex class combinations", () => {
      const isActive = true;
      const isDisabled = false;

      expect(
        cn(
          "base-style",
          isActive ? "active" : "inactive",
          isDisabled && "disabled",
          "common-style"
        )
      ).toBe("base-style active common-style");
    });
  });
});
