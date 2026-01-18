/**
 * Brand Configuration
 * Customize your brand name, logo, and other settings here.
 */

export const BRAND_CONFIG = {
    // Brand Identity
    name: "Hargao",
    tagline: "Create Your Immersive Art Gallery",

    // Logo (can be a path to an image or null for text-only)
    logo: null as string | null, // e.g., "/logo.png"

    // Company/Creator Info
    company: "Your Company Name",
    website: "https://example.com",

    // SEO
    seo: {
        defaultTitle: "Gallery Creator - Create Your Virtual Art Gallery",
        description: "Create stunning virtual art galleries with our easy-to-use gallery creator. Upload your paintings, customize your environment, and share with the world.",
        keywords: ["art gallery", "virtual gallery", "3D gallery", "art exhibition", "digital art"],
    },

    // Theme Colors (can be used throughout the app)
    colors: {
        primary: "#78aaa6ff",      // Soft teal
        secondary: "#004E89",    // Deep blue
        accent: "#F7C948",       // Bright yellow
        success: "#2ECC71",      // Green
        error: "#E74C3C",        // Red
        background: "#FFFCF2",   // Off-white cream
        surface: "#FFFFFF",      // White
        text: "#1A1A2E",         // Dark navy
        border: "#1A1A2E",       // Dark navy (for neobrutalism)
    },

    // Social Links
    social: {
        instagram: "https://instagram.com/yourbrand",
        twitter: "https://twitter.com/yourbrand",
        discord: "https://discord.gg/yourbrand",
    }
};

// Gallery Options Configuration
export const GALLERY_OPTIONS = {
    environments: [
        { id: 1, label: "Brutalist Art Gallery", image: "/images/environments/brutalist.jpg" },
        { id: 2, label: "Classical Museum", image: "/images/environments/classical.jpg" },
        { id: 3, label: "Salt Flat", image: "/images/environments/salt-flat.jpg" },
        { id: 4, label: "Color Scream", image: "/images/environments/color-scream.jpg" },
    ],

    characters: [
        { id: 1, label: "Female", image: "/images/characters/female.jpg" },
        { id: 2, label: "Mannequin", image: "/images/characters/mannequin.jpg" },
    ],

    // UI Themes (matching Babylon.js app)
    // 0=Classic Dark, 1=Light Minimal, 2=Neon Cyberpunk, 3=Elegant Museum, 4=Classic macOS
    uiThemes: [
        { id: 0, label: "Classic Dark", description: "Gold accents on dark" },
        { id: 1, label: "Light Minimal", description: "Clean white" },
        { id: 2, label: "Neon Cyberpunk", description: "Pink/cyan glow" },
        { id: 3, label: "Elegant Museum", description: "Warm brown tones" },
        { id: 4, label: "Classic macOS", description: "Aqua-inspired" },
    ],

    // Default UI Settings (pre-selected options for new galleries)
    defaultUI: {
        environment: 1,        // Default to Brutalist Art Gallery (1-4)
        character: 1,          // Default to Female (0=Bear, 1=Female, 2=Mannequin)
        uiTheme: 4,            // Default to Classic macOS (0-4)
    },

    // Default Audio Settings
    defaultAudio: {
        enableFootsteps: true,
        footstepsVolume: 4,    // 1-10
        backgroundMusicVolume: 5, // 1-10
    },

    // Default Branding Settings
    defaultBranding: {
        showWatermark: true,
        customWatermark: null as string | null,
    },

    // Default Access Settings
    defaultAccess: {
        isPasswordProtected: false,
    },

    // Subscription Tier (default for new users)
    defaultTier: "free" as "free" | "premium" | "admin",

    maxPaintings: 10,
    minPaintings: 1,
};

/**
 * Character Limits for Form Fields
 * Used for validation and character counters
 */
export const CHAR_LIMITS = {
    username: 30,
    bio: 500,
    galleryName: 50,
    galleryDescription: 1000,
    paintingTitle: 100,
    paintingDescription: 500,
};

export default BRAND_CONFIG;
