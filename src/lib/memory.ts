// src/lib/memory.ts
import { supabaseAdmin } from "./supabaseAdmin";

/* ---------------------------------------------------------------------------
   🧩 USER PROFILES
--------------------------------------------------------------------------- */

export async function getOrCreateUserProfile(userId: string, email?: string) {
  try {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("❌ Error fetching user profile:", fetchError.message);
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
        console.error("❌ Failed to create user profile:", insertError.message);
        throw insertError;
      }

      console.log(`✅ Created new profile for user ${email || userId}`);
    }

    return existing || { id: userId, email };
  } catch (err) {
    console.error("❌ getOrCreateUserProfile failed:", err);
    throw err;
  }
}

/* ---------------------------------------------------------------------------
   🧩 SESSIONS
--------------------------------------------------------------------------- */

export async function createSession(
  userId: string,
  companionSlug: string,
  intent: string = "general"
) {
  try {
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

    if (error) throw error;

    console.log(`🧭 Created new session for user ${userId}`);
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

/* ---------------------------------------------------------------------------
   🧩 MESSAGES
--------------------------------------------------------------------------- */

export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant" | "system",
  content: string,
  attachments?: Record<string, any>
) {
  try {
    if (!sessionId) throw new Error("Missing session ID in saveMessage");
    if (!role) throw new Error("Missing role in saveMessage");

    const payload = {
      session_id: sessionId,
      role,
      content: content || "",
      attachments: attachments || {},
      created_at: new Date().toISOString(),
    };

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
   🧩 TONE HISTORY
--------------------------------------------------------------------------- */

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

    // Also update user_profiles.current_tone
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

export async function getLastTone(userId: string, companionSlug: string) {
  try {
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
      return null;
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