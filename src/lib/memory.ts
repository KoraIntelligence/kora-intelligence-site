// src/lib/memory.ts
import { supabaseAdmin } from "./supabaseAdmin";

/* ---------------------------------------------------------------------------
   🧩 USER PROFILES  (AUTHENTICATED USERS ONLY)
--------------------------------------------------------------------------- */

/**
 * Ensure there's a row in user_profiles for a **real Supabase user**.
 * - userId MUST be a valid uuid from Supabase auth.
 * - Guests should NOT call this (we keep guests out of user_profiles here).
 */
export async function getOrCreateUserProfile(userId: string, email?: string | null) {
  try {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Error fetching user profile:", fetchError.message);
      throw fetchError;
    }

    if (!existing) {
      const { error: insertError } = await supabaseAdmin
        .from("user_profiles")
        .insert([
          {
            id: userId,
            email: email ?? null,
            name: email ? email.split("@")[0] : "Anonymous",
            current_tone: "calm",
          },
        ]);

      if (insertError) {
        console.error("❌ Failed to create user profile:", insertError.message);
        throw insertError;
      }

      console.log(`✅ Created new profile for user ${email || userId}`);
      return {
        id: userId,
        email: email ?? null,
        name: email ? email.split("@")[0] : "Anonymous",
        current_tone: "calm",
      };
    }

    return existing;
  } catch (err) {
    console.error("❌ getOrCreateUserProfile failed:", err);
    throw err;
  }
}

/* ---------------------------------------------------------------------------
   🧩 SESSIONS
--------------------------------------------------------------------------- */

/**
 * Create a session.
 * - For guests: pass userId = null → sessions.user_id will be NULL (allowed).
 * - For auth users: pass the Supabase user.id (uuid).
 */
