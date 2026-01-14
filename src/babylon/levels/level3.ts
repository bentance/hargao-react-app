import type { LevelData } from "./types";

// Level 3: Salt Flat
// Open outdoor environment with circular ground and tropical skybox
export const LEVEL_3: LevelData = {
    id: 3,
    name: "Salt Flat",
    isGallery: false,
    isCircular: true,          // Use circular ground instead of rectangle
    groundRadius: 50,          // 50 unit radius circle
    groundYOffset: 0,
    hasInvisibleWalls: true,   // Invisible boundary to keep player inside
    hasFreestandingArt: true,  // Display paintings as freestanding framed art
    floorTexture: "/textures/salt_flat_floor_texture.jpg",
    skyboxPath: "https://playground.babylonjs.com/textures/TropicalSunnyDay",  // Cubemap skybox
    platforms: [],
    slopes: {
        startX: 0,
        z: 0,
        width: 0,
        count: 0
    }
};
