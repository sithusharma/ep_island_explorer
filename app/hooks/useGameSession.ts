"use client";

// ---------------------------------------------------------------------------
// useGameSession — Supabase Realtime subscription to game_sessions table.
//
// Required Supabase SQL (run once in the dashboard):
//
//   create table if not exists game_sessions (
//     id                   text primary key,
//     current_stage        int  not null default 0,
//     unlocked_tokens      text[]       default '{}',
//     completed_milestones jsonb        default '{}',
//     updated_at           timestamptz  default now()
//   );
//
//   -- Allow all authenticated users to read and write
//   alter table game_sessions enable row level security;
//   create policy "all auth users" on game_sessions
//     for all using (auth.role() = 'authenticated');
//
//   -- Realtime must be enabled for this table in the Supabase dashboard
//   -- (Database → Replication → game_sessions → enable)
//
//   -- Helper RPC for atomic token append (avoids race conditions)
//   create or replace function append_token(session_id text, token text)
//   returns void language sql as $$
//     update game_sessions
//       set unlocked_tokens = array_append(unlocked_tokens, token),
//           updated_at      = now()
//       where id = session_id;
//   $$;
//
// ---------------------------------------------------------------------------

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../utils/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GameSession {
  id: string;
  current_stage: number;
  unlocked_tokens: string[];
  completed_milestones: Record<string, unknown>;
  updated_at: string;
}

// Shared session key — same for all players in one run.
// Change this string to start a fresh game (e.g. a new event date).
const SESSION_ID = "ep-island-2025";

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useGameSession() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionRef = useRef<GameSession | null>(null);
  sessionRef.current = session;

  useEffect(() => {
    // Initial fetch / upsert (ensures the row exists)
    supabase
      .from("game_sessions")
      .select("*")
      .eq("id", SESSION_ID)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error) { console.error("[GameSession] fetch error", error); setLoading(false); return; }
        if (data) {
          setSession(data as GameSession);
        } else {
          // Row doesn't exist yet — create it with defaults
          const { data: created } = await supabase
            .from("game_sessions")
            .insert({ id: SESSION_ID })
            .select()
            .single();
          if (created) setSession(created as GameSession);
        }
        setLoading(false);
      });

    // Real-time subscription — any UPDATE to this row propagates instantly
    const channel = supabase
      .channel(`gs:${SESSION_ID}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${SESSION_ID}`,
        },
        (payload) => {
          setSession(payload.new as GameSession);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Mutation helpers ───────────────────────────────────────────────────────

  const advanceStage = useCallback(async (stage: number) => {
    const { error } = await supabase
      .from("game_sessions")
      .update({ current_stage: stage, updated_at: new Date().toISOString() })
      .eq("id", SESSION_ID);
    if (error) console.error("[GameSession] advanceStage error", error);
  }, []);

  const unlockToken = useCallback(async (token: string) => {
    // Uses the atomic RPC to avoid duplicate entries on concurrent calls
    const { error } = await supabase.rpc("append_token", {
      session_id: SESSION_ID,
      token,
    });
    if (error) console.error("[GameSession] unlockToken error", error);
  }, []);

  const completeMilestone = useCallback(
    async (key: string, value: unknown) => {
      const current = sessionRef.current?.completed_milestones ?? {};
      const { error } = await supabase
        .from("game_sessions")
        .update({
          completed_milestones: { ...current, [key]: value },
          updated_at: new Date().toISOString(),
        })
        .eq("id", SESSION_ID);
      if (error) console.error("[GameSession] completeMilestone error", error);
    },
    []
  );

  // ── Artifact mode ──────────────────────────────────────────────────────────
  // The game has 7 stages (0-based index 0–6).
  // Once all 7 are done the experience switches to a read-only artifact view:
  // every gallery stays open and stage items remain visible permanently.
  const TOTAL_STAGES = 7;
  const isArtifact = session !== null && session.current_stage >= TOTAL_STAGES;

  return { session, loading, isArtifact, advanceStage, unlockToken, completeMilestone };
}
