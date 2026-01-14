'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Babylon.js
const GalleryViewer = dynamic(
    () => import('@/components/GalleryViewer'),
    {
        ssr: false,
        loading: () => (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: 'Space Grotesk, sans-serif'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Loading Gallery...</h2>
                </div>
            </div>
        )
    }
);

interface CatchAllPageProps {
    params: Promise<{
        path: string[];
    }>;
}

interface GalleryData {
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
}

interface UserData {
    displayName: string;
    bio: string;
    photoURL: string | null;
    links: {
        website: string | null;
        instagram: string | null;
    };
}

export default function CatchAllPage({ params }: CatchAllPageProps) {
    const [galleryData, setGalleryData] = useState<GalleryData | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGalleryRoute, setIsGalleryRoute] = useState(false);

    useEffect(() => {
        const loadGallery = async () => {
            try {
                const resolvedParams = await params;
                const path = resolvedParams.path;

                console.log('Catch-all path:', path);
                console.log('First segment:', path[0], 'starts with @:', path[0]?.startsWith('@'));

                // Decode URL-encoded @ if needed
                let usernameSegment = path[0];
                if (usernameSegment?.startsWith('%40')) {
                    usernameSegment = '@' + usernameSegment.substring(3);
                }

                // Check if this is a @username/slug route
                // Path would be ['@username', 'slug']
                if (path.length !== 2 || !usernameSegment?.startsWith('@')) {
                    // Not a gallery route, let it 404
                    console.log('Not a gallery route - length:', path.length, 'starts with @:', usernameSegment?.startsWith('@'));
                    setError('not_found');
                    setIsLoading(false);
                    return;
                }

                setIsGalleryRoute(true);

                // Extract username (remove @ prefix)
                const username = usernameSegment.substring(1);
                const slug = path[1];

                console.log(`Loading gallery: @${username}/${slug}`);

                // First, find the user by username
                const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
                if (!usernameDoc.exists()) {
                    console.error('Username not found:', username);
                    setError('User not found');
                    setIsLoading(false);
                    return;
                }

                const userId = usernameDoc.data().uid;
                console.log('Found user ID:', userId);

                // Get user data
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    const user = userDoc.data();
                    setUserData({
                        displayName: user.displayName || username,
                        bio: user.bio || '',
                        photoURL: user.photoURL || null,
                        links: {
                            website: user.links?.website || null,
                            instagram: user.links?.instagram || null,
                        }
                    });
                }

                // Find the gallery by owner and slug
                const galleriesQuery = query(
                    collection(db, 'galleries'),
                    where('ownerId', '==', userId),
                    where('slug', '==', slug),
                    where('isPublished', '==', true)
                );
                const galleriesSnapshot = await getDocs(galleriesQuery);

                if (galleriesSnapshot.empty) {
                    console.error('Gallery not found for user:', userId, 'slug:', slug);
                    setError('Gallery not found');
                    setIsLoading(false);
                    return;
                }

                const galleryDoc = galleriesSnapshot.docs[0];
                const gallery = galleryDoc.data();

                console.log('Gallery data loaded:', gallery);
                console.log('Environment from Firebase:', gallery.environment);

                // Level is 1-indexed (1=Gallery, 2=Museum, 3=SaltFlat, 4=ColorScream)
                // Default to 2 (Classical Museum) if not set or 0
                const levelValue = gallery.environment?.level || 2;
                const characterValue = gallery.environment?.character ?? 1;

                console.log('Using level:', levelValue, 'character:', characterValue);

                setGalleryData({
                    environment: {
                        level: levelValue,
                        character: characterValue,
                        uiTheme: gallery.environment?.uiTheme ?? 4,
                    },
                    audio: {
                        enableFootsteps: gallery.audio?.enableFootsteps ?? true,
                        footstepsVolume: gallery.audio?.footstepsVolume ?? 50,
                    },
                    branding: {
                        showWatermark: gallery.branding?.showWatermark ?? true,
                    },
                    paintings: (gallery.paintings || []).map((p: any) => ({
                        id: p.id,
                        title: p.title || '',
                        description: p.description || '',
                        imageUrl: p.imageUrl || '',
                    }))
                });

                setIsLoading(false);

            } catch (err) {
                console.error('Error loading gallery:', err);
                setError('Failed to load gallery');
                setIsLoading(false);
            }
        };

        loadGallery();
    }, [params]);

    // If not a gallery route, show 404
    if (error === 'not_found') {
        notFound();
    }

    if (isLoading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: 'Space Grotesk, sans-serif'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Loading Gallery...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: 'Space Grotesk, sans-serif'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>😔 {error}</h2>
                    <p style={{ marginTop: '1rem', color: '#999' }}>
                        The gallery you're looking for doesn't exist or isn't published.
                    </p>
                    <a
                        href="/"
                        style={{
                            display: 'inline-block',
                            marginTop: '2rem',
                            padding: '0.75rem 1.5rem',
                            background: '#F7C948',
                            color: '#1a1a2e',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            border: '2px solid white'
                        }}
                    >
                        ← Go Home
                    </a>
                </div>
            </div>
        );
    }

    if (!galleryData) {
        return null;
    }

    return (
        <GalleryViewer
            galleryData={galleryData}
            userData={userData || undefined}
        />
    );
}
