import { Request } from 'express';

export function getReqBaseUrl(req: Request) {
  const host = req.header('Host');

  let url = `${req.protocol}://${host}`;
  if (req.header('X-Proxy')) {
    url += '/api';
  }

  return url;
}
