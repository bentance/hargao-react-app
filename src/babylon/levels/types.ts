export interface PlatformData {
    x: number;
    y: number;
    z: number;
    width: number;
    depth: number;
}

export interface SlopeData {
    startX: number;
    z: number;
    width: number;
    count: number;
}

export interface GroundSize {
    width: number;
    height: number;
}

export interface LevelData {
    id: number;
    name: string;
    filename?: string; // Optional: if set, load this GLB file
    scale?: number;    // Optional: scale factor for the model
    yOffset?: number;  // Optional: manual Y offset
    isGallery?: boolean; // If true, use gallery mode with wall paintings
    groundSize?: GroundSize; // Optional: custom ground size for this level
    groundYOffset?: number;  // Optional: Y position offset for ground
    hasBoundaryWalls?: boolean; // Optional: add walls around the ground plane
    floorTexture?: string; // Optional: path to floor texture image
    wallTexture?: string;  // Optional: path to wall texture image
    wallColor?: { r: number, g: number, b: number }; // Optional: solid wall color (overrides texture)
    isCircular?: boolean;  // Optional: if true, ground is a disc instead of rectangle
    groundRadius?: number; // Optional: radius for circular ground
    hasInvisibleWalls?: boolean; // Optional: add invisible boundary walls
    skyboxPath?: string;   // Optional: path to cubemap skybox textures
    hasFreestandingArt?: boolean; // Optional: display paintings as freestanding framed art with About
    isMuseumRoom?: boolean; // Optional: enclosed room with paintings on 4 walls
    hasCeiling?: boolean;   // Optional: add ceiling to room
    ceilingColor?: { r: number, g: number, b: number }; // Optional: ceiling color
    groundColor?: { r: number, g: number, b: number }; // Optional: ground color
    disableSunLight?: boolean; // Optional: disable directional sun light for indoor levels
    platforms: PlatformData[];
    slopes: SlopeData;
    isColorScream?: boolean; // Optional: "Color Scream" level with floating shapes
}
