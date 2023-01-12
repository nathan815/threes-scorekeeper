import { AuthUser } from "src/auth/authContext";

type AuthResult = {
  provider: string;
  success: boolean;
  user: AuthUser;
  error: string;
  isNew: boolean;
};
type AuthMessage = { source: string; payload: AuthResult };

let popupWindow: Window | null = null;
let previousUrl: string | null = null;
let previousCallback: any = null;
let intervalId: number;

export function openAuthPopupWindow(
  provider: 'google',
  displayName?: string
): Promise<AuthResult> {
  return new Promise((resolve, reject) => {
    const windowFeatures =
      'toolbar=no, menubar=no, width=600, height=700, top=100, left=100';

    const url =
      `/api/auth/${provider}` +
      (displayName ? `?displayName=${encodeURIComponent(displayName)}` : '');
    const name = 'Sign in';

    console.log('opening auth popup', url);

    function receiveMessage(event: MessageEvent<AuthMessage>) {
      if (event.data.source !== 'auth_popup') {
        return;
      }

      console.log('received message from oauth popup', event.data);
      clearInterval(intervalId);
      popupWindow?.close();

      const result = event.data.payload;
      if (result.success) {
        resolve(result);
      } else {
        console.error('oauth failed', event.data);
        reject(result);
      }
    }

    // Detect if the window was closed and reject the promise
    clearInterval(intervalId);
    intervalId = window.setInterval(() => {
      if (popupWindow === null || popupWindow.closed) {
        window.removeEventListener('message', receiveMessage);
        previousCallback = null;
        popupWindow = null;
        clearInterval(intervalId);
        reject('Login popup window was closed');
      }
    }, 2000);

    if (previousCallback) {
      window.removeEventListener('message', previousCallback);
    }

    if (popupWindow === null || popupWindow.closed) {
      popupWindow = window.open(url, name, windowFeatures);
    } else if (previousUrl !== url) {
      popupWindow = window.open(url, name, windowFeatures);
      popupWindow?.focus();
    } else {
      popupWindow.focus();
    }

    window.addEventListener('message', receiveMessage, false);

    previousUrl = url;
    previousCallback = receiveMessage;
  });
}
