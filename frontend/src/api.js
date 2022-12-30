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
    displayName
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
  const resp = await http.post(`/games/${shortId}/join`);
  return resp.data;
}
