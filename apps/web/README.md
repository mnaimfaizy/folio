# Library UI

![Coverage](https://img.shields.io/badge/coverage-91%25-brightgreen)

A modern, responsive user interface for a library management system built with React, TypeScript, and Vite.

## 📚 Project Overview

Library UI provides a comprehensive interface for managing a library's digital presence. It supports user authentication, book browsing, and book management functionalities.

## ✨ Features

- **User Authentication**

  - Login & Signup
  - Password Management (Reset, Change)
  - Email Verification

- **Book Management**

  - Browse books in catalog or list view
  - Add new books
  - Edit existing books
  - Book details view

- **Modern UI Components**
  - Responsive design with Tailwind CSS
  - Accessible components using Radix UI primitives
  - Custom UI component library

## 🛠️ Tech Stack

- **React 19** - Frontend library
- **TypeScript** - Static type checking
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI components
- **Lucide React** - Icon library
- **Shadcn UI** - Component collection based on Radix UI

## 🚀 Getting Started

### Prerequisites

- Node.js (recommended: latest LTS version)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the library-ui directory:
   ```
   cd library-ui
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

### Development

Start the development server:

```
npm run dev
```

or

```
yarn dev
```

Open your browser and visit `http://localhost:5173`

### Building for Production

Build the project:

```
npm run build
```

or

```
yarn build
```

Preview the production build:

```
npm run preview
```

or

```
yarn preview
```

## 📊 Testing and Test Coverage

Current test coverage metrics:

- **91%** statement coverage
- **86%** branch coverage
- **89%** function coverage
- **92%** line coverage

Our test suite is built with Vitest and React Testing Library, providing comprehensive coverage of the application functionality:

### Types of Tests

1. **Unit Tests** - Testing individual functions and utilities
2. **Component Tests** - Testing React components in isolation
3. **Integration Tests** - Testing interactions between components
4. **Snapshot Tests** - Ensuring UI components render consistently over time

### Key Test Files

- **Components**

  - Auth components (`LoginComponent.test.tsx`, `SignUpComponent.test.tsx`)
  - Book components (`BookDetailsComponent.test.tsx`, `BooksCatalogComponent.test.tsx`, `ReviewFormComponent.test.tsx`)
  - Auth guards (`AuthGuard.test.tsx`, `GuestGuard.test.tsx`, `AdminGuard.test.tsx`)
  - UI components (`Button.test.tsx` with snapshots)

- **Store and Services**

  - Redux store testing (`store/index.test.ts`)

- **Integration Tests**
  - Complete user flows (`UserBookCollectionFlow.test.tsx`)

### Running Tests

Run all tests:

```
npm test
```

Generate a coverage report:

```
npm run test:coverage
```

View the coverage report in the `coverage` directory after generation. It provides detailed information about which parts of the codebase are covered by tests.

## 🔄 Continuous Integration

This project is configured with GitHub Actions for continuous integration. The workflow (`library-ui-ci.yml`) is organized into separate jobs:

1. **Install Dependencies** - Sets up the environment and caches node_modules
2. **Lint** - Runs ESLint to ensure code quality
3. **Test** - Executes tests and generates coverage reports
4. **Build** - Creates a production build of the application

Each job runs independently, providing clear visibility into which step might fail during the CI process.

## 🔗 Related Projects

This UI interfaces with the library-api backend service located in the parent directory.

## 📊 Project Structure

```
library-ui/
├── public/            # Static assets
├── src/
│   ├── assets/        # Project assets (images, etc.)
│   ├── components/    # UI components
│   │   ├── auth/      # Authentication components
│   │   ├── books/     # Book management components
│   │   ├── landing/   # Landing page components
│   │   ├── shared/    # Shared components (Header, Footer, etc.)
│   │   └── ui/        # Base UI components
│   ├── lib/           # Library code and utilities
│   ├── __tests__/     # Test files organized by component/feature
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
└── [config files]     # Various configuration files
```

## 📝 License

This project is licensed under the MIT License.
