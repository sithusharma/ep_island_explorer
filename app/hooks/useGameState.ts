"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../utils/supabase";

export interface GameSession {
  id: string;
  current_stage: number;
  unlocked_tokens: string[];
  completed_milestones: Record<string, unknown>;
  updated_at: string;
}

const SESSION_ID = "ep-island-2025";
const FINAL_STAGE = 9;

function normalizeStage(stage: number) {
  return Math.max(0, Math.min(FINAL_STAGE, stage));
}

export function getMiloHint(currentStage: number, unlockedTokens: string[] = []) {
  const graveyardDone = unlockedTokens.includes("graveyard-done");

  switch (normalizeStage(currentStage)) {
    case 0:
      return "Welcome to VT Island! There is a prize we all have to work together to unlock. Explore the buildings and look at photos together — that's the whole point. For your first hint: get some alcohol for the ride.";
    case 1:
      return "Look for where Jake had his worst alc experience.";
    case 2:
      if (!graveyardDone)
        return "The fallen hold the next key. Head to the graveyard and pay your respects — go through Edge to learn who they were.";
      return "Look for the floofiest of them all.";
    case 3:
      return "Head to UVA. Riya needs to find a condom and bring it to the creepy AirBnB. Don't party too hard once inside, or you might hurt yourself.";
    case 4:
      return "Head to NYC 2.0. Sanjana needs to find the photo of her with crutches. Remember, don't drink too much when trying to talk to girls.";
    case 5:
      return "Get to Puerto Rico. Arav needs to pick up a beer can artifact and bring it to a girl.";
    case 6:
      return "Everyone go find your own garages on VT island. Find the one ugly photo amongst all the nice pictures. Once found: get some drugs and enjoy the views at the smoke shop.";
    case 7:
      return "The four original members of Edge need to find their specific photos to unlock their tokens.";
    case 8:
      return "A moving truck has appeared outside Edge. Everyone needs to search across every island to find one cigarette for Arnav.";
    case 9:
      return "You did it. Head back to the Drillfield building to unlock the final prize.";
    default:
      return "Welcome to VT Island! There is a prize we all have to work together to unlock. Explore the buildings and look at photos together.";
  }
}

export function useGameState() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionRef = useRef<GameSession | null>(null);
  sessionRef.current = session;

  useEffect(() => {
    supabase
      .from("game_sessions")
      .select("*")
      .eq("id", SESSION_ID)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error) {
          console.error("[GameState] fetch error", error);
          setLoading(false);
          return;
        }
        if (data) {
          setSession({ ...(data as GameSession), current_stage: normalizeStage((data as GameSession).current_stage) });
        } else {
          const { data: created } = await supabase
            .from("game_sessions")
            .insert({ id: SESSION_ID })
            .select()
            .single();
          if (created) {
            setSession({ ...(created as GameSession), current_stage: normalizeStage((created as GameSession).current_stage) });
          }
        }
        setLoading(false);
      });

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
          setSession({ ...(payload.new as GameSession), current_stage: normalizeStage((payload.new as GameSession).current_stage) });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const isArtifact = session !== null && normalizeStage(session.current_stage) === FINAL_STAGE;

  const advanceStage = useCallback(async (stage: number) => {
    if (sessionRef.current && normalizeStage(sessionRef.current.current_stage) === FINAL_STAGE) return;

    const nextStage = normalizeStage(stage);
    const { error } = await supabase
      .from("game_sessions")
      .update({ current_stage: nextStage, updated_at: new Date().toISOString() })
      .eq("id", SESSION_ID);
    if (error) console.error("[GameState] advanceStage error", error);
  }, []);

  const unlockToken = useCallback(async (token: string) => {
    const { error } = await supabase.rpc("append_token", {
      session_id: SESSION_ID,
      token,
    });
    if (error) console.error("[GameState] unlockToken error", error);
  }, []);

  const completeMilestone = useCallback(
    async (key: string, value: unknown) => {
      if (sessionRef.current && normalizeStage(sessionRef.current.current_stage) === FINAL_STAGE) return;

      const current = sessionRef.current?.completed_milestones ?? {};
      const { error } = await supabase
        .from("game_sessions")
        .update({
          completed_milestones: { ...current, [key]: value },
          updated_at: new Date().toISOString(),
        })
        .eq("id", SESSION_ID);
      if (error) console.error("[GameState] completeMilestone error", error);
    },
    []
  );

  return {
    session,
    loading,
    currentStage: normalizeStage(session?.current_stage ?? 0),
    isArtifact,
    advanceStage,
    unlockToken,
    completeMilestone,
  };
}
