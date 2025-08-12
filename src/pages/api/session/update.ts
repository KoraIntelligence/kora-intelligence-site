import type { NextApiRequest, NextApiResponse } from 'next';
import { updateSessionMem } from 'lib/sessionStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, patch } = req.body;
  if (!sessionId || !patch) {
    return res.status(400).json({ error: 'Missing sessionId or patch' });
  }

  await updateSessionMem(sessionId, patch);
  res.status(200).json({ success: true });
}