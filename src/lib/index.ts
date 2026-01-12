/**
 * Firebase Services - Barrel Export
 */

// Core Firebase
export { auth, db, storage } from './firebase';

// Authentication
export {
    registerUser,
    signInUser,
    signOutUser,
    getUserData,
    isUsernameAvailable,
    onAuthChange,
} from './auth';

// Gallery
export {
    createGallery,
    getGalleryById,
    getGalleryBySlug,
    getUserGalleries,
    deleteGallery,
    uploadPaintingImage,
    uploadProfileImage,
    incrementViewCount,
} from './gallery';
