import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const assistantMap: Record<string, string> = {
  ccc: 'asst_AGVgVCWCvNwXa150Qss8sFnI',
  // fmc: 'asst_XXXXXX',
  // dreamer: 'asst_YYYYYY',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  const assistantId = assistantMap[slug as string];
  if (!assistantId) {
    return res.status(404).json({ error: 'Companion not found' });
  }

  const userMessage = req.body?.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'Missing user message' });
  }

  try {
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: userMessage,
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
    });

    if (run.status === 'failed') {
      return res.status(500).json({ error: 'Assistant failed to complete the run' });
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantReply = messages.data.find((msg) => msg.role === 'assistant');

    const content =
      assistantReply?.content[0]?.type === 'text'
        ? assistantReply.content[0].text.value
        : 'No readable response.';

    return res.status(200).json({ reply: content });
  } catch (error) {
    console.error('Invocation error:', error);
    return res.status(500).json({ error: 'Invocation failed' });
  }
}