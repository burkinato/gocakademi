const API_BASE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:3001')
  .replace(/\/$/, '');

/**
 * Convert a relative asset path returned by the API into a fully qualified URL.
 */
export const getAssetUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('//') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
