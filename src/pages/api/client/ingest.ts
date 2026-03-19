// src/pages/api/client/ingest.ts
// File ingestion pipeline: file → parse → chunk → embed → store in knowledge_chunks
// Called from /account when a business uploads a file to their knowledge base.

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { parseUploadedFile } from '../session/utils/parseFiles';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// ---------------------------------------------------------------------------
// Chunking
// Split text into overlapping chunks of ~400 words (~2000 chars) with
// ~50-word overlap (~250 chars). Word-boundary aware — no mid-word splits.
// ---------------------------------------------------------------------------
const CHUNK_SIZE = 2000;    // characters
const CHUNK_OVERLAP = 250;  // characters

function chunkText(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length === 0) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + CHUNK_SIZE;

    // Snap to word boundary — don't cut mid-word
    if (end < cleaned.length) {
      const lastSpace = cleaned.lastIndexOf(' ', end);
      if (lastSpace > start) end = lastSpace;
    } else {
      end = cleaned.length;
    }

    const chunk = cleaned.slice(start, end).trim();
    if (chunk.length > 50) chunks.push(chunk); // skip tiny fragments

    start = end - CHUNK_OVERLAP;
    if (start <= 0) start = end; // prevent infinite loop on very short text
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Embed a batch of strings via OpenAI text-embedding-3-small
// Returns array of float32 vectors (length 1536 each)
// ---------------------------------------------------------------------------
async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

// ---------------------------------------------------------------------------
// Handler
// POST body: { clientId, filePayload: { contentBase64, type, name } }
// ---------------------------------------------------------------------------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clientId, filePayload } = req.body as {
    clientId: string;
    filePayload: { contentBase64: string; type: string; name: string };
  };

  if (!clientId) return res.status(400).json({ error: 'Missing clientId' });
  if (!filePayload?.contentBase64) return res.status(400).json({ error: 'Missing filePayload' });

  try {
    // 1. Parse file → raw text
    console.log(`📥 Ingesting file: ${filePayload.name} for client ${clientId}`);
    const rawText = await parseUploadedFile(filePayload, filePayload.type);

    if (!rawText || rawText.trim().length < 20) {
      return res.status(422).json({ error: 'Could not extract meaningful text from file.' });
    }

    // 2. Chunk text
    const chunks = chunkText(rawText);
    console.log(`✂️  Split into ${chunks.length} chunks`);

    if (chunks.length === 0) {
      return res.status(422).json({ error: 'File produced no usable text chunks.' });
    }

    // 3. Delete existing chunks for this source file (clean re-ingest)
    const { error: deleteError } = await supabaseAdmin
      .from('knowledge_chunks')
      .delete()
      .eq('client_id', clientId)
      .eq('source_file', filePayload.name);

    if (deleteError) {
      console.warn('⚠️ Could not delete old chunks:', deleteError.message);
    }

    // 4. Embed in batches of 20 (OpenAI rate limit friendly)
    const BATCH_SIZE = 20;
    const allRows: Array<{
      client_id: string;
      content: string;
      embedding: number[];
      source_file: string;
      chunk_index: number;
    }> = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await embedBatch(batch);

      batch.forEach((content, j) => {
        allRows.push({
          client_id: clientId,
          content,
          embedding: embeddings[j],
          source_file: filePayload.name,
          chunk_index: i + j,
        });
      });

      console.log(`🔢 Embedded batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
    }

    // 5. Insert all rows into knowledge_chunks
    const { error: insertError } = await supabaseAdmin
      .from('knowledge_chunks')
      .insert(allRows);

    if (insertError) {
      console.error('❌ Insert error:', insertError.message);
      return res.status(500).json({ error: 'Failed to store knowledge chunks.' });
    }

    console.log(`✅ Ingested ${allRows.length} chunks for client ${clientId} from ${filePayload.name}`);

    return res.status(200).json({
      ok: true,
      chunks: allRows.length,
      source: filePayload.name,
    });

  } catch (err: any) {
    console.error('❌ Ingest error:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Ingest failed.' });
  }
}
