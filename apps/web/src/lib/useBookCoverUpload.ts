import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import AdminService from '@/services/adminService';
import { uploadthingUploader } from '@/lib/uploadthing';
import { TokenManager } from '@/services/tokenManager';

export type UploadedCover = { url: string; key: string };

type UseBookCoverUploadOptions = {
  getTitle: () => string;
  initialCover?: UploadedCover | null;
  disabled?: boolean;
};

const slugifyTitle = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return slug || 'untitled-book';
};

export function useBookCoverUpload(options: UseBookCoverUploadOptions) {
  const { getTitle, initialCover = null, disabled = false } = options;

  const [uploadedCover, setUploadedCover] = useState<UploadedCover | null>(
    initialCover,
  );
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isCoverRemoving, setIsCoverRemoving] = useState(false);

  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const canUploadCover = useMemo(() => {
    const title = getTitle()?.trim();
    return Boolean(title) && !disabled && !isCoverUploading && !isCoverRemoving;
  }, [getTitle, disabled, isCoverUploading, isCoverRemoving]);

  const openCoverFilePicker = useCallback(() => {
    if (!getTitle()?.trim()) {
      toast.warning('Please enter a book title before uploading the cover.');
      return;
    }
    if (!canUploadCover) return;
    coverInputRef.current?.click();
  }, [getTitle, canUploadCover]);

  const uploadCoverFile = useCallback(
    async (file: File) => {
      const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
      const maxBytes = 500 * 1024;

      const title = getTitle() || '';
      if (!title.trim()) {
        toast.warning('Please enter a book title before uploading the cover.');
        return;
      }

      if (!allowed.has(file.type)) {
        toast.warning(
          'Invalid file type. Only jpg, jpeg, png, webp are allowed.',
        );
        return;
      }

      if (file.size > maxBytes) {
        toast.warning('File too large. Max size is 500KB.');
        return;
      }

      const originalName = file.name || 'cover';
      const dotIndex = originalName.lastIndexOf('.');
      const ext =
        dotIndex >= 0 ? originalName.slice(dotIndex).toLowerCase() : '';
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
        ? ext
        : file.type === 'image/jpeg'
          ? '.jpg'
          : file.type === 'image/png'
            ? '.png'
            : file.type === 'image/webp'
              ? '.webp'
              : '';

      const desiredName = `${slugifyTitle(title)}${safeExt}`;
      const renamedFile = new File([file], desiredName, { type: file.type });

      const token = TokenManager.getToken();
      if (!token) {
        toast.error('You must be logged in as an admin to upload a cover.');
        return;
      }

      const previousCoverKey = uploadedCover?.key || null;

      setIsCoverUploading(true);
      try {
        const res = await uploadthingUploader.uploadFiles('bookCover', {
          files: [renamedFile],
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const first = res?.[0] as { url?: string; key?: string } | undefined;
        if (!first?.url || !first?.key) {
          toast.error('Upload failed. Please try again.');
          return;
        }

        setUploadedCover({ url: first.url, key: first.key });
        toast.success('Cover uploaded successfully.');

        if (previousCoverKey && previousCoverKey !== first.key) {
          try {
            await AdminService.deleteCoverUpload(previousCoverKey);
          } catch (cleanupError) {
            console.warn(
              'Failed to delete previous cover upload:',
              cleanupError,
            );
          }
        }
      } catch (error) {
        console.error('Cover upload failed:', error);
        toast.error('Upload failed. Please try again.');
      } finally {
        setIsCoverUploading(false);
      }
    },
    [getTitle, uploadedCover],
  );

  const handleRemoveCover = useCallback(async () => {
    if (!uploadedCover) {
      return;
    }

    setIsCoverRemoving(true);
    try {
      if (uploadedCover.key) {
        await AdminService.deleteCoverUpload(uploadedCover.key);
      }
      setUploadedCover(null);
      toast.success('Cover removed.');
    } catch (error) {
      console.error('Failed to remove cover:', error);
      toast.error('Failed to remove cover. Please try again.');
    } finally {
      setIsCoverRemoving(false);
    }
  }, [uploadedCover]);

  const onFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      void uploadCoverFile(file);
      event.target.value = '';
    },
    [uploadCoverFile],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (!file) return;
      void uploadCoverFile(file);
    },
    [uploadCoverFile],
  );

  const setCoverFromServer = useCallback((cover: UploadedCover | null) => {
    setUploadedCover(cover);
  }, []);

  return {
    uploadedCover,
    setUploadedCover: setCoverFromServer,
    isCoverUploading,
    isCoverRemoving,
    coverInputRef,
    canUploadCover,
    slugifyTitle,
    openCoverFilePicker,
    uploadCoverFile,
    onFileInputChange,
    onDrop,
    handleRemoveCover,
  };
}
