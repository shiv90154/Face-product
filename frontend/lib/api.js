// lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Generic fetch wrapper ──────────────────────────────────
async function fetchApi(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(
      `Server returned HTML (not JSON). Status: ${res.status}. ` +
      `Please check your backend URL or ensure the server is running.`
    );
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${res.status}`);
  }

  return res.json();
}

// ─── User APIs ──────────────────────────────────────────────
export async function getUserCount() {
  const res = await fetchApi('/users/count');
  return res.count || 0;
}

export async function getAllUsers() {
  const res = await fetchApi('/users');
  return res.users || [];
}

// ─── Product APIs ──────────────────────────────────────────
export async function getProducts() {
  const res = await fetchApi('/products');
  return res.products || [];
}

export async function getProduct(id) {
  const res = await fetchApi(`/products/${id}`);
  return res.product;
}

export async function createProduct(data) {
  const res = await fetchApi('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.product;
}

export async function updateProduct(id, data) {
  const res = await fetchApi(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.product;
}

export async function deleteProduct(id) {
  await fetchApi(`/products/${id}`, { method: 'DELETE' });
}

// ─── Category APIs ─────────────────────────────────────────
export async function getCategories() {
  const res = await fetchApi('/categories');
  return res.categories || [];
}

// ─── Image Upload ──────────────────────────────────────────
export async function uploadImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Upload failed');
  }

  const data = await res.json();
  return data.urls || [];
}

// ─── Auth APIs ─────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res;
}

export async function register(userData) {
  const res = await fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return res;
}

export async function logout() {
  await fetchApi('/auth/logout', { method: 'POST' });
}

// ─── Export the base URL as both named and default ────────
export const API_URL = API_BASE;
export default API_URL;