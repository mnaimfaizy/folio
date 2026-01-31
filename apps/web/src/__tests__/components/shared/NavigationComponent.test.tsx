import { NavigationComponent } from "@/components/shared/NavigationComponent";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { describe, expect, it } from "vitest";

// Mock the store
const mockStore = configureStore([]);

describe("NavigationComponent", () => {
  it("does not render when user is not authenticated", () => {
    const store = mockStore({
      auth: { user: null, token: null, isAuthenticated: false },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <NavigationComponent />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("renders navigation when user is authenticated", () => {
    const store = mockStore({
      auth: {
        user: { id: 1, name: "Test User", role: "USER" },
        token: "test-token",
        isAuthenticated: true,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <NavigationComponent />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
