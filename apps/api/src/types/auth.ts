export interface AuthenticatedPermission {
  key: string;
}

export interface AuthenticatedRole {
  id: string;
  name: string;
  permissions: AuthenticatedPermission[];
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  roles: AuthenticatedRole[];
}

export interface JwtSessionPayload {
  sub: string;
  sid: string;
  jti: string;
  type: 'access' | 'refresh';
}

export type SessionDeviceType = 'DESKTOP' | 'MOBILE' | 'TABLET' | 'BOT' | 'UNKNOWN';
