import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine if running in Docker
const isRunningInDocker = process.env.RUNNING_IN_DOCKER === 'true';
const isProduction = process.env.NODE_ENV === 'production';

const resolveJwtSecret = (): string => {
  const envJwtSecret = process.env.JWT_SECRET;

  if (envJwtSecret) {
    return envJwtSecret;
  }

  if (isProduction) {
    throw new Error('JWT_SECRET must be set in production');
  }

  return 'development_jwt_secret_change_me';
};

const parseCorsAllowedOrigins = (): string[] => {
  const rawOrigins =
    process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL;

  if (!rawOrigins) {
    return [];
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const corsAllowedOrigins = parseCorsAllowedOrigins();

if (isProduction && corsAllowedOrigins.length === 0) {
  throw new Error(
    'CORS_ALLOWED_ORIGINS or FRONTEND_URL must be set in production',
  );
}

const config = {
  // Server configuration
  port: process.env.PORT || 3000,

  // JWT configuration
  jwt: {
    secret: resolveJwtSecret(),
    expiresIn: '24h', // Token expiry time
  },

  cors: {
    allowedOrigins: corsAllowedOrigins,
  },

  // Password reset configuration
  resetPassword: {
    expiryTime: parseInt(process.env.RESET_PASSWORD_EXPIRY || '3600000'), // Default: 1 hour
  },

  // Open Library API (for fetching book details by ISBN)
  openLibrary: {
    baseUrl: 'https://openlibrary.org/api',
  },

  // External book providers (admin-only imports)
  externalBooks: {
    openLibrary: {
      baseUrl: 'https://openlibrary.org/api',
      searchUrl: 'https://openlibrary.org/search.json',
    },
    googleBooks: {
      baseUrl: 'https://www.googleapis.com/books/v1',
      apiKey: process.env.GOOGLE_BOOKS_API_KEY || '',
    },
    isbnDb: {
      baseUrl: process.env.ISBNDB_BASE_URL || 'https://api2.isbndb.com',
      apiKey: process.env.ISBNDB_API_KEY || '',
    },
    loc: {
      baseUrl: 'https://www.loc.gov/books/',
    },
    wikidata: {
      endpoint: 'https://query.wikidata.org/sparql',
    },
    worldCat: {
      baseUrl: process.env.WORLDCAT_BASE_URL || '',
      wsKey: process.env.WORLDCAT_WSKEY || '',
    },
  },

  // Email configuration
  email: {
    host:
      process.env.SMTP_HOST || (isRunningInDocker ? 'mailhog' : 'localhost'),
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'library@example.com',
    service: process.env.EMAIL_SERVICE || '',
  },

  // Frontend URL for email links
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
};

export default config;
