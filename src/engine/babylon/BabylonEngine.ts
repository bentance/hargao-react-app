/**
 * Babylon.js Engine Adapter
 * 
 * Wraps the existing Babylon.js App class to conform to the I3DEngine interface.
 * This allows the GalleryViewer to work with any 3D engine implementation.
 */

import type {
    I3DEngine,
    EngineConfig,
    EngineGalleryData,
    EngineUserData,
    EngineEvents,
    EngineCapabilities
} from '../types';

export class BabylonEngine implements I3DEngine {
    readonly name = 'Babylon.js';
    readonly version = '7.0';

    private app: any = null;
    private canvas: HTMLCanvasElement | null = null;
    private config: EngineConfig | null = null;
    private initialized = false;
    private eventHandlers: Partial<EngineEvents> = {};

    /**
     * Initialize the Babylon.js engine
     */
    async initialize(canvas: HTMLCanvasElement, config: EngineConfig): Promise<void> {
        if (this.initialized) {
            console.warn('BabylonEngine: Already initialized');
            return;
        }

        this.canvas = canvas;
        this.config = config;

        try {
            // Dynamic import to avoid SSR issues
            const { App } = await import('@/babylon/app');
            const {
                setGalleryData,
                setUserData,
                setAppMode,
                setUserType,
                loadGalleryConfig
            } = await import('@/babylon/config');

            console.log('BabylonEngine: Initializing...', {
                mode: config.mode,
                source: config.source
            });

            // Set application mode (online/offline)
            setAppMode(config.source);

            // Set user type (default/explore/admin)
            setUserType(config.mode);

            // For explore mode, load the first gallery config
            if (config.mode === 'explore' && config.source === 'offline') {
                console.log('BabylonEngine: Loading explore mode gallery 1...');
                const success = await loadGalleryConfig(1);
                if (!success) {
                    console.error('BabylonEngine: Failed to load gallery 1 config');
                }
            }

            // Set gallery data if in online mode
            if (config.source === 'online' && config.galleryData) {
                setGalleryData(config.galleryData);
            }

            // Set user/artist data if provided
            if (config.userData) {
                setUserData(config.userData);
            }

            // Small delay to ensure data is fully propagated
            await new Promise(resolve => setTimeout(resolve, 100));

            // Create Babylon app
            this.app = new App(canvas);
            this.initialized = true;

            console.log('BabylonEngine: Initialized successfully');

            // Trigger ready event
            this.eventHandlers.onReady?.();

        } catch (error) {
            console.error('BabylonEngine: Initialization failed:', error);
            this.eventHandlers.onError?.(error as Error);
            throw error;
        }
    }

    /**
     * Set gallery data
     */
    setGalleryData(data: EngineGalleryData): void {
        if (!this.initialized) {
            console.warn('BabylonEngine: Cannot set gallery data - not initialized');
            return;
        }

        import('@/babylon/config').then(({ setGalleryData }) => {
            setGalleryData(data);
        });
    }

    /**
     * Set user/artist data
     */
    setUserData(data: EngineUserData): void {
        if (!this.initialized) {
            console.warn('BabylonEngine: Cannot set user data - not initialized');
            return;
        }

        import('@/babylon/config').then(({ setUserData }) => {
            setUserData(data);
        });
    }

    /**
     * Change the current level
     */
    async changeLevel(levelId: number): Promise<void> {
        if (!this.app) {
            console.warn('BabylonEngine: Cannot change level - app not initialized');
            return;
        }

        // Calculate offset from current level
        // This is a simplified implementation
        await this.app.changeLevel(1);
        this.eventHandlers.onLevelChange?.(levelId);
    }

    /**
     * Navigate between galleries
     */
    async changeGallery(offset: number): Promise<void> {
        if (!this.app) {
            console.warn('BabylonEngine: Cannot change gallery - app not initialized');
            return;
        }

        await this.app.changeLevel(offset);
    }

    /**
     * Start the render loop
     */
    run(): void {
        if (this.app) {
            this.app.run();
        }
    }

    /**
     * Pause rendering
     */
    pause(): void {
        // Babylon app doesn't have pause - would need to implement
        console.log('BabylonEngine: Pause not implemented');
    }

    /**
     * Resume rendering
     */
    resume(): void {
        // Babylon app doesn't have resume - would need to implement
        console.log('BabylonEngine: Resume not implemented');
    }

    /**
     * Take a screenshot
     */
    async screenshot(): Promise<Blob> {
        if (!this.canvas) {
            throw new Error('Canvas not available');
        }

        return new Promise((resolve, reject) => {
            this.canvas!.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create screenshot'));
                }
            }, 'image/png');
        });
    }

    /**
     * Dispose of all resources
     */
    dispose(): void {
        if (this.app) {
            console.log('BabylonEngine: Disposing...');
            this.app.dispose();
            this.app = null;
        }
        this.canvas = null;
        this.config = null;
        this.initialized = false;
        this.eventHandlers = {};
    }

    /**
     * Check if initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Register event handler
     */
    on<K extends keyof EngineEvents>(event: K, handler: EngineEvents[K]): void {
        this.eventHandlers[event] = handler;
    }

    /**
     * Remove event handler
     */
    off<K extends keyof EngineEvents>(event: K): void {
        delete this.eventHandlers[event];
    }

    /**
     * Get engine capabilities
     */
    getCapabilities(): EngineCapabilities {
        return {
            supportsVR: true,
            supportsAR: true,
            supportsShadows: true,
            supportsPostProcessing: true,
            maxTextureSize: 4096,
        };
    }
}
