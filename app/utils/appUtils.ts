import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import snakecaseKeys from 'snakecase-keys'
import camelcaseKeys from 'camelcase-keys'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function toSnakeCase<T extends Record<string, any>>(obj: T): T {
  if (obj instanceof FormData) {
    return obj
  }

  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase) as unknown as T
  }

  return snakecaseKeys(obj, { deep: true }) as T
}

export function toCamelCase<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase) as unknown as T
  }

  return camelcaseKeys(obj, { deep: true }) as T
}
