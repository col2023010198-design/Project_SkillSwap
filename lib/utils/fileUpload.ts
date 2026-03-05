import { supabase } from '../supabase';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain',
  ...ALLOWED_IMAGE_TYPES
];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  // Check file size
  const maxSize = ALLOWED_IMAGE_TYPES.includes(file.type) ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported'
    };
  }

  return { isValid: true };
}

export function getFileType(mimeType: string): 'image' | 'file' {
  return ALLOWED_IMAGE_TYPES.includes(mimeType) ? 'image' : 'file';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export async function uploadMessageAttachment(
  file: File,
  userId: string
): Promise<{ url: string; error?: string }> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return { url: '', error: validation.error };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('message-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: '', error: 'Failed to upload file' };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl };
  } catch (err) {
    console.error('Unexpected upload error:', err);
    return { url: '', error: 'An unexpected error occurred' };
  }
}

export async function deleteMessageAttachment(url: string): Promise<{ error?: string }> {
  try {
    // Extract file path from URL
    const urlParts = url.split('/message-attachments/');
    if (urlParts.length < 2) {
      return { error: 'Invalid file URL' };
    }

    const filePath = urlParts[1];

    // Delete from storage
    const { error } = await supabase.storage
      .from('message-attachments')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { error: 'Failed to delete file' };
    }

    return {};
  } catch (err) {
    console.error('Unexpected delete error:', err);
    return { error: 'An unexpected error occurred' };
  }
}
