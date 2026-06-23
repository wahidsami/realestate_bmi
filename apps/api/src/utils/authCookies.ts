import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

const AUTH_HINT_COOKIE = `${env.ADMIN_COOKIE_NAME}_hint`;

const resolveCookieDomain = () => {
  const domain = env.COOKIE_DOMAIN?.trim();
  if (!domain) {
    return undefined;
  }

  if (domain === 'localhost' || domain === '127.0.0.1' || domain === '::1') {
    return undefined;
  }

  return domain;
};

export const buildCookieOptions = (maxAgeMs: number): CookieOptions => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAMESITE,
  domain: resolveCookieDomain(),
  path: '/',
  maxAge: maxAgeMs,
});

export const setRefreshCookie = (res: Response, token: string, maxAgeMs: number) => {
  res.cookie(env.ADMIN_COOKIE_NAME, token, buildCookieOptions(maxAgeMs));
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie(env.ADMIN_COOKIE_NAME, buildCookieOptions(0));
};

export const setAuthHintCookie = (res: Response, maxAgeMs: number) => {
  res.cookie(AUTH_HINT_COOKIE, '1', {
    httpOnly: false,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    domain: resolveCookieDomain(),
    path: '/',
    maxAge: maxAgeMs,
  });
};

export const clearAuthHintCookie = (res: Response) => {
  res.clearCookie(AUTH_HINT_COOKIE, {
    httpOnly: false,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    domain: resolveCookieDomain(),
    path: '/',
  });
};
