'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import styles from './feature.module.css';

interface GalleryPreview {
    id: string;
    name: string;
    slug: string;
    ownerUsername: string;
    description: string;
    thumbnailUrl: string | null;
    viewCount: number;
}

export default function FeaturePage() {
    const [galleries, setGalleries] = useState<GalleryPreview[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadGalleries();
    }, []);

    const loadGalleries = async () => {
        try {
            // Get top 20 galleries ordered by view count
            const galleriesQuery = query(
                collection(db, 'galleries'),
                where('isPublished', '==', true),
                orderBy('viewCount', 'desc'),
                limit(20)
            );
            const snapshot = await getDocs(galleriesQuery);

            const galleriesData: GalleryPreview[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                galleriesData.push({
                    id: doc.id,
                    name: data.name,
                    slug: data.slug,
                    ownerUsername: data.ownerUsername,
                    description: data.description || '',
                    thumbnailUrl: data.paintings?.[0]?.imageUrl || null,
                    viewCount: data.viewCount || 0,
                });
            });

            setGalleries(galleriesData);
        } catch (error) {
            console.error('Error loading featured galleries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Link href="/" className={styles.backButton}>← Back</Link>

                <header className={styles.header}>
                    <h1>🌟 Featured Galleries</h1>
                    <p>The most popular virtual art exhibitions</p>
                </header>

                {isLoading ? (
                    <div className={styles.loading}>Loading featured galleries...</div>
                ) : galleries.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No featured galleries yet.</p>
                        <Link href="/create" className={styles.createBtn}>Be the first!</Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {galleries.map((gallery, index) => (
                            <div key={gallery.id} className={styles.galleryCard}>
                                <div className={styles.rank}>#{index + 1}</div>
                                <div className={styles.thumbnail}>
                                    {gallery.thumbnailUrl ? (
                                        <img src={gallery.thumbnailUrl} alt={gallery.name} />
                                    ) : (
                                        <div className={styles.noImage}>🖼️</div>
                                    )}
                                </div>
                                <div className={styles.cardContent}>
                                    <h3>{gallery.name}</h3>
                                    <p className={styles.owner}>by @{gallery.ownerUsername}</p>
                                    <p className={styles.views}>👁️ {gallery.viewCount} views</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
