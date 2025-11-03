// src/lib/memory.ts
import { supabaseAdmin } from "./supabaseClient";

/* ---------------------------------------------------------------------------
   🧩 USER PROFILES
--------------------------------------------------------------------------- */

/**
 * Ensures a user profile exists in Supabase.
 * If not found, it creates one automatically.
 */
export async function getOrCreateUserProfile(userId: string, email?: string) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("❌ Error fetching user profile:", fetchError);
    throw fetchError;
  }

  if (!existing) {
    const { error: insertError } = await supabaseAdmin
      .from("user_profiles")
      .insert([
        {
          id: userId,
          email,
          name: email?.split("@")[0] || "Anonymous",
          current_tone: "calm",
        },
      ]);

    if (insertError) {
      console.error("❌ Failed to create user profile:", insertError);
      throw insertError;
    }

    console.log(`✅ Created new profile for user ${email || userId}`);
  }

  return existing || { id: userId, email };
}

/* ---------------------------------------------------------------------------
   🧩 SESSIONS
--------------------------------------------------------------------------- */

/**
 * Creates a new conversation session for the user.
 */
export async function createSession(
  userId: string,
  companionSlug: string,
  intent: string = "general"
) {
  const { data, error } = await supabaseAdmin
    .from("sessions")
    .insert([
      {
        user_id: userId,
        companion_slug: companionSlug,
        context: { intent },
        last_updated: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ Failed to create session:", error);
    throw error;
  }

  return data;
}

/**
 * Updates session context (e.g. conversation memory or metadata)
 */
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

  if (error) console.error("⚠️ Failed to update session context:", error);
}

/* ---------------------------------------------------------------------------
   🧩 MESSAGES
--------------------------------------------------------------------------- */

/**
 * Saves a chat message from either user or assistant.
 */
export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant" | "system",
  content: string,
  attachments?: Record<string, any>
) {
  if (!content && !attachments) return;

  const { error } = await supabaseAdmin.from("messages").insert([
    {
      session_id: sessionId,
      role,
      content,
      attachments: attachments || {},
    },
  ]);

  if (error) {
    console.error("⚠️ Failed to save message:", error);
  }
}

/**
 * Fetches conversation history for a given session.
 */
export async function getMessages(sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("⚠️ Failed to get messages:", error);
    return [];
  }

  return data || [];
}

/* ---------------------------------------------------------------------------
   🧩 TONE HISTORY
--------------------------------------------------------------------------- */

/**
 * Save tone record for user-companion interaction.
 */
export async function saveTone(
  userId: string,
  companionSlug: string,
  tone: string,
  reason: string = "session_update"
) {
  const { error } = await supabaseAdmin.from("tone_history").insert([
    {
      user_id: userId,
      companion_slug: companionSlug,
      tone,
      reason,
    },
  ]);

  if (error) console.error("⚠️ Failed to save tone:", error);

  // Also update current_tone in user_profiles
  await supabaseAdmin
    .from("user_profiles")
    .update({ current_tone: tone })
    .eq("id", userId);
}

/**
 * Retrieve the latest tone from tone_history or fallback to user_profiles
 */
export async function getLastTone(userId: string, companionSlug: string) {
  const { data, error } = await supabaseAdmin
    .from("tone_history")
    .select("tone")
    .eq("user_id", userId)
    .eq("companion_slug", companionSlug)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("⚠️ Error getting tone history:", error);
    return null;
  }

  if (data?.tone) return data.tone;

  // Fallback to user_profiles.current_tone
  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("current_tone")
    .eq("id", userId)
    .single();

  return profile?.current_tone || "calm";
}