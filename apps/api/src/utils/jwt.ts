import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  sub: string;
  sid: string;
  jti: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
  jti: string;
  type: 'refresh';
}

export const createJti = () => crypto.randomUUID();

export const signAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const signRefreshToken = (payload: RefreshTokenPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as (AccessTokenPayload | RefreshTokenPayload) & jwt.JwtPayload;
};
