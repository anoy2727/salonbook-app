import { authClient } from "./auth-client";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
let cache = { token: null, exp: 0 };

export function clearToken() {
  cache = { token: null, exp: 0 };
}

// Better Auth gives us a JWT; the Express server verifies it on every protected request
async function getToken(force) {
  if (!force && cache.token && Date.now() < cache.exp) return cache.token;
  const { data } = await authClient.token();
  if (!data?.token) return null;
  cache = { token: data.token, exp: Date.now() + 10 * 60 * 1000 };
  return data.token;
}

export async function api(path, { method = "GET", body, form, auth = true } = {}) {
  const send = async (force) => {
    const headers = {};
    if (auth) {
      const token = await getToken(force);
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    let payload;
    if (form) payload = form;
    else if (body) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
    return fetch(`${API}${path}`, { method, headers, body: payload });
  };

  let res;
  try {
    res = await send(false);
    if (res.status === 401 && auth) {
      clearToken();
      res = await send(true);
    }
  } catch {
    throw new Error("Cannot reach the server. Please check your connection.");
  }
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error(data?.message || "Something went wrong. Please try again.");
    err.status = res.status;
    err.code = data?.code;
    throw err;
  }
  return data;
}
