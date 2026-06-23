/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Property } from '@bina/types';
import { apiClient } from '../api';
import { ApiClientError } from '../api/errors';
import type { IPropertyRepository } from './contracts';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const normalizeProperty = (property: Property): Property => ({
  ...property,
  galleryImageIds: Array.isArray(property.galleryImageIds) ? property.galleryImageIds : [],
  customAmenities: Array.isArray(property.customAmenities) ? property.customAmenities : [],
  highlights: Array.isArray(property.highlights) ? property.highlights : [],
  nearbyPlaces: Array.isArray(property.nearbyPlaces) ? property.nearbyPlaces : [],
  floorPlanMediaIds: Array.isArray(property.floorPlanMediaIds) ? property.floorPlanMediaIds : [],
  documentMediaIds: Array.isArray(property.documentMediaIds) ? property.documentMediaIds : [],
  status: property.status || 'available',
  type: property.type || { ar: '', en: '' },
  title: property.title || { ar: '', en: '' },
  description: property.description || { ar: '', en: '' },
  location: property.location || { ar: '', en: '' },
});

const sanitizePropertyPayload = <T extends Record<string, unknown>>(property: T) => {
  const { project, ...rest } = property;
  return rest as T;
};

const unwrapPropertyList = (response: unknown): Property[] => {
  if (!isRecord(response)) {
    return [];
  }

  const data = response.data;
  if (isRecord(data) && Array.isArray(data.items)) {
    return data.items as Property[];
  }

  if (Array.isArray(data)) {
    return data as Property[];
  }

  if (Array.isArray(response.items)) {
    return response.items as Property[];
  }

  return [];
};

const unwrapProperty = (response: unknown): Property | null => {
  if (!isRecord(response)) {
    return null;
  }

  if (isRecord(response.data) && isRecord(response.data.data)) {
    return response.data.data as Property;
  }

  if (isRecord(response.data)) {
    return response.data as Property;
  }

  if (isRecord(response.property)) {
    return response.property as Property;
  }

  return null;
};

const isRecoverableApiError = (error: unknown) => {
  if (!(error instanceof ApiClientError)) {
    return false;
  }

  return !error.status || error.status >= 500 || error.status === 404 || error.status === 429;
};

export class ApiPropertyRepository implements IPropertyRepository {
  public async getProperties(): Promise<Property[]> {
    if (!apiClient.enabled) {
      return [];
    }

    try {
      const response = await apiClient.get('/properties');
      return unwrapPropertyList(response).map(normalizeProperty);
    } catch (error) {
      if (!isRecoverableApiError(error)) {
        throw error;
      }
      if (import.meta.env?.DEV) {
        console.warn('[PropertyRepository] Returning empty list because API read failed', error);
      }
      return [];
    }
  }

  public async getPropertyById(id: string): Promise<Property | null> {
    if (!apiClient.enabled) {
      return null;
    }

    try {
      const response = await apiClient.get(`/properties/${id}`);
      const property = unwrapProperty(response);
      return property ? normalizeProperty(property) : null;
    } catch (error) {
      if (!isRecoverableApiError(error)) {
        throw error;
      }
      return null;
    }
  }

  public async createProperty(property: Omit<Property, 'id'>): Promise<Property> {
    if (!apiClient.enabled) {
      throw new ApiClientError('API mode is disabled');
    }

    const response = await apiClient.post('/properties', sanitizePropertyPayload(property as Record<string, unknown>));
    const created = unwrapProperty(response);
    if (!created) {
      throw new ApiClientError('Property creation failed');
    }
    return normalizeProperty(created);
  }

  public async updateProperty(id: string, property: Partial<Property>): Promise<Property | null> {
    if (!apiClient.enabled) {
      return null;
    }

    const response = await apiClient.put(`/properties/${id}`, sanitizePropertyPayload(property as Record<string, unknown>));
    const updated = unwrapProperty(response);
    return updated ? normalizeProperty(updated) : null;
  }

  public async deleteProperty(id: string): Promise<boolean> {
    if (!apiClient.enabled) {
      return false;
    }

    await apiClient.delete(`/properties/${id}`);
    return true;
  }
}
