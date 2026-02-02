import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
const apiVersion = process.env.npm_package_version ?? '1.0.0';

function toPosixPath(p: string): string {
  return p.split(path.sep).join('/');
}

const workspaceRoot = process.env.NX_WORKSPACE_ROOT || process.cwd();
const workspaceApiRoot = path.resolve(workspaceRoot, 'apps/api');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Library API Documentation',
    version: apiVersion,
    description: 'Documentation for the Library REST API',
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
    contact: {
      name: 'API Support',
      email: 'support@library-api.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.library-api.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

// Options for the swagger docs
const options = {
  definition: swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: [
    // Prefer workspace source files (works even if the app is served from a bundled dist build).
    `${toPosixPath(path.resolve(workspaceApiRoot, 'routes'))}/**/*.ts`,
    `${toPosixPath(path.resolve(workspaceApiRoot, 'routes'))}/**/*.js`,
    `${toPosixPath(path.resolve(workspaceApiRoot, 'models'))}/**/*.ts`,
    `${toPosixPath(path.resolve(workspaceApiRoot, 'models'))}/**/*.js`,

    // Works both when running TS directly and when running compiled JS from dist/.
    // Convert to forward slashes so globbing works reliably on Windows.
    `${toPosixPath(path.resolve(__dirname, '../routes'))}/**/*.ts`,
    `${toPosixPath(path.resolve(__dirname, '../routes'))}/**/*.js`,
    `${toPosixPath(path.resolve(__dirname, '../models'))}/**/*.ts`,
    `${toPosixPath(path.resolve(__dirname, '../models'))}/**/*.js`,
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
