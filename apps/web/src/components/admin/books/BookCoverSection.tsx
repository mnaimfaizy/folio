import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

/* ================================================================
   Book cover upload / preview section
   ================================================================ */

interface UploadedCover {
  url: string;
  key: string;
}

interface BookCoverSectionProps {
  uploadedCover: UploadedCover | null;
  isCoverUploading: boolean;
  isCoverRemoving: boolean;
  canUploadCover: boolean;
  coverInputRef: React.RefObject<HTMLInputElement>;
  watchedTitle: string;
  submitting: boolean;
  isCreateMode: boolean;
  openCoverFilePicker: () => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleRemoveCover: () => Promise<void>;
}

export function BookCoverSection({
  uploadedCover,
  isCoverUploading,
  isCoverRemoving,
  canUploadCover,
  coverInputRef,
  watchedTitle,
  submitting,
  isCreateMode,
  openCoverFilePicker,
  onFileInputChange,
  onDrop,
  handleRemoveCover,
}: BookCoverSectionProps) {
  const hasCover = Boolean(uploadedCover?.url);
  const canUpload = canUploadCover && !hasCover;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4">Book Cover</h2>

      <div
        className={cn('space-y-4', {
          'flex justify-between gap-4': isCreateMode,
        })}
      >
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFileInputChange}
        />

        {/* ── Drop zone ───────────────────────── */}
        <div
          className={cn('rounded-lg border border-dashed bg-muted/30 p-4', {
            'w-1/2 h-full': isCreateMode,
          })}
        >
          <div
            className={
              'flex flex-col items-center justify-center text-center gap-3 rounded-lg p-6 min-h-40 ' +
              (canUpload ? 'cursor-pointer' : 'cursor-not-allowed')
            }
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              if (!hasCover) onDrop(e);
            }}
            onClick={() => {
              if (!hasCover) openCoverFilePicker();
            }}
          >
            <div className="text-sm text-muted-foreground">
              {isCoverUploading
                ? 'Uploading cover...'
                : hasCover
                  ? 'Remove the current cover to upload a new one'
                  : watchedTitle?.trim()
                    ? 'Drop image here or click to upload'
                    : 'Enter a title to enable cover upload'}
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!canUpload}
              onClick={(e) => {
                e.stopPropagation();
                openCoverFilePicker();
              }}
            >
              Choose Image
            </Button>
            <div className="text-xs text-muted-foreground">
              JPG/PNG/WebP · max 500KB
            </div>
          </div>
        </div>

        {/* ── Preview ─────────────────────────── */}
        <div
          className={cn(
            'rounded-lg border bg-muted/30 p-4 flex items-center justify-center',
            {
              'w-1/2 h-full': isCreateMode,
            },
          )}
        >
          {uploadedCover?.url ? (
            <div className="relative">
              <img
                src={uploadedCover.url}
                alt="Uploaded cover"
                className="w-36 h-52 object-cover rounded-md border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/300x450?text=No+Cover';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full"
                disabled={submitting || isCoverUploading || isCoverRemoving}
                onClick={() => void handleRemoveCover()}
                aria-label="Remove uploaded cover"
                title="Remove"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-8">
              No cover uploaded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
