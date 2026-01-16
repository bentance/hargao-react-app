'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './featured.module.css';

interface FeaturedGallery {
    id: string;
    name: string;
    slug: string;
    ownerUsername: string;
    ownerDisplayName: string;
    ownerPhotoURL: string | null;
    thumbnailUrl: string | null;
    paintingsCount: number;
}

export default function FeaturedPage() {
    const [galleries, setGalleries] = useState<FeaturedGallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFeaturedGalleries();
    }, []);

    const loadFeaturedGalleries = async () => {
        try {
            const galleriesQuery = query(
                collection(db, 'galleries'),
                where('isFeatured', '==', true)
            );
            const snapshot = await getDocs(galleriesQuery);
            const featured: FeaturedGallery[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                // Only show published galleries
                if (data.isPublished) {
                    featured.push({
                        id: doc.id,
                        name: data.name,
                        slug: data.slug,
                        ownerUsername: data.ownerUsername || 'unknown',
                        ownerDisplayName: data.ownerDisplayName || data.ownerUsername || 'Artist',
                        ownerPhotoURL: data.ownerPhotoURL || null,
                        thumbnailUrl: data.paintings?.[0]?.imageUrl || null,
                        paintingsCount: data.paintings?.length || 0
                    });
                }
            });

            setGalleries(featured);
        } catch (err) {
            console.error('Error loading featured galleries:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <Link href="/" className={styles.backBtn}>Back</Link>
                    <div className={styles.headerContent}>
                        <h1>Featured Galleries</h1>
                        <p>Curated collections from talented artists</p>
                    </div>
                </header>

                {/* Gallery Grid */}
                {isLoading ? (
                    <div className={styles.loading}>Loading featured galleries...</div>
                ) : galleries.length === 0 ? (
                    <div className={styles.empty}>
                        <h2>No featured galleries yet</h2>
                        <p>Check back soon for curated collections!</p>
                        <Link href="/explore" className={styles.exploreBtn}>
                            Explore Demo Galleries
                        </Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {galleries.map((gallery) => (
                            <Link
                                key={gallery.id}
                                href={`/@${gallery.ownerUsername}/${gallery.slug}`}
                                className={styles.galleryCard}
                            >
                                <div className={styles.thumbnail}>
                                    {gallery.thumbnailUrl ? (
                                        <img src={gallery.thumbnailUrl} alt={gallery.name} />
                                    ) : (
                                        <div className={styles.noImage}>No Image</div>
                                    )}
                                    <div className={styles.overlay}>
                                        <span className={styles.viewBtn}>View Gallery</span>
                                    </div>
                                </div>
                                <div className={styles.cardInfo}>
                                    <h3>{gallery.name}</h3>
                                    <div className={styles.artistInfo}>
                                        {gallery.ownerPhotoURL ? (
                                            <img
                                                src={gallery.ownerPhotoURL}
                                                alt={gallery.ownerDisplayName}
                                                className={styles.artistAvatar}
                                            />
                                        ) : (
                                            <div className={styles.avatarPlaceholder}>
                                                {gallery.ownerDisplayName[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <span>@{gallery.ownerUsername}</span>
                                    </div>
                                    <p className={styles.paintingCount}>
                                        {gallery.paintingsCount} paintings
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
