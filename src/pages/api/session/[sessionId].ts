import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionMem } from 'lib/sessionStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const mem = await getSessionMem(sessionId as string);
  res.status(200).json(mem || {});
}