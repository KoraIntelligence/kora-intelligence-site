import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  const { journey, support, feeling } = req.body;

  if (!journey || !support || !feeling) {
    return res.status(400).json({ error: 'Missing one or more required fields' });
  }

  try {
    const assistantId = 'asst_aE00JRW0DngBvFviF1QlupCX'; // Replace with your actual Assistant ID

    // Step 1: Create a thread
    const thread = await openai.beta.threads.create();

    // Step 2: Add message to thread
    const userMessage = `A seeker arrives with the following invocation:\n\nJourney: ${journey}\nSupport Needed: ${support.join(', ')}\nTone Desired: ${feeling}\n\nRespond as Kainat OS, suggesting 1–2 Companions from memory, with poetic scroll style as per your instructions.`;
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: userMessage,
    });

    // Step 3: Run assistant
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
    });

    if (run.status !== 'completed') {
      return res.status(500).json({ error: 'Kainat failed to complete the scroll.' });
    }

    // Step 4: Extract reply
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantReply = messages.data.find(msg => msg.role === 'assistant');

    if (!assistantReply) {
      return res.status(500).json({ error: 'No scroll returned from Kainat.' });
    }

    const content =
      assistantReply.content[0]?.type === 'text'
        ? assistantReply.content[0].text.value
        : '✨ No readable scroll was returned.';

    return res.status(200).json({ scroll: content });
  } catch (err) {
    console.error('[Kainat Error]', err);
    return res.status(500).json({ error: 'Internal server error from Kainat.' });
  }
}