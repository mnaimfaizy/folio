import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { createRouteHandler } from 'uploadthing/express';
import config from './config/config';
import swaggerSpec from './config/swagger';
import { connectDatabase } from './db/database';
import adminRoutes from './routes/admin';
import authorRoutes from './routes/authorRoutes';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import loanRoutes from './routes/loanRoutes';
import requestRoutes from './routes/requestRoutes';
import reviewRoutes from './routes/reviewRoutes';
import settingsRoutes from './routes/settingsRoutes';
import { uploadRouter } from './uploadthing';
import { startLoanReminderScheduler } from './utils/loanReminderScheduler';

// Load environment variables
dotenv.config();

// Connect to database
connectDatabase().catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

startLoanReminderScheduler();

// Initialize express app
export const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const shouldExposeApiDocs =
  !isProduction || process.env.ENABLE_SWAGGER_IN_PRODUCTION === 'true';

app.disable('x-powered-by');

// cPanel/Passenger typically runs behind a reverse proxy that sets X-Forwarded-For.
// express-rate-limit validates this header and requires trust proxy to be enabled.
// Trust a single proxy hop (safer than `true`).
if (isProduction) {
  app.set('trust proxy', 1);
}

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!isProduction) {
        callback(null, true);
        return;
      }

      if (config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed'));
    },
  }),
);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting only in production to avoid dev lockouts
if (isProduction) {
  app.use(apiLimiter);
}

// Request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const elapsedMs = Date.now() - startedAt;
    console.info(
      JSON.stringify({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        elapsedMs,
      }),
    );
  });

  next();
});

// Swagger documentation
if (shouldExposeApiDocs) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api', reviewRoutes);
app.use('/api/admin', adminRoutes); // Mount admin routes
app.use('/api/settings', settingsRoutes); // Public settings endpoint

// UploadThing (must be served from /api/uploadthing)
app.use(
  '/api/uploadthing',
  createRouteHandler({
    router: uploadRouter,
    config: {
      token: process.env.UPLOADTHING_TOKEN,
    },
  }),
);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Library API is running' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err.message === 'CORS origin not allowed') {
    res.status(403).json({ message: 'Origin not allowed' });
    return;
  }

  console.error(err);
  res.status(500).json({
    message: isProduction ? 'Internal server error' : 'Something went wrong',
  });
});

// Start the server
const PORT = config.port;

// Don't start the server if we're running tests (it will be handled by supertest)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (shouldExposeApiDocs) {
      console.log(
        `Swagger documentation available at http://localhost:${PORT}/api-docs`,
      );
    }
  });
}
