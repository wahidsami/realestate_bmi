import { apiClient } from '../api';
import { ApiClientError } from '../api/errors';
import type { IAuthRepository } from './contracts';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: unknown;
  permissions: string[];
  mustChangePassword?: boolean;
};

export class AuthRepository implements IAuthRepository {
  public canAttemptRefresh(): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    return document.cookie.includes('bmi_admin_session_hint=1');
  }

  public hasAccessToken(): boolean {
    return apiClient.hasAccessToken();
  }

  public async login(identifier: string, password: string) {
    const response = await apiClient.post<{ success: boolean } & AuthResponse>('/auth/login', {
      identifier,
      password,
    });

    if (!response.accessToken) {
      throw new ApiClientError('Authentication failed');
    }

    apiClient.setAccessToken(response.accessToken);
    return response;
  }

  public async logout(): Promise<boolean> {
    try {
      await apiClient.post('/auth/logout', {});
    } finally {
      apiClient.clearAuth();
    }
    return true;
  }

  public async refresh(): Promise<string | null> {
    try {
      const response = await apiClient.post<{ success: boolean; accessToken?: string }>('/auth/refresh', {});
      if (response.accessToken) {
        apiClient.setAccessToken(response.accessToken);
        return response.accessToken;
      }
      return null;
    } catch {
      apiClient.clearAuth();
      return null;
    }
  }

  public async me(): Promise<unknown> {
    const response = await apiClient.get<{ user: unknown; permissions: string[] }>('/auth/me');
    return response;
  }

  public async updateProfile(payload: Record<string, unknown>): Promise<unknown> {
    const response = await apiClient.patch('/auth/profile', payload);
    return response;
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<{ success: true }> {
    return apiClient.patch<{ success: true }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  public async forgotPassword(email: string): Promise<unknown> {
    return apiClient.post('/auth/forgot-password', { email });
  }

  public async resetPassword(token: string, newPassword: string): Promise<unknown> {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  }
}
