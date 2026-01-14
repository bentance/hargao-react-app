import type { LevelData } from "./types";
import { LEVEL_1 } from "./level1";
import { LEVEL_2 } from "./level2";
import { LEVEL_3 } from "./level3";
import { LEVEL_4 } from "./level4";

export * from "./types";

// Level 1: Art Gallery (indoor with wall paintings)
// Level 2: Classical Museum (enclosed room with 4-wall gallery)
// Level 3: Salt Flat (outdoor with freestanding art)
// Level 4: Color Scream (floating shapes)
export const LEVELS: LevelData[] = [
    LEVEL_1,
    LEVEL_2,
    LEVEL_3,
    LEVEL_4
];