export async function createSession(
  userId: string | null,
  companionSlug: string,
  intent: string = "general"
) {
  try {
    const { data, error } = await supabaseAdmin
      .from("sessions")
      .insert([
        {
          user_id: userId ?? null, // guests → NULL, auth → uuid
          companion_slug: companionSlug,
          context: { intent },
          last_updated: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log(`🧭 Created new session for user ${userId ?? "guest/null"}`);
    return data;
  } catch (err) {
    console.error("❌ Failed to create session:", err);
    throw err;
  }
}

export async function updateSessionContext(
  sessionId: string,
  newContext: Record<string, any>
) {
  const { error } = await supabaseAdmin
    .from("sessions")
    .update({
      context: newContext,
      last_updated: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) console.error("⚠️ Failed to update session context:", error.message);
}

/**
 * Set the human-readable title and mode on a session.
 * Called after the first assistant message to auto-name the session.
 * Format: "Salar · Proposal Builder · 14 Mar"
 */
export async function updateSessionTitle(
  sessionId: string,
  companion: string,
  mode: string
) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const modeLabel = mode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const companionLabel = companion[0].toUpperCase() + companion.slice(1);
  const title = `${companionLabel} · ${modeLabel} · ${date}`;

  const { error } = await supabaseAdmin
    .from("sessions")
    .update({
      title,
      mode,
      last_updated: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .is("title", null); // only set once — don't overwrite if already named

  if (error) console.error("⚠️ Failed to update session title:", error.message);
}

/* ---------------------------------------------------------------------------
   🧩 MESSAGES
--------------------------------------------------------------------------- */

type MessageRole = "user" | "assistant" | "system";

type SaveMessageOptions =
  | Record<string, any>
  | {
      attachments?: Record<string, any>;
      meta?: Record<string, any>;
    };

export async function saveMessage(
  sessionId: string,
  role: MessageRole,
  content: string,
  attachmentsOrOptions?: SaveMessageOptions
) {
  try {
    if (!sessionId) throw new Error("Missing session ID in saveMessage");
    if (!role) throw new Error("Missing role in saveMessage");

    let attachments: Record<string, any> | undefined = undefined;
    let meta: Record<string, any> | undefined = undefined;

    if (attachmentsOrOptions) {
      const maybe = attachmentsOrOptions as any;

      if (
        typeof maybe === "object" &&
        (Object.prototype.hasOwnProperty.call(maybe, "attachments") ||
          Object.prototype.hasOwnProperty.call(maybe, "meta"))
      ) {
        attachments = maybe.attachments || {};
        meta = maybe.meta || undefined;
      } else {
        attachments = attachmentsOrOptions as Record<string, any>;
      }
    }

    const payload: Record<string, any> = {
      session_id: sessionId,
      role,
      content: content || "",
      attachments: attachments || {},
      created_at: new Date().toISOString(),
    };

    // Write metadata to the dedicated column (requires migration A3 to be run)
    if (meta) {
      payload.metadata = meta;
    }

    const { error } = await supabaseAdmin.from("messages").insert([payload]);

    if (error) {
      console.error("❌ Failed to save message:", error.message);
      return { ok: false, error };
    }

    console.log(`💾 Message saved (${role}) for session ${sessionId}`);
    return { ok: true };
  } catch (err) {
    console.error("⚠️ saveMessage threw error:", err);
    return { ok: false, error: err };
  }
}

export async function getMessages(sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("⚠️ Failed to get messages:", error.message);
    return [];
  }

  return data || [];
}

/* ---------------------------------------------------------------------------
   🧩 BRAND PROFILES
--------------------------------------------------------------------------- */

export interface BrandProfile {
  id?: string;
  user_id: string;
  brand_name?: string | null;
  industry?: string | null;
  tone_keywords?: string[] | null;
  messaging_pillars?: string[] | null;
  target_audience?: string | null;
  brand_voice_notes?: string | null;
}

/**
 * Fetch the brand profile for an authenticated user.
 * Returns null if no profile exists yet.
 */
export async function getBrandProfile(userId: string): Promise<BrandProfile | null> {
  if (!userId) return null;

  const { data, error } = await supabaseAdmin
    .from("brand_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("⚠️ getBrandProfile error:", error.message);
    return null;
  }

  return data ?? null;
}

/**
 * Upsert a brand profile for an authenticated user.
 */
export async function upsertBrandProfile(profile: BrandProfile): Promise<{ ok: boolean }> {
  const { error } = await supabaseAdmin
    .from("brand_profiles")
    .upsert(
      { ...profile, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("❌ upsertBrandProfile error:", error.message);
    return { ok: false };
  }

  return { ok: true };
}

/**
 * Build a brand context string to inject into companion system prompts.
 * Returns an empty string if the user has no brand profile or the profile
 * has no meaningful content — so the prompt is unaffected for guest users.
 */
export async function getBrandContext(userId: string | null): Promise<string> {
  if (!userId) return "";

  const profile = await getBrandProfile(userId);
  if (!profile) return "";

  const lines: string[] = [];

  if (profile.brand_name) lines.push(`Brand: ${profile.brand_name}`);
  if (profile.industry) lines.push(`Industry: ${profile.industry}`);
  if (profile.target_audience) lines.push(`Target Audience: ${profile.target_audience}`);
  if (profile.tone_keywords?.length)
    lines.push(`Brand Tone: ${profile.tone_keywords.join(", ")}`);
  if (profile.messaging_pillars?.length)
    lines.push(`Messaging Pillars: ${profile.messaging_pillars.join(" | ")}`);
  if (profile.brand_voice_notes)
    lines.push(`Voice Notes: ${profile.brand_voice_notes}`);

  if (lines.length === 0) return "";

  return `\n--------------------------------------------------\nBRAND CONTEXT (apply to all outputs):\n${lines.join("\n")}\n--------------------------------------------------\n`;
}

/* ---------------------------------------------------------------------------
   🧩 TONE HISTORY
--------------------------------------------------------------------------- */

/**
 * Save tone for an authenticated user.
 * - For guests, just don't call this (unified.ts will skip when userId is null).
 */
export async function saveTone(
  userId: string,
  companionSlug: string,
  tone: string,
  reason: string = "session_update"
) {
  try {
    if (!userId) throw new Error("Missing userId in saveTone");

    const tonePayload = {
      user_id: userId,
      companion_slug: companionSlug,
      tone: tone || "neutral",
      reason,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin.from("tone_history").insert([tonePayload]);

    if (error) {
      console.error("❌ Failed to save tone:", error.message);
      return { ok: false, error };
    }

    console.log(`🎵 Tone "${tone}" saved for user ${userId}`);

    const { error: updateError } = await supabaseAdmin
      .from("user_profiles")
      .update({ current_tone: tone })
      .eq("id", userId);

    if (updateError)
      console.error("⚠️ Failed to update user_profiles tone:", updateError.message);

    return { ok: true };
  } catch (err) {
    console.error("⚠️ saveTone threw error:", err);
    return { ok: false, error: err };
  }
}

/**
 * Get last tone for an authenticated user.
 * - If userId is null (guest) → always returns "calm".
 */
export async function getLastTone(userId: string | null, companionSlug: string) {
  try {
    if (!userId) {
      // Guests: no tone history, default to calm
      return "calm";
    }

    const { data, error } = await supabaseAdmin
      .from("tone_history")
      .select("tone")
      .eq("user_id", userId)
      .eq("companion_slug", companionSlug)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("⚠️ Error getting tone history:", error.message);
      return "calm";
    }

    if (data?.tone) return data.tone;

    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("current_tone")
      .eq("id", userId)
      .single();

    return profile?.current_tone || "calm";
  } catch (err) {
    console.error("❌ getLastTone failed:", err);
    return "calm";
  }
}