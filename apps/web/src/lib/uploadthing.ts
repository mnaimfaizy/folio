import { generateUploadButton } from '@uploadthing/react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const UploadButton = generateUploadButton({
  url: `${API_BASE_URL}/api/uploadthing`,
});
