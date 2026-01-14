// ============================================================================
// CONFIGURATION - Uses Firebase-compatible interfaces
// ============================================================================

import type {
    User,
    Gallery,
    Painting,
    UIThemeType,
    GalleryLevel,
    CharacterType
} from "./types/firebase";

import {
    UI_THEME_OPTIONS,
    LEVEL_OPTIONS,
    CHARACTER_OPTIONS
} from "./types/firebase";

// Re-export types for use in other modules
export type { Painting as PaintingData };
export { UI_THEME_OPTIONS, LEVEL_OPTIONS, CHARACTER_OPTIONS };


// ============================================================================
// APP CONFIGURATION - Online/Offline Mode
// ============================================================================
export const APP_CONFIG = {
    type: "online" as "online" | "offline",
    apiUrl: "https://api.jsonbin.io/v3/b/69546449d0ea881f404a72e4",
    apiKey: "$2a$10$qV2Px4cEdbqe23.Aa4SpoOOqN0ngyfcsvHRB.AEpiXIbx2kHfe/VS"
};

// ============================================================================
// MAIN CONFIGURATION - Application Settings (not gallery-specific)
// ============================================================================
export const MAIN_CONFIG = {
    isInspectorShortcut: false,
    showViewIndicators: true,
    showFPS: true,
    brandName: "hargao",
    brandWebsite: "youtube.com"
};

// ============================================================================
// CURRENT USER - The logged-in user (or default for offline mode)
// In online mode, this would be populated from Firebase Auth
// ============================================================================
export let CURRENT_USER: User = {
    uid: "offline-user",
    username: "guest",
    email: "",
    displayName: "Artist Name",
    photoURL: null,
    bio: "Welcome to my virtual gallery! I create digital art inspired by nature and dreams.",
    links: {
        website: "artist.com",
        instagram: "@artistname",
        twitter: null,
        youtube: null
    },
    tier: "free",
    maxGalleries: 3,
    galleriesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
};

// ============================================================================
// CURRENT GALLERY - The currently loaded gallery
// ============================================================================
export let CURRENT_GALLERY: Gallery = {
    id: "offline-gallery",
    ownerId: "offline-user",
    ownerUsername: "guest",
    slug: "default",
    name: "My Gallery",
    description: "",
    isPublished: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    access: {
        isPasswordProtected: false,
        passwordHash: null
    },
    branding: {
        showWatermark: true,
        customWatermark: null
    },
    environment: {
        level: 3 as GalleryLevel,
        character: 1 as CharacterType,
        uiTheme: 4 as UIThemeType
    },
    audio: {
        enableFootsteps: true,
        footstepsVolume: 4,
        backgroundMusic: null,
        backgroundMusicVolume: 5
    },
    paintings: [
        { id: 1, title: "Chinese Painting", description: "", imageUrl: "" },
        { id: 2, title: "Saint George and the Dragon", description: "One of my favourite paintings", imageUrl: "" },
        { id: 3, title: "Cool Art", description: "Imaginary Landscape, wish I was there", imageUrl: "" },
        { id: 4, title: "Astronaut by the swimming pool", description: "poetic", imageUrl: "" },
        { id: 5, title: "", description: "", imageUrl: "" },
        { id: 6, title: "be happy", description: "spend some time everyday with the people you love", imageUrl: "" },
        { id: 7, title: "L'Artisan Moderne", description: "by Henri de Toulouse-Lautrec", imageUrl: "" },
        { id: 8, title: "The Bedroom", description: "by Van Gogh", imageUrl: "" },
        { id: 9, title: "", description: "", imageUrl: "" },
        { id: 10, title: "Under the Wave off Kanagawa", description: "by Hokusai", imageUrl: "" }
    ],
    stats: {
        viewCount: 0,
        uniqueVisitors: 0,
        lastViewedAt: null
    }
};

// ============================================================================
// USER TYPE - Controls app behavior mode
// ============================================================================
export type UserType = "default" | "explore" | "admin" | "test" | "free" | "premium";
let currentUserType: UserType = "explore";

export function getUserType(): UserType {
    return currentUserType;
}


export function setUserType(type: UserType): void {
    currentUserType = type;
}

