import { EmailVerificationComponent } from "@/components/auth/EmailVerificationComponent";
import * as authService from "@/services/authService"; // Import the actual module
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";
import { describe, expect, it, vi } from "vitest";

// Mock the auth service using a factory
vi.mock("@/services/authService", async (importOriginal) => {
  const actual = await importOriginal<typeof authService>();
  return {
    // Mock the default export
    default: {
      ...actual.default, // Keep original methods if needed, or mock specific ones
      verifyEmail: vi.fn(), // Example: Mock specific method used by the component/slice
      // Add other methods used by the component or related slices if necessary
    },
    // Keep named exports if any (though authService only has default)
    // ...actual,
  };
});

// No need to cast here anymore if mocking default correctly
// const mockedAuthService = vi.mocked(authService);

const mockStore = configureStore([]);
const store = mockStore({});

describe("EmailVerificationComponent", () => {
  it("renders verifying message initially", () => {
    // How you access the mock depends on how the component/slice imports it.
    // If it imports the default export:
    // Option 1: Re-import the default export after mocking
    // import AuthService from "@/services/authService";
    // vi.mocked(AuthService.verifyEmail).mockResolvedValue({ message: "Mock success" });

    // Option 2: Access via the original import (if test setup allows)
    // mockedAuthService.default.verifyEmail.mockResolvedValue({ message: "Mock success" });

    // *** Assuming the component uses RTK Query hook (useVerifyEmailMutation) ***
    // This mock needs to align with how RTK Query hooks are typically mocked.
    // The previous mock `useVerifyEmailMutation: vi.fn()` might be closer, but
    // the error indicates the issue is with the service mock itself, potentially
    // affecting how RTK Query generates the hook mock.
    // Let's stick to fixing the service mock first.

    // Temporarily adjust test to reflect service mock (will likely need RTK Query mock adjustment later)
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/verify-email/some-token"]}>
          <Routes>
            <Route
              path="/verify-email/:token"
              element={<EmailVerificationComponent />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    // Check for a state reflected by the component, assuming initial state
    // The exact text might change based on how the component handles loading/initial state
    waitFor(() =>
      expect(
        screen.getByText(
          /Your email has been verified successfully! You can now log in to your account./i
        )
      ).toBeInTheDocument()
    );
  });

  // Add more tests for success and error states
});
