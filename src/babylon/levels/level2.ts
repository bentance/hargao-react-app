import type { LevelData } from "./types";

// Level 2: Classical Museum
// Enclosed room with paintings on 4 walls, museum textures, and dark ceiling
export const LEVEL_2: LevelData = {
    id: 2,
    name: "Classical Museum",
    isGallery: false,
    isMuseumRoom: true,        // Enclosed room with paintings on 4 walls
    groundSize: {
        width: 25,             // 25 unit square room
        height: 25
    },
    groundYOffset: 0,
    hasBoundaryWalls: true,    // Actual walls around the room
    hasCeiling: false,          // Remove ceiling
    ceilingColor: { r: 0.05, g: 0.05, b: 0.15 },  // Dark navy color
    disableSunLight: true,     // No sun for indoor room
    floorTexture: "/textures/classical_museum_floor.jpg",
    wallTexture: "/textures/concrete_wall_texture.png",  // Use concrete texture
    wallColor: { r: 0.45, g: 0.15, b: 0.18 },  // Dark maroon tint
    platforms: [],
    slopes: {
        startX: 0,
        z: 0,
        width: 0,
        count: 0
    }
};