// ============================================================================
// REACT INTEGRATION - Functions to set data from props
// Used by GalleryViewer component when APP_CONFIG.type === "online"
// ============================================================================

/**
 * Set the app mode (online = use props data, offline = use local files)
 */
export function setAppMode(mode: "online" | "offline"): void {
    (APP_CONFIG as any).type = mode;
    console.log(`App mode set to: ${mode}`);
}

/**
 * Set gallery data from React props (for online mode)
 */
export function setGalleryData(data: {
    environment: {
        level: number;
        character: number;
        uiTheme?: number;
    };
    audio?: {
        enableFootsteps?: boolean;
        footstepsVolume?: number;
    };
    branding?: {
        showWatermark?: boolean;
    };
    paintings: {
        id: number;
        title: string;
        description: string;
        imageUrl: string;
    }[];
}): void {
    // Set environment
    if (data.environment) {
        // Ensure level is at least 1 (levels are 1-indexed)
        const level = Math.max(1, data.environment.level || 2);
        // Use character from data, default to 1 (Female) 
        const character = data.environment.character ?? 1;

        console.log(`setGalleryData: Setting level=${level}, character=${character}`);

        CURRENT_GALLERY.environment.level = level as GalleryLevel;
        CURRENT_GALLERY.environment.character = character as CharacterType;
        if (data.environment.uiTheme !== undefined) {
            CURRENT_GALLERY.environment.uiTheme = data.environment.uiTheme as UIThemeType;
        }
    }

    // Set audio
    if (data.audio) {
        if (data.audio.enableFootsteps !== undefined) {
            CURRENT_GALLERY.audio.enableFootsteps = data.audio.enableFootsteps;
        }
        if (data.audio.footstepsVolume !== undefined) {
            CURRENT_GALLERY.audio.footstepsVolume = data.audio.footstepsVolume;
        }
    }

    // Set branding
    if (data.branding) {
        if (data.branding.showWatermark !== undefined) {
            CURRENT_GALLERY.branding.showWatermark = data.branding.showWatermark;
        }
    }

    // Set paintings
    if (data.paintings) {
        CURRENT_GALLERY.paintings = data.paintings.map(p => ({
            id: p.id,
            title: p.title || "",
            description: p.description || "",
            imageUrl: p.imageUrl || "",
            // Add 'url' as alias for backward compatibility with LevelBuilder
            url: p.imageUrl || ""
        }));
        PAINTINGS = CURRENT_GALLERY.paintings;
        console.log("Paintings set with URLs:", CURRENT_GALLERY.paintings.map(p => ({ id: p.id, url: p.url })));
    }

    console.log("Gallery data set from props:", CURRENT_GALLERY);
}

/**
 * Set user/artist data from React props (for online mode)
 */
export function setUserData(data: {
    displayName: string;
    bio: string;
    photoURL: string | null;
    links: {
        website: string | null;
        instagram: string | null;
        twitter?: string | null;
        youtube?: string | null;
    };
}): void {
    CURRENT_USER.displayName = data.displayName;
    CURRENT_USER.bio = data.bio;
    CURRENT_USER.photoURL = data.photoURL;

    console.log("Setting user photoURL:", data.photoURL);

    if (data.links) {
        CURRENT_USER.links = {
            website: data.links.website,
            instagram: data.links.instagram,
            twitter: data.links.twitter || null,
            youtube: data.links.youtube || null
        };
    }

    console.log("User data set from props:", CURRENT_USER);
}


// ============================================================================
// LEGACY COMPATIBILITY LAYER
// These exports maintain backward compatibility with existing code
// ============================================================================

// GAME_CONFIG equivalent (maps to CURRENT_GALLERY.environment + audio)
export const GAME_CONFIG = {
    get currentLevel(): number { return CURRENT_GALLERY.environment.level; },
    set currentLevel(value: number) { CURRENT_GALLERY.environment.level = value as GalleryLevel; },

    get currentCharacter(): number { return CURRENT_GALLERY.environment.character; },
    set currentCharacter(value: number) { CURRENT_GALLERY.environment.character = value as CharacterType; },

    get uiTheme(): number { return CURRENT_GALLERY.environment.uiTheme; },
    set uiTheme(value: number) { CURRENT_GALLERY.environment.uiTheme = value as UIThemeType; },

    get enableWalkingSound(): boolean { return CURRENT_GALLERY.audio.enableFootsteps; },
    set enableWalkingSound(value: boolean) { CURRENT_GALLERY.audio.enableFootsteps = value; },

    get walkingSoundVolume(): number { return CURRENT_GALLERY.audio.footstepsVolume; },
    set walkingSoundVolume(value: number) { CURRENT_GALLERY.audio.footstepsVolume = value; }
};

