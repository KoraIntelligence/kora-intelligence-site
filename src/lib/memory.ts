// src/lib/memory.ts
import { supabaseAdmin } from "./supabaseAdmin";

/* ---------------------------------------------------------------------------
   🧩 USER PROFILES
--------------------------------------------------------------------------- */

export async function getOrCreateUserProfile(userId: string, email?: string) {
  try {
    // 🔧 FIX: Look up user by email first (Supabase auth always guarantees email)
    if (email) {
      const { data: byEmail } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (byEmail) {
        return byEmail;
      }
    }

    // 🔧 FIX: Fall back to lookup by id
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (existing) return existing;

    // 🔧 FIX: Create profile with correct id + email
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

    console.log(`✅ Created new profile for ${email || userId}`);
    return { id: userId, email };
  } catch (err) {
    console.error("❌ getOrCreateUserProfile failed:", err);
    throw err;
  }
}

/* ---------------------------------------------------------------------------
   🧩 SESSIONS
--------------------------------------------------------------------------- */

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
          // For guests userId will be null; FK allows NULL so that's safe.
          user_id: userId ?? null,
          companion_slug: companionSlug,
          context: { intent },
          last_updated: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log(`🧭 Created new session for user ${userId ?? "guest"}`);
    return data;
  } catch (err) {
    console.error("❌ Failed to create session:", err);
    throw err;
  }
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

    let attachments = undefined;
    let meta = undefined;

    if (attachmentsOrOptions) {
      const maybe = attachmentsOrOptions as any;

      if (
        typeof maybe === "object" &&
        (maybe.attachments !== undefined || maybe.meta !== undefined)
      ) {
        attachments = maybe.attachments || {};
        meta = maybe.meta || undefined;
      } else {
        attachments = attachmentsOrOptions as Record<string, any>;
      }
    }

    // 🔧 FIX: Store meta OUTSIDE attachments to match frontend expectations
    const payload = {
      session_id: sessionId,
      role,
      content: content || "",
      attachments: attachments || {},
      meta: meta || null,
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

    const { error } = await supabaseAdmin
      .from("tone_history")
      .insert([tonePayload]);

    if (error) {
      console.error("❌ Failed to save tone:", error.message);
      return { ok: false, error };
    }

    // 🔧 FIX: Update by userId OR email fallback
    const { error: updateError } = await supabaseAdmin
      .from("user_profiles")
      .update({ current_tone: tone })
      .eq("id", userId);

    if (updateError) {
      console.warn("⚠️ user_profiles update by id failed. Trying by email…");

      await supabaseAdmin
        .from("user_profiles")
        .update({ current_tone: tone })
        .eq("email", userId); // fallback
    }

    return { ok: true };
  } catch (err) {
    console.error("⚠️ saveTone threw error:", err);
    return { ok: false, error: err };
  }
}