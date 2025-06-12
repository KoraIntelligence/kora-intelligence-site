import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  const userMessage = req.body?.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'Missing user message' });
  }

  try {
    const assistantId = 'asst_AGVgVCWCvNwXa150Qss8sFnI'; // Salar
    const thread = await openai.beta.threads.create();

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: userMessage,
    });

    // Create a run and poll for completion
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
    });

    if (run.status === 'failed') {
      return res.status(500).json({ error: 'Salar failed to complete the run' });
    }

    // Get the assistant's reply
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantReply = messages.data.find((msg) => msg.role === 'assistant');

    if (!assistantReply) {
      return res.status(500).json({ error: 'No response from Salar' });
    }

    const content =
      assistantReply.content[0]?.type === 'text'
        ? assistantReply.content[0].text.value
        : 'No readable response.';

    return res.status(200).json({ reply: content });
  } catch (error) {
    console.error('Error invoking Salar:', error);
    return res.status(500).json({ error: 'Internal error invoking Salar' });
  }
}