// USER_CONFIG equivalent (maps to CURRENT_USER + CURRENT_GALLERY)
export const USER_CONFIG = {
    get username(): string { return CURRENT_USER.username; },
    set username(value: string) { CURRENT_USER.username = value; },

    get galleryName(): string { return CURRENT_GALLERY.name; },
    set galleryName(value: string) { CURRENT_GALLERY.name = value; },

    get userType(): UserType { return currentUserType; },
    set userType(value: UserType) { currentUserType = value; },

    get isPassword(): boolean { return CURRENT_GALLERY.access.isPasswordProtected; },
    set isPassword(value: boolean) { CURRENT_GALLERY.access.isPasswordProtected = value; },

    get password(): string | null { return CURRENT_GALLERY.access.passwordHash; },
    set password(value: string | null) { CURRENT_GALLERY.access.passwordHash = value; },

    get isWatermark(): boolean { return CURRENT_GALLERY.branding.showWatermark; },
    set isWatermark(value: boolean) { CURRENT_GALLERY.branding.showWatermark = value; },

    get displayname(): string { return CURRENT_USER.displayName; },
    set displayname(value: string) { CURRENT_USER.displayName = value; },

    get displayImage(): string { return CURRENT_USER.photoURL || "user_displayImage"; },
    set displayImage(value: string) { CURRENT_USER.photoURL = value; },

    get userImageUrl(): string { return CURRENT_USER.photoURL || ""; },
    set userImageUrl(value: string) { CURRENT_USER.photoURL = value; },

    get details(): string { return CURRENT_USER.bio; },
    set details(value: string) { CURRENT_USER.bio = value; },

    get website(): string { return CURRENT_USER.links.website || ""; },
    set website(value: string) { CURRENT_USER.links.website = value || null; },

    get instagram(): string { return CURRENT_USER.links.instagram || ""; },
    set instagram(value: string) { CURRENT_USER.links.instagram = value || null; }
};

// PAINTINGS array reference (maps to CURRENT_GALLERY.paintings)
export function getPaintings(): Painting[] {
    return CURRENT_GALLERY.paintings;
}

// For backward compatibility - direct access to paintings array
export let PAINTINGS: Painting[] = CURRENT_GALLERY.paintings;

// ============================================================================
// GALLERY CONFIG INTERFACE (for explore mode JSON files)
// Now uses Firebase-compatible structure
// ============================================================================
export interface GalleryConfigJSON {
    name: string;
    slug: string;
    description?: string;
    environment: {
        level: number;
        character?: number;
        uiTheme?: number;
    };
    audio?: {
        enableFootsteps?: boolean;
        footstepsVolume?: number;
    };
    artist: {
        displayName: string;
        bio: string;
        photoURL: string | null;
        links: {
            website: string | null;
            instagram: string | null;
            twitter: string | null;
            youtube: string | null;
        };
    };
    paintings: Painting[];
}

// Legacy interface for backward compatibility
export interface GalleryConfig {
    level: number;
    userConfig: Partial<User>;
    paintings: Painting[];
}

// ============================================================================
// EXPLORE MODE - Gallery Switching
// ============================================================================
const TOTAL_GALLERIES = 5;
let currentGalleryIndex = 1;
let paintingsBasePath = "/paintings/Default";

export function getCurrentGalleryIndex(): number {
    return currentGalleryIndex;
}

export function getPaintingsBasePath(): string {
    return paintingsBasePath;
}

