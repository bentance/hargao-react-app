/**
 * Firebase Data Interfaces
 * These interfaces match the Babylon.js app's expected data structure
 */

// ============================================
// USER INTERFACE
// ============================================

export interface UserLinks {
    website: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
}

export interface User {
    // === IDENTITY ===
    uid: string;                    // Firebase Auth UID
    username: string;               // Unique handle for URLs (3-30 chars, URL-safe)
    email: string;                  // Login email

    // === ARTIST PROFILE ===
    displayName: string;            // Display name (2-50 chars)
    photoURL: string | null;        // Profile pic URL
    bio: string;                    // Artist bio (0-500 chars)
    links: UserLinks;

    // === SUBSCRIPTION ===
    tier: "free" | "premium" | "admin";
    maxGalleries: number;           // Gallery limit (default: 3 for free)

    // === METADATA ===
    galleriesCount: number;         // Current gallery count
    createdAt: string;              // ISO timestamp
    updatedAt: string;              // ISO timestamp
}

// ============================================
// GALLERY INTERFACE
// ============================================

export interface GalleryAccess {
    isPasswordProtected: boolean;
    passwordHash: string | null;    // bcrypt hash
}

export interface GalleryBranding {
    showWatermark: boolean;         // Show "hargao studio"
    customWatermark: string | null; // Premium: custom text (0-50 chars)
}

export interface GalleryEnvironment {
    level: 1 | 2 | 3 | 4;           // 1=Brutalist, 2=Museum, 3=Salt, 4=Color
    character: 0 | 1 | 2;           // 0=Bear, 1=Female, 2=Mannequin
    uiTheme: 0 | 1 | 2 | 3 | 4;     // 0=Dark, 1=Light, 2=Neon, 3=Museum, 4=macOS
}

export interface GalleryAudio {
    enableFootsteps: boolean;
    footstepsVolume: number;        // 1-10 (default: 4)
    backgroundMusic: string | null; // Future: music URL
    backgroundMusicVolume: number;  // 1-10 (default: 5)
}

export interface GalleryStats {
    viewCount: number;
    uniqueVisitors: number;
    lastViewedAt: string | null;    // ISO timestamp
}

export interface Painting {
    id: number;                     // Position 1-10
    title: string;                  // 0-100 chars (empty = no popup)
    description: string;            // 0-500 chars
    imageUrl: string;               // Firebase Storage URL
}

export interface Gallery {
    // === OWNERSHIP & ROUTING ===
    id: string;                     // Document ID
    ownerId: string;                // FK to users.uid
    ownerUsername: string;          // Denormalized for URL
    slug: string;                   // URL-safe ID (3-50 chars)

    // === GALLERY METADATA ===
    name: string;                   // Display name (3-100 chars)
    description: string;            // Description (0-500 chars)

    // === PUBLISHING ===
    isPublished: boolean;           // Draft vs Live
    publishedAt: string | null;     // ISO timestamp

    // === TIMESTAMPS ===
    createdAt: string;              // ISO timestamp
    updatedAt: string;              // ISO timestamp

    // === ACCESS CONTROL ===
    access: GalleryAccess;

    // === BRANDING ===
    branding: GalleryBranding;

    // === ENVIRONMENT SETTINGS ===
    environment: GalleryEnvironment;

    // === AUDIO SETTINGS ===
    audio: GalleryAudio;

    // === PAINTINGS ===
    paintings: Painting[];

    // === ANALYTICS ===
    stats: GalleryStats;
}

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_USER: Omit<User, 'uid' | 'email' | 'createdAt' | 'updatedAt'> = {
    username: '',
    displayName: '',
    photoURL: null,
    bio: '',
    links: {
        website: null,
        instagram: null,
        twitter: null,
        youtube: null,
    },
    tier: 'free',
    maxGalleries: 3,
    galleriesCount: 0,
};

export const DEFAULT_GALLERY: Omit<Gallery, 'id' | 'ownerId' | 'ownerUsername' | 'createdAt' | 'updatedAt'> = {
    slug: 'my-gallery',
    name: 'My Gallery',
    description: '',
    isPublished: false,
    publishedAt: null,
    access: {
        isPasswordProtected: false,
        passwordHash: null,
    },
    branding: {
        showWatermark: true,
        customWatermark: null,
    },
    environment: {
        level: 1,           // Brutalist Art Gallery
        character: 1,       // Female
        uiTheme: 4,         // macOS (default)
    },
    audio: {
        enableFootsteps: true,
        footstepsVolume: 4,
        backgroundMusic: null,
        backgroundMusicVolume: 5,
    },
    paintings: [],
    stats: {
        viewCount: 0,
        uniqueVisitors: 0,
        lastViewedAt: null,
    },
};

// ============================================
// TIER LIMITS
// ============================================

export const TIER_LIMITS = {
    free: {
        maxGalleries: 3,
        maxPaintings: 10,
        customWatermark: false,
        passwordProtection: false,
    },
    premium: {
        maxGalleries: 20,
        maxPaintings: 50,
        customWatermark: true,
        passwordProtection: true,
    },
    admin: {
        maxGalleries: 100,
        maxPaintings: 100,
        customWatermark: true,
        passwordProtection: true,
    },
};

// ============================================
// ENVIRONMENT & CHARACTER LABELS
// ============================================

export const ENVIRONMENT_LEVELS = {
    1: { name: 'Brutalist Art Gallery', description: 'Outdoor wall gallery' },
    2: { name: 'Classical Museum', description: 'Indoor 4-wall room' },
    3: { name: 'Salt Flat', description: 'Freestanding displays' },
    4: { name: 'Color Scream', description: 'Abstract floating shapes' },
};

export const CHARACTER_TYPES = {
    0: { name: 'Bear', description: 'Bear character' },
    1: { name: 'Female', description: 'Female character' },
    2: { name: 'Mannequin', description: 'Mannequin character' },
};

export const UI_THEMES = {
    0: { name: 'Classic Dark', description: 'Gold accents on dark' },
    1: { name: 'Light Minimal', description: 'Clean white' },
    2: { name: 'Neon Cyberpunk', description: 'Pink/cyan glow' },
    3: { name: 'Elegant Museum', description: 'Warm brown tones' },
    4: { name: 'Classic macOS', description: 'Aqua-inspired' },
};
