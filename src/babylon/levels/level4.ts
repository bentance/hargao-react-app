import type { LevelData } from "./types";

// Level 4: Color Scream
// A square plane with different shapes floating around
export const LEVEL_4: LevelData = {
    id: 4,
    name: "Color Scream",
    isColorScream: true,
    groundSize: {
        width: 60,
        height: 60
    },
    groundYOffset: 0,
    groundColor: { r: 0, g: 1, b: 1 }, // Electric Cyan #00FFFF
    hasBoundaryWalls: false,
    hasInvisibleWalls: true,
    hasCeiling: false,
    disableSunLight: false,
    platforms: [],
    slopes: {
        startX: 0,
        z: 0,
        width: 0,
        count: 0
    }
};
