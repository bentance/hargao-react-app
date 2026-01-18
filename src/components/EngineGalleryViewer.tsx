'use client';

/**
 * Engine-Agnostic Gallery Viewer
 * 
 * This component uses the engine abstraction layer to render 3D galleries.
 * It can work with Babylon.js, Three.js, or any engine that implements I3DEngine.
 */

import { useEffect, useRef, useCallback } from 'react';
import type { I3DEngine, EngineConfig, EngineGalleryData, EngineUserData } from '@/engine';
import { createEngine, EngineType } from '@/engine';
import styles from './GalleryViewer.module.css';

interface EngineGalleryViewerProps {
    /** Gallery environment and painting data */
    galleryData?: EngineGalleryData;
    /** Artist/user profile data */
    userData?: EngineUserData;
    /** Viewing mode */
    mode?: 'default' | 'explore' | 'admin';
    /** Data source */
    source?: 'online' | 'offline';
    /** Engine to use (default: Babylon.js) */
    engine?: EngineType;
    /** Called when engine is ready */
    onReady?: () => void;
    /** Called on engine error */
    onError?: (error: Error) => void;
    /** Called on level change */
    onLevelChange?: (levelId: number) => void;
}

export default function EngineGalleryViewer({
    galleryData,
    userData,
    mode = 'default',
    source = 'online',
    engine: engineType = EngineType.BABYLON,
    onReady,
    onError,
    onLevelChange,
}: EngineGalleryViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<I3DEngine | null>(null);
    const isInitializing = useRef(false);

    // Initialize engine
    const initEngine = useCallback(async () => {
        // Prevent double initialization
        if (isInitializing.current || engineRef.current?.isInitialized()) {
            return;
        }

        // Wait for canvas
        if (!canvasRef.current) {
            return;
        }

        // For online mode, wait for gallery data
        if (source === 'online' && !galleryData) {
            return;
        }

        isInitializing.current = true;

        try {
            console.log(`EngineGalleryViewer: Creating ${engineType} engine...`);

            // Create engine using factory
            const engine = await createEngine({ preferredEngine: engineType });
            engineRef.current = engine;

            // Register event handlers
            if (onReady) engine.on('onReady', onReady);
            if (onError) engine.on('onError', onError);
            if (onLevelChange) engine.on('onLevelChange', onLevelChange);

            // Build config
            const config: EngineConfig = {
                mode,
                source,
                galleryData,
                userData,
            };

            // Initialize
            await engine.initialize(canvasRef.current!, config);

            console.log('EngineGalleryViewer: Engine initialized');

        } catch (error) {
            console.error('EngineGalleryViewer: Failed to initialize:', error);
            onError?.(error as Error);
        } finally {
            isInitializing.current = false;
        }
    }, [galleryData, userData, mode, source, engineType, onReady, onError, onLevelChange]);

    // Initialize on mount
    useEffect(() => {
        initEngine();

        // Cleanup on unmount
        return () => {
            if (engineRef.current) {
                console.log('EngineGalleryViewer: Disposing engine...');
                engineRef.current.dispose();
                engineRef.current = null;
            }
            isInitializing.current = false;
        };
    }, [initEngine]);

    // Detect mobile for loading screen
    const isMobile = typeof window !== 'undefined' &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    return (
        <div className={styles.container}>
            {/* Loading screen - hidden by engine after load */}
            <div id="loadingScreen" className={styles.loadingScreen}>
                <div className={styles.loadingContent}>
                    {/* Instruction Image */}
                    <img
                        src={isMobile ? "/ui/Mobile_View_Instructions_v0.jpg" : "/ui/Desktop_View_Instructions_v0.jpg"}
                        alt="Controls Instructions"
                        className={styles.instructionImage}
                    />
                    {/* Loading Text */}
                    <div className={styles.loadingText}>
                        <span className={styles.studioName}>hargao</span>
                        <span className={styles.loadingLabel}>loading</span>
                    </div>
                    <div className={styles.spinner}></div>
                </div>
            </div>

            {/* 3D Engine Canvas */}
            <canvas
                ref={canvasRef}
                id="renderCanvas"
                className={styles.canvas}
            />
        </div>
    );
}

/**
 * Hook to access the engine instance
 * Use this for advanced operations like screenshots
 */
export function useEngine() {
    // This would need a context provider for proper implementation
    // For now, this is a placeholder showing the pattern
    console.warn('useEngine: Not yet implemented. Use component refs for now.');
    return null;
}