export async function loadGalleryConfig(galleryIndex: number): Promise<boolean> {
    try {
        const configPath = `/exploration_content/gallery_${galleryIndex}/gallery_config.json`;
        console.log(`Loading gallery config from: ${configPath}`);

        const response = await fetch(configPath);
        if (!response.ok) {
            console.error(`Failed to load gallery config: ${response.status}`);
            return false;
        }

        const data: GalleryConfigJSON = await response.json();
        console.log(`Gallery ${galleryIndex} data:`, data);

        // Update gallery metadata
        if (data.name) CURRENT_GALLERY.name = data.name;
        if (data.slug) CURRENT_GALLERY.slug = data.slug;
        if (data.description) CURRENT_GALLERY.description = data.description;

        // Update environment settings
        if (data.environment) {
            if (data.environment.level !== undefined) {
                CURRENT_GALLERY.environment.level = data.environment.level as GalleryLevel;
            }
            if (data.environment.character !== undefined) {
                CURRENT_GALLERY.environment.character = data.environment.character as CharacterType;
            }
            if (data.environment.uiTheme !== undefined) {
                CURRENT_GALLERY.environment.uiTheme = data.environment.uiTheme as UIThemeType;
            }
            console.log(`Updated environment:`, CURRENT_GALLERY.environment);
        }

        // Update audio settings
        if (data.audio) {
            if (data.audio.enableFootsteps !== undefined) {
                CURRENT_GALLERY.audio.enableFootsteps = data.audio.enableFootsteps;
            }
            if (data.audio.footstepsVolume !== undefined) {
                CURRENT_GALLERY.audio.footstepsVolume = data.audio.footstepsVolume;
            }
        }

        // Update artist profile (from CURRENT_USER since we use Option A)
        if (data.artist) {
            CURRENT_USER.displayName = data.artist.displayName;
            CURRENT_USER.bio = data.artist.bio;
            CURRENT_USER.photoURL = data.artist.photoURL;
            if (data.artist.links) {
                CURRENT_USER.links = { ...data.artist.links };
            }
            console.log(`Updated CURRENT_USER:`, CURRENT_USER);
        }

        // Update paintings
        if (data.paintings) {
            // Ensure all paintings have required fields
            CURRENT_GALLERY.paintings = data.paintings.map(p => ({
                id: p.id,
                title: p.title || "",
                description: p.description || "",
                imageUrl: p.imageUrl || ""
            }));
            PAINTINGS = CURRENT_GALLERY.paintings;
            console.log(`Updated paintings:`, CURRENT_GALLERY.paintings);
        }

        // Set the paintings base path
        paintingsBasePath = `/exploration_content/gallery_${galleryIndex}`;
        console.log(`Set paintingsBasePath to: ${paintingsBasePath}`);

        currentGalleryIndex = galleryIndex;
        console.log(`Gallery ${galleryIndex} config loaded successfully.`);
        return true;

    } catch (error) {
        console.error(`Error loading gallery ${galleryIndex} config:`, error);
        return false;
    }
}


export async function switchGallery(offset: number): Promise<number | null> {
    console.log(`switchGallery called: offset=${offset}, currentGalleryIndex=${currentGalleryIndex}`);
    let newIndex = currentGalleryIndex + offset;

    if (newIndex < 1) newIndex = TOTAL_GALLERIES;
    if (newIndex > TOTAL_GALLERIES) newIndex = 1;

    console.log(`Calculated newIndex=${newIndex}`);

    if (newIndex !== currentGalleryIndex) {
        console.log(`Loading gallery ${newIndex}...`);
        const success = await loadGalleryConfig(newIndex);
        if (success) {
            console.log(`Gallery ${newIndex} loaded successfully`);
            return newIndex;
        }
        console.log(`Failed to load gallery ${newIndex}`);
    }

    return null;
}

// ============================================================================
// UI THEMES
// ============================================================================
export interface UITheme {
    name: string;
    background: string;
    borderColor: string;
    titleColor: string;
    textColor: string;
    subtitleColor: string;
    hintColor: string;
    borderThickness: number;
    cornerRadius: number;
    fontFamily: string;
}

