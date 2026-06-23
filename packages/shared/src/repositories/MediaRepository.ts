/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MediaItem } from '@bina/types';
import { apiClient } from '../api';
import { ApiClientError } from '../api/errors';
import type { IMediaRepository } from './contracts';

type ApiMediaRecord = {
  id: string;
  originalName: string;
  publicUrl?: string | null;
  filePath?: string | null;
  mimeType: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isPublic?: boolean;
};

const isDataUrl = (value: string) => value.startsWith('data:');
const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const mimeToCategory = (mimeType: string) => {
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf') || mimeType.includes('officedocument')) return 'document';
  return 'image';
};

const dataUrlToBlob = (dataUrl: string) => {
  const [header, payload] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || 'application/octet-stream';
  const binary = atob(payload || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
};

const urlToFile = async (url: string, name: string, fallbackMimeType: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiClientError(`Failed to fetch media from URL: ${response.status}`);
  }

  const blob = await response.blob();
  const mimeType = blob.type || response.headers.get('content-type') || fallbackMimeType || 'application/octet-stream';
  return new File([blob], name, { type: mimeType });
};

const toApiMediaItem = (item: ApiMediaRecord): MediaItem => ({
  id: item.id,
  name: item.originalName,
  mimeType: item.mimeType,
  base64Data: item.publicUrl ? apiClient.getAbsoluteUrl(item.publicUrl) : item.filePath ? apiClient.getAbsoluteUrl(`/api/media/${item.id}/file`) : '',
  uploadedAt: item.createdAt || item.updatedAt || new Date().toISOString(),
});

export class MediaRepository implements IMediaRepository {
  /**
   * Retrieves all media items.
   * Readied for SQL: SELECT * FROM media_library ORDER BY uploaded_at DESC;
   */
  public async getMediaItems(): Promise<MediaItem[]> {
    if (apiClient.enabled) {
      try {
        const isAuthenticated = apiClient.hasAccessToken();
        const cacheKey = isAuthenticated ? 'media:list:private:createdAt:desc:200' : 'media:list:public:createdAt:desc:200';
        const cached = apiClient.cache.get<MediaItem[]>(cacheKey);
        if (cached) {
          return cached;
        }

        const endpoint = isAuthenticated
          ? '/media?sortBy=createdAt&sortOrder=desc&limit=200'
          : '/media/public?sortBy=createdAt&sortOrder=desc&limit=200';
        const response = await apiClient.get<{ items: ApiMediaRecord[] }>(endpoint);
        const remote = (response.items || []).map(toApiMediaItem);
        apiClient.cache.set(cacheKey, remote, 15_000);
        return remote;
      } catch (error) {
        if (import.meta.env?.DEV) {
          console.warn('[MediaRepository] Returning empty list because API read failed', error);
        }
        return [];
      }
    }

    return [];
  }

  /**
   * Saves a new base64 media block.
   * Readied for SQL: INSERT INTO media_library (id, name, mime_type, base64_data, uploaded_at) VALUES (...);
   */
  public async createMediaItem(
    name: string,
    mimeType: string,
    base64Data: string,
    options?: { onUploadProgress?: (progress: number) => void },
  ): Promise<MediaItem> {
    if (apiClient.enabled && (isDataUrl(base64Data) || isHttpUrl(base64Data))) {
      try {
        const formData = new FormData();
        const file = isDataUrl(base64Data)
          ? new File([dataUrlToBlob(base64Data)], name, { type: mimeType })
          : await urlToFile(base64Data, name, mimeType);
        formData.append('file', file);
        formData.append('category', mimeToCategory(mimeType));
        formData.append('isPublic', 'true');

        const response = await apiClient.post<{ media: ApiMediaRecord[] | ApiMediaRecord }>('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            if (!options?.onUploadProgress) {
              return;
            }
            const total = event.total || file.size || 1;
            const progress = Math.max(0, Math.min(100, Math.round((event.loaded / total) * 100)));
            options.onUploadProgress(progress);
          },
        });
        const created = Array.isArray(response.media) ? response.media[0] : response.media;
        if (created) {
          const mapped = toApiMediaItem(created);
          apiClient.cache.invalidate('media:list:');
          return mapped;
        }
      } catch (error) {
        throw error;
      }
    }

    if (apiClient.enabled) {
      throw new ApiClientError('Media upload failed');
    }

    throw new ApiClientError('Media upload is unavailable');
  }

  /**
   * Deletes a media file.
   * Readied for SQL: DELETE FROM media_library WHERE id = ?;
   */
  public async deleteMediaItem(id: string): Promise<boolean> {
    if (apiClient.enabled && !id.startsWith('media_')) {
      try {
        await apiClient.delete(`/media/${id}`);
        apiClient.cache.invalidate('media:list:');
        return true;
      } catch (error) {
        throw error;
      }
    }

    return false;
  }
}
