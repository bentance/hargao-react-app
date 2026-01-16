'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import styles from './profile.module.css';

interface UserProfile {
    username: string;
    displayName: string;
    email: string;
    photoURL: string | null;
    bio: string;
    links: {
        website: string | null;
        instagram: string | null;
    };
}

export default function ProfileSettingsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form state
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [website, setWebsite] = useState('');
    const [instagram, setInstagram] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await loadUserProfile(currentUser.uid);
            } else {
                router.push('/signin');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const loadUserProfile = async (uid: string) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const profileData: UserProfile = {
                    username: data.username || '',
                    displayName: data.displayName || '',
                    email: data.email || '',
                    photoURL: data.photoURL || null,
                    bio: data.bio || '',
                    links: {
                        website: data.links?.website || null,
                        instagram: data.links?.instagram || null
                    }
                };
                setProfile(profileData);
                setDisplayName(profileData.displayName);
                setBio(profileData.bio);
                setWebsite(profileData.links.website || '');
                setInstagram(profileData.links.instagram || '');
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            // Upload to Firebase Storage
            const fileName = `${user.uid}_${Date.now()}.${file.name.split('.').pop()}`;
            const storageRef = ref(storage, `users/${user.uid}/profile/${fileName}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Update Firestore
            await updateDoc(doc(db, 'users', user.uid), {
                photoURL: downloadURL
            });

            setProfile(prev => prev ? { ...prev, photoURL: downloadURL } : null);
            setPreviewImage(null);
            setMessage({ type: 'success', text: 'Profile image updated!' });
        } catch (err: any) {
            console.error('Error uploading image:', err);
            setMessage({ type: 'error', text: 'Failed to upload image: ' + err.message });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                displayName: displayName.trim(),
                bio: bio.trim(),
                links: {
                    website: website.trim() || null,
                    instagram: instagram.trim() || null
                }
            });
            setMessage({ type: 'success', text: 'Profile saved successfully!' });
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setMessage({ type: 'error', text: 'Failed to save: ' + err.message });
        } finally {
            setIsSaving(false);
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
                <Link href="/dashboard" className={styles.backBtn}>Back to Dashboard</Link>

                <h1>Profile Settings</h1>

                {message.text && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Image Section */}
                <section className={styles.section}>
                    <h2>Profile Image</h2>
                    <div className={styles.imageSection}>
                        <div className={styles.currentImage}>
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" />
                            ) : profile?.photoURL ? (
                                <img src={profile.photoURL} alt={profile.displayName} />
                            ) : (
                                <div className={styles.placeholder}>
                                    {profile?.displayName?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <div className={styles.imageActions}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageSelect}
                                className={styles.fileInput}
                            />
                            <button
                                type="button"
                                className={styles.selectBtn}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Select Image
                            </button>
                            {previewImage && (
                                <button
                                    type="button"
                                    className={styles.uploadBtn}
                                    onClick={handleImageUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Profile Info Section */}
                <section className={styles.section}>
                    <h2>Profile Information</h2>
                    <form onSubmit={handleSaveProfile} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Username</label>
                            <input
                                type="text"
                                value={profile?.username || ''}
                                disabled
                                className="neo-input"
                            />
                            <small>Username cannot be changed</small>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="neo-input"
                                placeholder="Your display name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="neo-textarea"
                                placeholder="Tell us about yourself..."
                                rows={3}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Website</label>
                            <input
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="neo-input"
                                placeholder="https://yourwebsite.com"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Instagram</label>
                            <input
                                type="text"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                className="neo-input"
                                placeholder="@yourusername"
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
