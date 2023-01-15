import { randomBytes } from 'crypto';

export async function generateSecret(): Promise<string> {
  return new Promise((resolve, reject) => {
    randomBytes(48, function (err: any, buffer: any) {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString('hex'));
      }
    });
  });
}
