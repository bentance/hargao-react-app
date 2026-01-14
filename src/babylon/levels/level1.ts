import type { LevelData } from "./types";

// Level 1: Art Gallery
// Indoor gallery with paintings on a wall and concrete textures
export const LEVEL_1: LevelData = {
    id: 1,
    name: "Art Gallery",
    isGallery: true,
    groundSize: {
        width: 100,   // Custom floor width
        height: 40    // Custom floor depth
    },
    groundYOffset: 0.1,
    hasBoundaryWalls: true,  // Add walls around the floor
    floorTexture: "/textures/concrete_floor_texture.jpg",
    wallTexture: "/textures/concrete_wall_texture.png",
    platforms: [],
    slopes: {
        startX: 0,
        z: 0,
        width: 0,
        count: 0
    }
};
