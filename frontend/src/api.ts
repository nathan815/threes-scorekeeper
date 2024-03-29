import axios, { AxiosError } from 'axios';

export interface Player {
  id: string;
  displayName?: string;
  gravatarHash: string;
  isPseudo?: boolean;
}

export interface Game {
  id: string;
  shortId: string;
  name: string;
  owner: Player;
  players: Player[];
  currentRound: number | null;
  rounds: GameRound[];
  totalPointsByPlayer: { [id: string]: number };
  currentWinnerIds: string[];
  startedAt?: string;
  endedAt?: string;
}

export interface GameRound {
  cardRank: number;
  isFinished: boolean;
  playerResults: { [id: string]: PlayerResult };
  startedAt: string;
  endedAt?: string;
}

export interface PlayerResult {
  userId: string;
  cardPoints: number;
  perfectCutBonus: unknown;
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

function getGame(id: string): Promise<Game> {
  return http.get(`/games/${id}`).then((res) => res.data);
}

function getAuthState() {
  return http.get(`/auth`).then((res) => res.data);
}

function logout() {
  return http.post(`/auth/logout`).then((res) => res.data);
}

function guestRegister(displayName: string) {
  return http
    .post('/auth/guest/register', {
      displayName,
    })
    .then((res) => res.data);
}

function guestLogin({ id, secret }: { id: string; secret: string }) {
  return http
    .post('/auth/guest/login', {
      userId: id,
      secret: secret,
    })
    .then((res) => res.data);
}

function updateUser(changes: { displayName: string }) {
  return http.patch(`/users/me`, changes).then((res) => res.data);
}

function createGame(name: string): Promise<Game> {
  return http
    .post(`/games`, {
      name: name,
    })
    .then((res) => res.data);
}

function addPseudoPlayer(
  gameId: string,
  newDisplayName: string
): Promise<Game> {
  return http
    .post(`/games/${gameId}/pseudoPlayers`, {
      displayName: newDisplayName,
    })
    .then((res) => res.data);
}

function joinGame(gameId: string): Promise<Game> {
  return http.post(`/games/${gameId}/join`).then((res) => res.data);
}

export interface UpdateGameChanges {
  id: string;
  name?: string;
  ownerId?: string;
}
function updateGame(updates: UpdateGameChanges): Promise<Game> {
  const { id, ...updatePayload } = updates;
  return http.patch(`/games/${id}`, updatePayload).then((res) => res.data);
}

function startGame(gameId: string): Promise<Game> {
  return http.post(`/games/${gameId}/start`).then((res) => res.data);
}

function completeCurrentRound(gameId: string): Promise<Game> {
  return http
    .post(`/games/${gameId}/rounds/current/end`)
    .then((res) => res.data);
}

export interface PlayerResultInput {
  [id: string]: {
    points?: number;
    perfectDeckCut?: boolean;
  };
}
function recordPlayerResults(
  gameId: string,
  playerResults: PlayerResultInput
): Promise<Game> {
  return http
    .put(`/games/${gameId}/rounds/current/playerResults`, {
      results: playerResults,
    })
    .then((res) => res.data);
}

export const api = {
  getAuthState,
  logout,
  guestLogin,
  guestRegister,
  updateUser,
  createGame,
  getGame,
  joinGame,
  addPseudoPlayer,
  updateGame,
  startGame,
  completeCurrentRound,
  recordPlayerResults,
};

export class ApiError extends Error {
  cause?: AxiosError;
  errorMessage?: string;
  context?: any;
  retryable: boolean;

  constructor(message, context, cause?: AxiosError) {
    super(message);
    this.retryable = true;
    if (cause) {
      this.cause = cause;
      if (cause.response?.status === 404) {
        this.retryable = false;
      }
    }
    this.errorMessage = message;
    this.context = context;
  }
}

export class ValidationError extends ApiError {
  humanReadableErrors: string[];

  constructor(error) {
    super('Validation failure', { errors: error.response.data.errors }, error);
    this.humanReadableErrors = this.context.errors.map((e) => {
      const field = `${e.param.charAt(0).toUpperCase()}${e.param.substring(1)}`;
      const message = `${e.msg.charAt(0).toLowerCase()}${e.msg.substring(1)}`;
      return `${field} ${message}`;
    });
    this.message = 'Validation failure: ' + this.humanReadableErrors;
  }
}
