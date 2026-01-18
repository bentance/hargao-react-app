/**
 * 3D Engine Abstraction Layer - Type Definitions
 * 
 * This abstraction allows swapping between different 3D engines (Babylon.js, Three.js)
 * without changing the rest of the application code.
 */

// ============================================
// GALLERY DATA TYPES
// ============================================

export interface EngineGalleryData {
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
    paintings: EnginePainting[];
}

export interface EnginePainting {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
}

export interface EngineUserData {
    displayName: string;
    bio: string;
    photoURL: string | null;
    links: {
        website: string | null;
        instagram: string | null;
    };
}

// ============================================
// ENGINE CONFIGURATION
// ============================================

export type EngineMode = 'default' | 'explore' | 'admin';
export type EngineSource = 'online' | 'offline';

export interface EngineConfig {
    mode: EngineMode;
    source: EngineSource;
    galleryData?: EngineGalleryData;
    userData?: EngineUserData;
}

// ============================================
// ENGINE EVENTS
// ============================================

export interface EngineEvents {
    onReady?: () => void;
    onError?: (error: Error) => void;
    onLoadProgress?: (progress: number) => void;
    onLevelChange?: (levelId: number) => void;
    onGalleryChange?: (galleryId: number) => void;
}

// ============================================
// MAIN ENGINE INTERFACE
// ============================================

/**
 * Core 3D Engine Interface
 * 
 * Any 3D engine (Babylon.js, Three.js, etc.) must implement this interface
 * to be compatible with the gallery viewer.
 */
export interface I3DEngine {
    /**
     * Engine identification
     */
    readonly name: string;
    readonly version: string;

    /**
     * Initialize the engine with a canvas element
     */
    initialize(canvas: HTMLCanvasElement, config: EngineConfig): Promise<void>;

    /**
     * Set gallery data (paintings, environment settings)
     */
    setGalleryData(data: EngineGalleryData): void;

    /**
     * Set artist/user data
     */
    setUserData(data: EngineUserData): void;

    /**
     * Change the current level/environment
     */
    changeLevel(levelId: number): Promise<void>;

    /**
     * Navigate between galleries (for explore mode)
     */
    changeGallery(offset: number): Promise<void>;

    /**
     * Start the render loop
     */
    run(): void;

    /**
     * Pause rendering
     */
    pause(): void;

    /**
     * Resume rendering
     */
    resume(): void;

    /**
     * Take a screenshot of the current view
     */
    screenshot(): Promise<Blob>;

    /**
     * Dispose of all resources
     */
    dispose(): void;

    /**
     * Check if engine is initialized
     */
    isInitialized(): boolean;

    /**
     * Register event handlers
     */
    on<K extends keyof EngineEvents>(event: K, handler: EngineEvents[K]): void;

    /**
     * Remove event handlers
     */
    off<K extends keyof EngineEvents>(event: K, handler?: EngineEvents[K]): void;
}

// ============================================
// ENGINE TYPES ENUM
// ============================================

export enum EngineType {
    BABYLON = 'babylon',
    THREEJS = 'threejs',
}

// ============================================
// ENGINE CAPABILITIES
// ============================================

export interface EngineCapabilities {
    supportsVR: boolean;
    supportsAR: boolean;
    supportsShadows: boolean;
    supportsPostProcessing: boolean;
    maxTextureSize: number;
}
