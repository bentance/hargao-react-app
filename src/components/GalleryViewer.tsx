'use client';

import { useEffect, useRef } from 'react';
import styles from './GalleryViewer.module.css';

interface GalleryViewerProps {
    galleryData?: {
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
    };
    userData?: {
        displayName: string;
        bio: string;
        photoURL: string | null;
        links: {
            website: string | null;
            instagram: string | null;
        };
    };
    mode?: 'default' | 'explore' | 'admin';
    source?: 'online' | 'offline';
}

export default function GalleryViewer({
    galleryData,
    userData,
    mode = 'default',
    source = 'online'
}: GalleryViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<any>(null);
    const isInitialized = useRef(false);


    // Only initialize once when data is available
    useEffect(() => {
        // Wait for canvas; for online mode, also wait for gallery data
        if (!canvasRef.current) return;
        if (source === 'online' && !galleryData) return;

        // Track if this effect instance is still mounted
        let isMounted = true;

        const initBabylon = async () => {
            // Double-check we haven't been initialized yet AND we're still mounted
            if (isInitialized.current || !isMounted) return;

            isInitialized.current = true;

            try {
                // Dynamic import to avoid SSR issues
                const { App } = await import('@/babylon/app');
                const { setGalleryData, setUserData, setAppMode, setUserType, loadGalleryConfig } = await import('@/babylon/config');

                // Check again if still mounted after async operations
                if (!isMounted) return;

                console.log('Initializing Babylon.js gallery viewer...');
                console.log('Mode:', mode, 'Source:', source);

                // Set application mode (online/offline)
                setAppMode(source);

                // Set user type (default/explore/admin)
                setUserType(mode);

                // For explore mode, load the first gallery config BEFORE creating the app
                if (mode === 'explore' && source === 'offline') {
                    console.log('Explore mode: Loading gallery 1 config...');
                    const success = await loadGalleryConfig(1);
                    if (success) {
                        console.log('Gallery 1 config loaded successfully');
                    } else {
                        console.error('Failed to load gallery 1 config');
                    }
                }

                // Set gallery data if in online mode
                if (source === 'online' && galleryData) {
                    setGalleryData(galleryData);
                }

                // Set user/artist data if provided
                if (userData) {
                    setUserData(userData);
                }

                // Small delay to ensure data is fully propagated
                await new Promise(resolve => setTimeout(resolve, 100));

                // Final mounted check before creating app
                if (!isMounted) return;

                // Create Babylon app
                appRef.current = new App(canvasRef.current!);
                console.log('Babylon.js gallery viewer initialized');

            } catch (error) {
                console.error('Failed to initialize Babylon.js:', error);
            }
        };

        initBabylon();

        // Cleanup on unmount
        return () => {
            isMounted = false;
            if (appRef.current) {
                console.log('Cleaning up Babylon.js...');
                appRef.current.dispose();
                appRef.current = null;
            }
            isInitialized.current = false;
        };
    }, [galleryData, userData, mode, source]); // Re-run when props change

    // Detect if mobile
    const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    return (
        <div className={styles.container}>
            {/* Loading screen - will be hidden by Babylon after load */}
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

            {/* Babylon.js Canvas */}
            <canvas
                ref={canvasRef}
                id="renderCanvas"
                className={styles.canvas}
            />
        </div>
    );
}
