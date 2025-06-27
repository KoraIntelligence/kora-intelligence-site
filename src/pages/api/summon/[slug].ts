import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const assistantMap: Record<string, string> = {
  ccc: 'asst_AGVgVCWCvNwXa150Qss8sFnI',
  fmc: 'asst_ElMMOYXEEs2RqLc1zPqDWHqK',
  dreamer: 'asst_YNZOhXEhj1QIam6Ehg4G3wbT',
  alchemist: 'asst_fOy8Tx4GDgaUf7K3NSBtU0Z3',
  pathbreaker: 'asst_0D8ZsGWJAOMHwitKrMBp6rZa',
  builder: 'asst_1y1exmpzEKy4n6j2AwKtrS3Y',
  cartographer: 'asst_HWxq4UpDd9djjDqVvmELgwQk',
  whisperer: 'asst_F2lkMOpHBfZyATNrQiHITWA1',
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