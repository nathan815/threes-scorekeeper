import { Request } from 'express';

export function getReqBaseUrl(req: Request) {
  const host = req.header('Host');
  const protocol = req.header('X-Proxy') ? 'https' : req.protocol;

  let url = `${protocol}://${host}`;
  if (req.header('X-Proxy')) {
    url += '/api';
  }

  return url;
}
