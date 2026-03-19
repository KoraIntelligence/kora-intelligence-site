// src/pages/api/build-enquiry.ts
// Saves a build enquiry from the /build landing page.
// Inserts into build_enquiries table. No auth required.

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  const { businessName, industry, city, jobDescription, hasData, email } = body as {
    businessName: string;
    industry?: string;
    city?: string;
    jobDescription?: string;
    hasData?: boolean;
    email: string;
  };

  if (!businessName || !email) {
    return res.status(400).json({ error: 'businessName and email are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const { error } = await supabaseAdmin.from('build_enquiries').insert([
    {
      business_name: businessName.trim(),
      industry: industry?.trim() || null,
      city: city?.trim() || null,
      job_description: jobDescription?.trim() || null,
      has_data: hasData ?? false,
      email: email.trim().toLowerCase(),
    },
  ]);

  if (error) {
    console.error('❌ build-enquiry insert error:', error.message);
    return res.status(500).json({ error: 'Failed to save enquiry.' });
  }

  console.log(`📩 Build enquiry from ${email} — ${businessName}`);
  return res.status(200).json({ ok: true });
}
