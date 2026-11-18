import type { CookieOptions, Response } from 'express';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
export const CSRF_COOKIE = 'csrf_token';
export const REFRESH_COOKIE_PATH = '/api/auth';

export function authCookieOptions(
  secure: boolean,
  maxAge: number,
  path: string,
): CookieOptions {
  return { httpOnly: true, secure, sameSite: 'strict', path, maxAge };
}

export function csrfCookieOptions(
  secure: boolean,
  maxAge: number,
): CookieOptions {
  return { httpOnly: false, secure, sameSite: 'strict', path: '/', maxAge };
}

export function clearAuthCookies(res: Response, secure: boolean): void {
  res.clearCookie(ACCESS_COOKIE, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
  });
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
  });
  res.clearCookie(CSRF_COOKIE, {
    httpOnly: false,
    secure,
    sameSite: 'strict',
    path: '/',
  });
}
