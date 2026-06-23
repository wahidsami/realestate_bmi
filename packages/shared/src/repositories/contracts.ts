import type {
  Inquiry,
  MediaItem,
  PageContent,
  Project,
  Property,
  WebsiteSettings,
  VisualPage,
  PageVersion,
} from '@bina/types';

export interface IPropertyRepository {
  getProperties(): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | null>;
  createProperty(property: Omit<Property, 'id'>): Promise<Property>;
  updateProperty(id: string, property: Partial<Property>): Promise<Property | null>;
  deleteProperty(id: string): Promise<boolean>;
}

export interface IProjectRepository {
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  createProject(project: Omit<Project, 'id'>): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;
}

export interface IInquiryRepository {
  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt'>): Promise<Inquiry>;
  updateInquiryStatus(id: string, status: Inquiry['status']): Promise<Inquiry | null>;
  deleteInquiry(id: string): Promise<boolean>;
}

export interface ISettingsRepository {
  getSettings(): Promise<WebsiteSettings>;
  updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings>;
}

export interface IPageRepository {
  getPages(): Promise<PageContent[]>;
  getPageBySlug(slug: string): Promise<PageContent | null>;
  updatePage(id: string, page: Partial<PageContent>): Promise<PageContent | null>;
  createPage(page: Omit<PageContent, 'id'>): Promise<PageContent>;
  deletePage(id: string): Promise<boolean>;
}

export interface IMediaRepository {
  getMediaItems(): Promise<MediaItem[]>;
  createMediaItem(
    name: string,
    mimeType: string,
    base64Data: string,
    options?: { onUploadProgress?: (progress: number) => void },
  ): Promise<MediaItem>;
  deleteMediaItem(id: string): Promise<boolean>;
}

export interface IAuthRepository {
  canAttemptRefresh(): boolean;
  hasAccessToken(): boolean;
  login(identifier: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: unknown;
    permissions: string[];
    mustChangePassword?: boolean;
  }>;
  logout(): Promise<boolean>;
  refresh(): Promise<string | null>;
  me(): Promise<unknown>;
  updateProfile(payload: Record<string, unknown>): Promise<unknown>;
  changePassword(currentPassword: string, newPassword: string): Promise<{ success: true }>;
  forgotPassword(email: string): Promise<unknown>;
  resetPassword(token: string, newPassword: string): Promise<unknown>;
}

export interface IVisualPagesRepository {
  subscribe(cb: () => void): () => void;
  getPagesSync(): VisualPage[];
  getPages(): Promise<VisualPage[]>;
  getPageById(id: string): Promise<VisualPage | null>;
  savePage(page: VisualPage): Promise<void>;
  deletePage(id: string): Promise<void>;
  getVersions(pageId: string): Promise<PageVersion[]>;
  restoreVersion(versionId: string): Promise<VisualPage | null>;
}
