// ---------------------------------------------------------------------------
// Map registry — lookup any map by its ID string
// ---------------------------------------------------------------------------

import type { MapData } from "../types";
import { vtIsland } from "./vt-island";
import { miamiMap } from "./miami";
import { puertoRicoMap } from "./puerto-rico";
import { cancunMap } from "./cancun";
import { nycMap } from "./nyc";
import { tennesseeMap } from "./tennessee";
import { uvaMap } from "./uva";
import { ncMap } from "./nc";
import { dcMap } from "./dc";
import { richmondMap } from "./richmond";
import { orlandoMap } from "./orlando";

const ALL_MAPS: Record<string, MapData> = {
  "vt-island": vtIsland,
  miami: miamiMap,
  "puerto-rico": puertoRicoMap,
  cancun: cancunMap,
  nyc: nycMap,
  tennessee: tennesseeMap,
  uva: uvaMap,
  nc: ncMap,
  dc: dcMap,
  richmond: richmondMap,
  orlando: orlandoMap,
};

export function getMap(id: string): MapData {
  return ALL_MAPS[id] ?? vtIsland;
}

/** Flight destinations available from the airport. */
export const AIRPORT_DESTINATIONS = [
  { id: "miami",        label: "Miami" },
  { id: "puerto-rico",  label: "Puerto Rico" },
  { id: "cancun",       label: "Cancún" },
];
