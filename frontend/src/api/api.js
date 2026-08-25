import { API_BASE_URL as BASE_URL } from "../config/apiBase.js";

export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let message = "Email atau password salah.";

    try {
      const errorBody = await response.json();
      message = errorBody?.message || errorBody?.error || message;
    } catch {
      // Response error tidak selalu JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

