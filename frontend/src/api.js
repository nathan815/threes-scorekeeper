import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
  timeout: 1000,
  withCredentials: true,
  // headers: {'X-Custom-Header': 'foobar'}
});

export function getGame(id) {
  return http.get(`/games/${id}`);
}

export function getAuthState() {
  return http.get(`/auth/state`).then((r) => r.data);
}

export async function guestRegister(displayName) {
  const resp = await http.post('/auth/guest/register', {
    displayName,
  });
  return resp.data;
}

export async function guestLogin({ id, secret }) {
  const resp = await http.post('/auth/guest/login', {
    userId: id,
    secret: secret,
  });
  return resp.data;
}

export async function joinGame(shortId) {
  try {
    const resp = await http.post(`/games/${shortId}/join`);
    return resp.data;
  } catch (err) {
    if (err.response && err.response.data) {
      const msg = err.response.data && err.response.data.errorMessage;
      if (msg) {
        throw new ApiError(msg, err.response.data);
      }
    }
    throw new ApiError(
      'An error occurred. Please try again in a moment.',
      undefined,
      err
    );
  }
}

export class ApiError extends Error {
  constructor(message, context, cause = undefined) {
    super(message);
    this.cause = cause;
    this.errorMessage = message;
    this.context = context;
  }
}
