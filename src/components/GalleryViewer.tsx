'use client';

import { useEffect, useRef } from 'react';
import styles from './GalleryViewer.module.css';

interface GalleryViewerProps {
    galleryData: {
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
}

export default function GalleryViewer({ galleryData, userData }: GalleryViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<any>(null);
    const isInitialized = useRef(false);


    // Only initialize once when data is available
    useEffect(() => {
        // Wait for gallery data to be available
        if (!galleryData || !canvasRef.current) return;

        // Track if this effect instance is still mounted
        let isMounted = true;

        const initBabylon = async () => {
            // Double-check we haven't been initialized yet AND we're still mounted
            if (isInitialized.current || !isMounted) return;

            isInitialized.current = true;

            try {
                // Dynamic import to avoid SSR issues
                const { App } = await import('@/babylon/app');
                const { setGalleryData, setUserData, setAppMode, setUserType } = await import('@/babylon/config');

                // Check again if still mounted after async operations
                if (!isMounted) return;

                console.log('Initializing Babylon.js gallery viewer...');
                console.log('Gallery data:', galleryData);

                // Set online mode since we're getting data from Firebase
                setAppMode('online');

                // Set user type to "default" for single gallery viewing (not explore mode)
                setUserType('default');

                // Set gallery data before initializing
                setGalleryData(galleryData);

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
    }, [galleryData, userData]); // Re-run when data changes

    return (
        <div className={styles.container}>
            {/* Loading screen - will be hidden by Babylon after load */}
            <div id="loadingScreen" className={styles.loadingScreen}>
                <div className={styles.loadingContent}>
                    <h2>Loading Gallery...</h2>
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
