"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../utils/supabase";
import type { InventoryItem } from "../components/InventoryBar";

interface InventorySessionRow {
  id: string;
  current_stage: number;
  active_artifacts?: string[] | null;
  unlocked_tokens?: string[] | null;
  completed_milestones?: Record<string, unknown> | null;
  updated_at: string;
}

export interface InventoryEntry extends InventoryItem {
  owner?: string;
  isOwnedByCurrentUser?: boolean;
  source: "base" | "artifact" | "token";
}

const SESSION_ID = "ep-island-2025";

const BASE_ITEMS: InventoryEntry[] = [
  {
    name: "Map",
    icon: "🗺️",
    enlargedIcon: "🗺️",
    description: "A folded island map you can open for a closer look.",
    source: "base",
  },
];

const CHARACTER_ARTIFACT_OWNERS: Record<string, string> = {
  "wheelchair": "Jake",
  "fake id": "Sithu",
  "lord floof": "Sarah",
};

const ITEM_CATALOG: Record<string, Omit<InventoryEntry, "source" | "isOwnedByCurrentUser">> = {
  "map": {
    name: "Map",
    icon: "🗺️",
    enlargedIcon: "🗺️",
    description: "A folded island map you can open for a closer look.",
  },
  "fake id": {
    name: "Fake ID",
    icon: "🪪",
    description: "A suspiciously convincing ID card.",
    owner: "Sithu",
  },
  "lord floof": {
    name: "Lord Floof",
    icon: "🦄",
    description: "A prized plush companion with major emotional importance.",
    owner: "Sarah",
  },
  "wheelchair": {
    name: "Wheelchair",
    icon: "♿",
    description: "A character-specific mobility item.",
    owner: "Jake",
  },
  "jake_token": {
    name: "JAKE_TOKEN",
    icon: "🏆",
    description: "Jake's hard-earned token.",
    owner: "Jake",
  },
  "sarah_token": {
    name: "SARAH_TOKEN",
    icon: "🦄",
    description: "Sarah's token. Lord Floof approves.",
    owner: "Sarah",
  },
  "graveyard-done": {
    name: "Graveyard",
    icon: "💀",
    description: "The fallen members have been honored.",
  },
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function normalizeSessionRow(row: Record<string, unknown>): InventorySessionRow {
  return {
    id: typeof row.id === "string" ? row.id : SESSION_ID,
    current_stage: typeof row.current_stage === "number" ? row.current_stage : 0,
    active_artifacts: Array.isArray(row.active_artifacts) ? row.active_artifacts.filter((value): value is string => typeof value === "string") : [],
    unlocked_tokens: Array.isArray(row.unlocked_tokens) ? row.unlocked_tokens.filter((value): value is string => typeof value === "string") : [],
    completed_milestones: row.completed_milestones && typeof row.completed_milestones === "object"
      ? (row.completed_milestones as Record<string, unknown>)
      : {},
    updated_at: typeof row.updated_at === "string" ? row.updated_at : new Date().toISOString(),
  };
}

function sameCharacter(a?: string, b?: string) {
  if (!a || !b) return false;
  return normalizeKey(a) === normalizeKey(b);
}

function getPlayerArtifacts(
  milestones: Record<string, unknown> | null | undefined,
  currentCharacter?: string
) {
  if (!currentCharacter || !milestones) return [] as string[];
  const playerArtifactsRoot = milestones.player_artifacts;
  if (!playerArtifactsRoot || typeof playerArtifactsRoot !== "object") return [] as string[];

  const artifacts = (playerArtifactsRoot as Record<string, unknown>)[currentCharacter];
  if (!Array.isArray(artifacts)) return [] as string[];
  return artifacts.filter((value): value is string => typeof value === "string");
}

function toInventoryEntry(name: string, source: "artifact" | "token", currentCharacter?: string): InventoryEntry {
  const key = normalizeKey(name);
  const catalogEntry = ITEM_CATALOG[key];
  const owner = catalogEntry?.owner ?? CHARACTER_ARTIFACT_OWNERS[key];
  const baseName = catalogEntry?.name ?? name;

  return {
    name: baseName,
    icon: catalogEntry?.icon ?? "✨",
    enlargedIcon: catalogEntry?.enlargedIcon,
    description: catalogEntry?.description ?? `${baseName} has been added to the shared inventory.`,
    owner,
    isOwnedByCurrentUser: sameCharacter(owner, currentCharacter),
    source,
  };
}

export function useInventory(currentCharacter?: string) {
  const [sessionRow, setSessionRow] = useState<InventorySessionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const rowRef = useRef<InventorySessionRow | null>(null);
  const hasActiveArtifactsColumnRef = useRef(false);
  rowRef.current = sessionRow;

  useEffect(() => {
    supabase
      .from("game_sessions")
      .select("*")
      .eq("id", SESSION_ID)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error) {
          console.error("[Inventory] fetch error", error.message ?? error);
          setLoading(false);
          return;
        }

        if (data) {
          hasActiveArtifactsColumnRef.current = "active_artifacts" in (data as Record<string, unknown>);
          setSessionRow(normalizeSessionRow(data as Record<string, unknown>));
        } else {
          const { data: created, error: createError } = await supabase
            .from("game_sessions")
            .insert({ id: SESSION_ID })
            .select("*")
            .single();

          if (createError) {
            console.error("[Inventory] create row error", createError.message ?? createError);
          } else if (created) {
            hasActiveArtifactsColumnRef.current = "active_artifacts" in (created as Record<string, unknown>);
            setSessionRow(normalizeSessionRow(created as Record<string, unknown>));
          }
        }

        setLoading(false);
      });

    const channel = supabase
      .channel(`inventory:${SESSION_ID}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${SESSION_ID}`,
        },
        (payload) => {
          hasActiveArtifactsColumnRef.current = "active_artifacts" in ((payload.new ?? {}) as Record<string, unknown>);
          setSessionRow(normalizeSessionRow((payload.new ?? {}) as Record<string, unknown>));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const collectArtifact = useCallback(async (artifactName: string) => {
    if (!currentCharacter) return;

    const currentArtifacts = getPlayerArtifacts(rowRef.current?.completed_milestones, currentCharacter);
    if (currentArtifacts.includes(artifactName)) return;

    const nextArtifacts = [...currentArtifacts, artifactName];
    const currentMilestones = rowRef.current?.completed_milestones ?? {};
    const existingPlayerArtifacts = currentMilestones.player_artifacts && typeof currentMilestones.player_artifacts === "object"
      ? (currentMilestones.player_artifacts as Record<string, unknown>)
      : {};
    const nextMilestones = {
      ...currentMilestones,
      player_artifacts: {
        ...existingPlayerArtifacts,
        [currentCharacter]: nextArtifacts,
      },
    };
    const { error } = await supabase
      .from("game_sessions")
      .update({
        ...(hasActiveArtifactsColumnRef.current ? { active_artifacts: rowRef.current?.active_artifacts ?? [] } : {}),
        completed_milestones: nextMilestones,
        updated_at: new Date().toISOString(),
      })
      .eq("id", SESSION_ID);

    if (error) {
      console.error("[Inventory] collectArtifact error", error.message ?? error);
    }
  }, []);

  const activeArtifacts = getPlayerArtifacts(sessionRow?.completed_milestones, currentCharacter);
  const unlockedTokens = sessionRow?.unlocked_tokens ?? [];

  const items = useMemo(() => {
    const merged = new Map<string, InventoryEntry>();

    for (const baseItem of BASE_ITEMS) {
      merged.set(normalizeKey(baseItem.name), {
        ...baseItem,
        isOwnedByCurrentUser: sameCharacter(baseItem.owner, currentCharacter),
      });
    }

    for (const artifact of activeArtifacts) {
      const entry = toInventoryEntry(artifact, "artifact", currentCharacter);
      merged.set(normalizeKey(entry.name), entry);
    }

    for (const token of unlockedTokens) {
      const entry = toInventoryEntry(token, "token", currentCharacter);
      if (!entry.owner || sameCharacter(entry.owner, currentCharacter)) {
        merged.set(normalizeKey(entry.name), entry);
      }
    }

    return Array.from(merged.values());
  }, [activeArtifacts, currentCharacter, unlockedTokens]);

  return {
    items,
    loading,
    currentStage: sessionRow?.current_stage ?? 0,
    activeArtifacts,
    unlockedTokens,
    collectArtifact,
  };
}
