/**
 * Gallery Service
 * Handles gallery creation, updates, and retrieval
 */

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Gallery, Painting, DEFAULT_GALLERY } from '@/types/firebase';
import { GALLERY_OPTIONS } from '@/config';

/**
 * Generate a unique gallery ID
 */
function generateGalleryId(): string {
    return 'gal_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Upload a painting image to Firebase Storage
 */
export async function uploadPaintingImage(
    galleryId: string,
    paintingId: number,
    file: File
): Promise<string> {
    const extension = file.name.split('.').pop() || 'jpg';
    const filePath = `galleries/${galleryId}/painting_${paintingId}.${extension}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    console.log(`✅ Uploaded painting ${paintingId}:`, downloadURL);
    return downloadURL;
}

/**
 * Upload user profile image to Firebase Storage
 */
export async function uploadProfileImage(userId: string, file: File): Promise<string> {
    const filePath = `users/${userId}/profile.jpg`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    console.log('✅ Uploaded profile image:', downloadURL);
    return downloadURL;
}

/**
 * Create a new gallery
 */
export async function createGallery(
    ownerId: string,
    ownerUsername: string,
    formData: {
        galleryName: string;
        gallerySlug: string;
        galleryDescription: string;
        environment: number;
        character: number;
        uiTheme: number;
        enableFootsteps: boolean;
        footstepsVolume: number;
        showWatermark: boolean;
        paintings: Array<{
            id: number;
            file: File | null;
            title: string;
            description: string;
        }>;
    },
    publish: boolean = true
): Promise<Gallery> {
    const galleryId = generateGalleryId();
    const now = new Date().toISOString();

    try {
        // 1. Upload all painting images first
        const uploadedPaintings: Painting[] = [];
        for (const painting of formData.paintings) {
            if (painting.file) {
                const imageUrl = await uploadPaintingImage(galleryId, painting.id, painting.file);
                uploadedPaintings.push({
                    id: painting.id,
                    title: painting.title || '',
                    description: painting.description || '',
                    imageUrl: imageUrl,
                });
            }
        }

        if (uploadedPaintings.length === 0) {
            throw new Error('At least one painting is required');
        }

        // 2. Create gallery document
        const galleryData: Gallery = {
            ...DEFAULT_GALLERY,
            id: galleryId,
            ownerId: ownerId,
            ownerUsername: ownerUsername,
            slug: formData.gallerySlug,
            name: formData.galleryName,
            description: formData.galleryDescription || '',
            isPublished: publish,
            publishedAt: publish ? now : null,
            createdAt: now,
            updatedAt: now,
            access: {
                isPasswordProtected: GALLERY_OPTIONS.defaultAccess.isPasswordProtected,
                passwordHash: null,
            },
            branding: {
                showWatermark: formData.showWatermark,
                customWatermark: null,
            },
            environment: {
                level: formData.environment as 1 | 2 | 3 | 4,
                character: formData.character as 0 | 1 | 2,
                uiTheme: formData.uiTheme as 0 | 1 | 2 | 3 | 4,
            },
            audio: {
                enableFootsteps: formData.enableFootsteps,
                footstepsVolume: formData.footstepsVolume,
                backgroundMusic: null,
                backgroundMusicVolume: GALLERY_OPTIONS.defaultAudio.backgroundMusicVolume,
            },
            paintings: uploadedPaintings,
            stats: {
                viewCount: 0,
                uniqueVisitors: 0,
                lastViewedAt: null,
            },
        };

        // 3. Save to Firestore
        await setDoc(doc(db, 'galleries', galleryId), {
            ...galleryData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            publishedAt: publish ? serverTimestamp() : null,
        });

        // 4. Increment user's gallery count
        await updateDoc(doc(db, 'users', ownerId), {
            galleriesCount: increment(1),
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Gallery created:', galleryId);
        return galleryData;
    } catch (error: any) {
        console.error('❌ Error creating gallery:', error.message);
        throw error;
    }
}

/**
 * Get a gallery by ID
 */
export async function getGalleryById(galleryId: string): Promise<Gallery | null> {
    try {
        const galleryDoc = await getDoc(doc(db, 'galleries', galleryId));
        if (galleryDoc.exists()) {
            return galleryDoc.data() as Gallery;
        }
        return null;
    } catch (error: any) {
        console.error('❌ Error fetching gallery:', error.message);
        throw error;
    }
}

/**
 * Get a gallery by username and slug
 */
export async function getGalleryBySlug(
    username: string,
    slug: string
): Promise<Gallery | null> {
    try {
        const q = query(
            collection(db, 'galleries'),
            where('ownerUsername', '==', username.toLowerCase()),
            where('slug', '==', slug.toLowerCase())
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as Gallery;
        }
        return null;
    } catch (error: any) {
        console.error('❌ Error fetching gallery by slug:', error.message);
        throw error;
    }
}

/**
 * Get all galleries for a user
 */
export async function getUserGalleries(ownerId: string): Promise<Gallery[]> {
    try {
        const q = query(
            collection(db, 'galleries'),
            where('ownerId', '==', ownerId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => doc.data() as Gallery);
    } catch (error: any) {
        console.error('❌ Error fetching user galleries:', error.message);
        throw error;
    }
}

/**
 * Delete a gallery
 */
export async function deleteGallery(galleryId: string, ownerId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'galleries', galleryId));

        // Decrement user's gallery count
        await updateDoc(doc(db, 'users', ownerId), {
            galleriesCount: increment(-1),
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Gallery deleted:', galleryId);
    } catch (error: any) {
        console.error('❌ Error deleting gallery:', error.message);
        throw error;
    }
}

/**
 * Increment gallery view count
 */
export async function incrementViewCount(galleryId: string): Promise<void> {
    try {
        await updateDoc(doc(db, 'galleries', galleryId), {
            'stats.viewCount': increment(1),
            'stats.lastViewedAt': serverTimestamp(),
        });
    } catch (error: any) {
        console.error('❌ Error incrementing view count:', error.message);
    }
}
