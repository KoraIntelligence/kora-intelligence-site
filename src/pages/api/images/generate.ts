import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, size = '512x512', styleHints = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }

  const finalPrompt = `${prompt}. Style hints: ${styleHints.join(', ')}`;

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: finalPrompt,
      size: size,
      n: 1,
    });

if (!response || !Array.isArray(response.data) || !response.data[0]?.url) {
  throw new Error('No image returned from OpenAI');
}

const imageUrl = response.data[0].url;

    return res.status(200).json({
      imageUrl,
      promptUsed: finalPrompt,
      createdAt: Date.now(),
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return res.status(500).json({ error: 'Failed to generate image' });
  }
}