export const UI_THEMES: UITheme[] = [
    {
        name: "Classic Dark",
        background: "rgba(20, 20, 30, 0.95)",
        borderColor: "#FFD700",
        titleColor: "#FFD700",
        textColor: "#FFFFFF",
        subtitleColor: "#CCCCCC",
        hintColor: "#888888",
        borderThickness: 3,
        cornerRadius: 20,
        fontFamily: "Arial"
    },
    {
        name: "Light Minimal",
        background: "rgba(255, 255, 255, 0.95)",
        borderColor: "#333333",
        titleColor: "#1a1a1a",
        textColor: "#333333",
        subtitleColor: "#666666",
        hintColor: "#999999",
        borderThickness: 1,
        cornerRadius: 8,
        fontFamily: "Helvetica"
    },
    {
        name: "Neon Cyberpunk",
        background: "rgba(10, 0, 20, 0.95)",
        borderColor: "#FF00FF",
        titleColor: "#00FFFF",
        textColor: "#FF00FF",
        subtitleColor: "#00FF00",
        hintColor: "#FF6600",
        borderThickness: 4,
        cornerRadius: 0,
        fontFamily: "Courier New"
    },
    {
        name: "Elegant Museum",
        background: "rgba(45, 35, 25, 0.95)",
        borderColor: "#C9A227",
        titleColor: "#C9A227",
        textColor: "#F5F0E6",
        subtitleColor: "#D4C5A9",
        hintColor: "#8B7355",
        borderThickness: 2,
        cornerRadius: 4,
        fontFamily: "Georgia"
    },
    {
        name: "Classic macOS",
        background: "rgba(232, 232, 232, 0.98)",
        borderColor: "#8E8E8E",
        titleColor: "#0066CC",
        textColor: "#333333",
        subtitleColor: "#666666",
        hintColor: "#888888",
        borderThickness: 1,
        cornerRadius: 12,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Lucida Grande', sans-serif"
    }
];

export function getCurrentTheme(): UITheme {
    return UI_THEMES[CURRENT_GALLERY.environment.uiTheme] || UI_THEMES[0];
}

// ============================================================================
// CHARACTER CONFIGURATIONS
// ============================================================================
const CHARACTERS = [
    { filename: "character.glb", scale: 0.1 },
    { filename: "character_1.glb", scale: 1 },
    { filename: "character_2.glb", scale: 1 }
];

function getCurrentCharacter() {
    return CHARACTERS[CURRENT_GALLERY.environment.character] || CHARACTERS[0];
}

// ============================================================================
// STATIC CONFIGURATION CONSTANTS
// ============================================================================
export const PLAYER_CONFIG = {
    movement: {
        speed: 0.14,
        rotationSpeed: 10.0
    },
    physics: {
        gravity: -0.18,
        terminalVelocity: -2.0,
        groundStickForce: -0.01,
        groundCheckDistance: 1.5
    },
    animation: {
        blendDuration: 0.2,
        idleTransitionDelay: 0.2
    },
    capsule: {
        height: 2,
        radius: 0.45,
        ellipsoid: { x: 0.6, y: 1.0, z: 0.6 },
        ellipsoidOffset: { x: 0, y: 1.0, z: 0 }
    },
    model: {
        path: "/models/",
        get filename() { return getCurrentCharacter().filename; },
        get scale() { return getCurrentCharacter().scale; },
        yOffset: 0
    }
};

export const CAMERA_CONFIG = {
    distance: 10,
    alpha: -Math.PI / 2,
    beta: Math.PI / 3,
    upperBetaLimit: Math.PI / 2 - 0.05,
    lowerBetaLimit: 0.1,
    sensitivity: 0.002
};

export const INTERACTION_CONFIG = {
    interactionRadius: 3.0
};

export const ENVIRONMENT_CONFIG = {
    ground: {
        width: 80,
        height: 80
    }
};

export const LIGHTING_CONFIG = {
    hemispheric: {
        intensity: 0.6,
        diffuseColor: { r: 0.9, g: 0.9, b: 1 },
        groundColor: { r: 0.2, g: 0.2, b: 0.2 }
    },
    directional: {
        intensity: 0.8,
        position: { x: 20, y: 40, z: 20 },
        direction: { x: -1, y: -2, z: -1 }
    },
    shadow: {
        mapSize: 5000,
        blurKernel: 1,
        orthoSize: 100,
        minZ: 1,
        maxZ: 200
    }
};

