import {
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/react';
import { genUploader } from 'uploadthing/client';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const UploadButton = generateUploadButton({
  url: `${API_BASE_URL}/api/uploadthing`,
});

export const UploadDropzone = generateUploadDropzone({
  url: `${API_BASE_URL}/api/uploadthing`,
});

export const uploadthingUploader = genUploader({
  url: `${API_BASE_URL}/api/uploadthing`,
});
