/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '@bina/types';
import { apiClient } from '../api';
import { ApiClientError } from '../api/errors';
import type { IProjectRepository } from './contracts';

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj_wasil_oasis',
    name: {
      ar: 'واحة الواصل السكنية',
      en: 'Al-Wasil Luxury Oasis'
    },
    description: {
      ar: 'حي سكني مغلق متميز يمتد على مساحة واسعة شمال العاصمة الرياض، يقدم فلل راقية بتصاميم مستوحاة من العمارة السلمانية العريقة.',
      en: 'A premium gated residential community sprawling in Northern Riyadh, presenting exquisite villas inspired by the timeless Salmani architectural heritage.'
    },
    developer: {
      ar: 'شركة بناء وإدارة',
      en: 'Bina & Edarah'
    },
    location: {
      ar: 'شمال الرياض، المملكة العربية السعودية',
      en: 'North Riyadh, Kingdom of Saudi Arabia'
    },
    city: {
      ar: 'الرياض',
      en: 'Riyadh'
    },
    district: {
      ar: 'حي الملقا',
      en: 'Al-Malqa'
    },
    address: {
      ar: 'طريق الملك سلمان، حي الملقا، الرياض',
      en: 'King Salman Road, Al-Malqa, Riyadh'
    },
    completionDate: '2027-12-31',
    units: 120,
    status: 'available',
    googleMapsLink: 'https://maps.google.com/?q=24.8123,46.6123',
    latitude: 24.8123,
    longitude: 46.6123,
    featured: true,
    galleryImageIds: [],
    amenityParking: true,
    amenitySecurity: true,
    amenityElevators: true,
    amenityMosque: true,
    amenityGym: true,
    amenityPool: false,
    amenityChildrenArea: true,
    customAmenities: [
      { ar: 'أنظمة ري مستدامة', en: 'Sustainable Irrigation Systems' },
      { ar: 'إنارة بالطاقة الشمسية', en: 'Solar Street Lights' }
    ],
    seoTitleAr: 'واحة الواصل السكنية | مشروع فلل شمال الرياض المتميز',
    seoTitleEn: 'Al-Wasil Luxury Oasis | Premier Villa Project North Riyadh',
    seoDescAr: 'واحة الواصل في حي الملقا تقدم أرقى الفلل الفاخرة بطابع سلمانى ساحر ونظام أمني واستكشافي ذكي.',
    seoDescEn: 'Al-Wasil Oasis in Al-Malqa presents elite luxury villas with captivating Salmani style, security grid, and smart community features.'
  },
  {
    id: 'proj_bina_heights',
    name: {
      ar: 'أبراج بناء الفاخرة',
      en: 'BINA Heights'
    },
    description: {
      ar: 'أبراج سكنية ذكية تطل على ساحل البحر الأحمر بجدة تنفرد بتقديم معايير رفاهية غير مسبوقة وخدمات فندقية متكاملة.',
      en: 'Smart residential towers overlooking the Red Sea coast in Jeddah, uniquely offering unprecedented luxury standards and integrated hotel-style services.'
    },
    developer: {
      ar: 'شركة بناء وإدارة',
      en: 'Bina & Edarah'
    },
    location: {
      ar: 'كورنيش جدة، جدة، المملكة العربية السعودية',
      en: 'Jeddah Corniche, Jeddah, Kingdom of Saudi Arabia'
    },
    city: {
      ar: 'جدة',
      en: 'Jeddah'
    },
    district: {
      ar: 'حي الشاطئ',
      en: 'Al-Shati'
    },
    address: {
      ar: 'طريق الكورنيش، حي الشاطئ، جدة',
      en: 'Corniche Road, Al-Shati, Jeddah'
    },
    completionDate: '2026-09-30',
    units: 86,
    status: 'sold',
    googleMapsLink: 'https://maps.google.com/?q=21.5833,39.1111',
    latitude: 21.5833,
    longitude: 39.1111,
    featured: true,
    galleryImageIds: [],
    amenityParking: true,
    amenitySecurity: true,
    amenityElevators: true,
    amenityMosque: false,
    amenityGym: true,
    amenityPool: true,
    amenityChildrenArea: true,
    customAmenities: [
      { ar: 'خدمات الكونسيرج الفندقية', en: '24/7 Premium Concierge Services' },
      { ar: 'شواحن سيارات كهربائية', en: 'Electric Vehicle Chargers' }
    ],
    seoTitleAr: 'أبراج بناء الفاخرة | شقق سكنية فاخرة مطلة على البحر بجدة',
    seoTitleEn: 'BINA Heights | Luxury Apartments Overlooking Red Sea Jeddah',
    seoDescAr: 'أبراج سكنية فارهة على كورنيش جدة تتمتع بإطلالة بانورامية كاملة وتطبيقات ذكية لمنازل ذكية.',
    seoDescEn: 'Opulent residential towers on Jeddah Corniche with panoramic sea views and fully-integrated luxury details.'
  }
];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeProject = (project: Project): Project => ({
  ...project,
  galleryImageIds: Array.isArray(project.galleryImageIds) ? project.galleryImageIds : [],
  customAmenities: Array.isArray(project.customAmenities) ? project.customAmenities : [],
  units: Number.isFinite(Number(project.units)) ? Number(project.units) : 0,
  status: project.status === 'sold' || project.status === 'sold-out' || project.status === 'under-construction'
    ? project.status
    : 'available',
  featured: Boolean(project.featured),
});

