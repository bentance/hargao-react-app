'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import styles from './dashboard.module.css';

interface UserProfile {
    username: string;
    displayName: string;
    email: string;
    photoURL: string | null;
    bio: string;
    tier: string;
}

interface Gallery {
    id: string;
    name: string;
    slug: string;
    isPublished: boolean;
    isFeatured: boolean;
    paintingsCount: number;
    thumbnailUrl: string | null;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await loadUserData(currentUser.uid);
            } else {
                // Not logged in, redirect to sign in
                router.push('/signin');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const loadUserData = async (uid: string) => {
        try {
            // Load user profile
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setProfile({
                    username: data.username || '',
                    displayName: data.displayName || '',
                    email: data.email || '',
                    photoURL: data.photoURL || null,
                    bio: data.bio || '',
                    tier: data.tier || 'free'
                });

                // Load user galleries
                const galleriesQuery = query(
                    collection(db, 'galleries'),
                    where('ownerId', '==', uid)
                );
                const galleriesSnapshot = await getDocs(galleriesQuery);
                const galleriesData: Gallery[] = [];
                galleriesSnapshot.forEach((doc) => {
                    const data = doc.data();
                    galleriesData.push({
                        id: doc.id,
                        name: data.name,
                        slug: data.slug,
                        isPublished: data.isPublished || false,
                        isFeatured: data.isFeatured || false,
                        paintingsCount: data.paintings?.length || 0,
                        thumbnailUrl: data.paintings?.[0]?.imageUrl || null
                    });
                });
                setGalleries(galleriesData);
            }
        } catch (err) {
            console.error('Error loading user data:', err);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (err) {
            console.error('Error signing out:', err);
        }
    };

    if (isLoading) {
        return (
            <main className={styles.main}>
                <div className={styles.loading}>Loading...</div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <Link href="/" className={styles.logo}>HARGAO</Link>
                    </div>
                    <div className={styles.headerRight}>
                        <button
                            className={styles.settingsBtn}
                            onClick={() => setShowSettings(true)}
                        >
                            Settings
                        </button>
                        <button
                            className={styles.signOutBtn}
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                {/* User Profile Section */}
                <section className={styles.profileSection}>
                    <div className={styles.profileImage}>
                        {profile?.photoURL ? (
                            <img src={profile.photoURL} alt={profile.displayName} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {profile?.displayName?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>
                    <div className={styles.profileInfo}>
                        <h1>{profile?.displayName || 'User'}</h1>
                        <p className={styles.username}>@{profile?.username}</p>
                        {profile?.bio && <p className={styles.bio}>{profile.bio}</p>}
                        <span className={styles.tier}>{profile?.tier} tier</span>
                    </div>
                </section>

                {/* Galleries Section */}
                <section className={styles.galleriesSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Your Galleries ({galleries.length})</h2>
                        <Link href="/create" className={styles.createBtn}>
                            + Create New
                        </Link>
                    </div>

                    {galleries.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>You haven't created any galleries yet.</p>
                            <Link href="/create" className={styles.createBtnLarge}>
                                Create Your First Gallery
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.galleriesGrid}>
                            {galleries.map((gallery) => (
                                <div key={gallery.id} className={styles.galleryCard}>
                                    <div className={styles.galleryThumbnail}>
                                        {gallery.thumbnailUrl ? (
                                            <img src={gallery.thumbnailUrl} alt={gallery.name} />
                                        ) : (
                                            <div className={styles.noThumbnail}>No Image</div>
                                        )}
                                        <div className={styles.galleryBadges}>
                                            <span className={gallery.isPublished ? styles.published : styles.draft}>
                                                {gallery.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                            {gallery.isFeatured && (
                                                <span className={styles.featured}>Featured</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.galleryInfo}>
                                        <h3>{gallery.name}</h3>
                                        <p>{gallery.paintingsCount} paintings</p>
                                    </div>
                                    <div className={styles.galleryActions}>
                                        <Link
                                            href={`/@${profile?.username}/${gallery.slug}`}
                                            className={styles.viewBtn}
                                            target="_blank"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/edit/${gallery.id}`}
                                            className={styles.editBtn}
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className={styles.modalOverlay} onClick={() => setShowSettings(false)}>
                    <div className={styles.settingsModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>User Settings</h2>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setShowSettings(false)}
                            >
                                X
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.settingGroup}>
                                <label>Profile Image</label>
                                <div className={styles.imageUpload}>
                                    <div className={styles.currentImage}>
                                        {profile?.photoURL ? (
                                            <img src={profile.photoURL} alt="Profile" />
                                        ) : (
                                            <div className={styles.avatarPlaceholder}>
                                                {profile?.displayName?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href="/settings/profile"
                                        className={styles.changeImageBtn}
                                    >
                                        Change Image
                                    </Link>
                                </div>
                            </div>
                            <div className={styles.settingGroup}>
                                <label>Display Name</label>
                                <p>{profile?.displayName}</p>
                            </div>
                            <div className={styles.settingGroup}>
                                <label>Username</label>
                                <p>@{profile?.username}</p>
                            </div>
                            <div className={styles.settingGroup}>
                                <label>Email</label>
                                <p>{profile?.email}</p>
                            </div>
                            <Link
                                href="/settings/profile"
                                className={styles.fullSettingsBtn}
                            >
                                All Settings
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
