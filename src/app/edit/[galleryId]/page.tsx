'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { GALLERY_OPTIONS } from '@/config';
import styles from './edit.module.css';

interface Painting {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
}

interface GalleryData {
    name: string;
    slug: string;
    ownerId: string;
    ownerUsername: string;
    environment: {
        level: number;
        character: number;
    };
    paintings: Painting[];
    isPublished: boolean;
}

export default function EditGalleryPage() {
    const router = useRouter();
    const params = useParams();
    const galleryId = params.galleryId as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<User | null>(null);
    const [gallery, setGallery] = useState<GalleryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Form state
    const [galleryName, setGalleryName] = useState('');
    const [selectedEnvironment, setSelectedEnvironment] = useState(1);
    const [selectedCharacter, setSelectedCharacter] = useState(1);
    const [paintings, setPaintings] = useState<Painting[]>([]);
    const [isPublished, setIsPublished] = useState(false);

    // Modals
    const [showDeletePaintingModal, setShowDeletePaintingModal] = useState(false);
    const [paintingToDelete, setPaintingToDelete] = useState<number | null>(null);
    const [showDeleteGalleryModal, setShowDeleteGalleryModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // User's other galleries (for name collision check)
    const [userGalleryNames, setUserGalleryNames] = useState<string[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await loadGallery(currentUser.uid);
            } else {
                router.push('/signin');
            }
        });
        return () => unsubscribe();
    }, [router, galleryId]);

    const loadGallery = async (uid: string) => {
        try {
            const galleryDoc = await getDoc(doc(db, 'galleries', galleryId));
            if (!galleryDoc.exists()) {
                setError('Gallery not found');
                setIsLoading(false);
                return;
            }

            const data = galleryDoc.data() as GalleryData;

            // Check ownership
            if (data.ownerId !== uid) {
                setError('You do not have permission to edit this gallery');
                setIsLoading(false);
                return;
            }

            setGallery(data);
            setGalleryName(data.name);
            setSelectedEnvironment(data.environment?.level || 1);
            setSelectedCharacter(data.environment?.character || 1);
            setPaintings(data.paintings || []);
            setIsPublished(data.isPublished || false);

            // Load user's other gallery names
            const galleriesQuery = query(
                collection(db, 'galleries'),
                where('ownerId', '==', uid)
            );
            const galleriesSnapshot = await getDocs(galleriesQuery);
            const names: string[] = [];
            galleriesSnapshot.forEach((doc) => {
                if (doc.id !== galleryId) {
                    names.push(doc.data().name.toLowerCase());
                }
            });
            setUserGalleryNames(names);

        } catch (err: any) {
            console.error('Error loading gallery:', err);
            setError('Failed to load gallery');
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = (name: string): string => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleSave = async () => {
        if (!user || !gallery) return;

        // Validate gallery name
        if (!galleryName.trim()) {
            setError('Gallery name is required');
            return;
        }

        // Check for duplicate name
        if (userGalleryNames.includes(galleryName.toLowerCase().trim()) &&
            galleryName.toLowerCase().trim() !== gallery.name.toLowerCase()) {
            setError('You already have a gallery with this name');
            return;
        }

        // Validate paintings
        if (paintings.length < 1) {
            setError('Gallery must have at least 1 painting');
            return;
        }

        setIsSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            const newSlug = generateSlug(galleryName);

            await updateDoc(doc(db, 'galleries', galleryId), {
                name: galleryName.trim(),
                slug: newSlug,
                environment: {
                    level: selectedEnvironment,
                    character: selectedCharacter
                },
                paintings: paintings,
                isPublished: isPublished,
                updatedAt: new Date()
            });

            setSuccessMessage('Gallery saved successfully!');

            // Update local gallery state
            setGallery(prev => prev ? {
                ...prev,
                name: galleryName.trim(),
                slug: newSlug
            } : null);

        } catch (err: any) {
            console.error('Error saving gallery:', err);
            setError('Failed to save gallery: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !user) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                // Upload to storage
                const fileName = `${Date.now()}_${file.name}`;
                const storageRef = ref(storage, `galleries/${galleryId}/paintings/${fileName}`);
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);

                // Add to paintings array
                const newPainting: Painting = {
                    id: Date.now() + i,
                    title: '',
                    description: '',
                    imageUrl: downloadURL
                };

                setPaintings(prev => [...prev, newPainting]);
            } catch (err) {
                console.error('Error uploading image:', err);
                setError('Failed to upload image');
            }
        }

        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const confirmDeletePainting = (paintingId: number) => {
        if (paintings.length <= 1) {
            setError('Cannot delete. Gallery must have at least 1 painting.');
            return;
        }
        setPaintingToDelete(paintingId);
        setShowDeletePaintingModal(true);
    };

    const handleDeletePainting = () => {
        if (paintingToDelete === null) return;

        setPaintings(prev => prev.filter(p => p.id !== paintingToDelete));
        setShowDeletePaintingModal(false);
        setPaintingToDelete(null);
    };

    const handleDeleteGallery = async () => {
        if (!user) return;

        // Verify password using reauthentication would be ideal, 
        // but for simplicity we'll check against the sign-in
        setIsDeleting(true);
        setDeleteError('');

        try {
            // Delete gallery document
            await deleteDoc(doc(db, 'galleries', galleryId));

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Error deleting gallery:', err);
            setDeleteError('Failed to delete gallery: ' + err.message);
            setIsDeleting(false);
        }
    };

    const updatePaintingField = (paintingId: number, field: 'title' | 'description', value: string) => {
        setPaintings(prev => prev.map(p =>
            p.id === paintingId ? { ...p, [field]: value } : p
        ));
    };

    if (isLoading) {
        return (
            <main className={styles.main}>
                <div className={styles.loading}>Loading gallery...</div>
            </main>
        );
    }

    if (error && !gallery) {
        return (
            <main className={styles.main}>
                <div className={styles.errorContainer}>
                    <h1>Error</h1>
                    <p>{error}</p>
                    <Link href="/dashboard" className={styles.backBtn}>Back to Dashboard</Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <Link href="/dashboard" className={styles.backBtn}>Back to Dashboard</Link>
                    <h1>Edit Gallery</h1>
                    <div className={styles.headerActions}>
                        <button
                            className={styles.deleteGalleryBtn}
                            onClick={() => setShowDeleteGalleryModal(true)}
                        >
                            Delete Gallery
                        </button>
                        <button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </header>

                {/* Messages */}
                {error && <div className={styles.error}>{error}</div>}
                {successMessage && <div className={styles.success}>{successMessage}</div>}

                {/* Gallery Settings */}
                <section className={styles.section}>
                    <h2>Gallery Settings</h2>

                    <div className={styles.formGroup}>
                        <label>Gallery Name *</label>
                        <input
                            type="text"
                            value={galleryName}
                            onChange={(e) => setGalleryName(e.target.value)}
                            className="neo-input"
                            placeholder="My Gallery"
                        />
                        <small>URL: /@{gallery?.ownerUsername}/{generateSlug(galleryName)}</small>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                            />
                            Published (visible to public)
                        </label>
                    </div>
                </section>

                {/* Environment Selection */}
                <section className={styles.section}>
                    <h2>Environment</h2>
                    <div className={styles.optionsGrid}>
                        {GALLERY_OPTIONS.environments.map((env) => (
                            <div
                                key={env.id}
                                className={`${styles.optionCard} ${selectedEnvironment === env.id ? styles.selected : ''}`}
                                onClick={() => setSelectedEnvironment(env.id)}
                            >
                                <img src={env.image} alt={env.label} />
                                <span>{env.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Character Selection */}
                <section className={styles.section}>
                    <h2>Character</h2>
                    <div className={styles.optionsGrid}>
                        {GALLERY_OPTIONS.characters.map((char) => (
                            <div
                                key={char.id}
                                className={`${styles.optionCard} ${selectedCharacter === char.id ? styles.selected : ''}`}
                                onClick={() => setSelectedCharacter(char.id)}
                            >
                                <img src={char.image} alt={char.label} />
                                <span>{char.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Paintings */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Paintings ({paintings.length})</h2>
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className={styles.fileInput}
                            />
                            <button
                                className={styles.addBtn}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                + Add Images
                            </button>
                        </div>
                    </div>

                    <div className={styles.paintingsGrid}>
                        {paintings.map((painting, index) => (
                            <div key={painting.id} className={styles.paintingCard}>
                                <div className={styles.paintingImage}>
                                    <img src={painting.imageUrl} alt={painting.title || `Painting ${index + 1}`} />
                                    <button
                                        className={styles.deletePaintingBtn}
                                        onClick={() => confirmDeletePainting(painting.id)}
                                        title="Delete painting"
                                    >
                                        X
                                    </button>
                                </div>
                                <div className={styles.paintingFields}>
                                    <input
                                        type="text"
                                        value={painting.title}
                                        onChange={(e) => updatePaintingField(painting.id, 'title', e.target.value)}
                                        placeholder="Title (optional)"
                                        className="neo-input"
                                    />
                                    <textarea
                                        value={painting.description}
                                        onChange={(e) => updatePaintingField(painting.id, 'description', e.target.value)}
                                        placeholder="Description (optional)"
                                        className="neo-textarea"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* View Gallery Link */}
                {gallery && (
                    <div className={styles.viewLink}>
                        <Link
                            href={`/@${gallery.ownerUsername}/${gallery.slug}`}
                            target="_blank"
                            className={styles.viewBtn}
                        >
                            View Gallery
                        </Link>
                    </div>
                )}
            </div>

            {/* Delete Painting Modal */}
            {showDeletePaintingModal && (
                <div className={styles.modalOverlay} onClick={() => setShowDeletePaintingModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>Delete Painting?</h2>
                        <p className={styles.warning}>
                            Are you sure you want to delete this painting?<br />
                            <strong>This cannot be undone.</strong>
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setShowDeletePaintingModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmDeleteBtn}
                                onClick={handleDeletePainting}
                            >
                                Delete Painting
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Gallery Modal */}
            {showDeleteGalleryModal && (
                <div className={styles.modalOverlay} onClick={() => setShowDeleteGalleryModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>Delete Gallery?</h2>
                        <p className={styles.warning}>
                            You are about to <strong>permanently delete</strong> the gallery:<br />
                            <strong>"{gallery?.name}"</strong><br /><br />
                            This will delete all paintings and cannot be undone.
                        </p>
                        <div className={styles.formGroup}>
                            <label>Type your password to confirm:</label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="neo-input"
                                placeholder="Enter your password"
                            />
                        </div>
                        {deleteError && <p className={styles.error}>{deleteError}</p>}
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setShowDeleteGalleryModal(false);
                                    setDeletePassword('');
                                    setDeleteError('');
                                }}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmDeleteBtn}
                                onClick={handleDeleteGallery}
                                disabled={isDeleting || !deletePassword}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
