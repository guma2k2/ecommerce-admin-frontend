/**
 * localStorage ~5MB, saved for infinity or until the user manually deletes it.
 * sessionStorage ~5MB, saved for the life of the CURRENT TAB
 */

import { Cookies } from 'react-cookie';

type CookieSetOptions = {
  path?: string;
  maxAge?: number;
};

const cookies = new Cookies();

const cookieOption = {
  path: '/',
};

interface StorageHelperInterface {
  setCookie: (name: string, value: any, options?: CookieSetOptions) => void;
  getCookie: (name: string) => any;
  removeCookie: (name: string, options?: CookieSetOptions) => Promise<void>;
  setLocalItem: (name: string, value: string) => void;
  setLocalObject: (name: string, obj: any) => void;
  getLocalItem: (name: string) => string | null;
  getLocalObject: (name: string) => any;
  removeLocalItem: (name: string) => void;
  setSessionItem: (name: string, value: string) => void;
  setSessionObject: (name: string, obj: any) => void;
  getSessionItem: (name: string) => string | null;
  getSessionObject: (name: string) => any;
  removeSessionItem: (name: string) => void;
}

const StorageHelper: StorageHelperInterface = {
  setCookie: (name: string, value: any, options: CookieSetOptions = {}) => {
    cookies.set(name, value, {
      ...cookieOption,
      ...options,
    });
  },

  getCookie: (name: string) => {
    return cookies.get(name);
  },

  removeCookie: async (name: string, options: CookieSetOptions = {}) => {
    await cookies.remove(name, { ...cookieOption, ...options });
  },

  setLocalItem: (name: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(name, value);
    }
  },

  setLocalObject: (name: string, obj: any) => {
    StorageHelper.setLocalItem(name, JSON.stringify(obj));
  },

  getLocalItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },

  getLocalObject: (name: string): any => {
    const response = StorageHelper.getLocalItem(name);
    return response ? JSON.parse(response) : {};
  },

  removeLocalItem: (name: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(name);
    }
  },

  setSessionItem: (name: string, value: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(name, value);
    }
  },

  setSessionObject: (name: string, obj: any) => {
    StorageHelper.setSessionItem(name, JSON.stringify(obj));
  },

  getSessionItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(name);
  },

  getSessionObject: (name: string): any => {
    const response = StorageHelper.getSessionItem(name);
    return response ? JSON.parse(response) : null;
  },

  removeSessionItem: (name: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(name);
    }
  },
};

export default StorageHelper;
