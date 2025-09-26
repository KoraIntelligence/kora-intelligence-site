import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { serialize } from 'cookie';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const assistantMap: Record<string, string> = {
  ccc: 'asst_AGVgVCWCvNwXa150Qss8sFnI',
  fmc: 'asst_ElMMOYXEEs2RqLc1zPqDWHqK',
  dreamer: 'asst_YNZOhXEhj1QIam6Ehg4G3wbT',
  alchemist: 'asst_fOy8Tx4GDgaUf7K3NSBtU023',
  pathbreaker: 'asst_0D8ZsGWJAOMHwitKrMBp6rZa',
  builder: 'asst_1y1exmpzEKy4n6j2AwKtrS3Y',
  cartographer: 'asst_HWxq4UpDd9djjDqVvmELgwQk',
  whisperer: 'asst_F2lkMOpHBfZyATNrQiHITWA1',
};

// ------- helpers -------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const TERMINAL: Array<string> = ['completed', 'failed', 'cancelled', 'expired'];

/** Wait until the latest run on this thread is terminal (if any). */
async function ensureThreadIdle(threadId: string) {
  // Get the last run (if there is one)
  const runs = await openai.beta.threads.runs.list(threadId, { limit: 1 });
  const latest = runs.data[0];
  if (!latest) return; // no runs yet

  if (!TERMINAL.includes(latest.status)) {
    await waitForRunCompletion(threadId, latest.id);
  }
}

// Poll the run until it reaches a terminal state. Throws on failure/timeout.
async function waitForRunCompletion(
  threadId: string,
  runId: string,
  opts?: { timeoutMs?: number }
) {
  const timeoutMs = opts?.timeoutMs ?? 270_000; // 270s cap for image generation
  const start = Date.now();
  let delay = 800; // start gentle, back off a bit

  // eslint-disable-next-line no-constant-condition
while (true) {
  const run = await openai.beta.threads.runs.retrieve(
  runId,
  { thread_id: threadId } // ✅ Only include thread_id here
);

  if (['completed','failed','cancelled','expired'].includes(run.status)) {
    if (run.status === 'failed') {
      throw new Error(run.last_error?.message || 'Run failed');
    }
    return run;
  }

  if (Date.now() - start > timeoutMs) {
    try {
      await openai.beta.threads.runs.cancel(
  runId,
  { thread_id: threadId } // ✅ Same rule applies
);
    } catch {}
    throw new Error('Run timed out');
  }

  await new Promise(r => setTimeout(r, delay));
  delay = Math.min(2500, delay * 1.5);
}
}

// ------- handler -------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  const assistantId = assistantMap[slug as string];
  if (!assistantId) {
    return res.status(404).json({ error: 'Companion not found' });
  }

  const userMessage: string | undefined = req.body?.message;
  const memory = req.body?.memory || {};
  if (!userMessage) {
    return res.status(400).json({ error: 'Missing user message' });
  }

  let threadId = req.cookies['sohbat_thread_id'];

  try {
    // Create thread on first contact
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      res.setHeader(
        'Set-Cookie',
        serialize('sohbat_thread_id', threadId, {
          path: '/',
          maxAge: 60 * 60 * 2, // 2 hours
          sameSite: 'lax',
        }),
      );
    }

    // ✅ Make sure there is no active run before we add ANY new messages
    await ensureThreadIdle(threadId);

    // Inject ephemeral session memory (if provided) as a short, explicit note.
    // We keep it as a separate user message so it’s transparent + easy to tweak.
    const { name, role, purpose, tone } = memory as {
      name?: string;
      role?: string;
      purpose?: string;
      tone?: string;
    };

    if (name || role || purpose || tone) {
      const lines: string[] = ['[Session Memory]'];
      if (name) lines.push(`Name: ${name}`);
      if (role) lines.push(`Role: ${role}`);
      if (purpose) lines.push(`Purpose: ${purpose}`);
      if (tone) lines.push(`Tone: ${tone}`);

      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: lines.join(' | '),
      });
    }

    // Now add the actual user message
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userMessage,
    });

    // Start a new run and wait for completion
    const run = await openai.beta.threads.runs.create(threadId, { assistant_id: assistantId });
    await waitForRunCompletion(threadId, run.id);

    // Pull latest assistant reply
    const messages = await openai.beta.threads.messages.list(threadId, { limit: 10 });
    const assistantReply = messages.data.find((msg) => msg.role === 'assistant');

    let content = 'No readable response.';
    let imageUrl: string | null = null;
    let promptUsed: string | null = null;

    if (assistantReply && assistantReply.content?.[0]?.type === 'text') {
      content = assistantReply.content[0].text.value;
    }

    // If the assistant responded with a tool call (e.g., generate_image), trigger our image API
    // Note: tool_calls may appear on the assistant message in some SDK versions.
    const maybeToolCalls = (assistantReply as any)?.tool_calls;
    if (Array.isArray(maybeToolCalls)) {
      for (const toolCall of maybeToolCalls) {
        if (toolCall?.function?.name === 'generate_image') {
          try {
            const args = JSON.parse(toolCall.function.arguments || '{}');
            const resp = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/images/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: args.prompt,
                size: args.size || '512x512',
                styleHints: args.styleHints || [],
              }),
            });
            const imageData = await resp.json();
            imageUrl = imageData?.imageUrl || null;
            promptUsed = imageData?.promptUsed || null;
          } catch (e) {
            // If image generation fails, we just return the text reply
            console.error('Image generation trigger failed:', e);
          }
        }
      }
    }

    return res.status(200).json({ reply: content, imageUrl, promptUsed });
  } catch (error: any) {
    console.error('Invocation error:', error);
    // Friendly error for the UI
    return res.status(500).json({ error: error?.message || 'Invocation failed' });
  }
}
