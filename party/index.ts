// ---------------------------------------------------------------------------
// PartyKit server — real-time player position sync
// Runs separately from Next.js.  Dev: npx partykit dev
// Deploy: npx partykit deploy
// ---------------------------------------------------------------------------

import type { Party, PartyKitServer, Connection } from "partykit/server";

interface Player {
  id: string;
  username: string;
  x: number;
  y: number;
  rotation: number;
  currentMap: string;
}

type ClientMessage =
  | { type: "move"; username: string; x: number; y: number; rotation: number; currentMap: string }
  | { type: "ping" };

type ServerMessage =
  | { type: "init"; players: Player[] }
  | { type: "playerMoved"; player: Player }
  | { type: "removePlayer"; id: string };

export default class Server implements PartyKitServer {
  // Player registry — lives for the lifetime of this Durable Object instance.
  readonly players = new Map<string, Player>();

  constructor(readonly room: Party) {}

  onConnect(conn: Connection) {
    // Send all currently-known players to the new connection so it can
    // populate its peer map immediately, filtered client-side by map.
    const snapshot: ServerMessage = {
      type: "init",
      players: Array.from(this.players.values()),
    };
    conn.send(JSON.stringify(snapshot));
  }

  onMessage(raw: string | ArrayBuffer, sender: Connection) {
    if (typeof raw !== "string") return;

    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw) as ClientMessage;
    } catch {
      return;
    }

    if (msg.type === "ping") return;

    if (msg.type === "move") {
      const prev = this.players.get(sender.id);

      const player: Player = {
        id: sender.id,
        username: msg.username ?? prev?.username ?? "Anonymous",
        x: msg.x,
        y: msg.y,
        rotation: msg.rotation,
        currentMap: msg.currentMap,
      };

      // If the player switched maps, tell the old map's participants to drop them.
      if (prev && prev.currentMap !== player.currentMap) {
        this.broadcastToMap(prev.currentMap, { type: "removePlayer", id: sender.id }, sender.id);
      }

      this.players.set(sender.id, player);
      this.broadcastToMap(player.currentMap, { type: "playerMoved", player }, sender.id);
    }
  }

  onClose(conn: Connection) {
    const player = this.players.get(conn.id);
    this.players.delete(conn.id);

    if (player) {
      this.broadcastToMap(player.currentMap, { type: "removePlayer", id: conn.id }, conn.id);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private broadcastToMap(targetMap: string, msg: ServerMessage, excludeId: string) {
    const payload = JSON.stringify(msg);
    for (const conn of this.room.getConnections()) {
      if (conn.id === excludeId) continue;
      const peer = this.players.get(conn.id);
      if (peer?.currentMap !== targetMap) continue;
      conn.send(payload);
    }
  }
}
