# Library Mobile

A React Native mobile application for the digital library management system.

## Technology Stack

- React Native 0.76.9
- Expo SDK 52
- TypeScript 5.3
- Expo Router 4.0 (for navigation)
- React Native Paper (UI components)
- Axios (API client)
- Expo SecureStore (for secure storage)
- Jest & React Test Renderer (for testing)

## Overview

The Library Mobile app provides a mobile client experience for the digital library system. It integrates with the Library API backend to provide a comprehensive library management experience on mobile devices.

## Features

- **User Authentication**
  - Secure login and signup
  - Email verification
  - Password reset functionality
  - JWT-based authentication with secure storage

- **Book Management**
  - Browse and search the book catalog
  - View detailed book information
  - Add books to personal collections
  - Leave reviews and ratings

- **User Profile**
  - View and edit user information
  - Manage personal book collections
  - Track reading history

- **Responsive UI**
  - Native mobile experience
  - Support for both light and dark themes
  - Haptic feedback for enhanced user experience
  - Smooth animations and transitions

- **Offline Capabilities**
  - Cache frequently accessed data
  - Synchronize when back online

## Project Structure

- `app/` - Contains the main application screens using Expo Router
  - `(tabs)/` - Tab-based navigation screens
  - `(auth)/` - Authentication-related screens
- `components/` - Reusable UI components
- `context/` - React context providers (e.g., AuthContext)
- `hooks/` - Custom React hooks
- `services/` - API service implementations
- `types/` - TypeScript type definitions
- `utils/` - Utility functions

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for macOS) or Android Emulator

### Installation

1. Clone the repository
2. Navigate to the library-mobile directory
3. Install the dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application

```bash
# Start the development server
npm start
# or
yarn start

# Run on iOS simulator
npm run ios
# or
yarn ios

# Run on Android emulator
npm run android
# or
yarn android
```

### Testing

```bash
# Run tests in watch mode
npm test
# or
yarn test

# Run tests for CI environment
npm run test:ci
# or
yarn test:ci
```

### Linting and Formatting

```bash
# Run linter
npm run lint
# or
yarn lint

# Fix linting issues
npm run lint:fix
# or
yarn lint:fix

# Format code with Prettier
npm run format
# or
yarn format

# Check types
npm run check-types
# or
yarn check-types

# Run all validation checks
npm run validate
# or
yarn validate
```

## Connecting to the API

The app connects to the Library API backend. By default, it will use the API URL defined in the Expo configuration. You can update this in the `api.ts` file if needed.

## Git Workflow

This project uses:
- Husky for git hooks
- Commitizen for standardized commit messages
- Conventional commit format
- ESLint and Prettier for code quality

To make a commit:
```bash
npm run commit
# or
yarn commit
```

## Reset Project

To reset the project to a clean state:
```bash
npm run reset-project
# or
yarn reset-project
```

## Troubleshooting

If you encounter any issues during development:

1. Make sure the backend API is running
2. Check that your device/emulator and API server are on the same network
3. Verify API URL configuration in `services/api.ts`
4. Try clearing the Expo cache: `expo start -c`

## License

This project is open source and available for personal and commercial use.
