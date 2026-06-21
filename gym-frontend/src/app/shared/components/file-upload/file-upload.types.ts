export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  preview?: string | ArrayBuffer | null;
  progress?: number;
  status?: 'uploading' | 'completed' | 'error' | 'idle';
  error?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  id?: string;
  url?: string;
}

export interface FileUploadConfig {
  maxSize?: number;
  acceptedTypes?: string;
  multiple?: boolean;
  maxFiles?: number;
  autoUpload?: boolean;
  uploadEndpoint?: string;
}

export interface FileUploadEvent {
  files: UploadedFile[];
  type: 'added' | 'removed' | 'uploaded' | 'error';
}