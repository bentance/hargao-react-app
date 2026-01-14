// ============================================================================
// FIREBASE DATA TYPES
// These interfaces define the shape of data stored in Firebase Firestore.
// ============================================================================

// ============================================================================
// USER - Account & Artist Profile (Combined)
// Collection: users/{userId}
// ============================================================================

export interface User {
    // === IDENTITY ===
    uid: string;                    // Firebase Auth UID
    username: string;               // Unique handle for URLs (e.g., "johndoe")
    email: string;                  // Login email

    // === ARTIST PROFILE (shown in gallery "About" panels) ===
    displayName: string;            // Artist/display name: "John Smith Art"
    photoURL: string | null;        // Profile picture (Firebase Storage URL)
    bio: string;                           // Artist bio/description
    links: UserLinks;               // Social media & website links

    // === SUBSCRIPTION ===
    tier: UserTier;                 // "free" or "premium" 
    maxGalleries: number;           // Gallery limit based on tier

    // === METADATA ===
    galleriesCount: number;         // Denormalized for quick limit checks
    createdAt: Date;
    updatedAt: Date;
}

export type UserTier = "free" | "premium" | "admin";

export interface UserLinks {
    website: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
}

// ============================================================================
// GALLERY - Individual Gallery Configuration
// Collection: galleries/{galleryId}
// ============================================================================

export interface Gallery {
    // === OWNERSHIP & ROUTING ===
    id: string;                     // Firestore document ID
    ownerId: string;                // FK to users.uid
    ownerUsername: string;          // Denormalized for URL: /@username/slug
    slug: string;                   // URL-safe identifier (unique per owner)

    // === GALLERY METADATA ===
    name: string;                   // Display name: "My Art Collection"
    description: string;            // Optional gallery description

    // === PUBLISHING ===
    isPublished: boolean;           // Draft vs Live
    publishedAt: Date | null;       // When first published

    // === TIMESTAMPS ===
    createdAt: Date;
    updatedAt: Date;

    // === SETTINGS ===
    access: GalleryAccess;          // Password protection
    branding: GalleryBranding;      // Watermark settings
    environment: GalleryEnvironment; // Level, character, theme
    audio: GalleryAudio;            // Sound settings

    // === CONTENT ===
    paintings: Painting[];          // Array of artworks

    // === ANALYTICS ===
    stats: GalleryStats;            // View counts
}

// ============================================================================
// GALLERY SUB-TYPES
// ============================================================================

export interface GalleryAccess {
    isPasswordProtected: boolean;
    passwordHash: string | null;    // bcrypt hash, NOT plaintext
}

export interface GalleryBranding {
    showWatermark: boolean;         // Show "hargao studio" watermark
    customWatermark: string | null; // Premium feature: custom watermark text
}

export interface GalleryEnvironment {
    level: GalleryLevel;            // 1-4: Which 3D environment
    character: CharacterType;       // 0-2: Which avatar
    uiTheme: UIThemeType;           // 0-4: UI panel styling
}

// Numeric types with specific allowed values
export type GalleryLevel = 1 | 2 | 3 | 4;
export type CharacterType = 0 | 1 | 2;
export type UIThemeType = 0 | 1 | 2 | 3 | 4;

export interface GalleryAudio {
    enableFootsteps: boolean;
    footstepsVolume: number;        // 1-10
    backgroundMusic: string | null; // Future: URL to background music
    backgroundMusicVolume: number;  // 1-10
}

export interface GalleryStats {
    viewCount: number;
    uniqueVisitors: number;
    lastViewedAt: Date | null;
}

// ============================================================================
// PAINTING - Individual Artwork
// ============================================================================

export interface Painting {
    id: number;                     // Position: 1, 2, 3...
    title: string;                  // Empty string = no info popup
    description: string;            // Artwork description
    imageUrl: string;               // Firebase Storage URL (empty string for local files)
    url?: string;                   // Legacy alias for imageUrl (backward compatibility)
}

// ============================================================================
// HELPER TYPES FOR FORMS & API
// ============================================================================

/**
 * Data required to create a new user (signup)
 */
export interface CreateUserInput {
    username: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
    bio?: string;
    links?: Partial<UserLinks>;
}

/**
 * Data required to create a new gallery
 */
export interface CreateGalleryInput {
    name: string;
    slug: string;
    description?: string;
    environment?: Partial<GalleryEnvironment>;
    audio?: Partial<GalleryAudio>;
    access?: Partial<GalleryAccess>;
    branding?: Partial<GalleryBranding>;
    paintings?: Omit<Painting, 'imageUrl'>[]; // URLs added after upload
}

/**
 * Data that can be updated on a gallery
 */
export interface UpdateGalleryInput {
    name?: string;
    slug?: string;
    description?: string;
    isPublished?: boolean;
    environment?: Partial<GalleryEnvironment>;
    audio?: Partial<GalleryAudio>;
    access?: Partial<GalleryAccess>;
    branding?: Partial<GalleryBranding>;
    paintings?: Painting[];
}

/**
 * Data that can be updated on a user profile
 */
export interface UpdateUserInput {
    displayName?: string;
    photoURL?: string | null;
    bio?: string;
    links?: Partial<UserLinks>;
}

// ============================================================================
// FIRESTORE DOCUMENT CONVERTERS (for type-safe reads/writes)
// ============================================================================

/**
 * Default values for a new user
 */
export const DEFAULT_USER: Omit<User, 'uid' | 'email' | 'username' | 'displayName' | 'createdAt' | 'updatedAt'> = {
    photoURL: null,
    bio: "",
    links: {
        website: null,
        instagram: null,
        twitter: null,
        youtube: null,
    },
    tier: "free",
    maxGalleries: 3,
    galleriesCount: 0,
};

/**
 * Default values for a new gallery
 */
export const DEFAULT_GALLERY: Omit<Gallery, 'id' | 'ownerId' | 'ownerUsername' | 'slug' | 'name' | 'createdAt' | 'updatedAt'> = {
    description: "",
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
        level: 1,       // Classical (default)
        character: 1,   // Female character
        uiTheme: 4,     // macOS theme
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

// ============================================================================
// LEVEL & THEME METADATA (for UI dropdowns)
// ============================================================================

export const LEVEL_OPTIONS: { value: GalleryLevel; label: string }[] = [
    { value: 1, label: "Brutalist Art Gallery" },
    { value: 2, label: "Classical Museum" },
    { value: 3, label: "Salt Flat" },
    { value: 4, label: "Color Scream" },
];

export const CHARACTER_OPTIONS: { value: CharacterType; label: string }[] = [
    { value: 0, label: "Bear" },
    { value: 1, label: "Female" },
    { value: 2, label: "Mannequin" },
];

export const UI_THEME_OPTIONS: { value: UIThemeType; label: string }[] = [
    { value: 0, label: "Classic Dark" },
    { value: 1, label: "Light Minimal" },
    { value: 2, label: "Neon Cyberpunk" },
    { value: 3, label: "Elegant Museum" },
    { value: 4, label: "Classic macOS" },
];
