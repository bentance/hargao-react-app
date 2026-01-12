/**
 * Brand Configuration
 * Customize your brand name, logo, and other settings here.
 */

export const BRAND_CONFIG = {
    // Brand Identity
    name: "Gallery Creator",
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

    themes: [
        { id: "dark", label: "Dark", icon: "🌙" },
        { id: "light", label: "Light", icon: "☀️" },
        { id: "neon", label: "Neon", icon: "💜" },
        { id: "vintage", label: "Vintage", icon: "📷" },
        { id: "minimal", label: "Minimal", icon: "⬜" },
    ],

    maxPaintings: 10,
    minPaintings: 1,
};

export default BRAND_CONFIG;
