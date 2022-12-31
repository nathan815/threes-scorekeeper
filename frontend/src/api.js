import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
  timeout: 1000,
  withCredentials: true,
});

const successfulResponseInterceptor = async (response) => response;
const errorResponseInterceptor = async (err) => {
  console.log('Request: ', err.request, 'Response Error:', err);
  if (err.response && err.response.data) {
    if (err.response.data.errorType === 'validation') {
      throw new ValidationError(err);
    }
    const msg = err.response.data && err.response.data.errorMessage;
    if (msg) {
      throw new ApiError(msg, err.response.data, err);
    }
  }
  throw new ApiError(
    'An error occurred. Please try again in a moment.',
    undefined,
    err
  );
};

http.interceptors.response.use(
  successfulResponseInterceptor,
  errorResponseInterceptor
);

function getGame(id) {
  return http.get(`/games/${id}`);
}

function getAuthState() {
  return http.get(`/auth/state`).then((r) => r.data);
}

async function guestRegister(displayName) {
  const resp = await http.post('/auth/guest/register', {
    displayName,
  });
  return resp.data;
}

async function guestLogin({ id, secret }) {
  const resp = await http.post('/auth/guest/login', {
    userId: id,
    secret: secret,
  });
  return resp.data;
}

async function createGame(name) {
  const resp = await http.post(`/games`, {
    name: name,
  });
  return resp.data;
}

async function joinGame(shortId) {
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

export const api = {
  getAuthState,
  guestLogin,
  guestRegister,
  getGame,
  joinGame,
  createGame,
};

export class ApiError extends Error {
  constructor(message, context, cause = undefined) {
    super(message);
    if (cause) {
      this.cause = cause;
    }
    this.errorMessage = message;
    this.context = context;
  }
}

export class ValidationError extends ApiError {
  constructor(error) {
    super('Validation failure', { errors: error.response.data.errors }, error);
    this.humanReadableErrors = this.context.errors.map((e) => {
      const field = `${e.param.charAt(0).toUpperCase()}${e.param.substring(1)}`;
      const message = `${e.msg.charAt(0).toLowerCase()}${e.msg.substring(1)}`;
      return `${field} ${message}`;
    });
  }
}
