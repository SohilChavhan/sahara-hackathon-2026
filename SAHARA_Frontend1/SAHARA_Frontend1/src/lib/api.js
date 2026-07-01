const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://s-a-h-a-r-a.onrender.com').replace(/\/+$/, '');

export async function apiFetch(path, options = {}) {
  const { timeoutMs = 30000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${path} timed out after ${Math.round(timeoutMs / 1000)}s`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function apiJson(path, options = {}) {
  const response = await apiFetch(path, options);
  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`Expected JSON from ${path}, received HTTP ${response.status}`);
  }

  if (!response.ok || data?.error) {
    throw new Error(data?.error || `Request to ${path} failed with HTTP ${response.status}`);
  }

  return data;
}