const unwrapProjectList = (response: unknown): Project[] => {
  if (!isRecord(response)) {
    return [];
  }

  if (isRecord(response.data) && Array.isArray(response.data.items)) {
    return response.data.items as Project[];
  }

  if (Array.isArray(response.items)) {
    return response.items as Project[];
  }

  return [];
};

const unwrapProject = (response: unknown): Project | null => {
  if (!isRecord(response)) {
    return null;
  }

  if (isRecord(response.data) && isRecord(response.data.data)) {
    return response.data.data as Project;
  }

  if (isRecord(response.data)) {
    return response.data as Project;
  }

  if (isRecord(response.project)) {
    return response.project as Project;
  }

  return null;
};

const sanitizeProjectPayload = <T extends Record<string, unknown>>(project: T) => {
  const { googleMapsLink, latitude, longitude, ...rest } = project;
  return {
    ...rest,
    googleMapsLink,
    latitude,
    longitude,
  } as T;
};

export class ProjectRepository implements IProjectRepository {
  public async getProjects(): Promise<Project[]> {
    if (!apiClient.enabled) {
      return DEFAULT_PROJECTS.map(normalizeProject);
    }

    try {
      const response = await apiClient.get('/projects');
      const items = unwrapProjectList(response).map(normalizeProject);
      return items.length > 0 ? items : DEFAULT_PROJECTS.map(normalizeProject);
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn('[ProjectRepository] Falling back to default projects because API read failed', error);
      }
      return DEFAULT_PROJECTS.map(normalizeProject);
    }
  }

  public async getProjectById(id: string): Promise<Project | null> {
    if (!apiClient.enabled) {
      return DEFAULT_PROJECTS.find((project) => project.id === id) || null;
    }

    try {
      const response = await apiClient.get(`/projects/${id}`);
      const project = unwrapProject(response);
      return project ? normalizeProject(project) : null;
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn('[ProjectRepository] Falling back to default project because API read failed', error);
      }
      return DEFAULT_PROJECTS.find((project) => project.id === id) || null;
    }
  }

  public async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    if (!apiClient.enabled) {
      throw new ApiClientError('API mode is disabled');
    }

    const response = await apiClient.post('/projects', sanitizeProjectPayload(project as Record<string, unknown>));
    const created = unwrapProject(response);
    if (!created) {
      throw new ApiClientError('Project creation failed');
    }
    return normalizeProject(created);
  }

  public async updateProject(id: string, project: Partial<Project>): Promise<Project | null> {
    if (!apiClient.enabled) {
      return null;
    }

    const response = await apiClient.put(`/projects/${id}`, sanitizeProjectPayload(project as Record<string, unknown>));
    const updated = unwrapProject(response);
    return updated ? normalizeProject(updated) : null;
  }

  public async deleteProject(id: string): Promise<boolean> {
    if (!apiClient.enabled) {
      return false;
    }

    await apiClient.delete(`/projects/${id}`);
    return true;
  }
}
