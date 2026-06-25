// app/services/auth.services.js
import API_URL from '@/lib/api';

// ─── Helper: handle any response (JSON or not) ──
async function handleResponse(res) {
  // Default error message
  let errorMessage = `Request failed (${res.status})`;

  // Try to read the response body as text
  let responseText = '';
  try {
    responseText = await res.text();
  } catch (e) {
    // If reading fails, proceed with empty text
  }

  // Attempt to parse as JSON
  let parsedJson = null;
  let isJson = false;
  try {
    if (responseText && responseText.trim().startsWith('{')) {
      parsedJson = JSON.parse(responseText);
      isJson = true;
    }
  } catch {
    // Not JSON – keep as text
  }

  // If the response is not OK, build a clear error message
  if (!res.ok) {
    if (isJson && parsedJson) {
      // Extract from common JSON error fields
      errorMessage = parsedJson.message || parsedJson.error || parsedJson.msg || errorMessage;
      if (typeof errorMessage !== 'string') {
        errorMessage = JSON.stringify(errorMessage);
      }

      // Handle MongoDB duplicate key error (E11000)
      if (errorMessage.toLowerCase().includes('e11000') ||
          errorMessage.toLowerCase().includes('duplicate')) {
        const fieldMatch = errorMessage.match(/index:\s*(\w+)_1/);
        const field = fieldMatch ? fieldMatch[1] : 'field';
        errorMessage = `This ${field} is already taken. Please use a different one.`;
      }
    } else if (responseText) {
      // Use the raw text, trimmed to 200 chars
      errorMessage = responseText.slice(0, 200);
    }
    throw new Error(errorMessage);
  }

  // If OK, return parsed JSON or a fallback object
  if (isJson && parsedJson) {
    return parsedJson;
  } else {
    // If OK but not JSON, return a success object
    return { success: true, message: responseText || 'Request succeeded' };
  }
}

// ─── Auth services ──────────────────────────────────────
export async function registerUser(userData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

export const loginUser = async (credentials) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
};

export async function logoutUser() {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function getProfile() {
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
  });
  return handleResponse(res);
}

// ─── Extra user management functions ────────────────────
export async function checkPhoneExists(phone) {
  try {
    const res = await fetch(`${API_URL}/users/check-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await handleResponse(res);
    return data.exists || false;
  } catch {
    return false;
  }
}

export async function updateProfile(updates) {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}