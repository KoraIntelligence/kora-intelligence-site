import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    whisper:
      'This Companion is not yet live, but your whisper has been heard. The Grove is listening.'
  });
}
