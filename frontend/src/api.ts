import axios from 'axios';

export interface Player {
  id: string;
  displayName: string;
  gravatarHash: string;
  isGuest: boolean;
}

export interface Game {
  id: string;
  shortId: string;
  name: string;
  owner: Player;
  players: Player[];
  rounds: GameRound[];
  totalPointsByPlayer: { [id: string]: number };
  currentWinnerIds: string[];
}

export interface GameRound {
  cardRank: number;
  isFinished: boolean;
  playerResults: { [id: string]: PlayerResult };
}

export interface PlayerResult {
  runningTotal: number;
  cardPoints: number;
  cutDeckPerfect: true;
}

const http = axios.create({
  baseURL: '/api',
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

  throw new ApiError('Unable to connect to server.', undefined, err);
};

http.interceptors.response.use(
  successfulResponseInterceptor,
  errorResponseInterceptor
);

function getGame(id): Promise<Game> {
  return http.get(`/games/${id}`).then((res) => res.data);
}

function getAuthState() {
  return http.get(`/auth/state`).then((res) => res.data);
}

function guestRegister(displayName) {
  return http
    .post('/auth/guest/register', {
      displayName,
    })
    .then((res) => res.data);
}

function guestLogin({ id, secret }) {
  return http
    .post('/auth/guest/login', {
      userId: id,
      secret: secret,
    })
    .then((res) => res.data);
}

function createGame(name) {
  return http
    .post(`/games`, {
      name: name,
    })
    .then((res) => res.data);
}

function joinGame(shortId) {
  return http.post(`/games/${shortId}/join`).then((res) => res.data);
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
  cause?: Error;
  errorMessage?: string;
  context?: any;

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
  humanReadableErrors?: string[];

  constructor(error) {
    super('Validation failure', { errors: error.response.data.errors }, error);
    this.humanReadableErrors = this.context.errors.map((e) => {
      const field = `${e.param.charAt(0).toUpperCase()}${e.param.substring(1)}`;
      const message = `${e.msg.charAt(0).toLowerCase()}${e.msg.substring(1)}`;
      return `${field} ${message}`;
    });
  }
}
