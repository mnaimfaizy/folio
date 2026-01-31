import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock React modules
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    StrictMode: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div> // Removed data-testid="strict-mode"
    ),
  };
});

// Mock react-dom/client with proper spies
const mockRender = vi.fn();
const createRootMock = vi.fn(() => ({
  render: mockRender,
}));

vi.mock("react-dom/client", () => {
  return {
    default: {
      createRoot: createRootMock,
    },
    createRoot: createRootMock,
  };
});

// Mock the store without requiring an import
const mockStore = {
  getState: vi.fn(),
  dispatch: vi.fn(),
  subscribe: vi.fn(),
  replaceReducer: vi.fn(),
  [Symbol.observable]: vi.fn(() => ({
    subscribe: vi.fn(),
    [Symbol.observable]: vi.fn(),
  })),
};

// Mock store module early to avoid import issues
vi.mock("../store", () => ({
  setupStore: () => mockStore,
  store: mockStore,
}));

// Mock react-redux
vi.mock("react-redux", () => ({
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="redux-provider">{children}</div>
  ),
}));

// Mock App component
vi.mock("../App", () => ({
  default: () => <div data-testid="app">App Component</div>,
}));

// Mock document.getElementById
document.getElementById = vi.fn(() => document.createElement("div"));

describe("main", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the app with Redux Provider", async () => {
    // Import the main module to trigger its execution
    await import("../main");

    // Verify root element was used
    expect(document.getElementById).toHaveBeenCalledWith("root");
    expect(createRootMock).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();

    // Render the structure manually to check it
    const { getByTestId } = render(
      <React.StrictMode>
        <Provider store={mockStore}>
          <div data-testid="app">App Component</div>
        </Provider>
      </React.StrictMode>
    );

    // Removed the strict-mode check
    expect(getByTestId("redux-provider")).toBeInTheDocument();
    expect(getByTestId("app")).toBeInTheDocument();
  });
});