export const DEBUG_CONFIG = {
    logAnimations: false,
    logModelLoading: false
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
export function isPaintingValid(painting: Painting): boolean {
    return painting.title.trim() !== "" && painting.description.trim() !== "";
}

export function getValidPaintings(): Painting[] {
    return CURRENT_GALLERY.paintings.filter(isPaintingValid);
}

export function getPaintingByIndex(index: number): Painting | undefined {
    const validPaintings = getValidPaintings();
    return validPaintings[index];
}

export function getPaintingById(id: number): Painting | undefined {
    const painting = CURRENT_GALLERY.paintings.find(p => p.id === id);
    if (painting) return painting;
    return { id, title: "", description: "", imageUrl: "" };
}

// ============================================================================
// CONFIGURATION LOADING
// ============================================================================
export async function loadConfiguration(): Promise<void> {
    if (APP_CONFIG.type === "online") {
        try {
            console.log("Fetching configuration from:", APP_CONFIG.apiUrl);

            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (APP_CONFIG.apiKey) {
                headers['X-Master-Key'] = APP_CONFIG.apiKey;
            }

            const response = await fetch(APP_CONFIG.apiUrl, { headers });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.error("Access Denied. Check API key or make bin public.");
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jsonResponse = await response.json();
            const data = jsonResponse.record || jsonResponse;

            // Map API response to new structure
            if (data.gameConfig) {
                if (data.gameConfig.currentLevel !== undefined) {
                    CURRENT_GALLERY.environment.level = data.gameConfig.currentLevel;
                }
                if (data.gameConfig.currentCharacter !== undefined) {
                    CURRENT_GALLERY.environment.character = data.gameConfig.currentCharacter;
                }
                if (data.gameConfig.uiTheme !== undefined) {
                    CURRENT_GALLERY.environment.uiTheme = data.gameConfig.uiTheme;
                }
                if (data.gameConfig.enableWalkingSound !== undefined) {
                    CURRENT_GALLERY.audio.enableFootsteps = data.gameConfig.enableWalkingSound;
                }
                if (data.gameConfig.walkingSoundVolume !== undefined) {
                    CURRENT_GALLERY.audio.footstepsVolume = data.gameConfig.walkingSoundVolume;
                }
            }

            if (data.userConfig) {
                if (data.userConfig.username) CURRENT_USER.username = data.userConfig.username;
                if (data.userConfig.displayname) CURRENT_USER.displayName = data.userConfig.displayname;
                if (data.userConfig.details) CURRENT_USER.bio = data.userConfig.details;
                if (data.userConfig.website) CURRENT_USER.links.website = data.userConfig.website;
                if (data.userConfig.instagram) CURRENT_USER.links.instagram = data.userConfig.instagram;
                if (data.userConfig.userImageUrl) CURRENT_USER.photoURL = data.userConfig.userImageUrl;
                if (data.userConfig.displayImage) CURRENT_USER.photoURL = data.userConfig.displayImage;
                if (data.userConfig.galleryName) CURRENT_GALLERY.name = data.userConfig.galleryName;
                if (data.userConfig.userType) currentUserType = data.userConfig.userType;
                if (data.userConfig.isPassword !== undefined) {
                    CURRENT_GALLERY.access.isPasswordProtected = data.userConfig.isPassword;
                }
                if (data.userConfig.password !== undefined) {
                    CURRENT_GALLERY.access.passwordHash = data.userConfig.password;
                }
                if (data.userConfig.isWatermark !== undefined) {
                    CURRENT_GALLERY.branding.showWatermark = data.userConfig.isWatermark;
                }
            }

            if (data.paintings) {
                CURRENT_GALLERY.paintings = data.paintings.map((p: any) => ({
                    id: p.id,
                    title: p.title || "",
                    description: p.description || "",
                    imageUrl: p.url || ""
                }));
                PAINTINGS = CURRENT_GALLERY.paintings;
            }

            // Map imageUrls to paintings
            if (data.imageUrls && Array.isArray(data.imageUrls)) {
                data.imageUrls.forEach((imgItem: any) => {
                    if (imgItem.id && imgItem.url) {
                        const painting = CURRENT_GALLERY.paintings.find(p => p.id === imgItem.id);
                        if (painting) {
                            painting.imageUrl = imgItem.url;
                        }
                    }
                });
            }

            console.log("Configuration loaded successfully from online source.");

        } catch (error) {
            console.error("Failed to load online configuration, using offline defaults:", error);
        }
    } else {
        console.log("Using offline configuration.");
    }
}
