import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import AuthService, {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  UpdateProfileResponse,
} from "../../services/authService";

// User type definition
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// API Error interface
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Auth State interface
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  emailVerified: boolean;
  verificationRequired: boolean;
}

// Initialize auth state from localStorage if available
const user = AuthService.getCurrentUser();
const token = localStorage.getItem("token");

const initialState: AuthState = {
  user: user,
  token: token,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
  emailVerified: true, // Assume true initially, will be set to false if API returns that info
  verificationRequired: false,
};

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      return response;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err?.response?.data?.message || "Login failed");
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (userData: SignupRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.signup(userData);
      return response;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err?.response?.data?.message || "Signup failed");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  AuthService.logout();
  return true;
});

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await AuthService.verifyEmail(token);
      return response;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err?.response?.data?.message || "Email verification failed"
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await AuthService.changePassword(
        currentPassword,
        newPassword
      );
      return response;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err?.response?.data?.message || "Password change failed"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await AuthService.updateProfile(name);
      return response;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (password: string, { rejectWithValue }) => {
    try {
      const response = await AuthService.deleteAccount(password);
      return response;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err?.response?.data?.message || "Failed to delete account"
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    },
    setVerificationRequired: (state, action: PayloadAction<boolean>) => {
      state.verificationRequired = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login actions
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Signup actions
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.isLoading = false;
        state.verificationRequired = true; // Set verification required flag, but don't set user or token
        state.error = null;
        // User should not be authenticated until they verify their email and login
        state.isAuthenticated = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Logout actions
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.emailVerified = false;
      })

      // Email verification actions
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
        state.emailVerified = true;
        state.verificationRequired = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Change password actions
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update profile actions
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<UpdateProfileResponse>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.error = null;
        }
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete account actions
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAuthError, setVerificationRequired } = authSlice.actions;

export default authSlice.reducer;
