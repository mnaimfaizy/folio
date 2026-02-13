import jwt from 'jsonwebtoken';
import { createUploadthing, type FileRouter } from 'uploadthing/express';
import { UploadThingError, UTApi } from 'uploadthing/server';
import config from './config/config';
import { UserRole } from './models/User';

const f = createUploadthing();
const utapi = new UTApi();

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function getExtensionLower(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return filename.slice(dotIndex).toLowerCase();
}

function requireAdminFromAuthHeader(authHeader: string | undefined): {
  userId: number | null;
} {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UploadThingError('Authentication required');
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;

  if (decoded?.role !== UserRole.ADMIN) {
    throw new UploadThingError('Access denied: Admin privilege required');
  }

  const userId = typeof decoded?.id === 'number' ? decoded.id : null;
  return { userId };
}

export const uploadRouter = {
  bookCover: f({
    image: {
      // UploadThing's `maxFileSize` is a typed union of specific values.
      // Use the nearest supported cap and enforce the exact 500KB limit below.
      maxFileSize: '512KB',
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const { userId } = requireAdminFromAuthHeader(req.headers.authorization);
      return { userId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      const ext = getExtensionLower(file.name);
      const mimeOk = allowedMimeTypes.has(file.type);
      const extOk = allowedExtensions.has(ext);

      const sizeBytes =
        'size' in file && typeof file.size === 'number' ? file.size : null;
      if (sizeBytes !== null && sizeBytes > 500 * 1024) {
        await utapi.deleteFiles(file.key);
        throw new UploadThingError('File too large. Max size is 500KB.');
      }

      if (!mimeOk || !extOk) {
        await utapi.deleteFiles(file.key);
        throw new UploadThingError(
          'Invalid file type. Only jpg, jpeg, png, webp are allowed.',
        );
      }

      return {
        uploadedBy: metadata.userId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
