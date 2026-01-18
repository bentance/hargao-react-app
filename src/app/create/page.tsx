'use client';

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND_CONFIG, GALLERY_OPTIONS } from '@/config';
import { registerUser, createGallery, uploadProfileImage } from '@/lib';
import styles from './create.module.css';

// Character limits for form fields
const CHAR_LIMITS = {
    username: 30,
    bio: 500,
    galleryName: 50,
    galleryDescription: 1000,
    paintingTitle: 100,
    paintingDescription: 500,
};

// Character counter component
const CharCounter = ({ current, max }: { current: number; max: number }) => {
    const remaining = max - current;
    const isWarning = remaining <= max * 0.2 && remaining > 0;
    const isError = remaining <= 0;

    return (
        <span className={`${styles.charCounter} ${isWarning ? styles.warning : ''} ${isError ? styles.error : ''}`}>
            {current}/{max}
        </span>
    );
};

interface Painting {
    id: number;
    file: File | null;
    preview: string | null;
    title: string;
    description: string;
}

interface FormData {
    // Account (Required)
    email: string;
    password: string;
    confirmPassword: string;

    // Artist Profile
    profileImage: File | null;
    profileImagePreview: string | null;
    username: string;
    bio: string;
    website: string;
    instagram: string;

    // Gallery Settings
    galleryName: string;
    gallerySlug: string;
    galleryDescription: string;
    environment: number;
    character: number;
    // Future versions
    uiTheme: number;
    enableFootsteps: boolean;
    footstepsVolume: number;
    showWatermark: boolean;

    // Paintings
    paintings: Painting[];
    selectedPaintingIndex: number;

    // Terms & Conditions
    agreeToTerms: boolean;
}

export default function CreatePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [publishedGalleryUrl, setPublishedGalleryUrl] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        // Account (Required)
        email: '',
        password: '',
        confirmPassword: '',

        // Artist Profile
        profileImage: null,
        profileImagePreview: null,
        username: '',
        bio: '',
        website: '',
        instagram: '',

        // Gallery Settings
        galleryName: 'my-gallery',
        gallerySlug: 'my-gallery',
        galleryDescription: '',
        environment: GALLERY_OPTIONS.defaultUI.environment,
        character: GALLERY_OPTIONS.defaultUI.character,
        // Future versions - defaults (using config values)
        uiTheme: GALLERY_OPTIONS.defaultUI.uiTheme,
        enableFootsteps: GALLERY_OPTIONS.defaultAudio.enableFootsteps,
        footstepsVolume: GALLERY_OPTIONS.defaultAudio.footstepsVolume,
        showWatermark: GALLERY_OPTIONS.defaultBranding.showWatermark,

        paintings: [
            { id: 1, file: null, preview: null, title: '', description: '' }
        ],
        selectedPaintingIndex: 0,

        // Terms & Conditions
        agreeToTerms: false,
    });

    const profileInputRef = useRef<HTMLInputElement>(null);
    const paintingInputRef = useRef<HTMLInputElement>(null);
    const addPaintingInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Sanitize username to be URL-safe (lowercase, hyphens instead of spaces)
    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Convert to lowercase, replace spaces with hyphens, remove special chars
        const sanitized = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
        setFormData(prev => ({ ...prev, username: sanitized }));
    };

    // Auto-generate slug from gallery name
    const handleGalleryNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        setFormData(prev => ({
            ...prev,
            galleryName: name,
            gallerySlug: slug || 'my-gallery'
        }));
    };

    const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    profileImage: file,
                    profileImagePreview: reader.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePaintingImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type - only JPG and PNG allowed
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                setSubmitError('Only JPG and PNG images are allowed for paintings.');
                e.target.value = ''; // Reset input
                return;
            }

            // Validate file size - max 5MB
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                setSubmitError('Painting image must be under 5MB.');
                e.target.value = ''; // Reset input
                return;
            }

            // Clear any previous errors
            setSubmitError(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => {
                    const paintings = [...prev.paintings];
                    paintings[prev.selectedPaintingIndex] = {
                        ...paintings[prev.selectedPaintingIndex],
                        file,
                        preview: reader.result as string,
                    };
                    return { ...prev, paintings };
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectOption = (field: string, value: number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectPainting = (index: number) => {
        setFormData(prev => ({ ...prev, selectedPaintingIndex: index }));
    };

    // Opens file picker to add a new painting directly
    const handleAddPainting = () => {
        if (formData.paintings.length < GALLERY_OPTIONS.maxPaintings) {
            addPaintingInputRef.current?.click();
        }
    };

    // Handle file selection when adding a new painting via ADD button
    const handleAddPaintingFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && formData.paintings.length < GALLERY_OPTIONS.maxPaintings) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newId = formData.paintings.length + 1;
                setFormData(prev => ({
                    ...prev,
                    paintings: [
                        ...prev.paintings,
                        { id: newId, file, preview: reader.result as string, title: '', description: '' }
                    ],
                    selectedPaintingIndex: prev.paintings.length,
                }));
            };
            reader.readAsDataURL(file);
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    // Handle thumbnail click - if no image, open file picker directly
    const handleThumbnailClick = (index: number) => {
        setFormData(prev => ({ ...prev, selectedPaintingIndex: index }));
        // If this slot doesn't have an image, open file picker immediately
        if (!formData.paintings[index].preview) {
            setTimeout(() => paintingInputRef.current?.click(), 50);
        }
    };

    const handleRemovePainting = (index: number) => {
        if (formData.paintings.length > GALLERY_OPTIONS.minPaintings) {
            setFormData(prev => {
                const paintings = prev.paintings.filter((_, i) => i !== index);
                // Reassign IDs
                const updatedPaintings = paintings.map((p, i) => ({ ...p, id: i + 1 }));
                return {
                    ...prev,
                    paintings: updatedPaintings,
                    selectedPaintingIndex: Math.min(prev.selectedPaintingIndex, updatedPaintings.length - 1),
                };
            });
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set to false if we're leaving the drop zone entirely
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image/')
        );

        if (files.length === 0) return;

        // Process each dropped file
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(current => {
                    if (current.paintings.length >= GALLERY_OPTIONS.maxPaintings) {
                        return current;
                    }

                    // Check if there's an empty slot (no image)
                    const firstEmptyIndex = current.paintings.findIndex(p => !p.preview);

                    if (firstEmptyIndex !== -1) {
                        // Fill the first empty slot
                        const paintings = [...current.paintings];
                        paintings[firstEmptyIndex] = {
                            ...paintings[firstEmptyIndex],
                            file,
                            preview: reader.result as string,
                        };
                        return {
                            ...current,
                            paintings,
                            selectedPaintingIndex: firstEmptyIndex,
                        };
                    } else {
                        // Add new painting slot
                        const newId = current.paintings.length + 1;
                        return {
                            ...current,
                            paintings: [
                                ...current.paintings,
                                { id: newId, file, preview: reader.result as string, title: '', description: '' }
                            ],
                            selectedPaintingIndex: current.paintings.length,
                        };
                    }
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const handlePaintingFieldChange = (field: 'title' | 'description', value: string) => {
        setFormData(prev => {
            const paintings = [...prev.paintings];
            paintings[prev.selectedPaintingIndex] = {
                ...paintings[prev.selectedPaintingIndex],
                [field]: value,
            };
            return { ...prev, paintings };
        });
    };

    const handleSubmit = async (e: FormEvent, isDraft: boolean) => {
        e.preventDefault();
        setSubmitError(null);

        // Basic validation
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.username) {
            setSubmitError('Please fill in all required fields (marked with *)');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setSubmitError('Passwords do not match!');
            return;
        }

        if (formData.password.length < 8) {
            setSubmitError('Password must be at least 8 characters');
            return;
        }

        // Check for letters, numbers, and special characters
        const hasLetter = /[a-zA-Z]/.test(formData.password);
        const hasNumber = /[0-9]/.test(formData.password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);

        if (!hasLetter || !hasNumber || !hasSpecial) {
            setSubmitError('Password must contain letters, numbers, and special characters (!@#$%^&*...)');
            return;
        }

        if (!formData.paintings.some(p => p.file)) {
            setSubmitError('Please upload at least one painting');
            return;
        }

        if (!formData.agreeToTerms) {
            setSubmitError('Please agree to the Terms & Conditions');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('🚀 Starting submission...');

            // 1. Register the user
            console.log('📝 Registering user...');
            const { user, userData } = await registerUser(
                formData.email,
                formData.password,
                formData.username,
                formData.username, // displayName = username for now
                null, // photoURL will be uploaded separately
                formData.bio,
                {
                    website: formData.website || undefined,
                    instagram: formData.instagram || undefined,
                }
            );

            // 2. Upload profile image if provided and update user document
            let profileURL = null;
            if (formData.profileImage) {
                console.log('📷 Uploading profile image...');
                profileURL = await uploadProfileImage(user.uid, formData.profileImage);

                // Update user document with photoURL
                const { updateDoc, doc } = await import('firebase/firestore');
                const { db } = await import('@/lib/firebase');
                await updateDoc(doc(db, 'users', user.uid), {
                    photoURL: profileURL
                });
                console.log(' Profile image URL saved to user document');
            }

            // 3. Create the gallery with paintings
            console.log('🎨 Creating gallery...');
            const gallery = await createGallery(
                user.uid,
                formData.username.toLowerCase(),
                {
                    galleryName: formData.galleryName,
                    gallerySlug: formData.gallerySlug,
                    galleryDescription: formData.galleryDescription,
                    environment: formData.environment,
                    character: formData.character,
                    uiTheme: formData.uiTheme,
                    enableFootsteps: formData.enableFootsteps,
                    footstepsVolume: formData.footstepsVolume,
                    showWatermark: formData.showWatermark,
                    paintings: formData.paintings.filter(p => p.file !== null),
                },
                !isDraft // publish = true if not a draft
            );

            console.log('✅ Gallery created successfully!', gallery.id);

            // 4. Send confirmation email with gallery link
            const galleryUrl = `/@${formData.username.toLowerCase()}/${formData.gallerySlug}`;
            try {
                console.log('📧 Sending confirmation email...');
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: formData.email,
                        galleryUrl,
                        username: formData.username,
                        galleryName: formData.galleryName,
                    }),
                });
                console.log('✅ Email sent!');
            } catch (emailError) {
                // Don't fail the whole process if email fails
                console.error('⚠️ Email failed (non-critical):', emailError);
            }

            // 5. Show success modal
            setPublishedGalleryUrl(galleryUrl);
            setShowSuccessModal(true);

        } catch (error: any) {
            console.error('❌ Submission error:', error);

            // Handle specific Firebase errors
            if (error.code === 'auth/email-already-in-use') {
                setSubmitError('This email is already registered. Please sign in instead.');
            } else if (error.code === 'auth/username-reserved') {
                setSubmitError('This username is reserved and cannot be used. Please choose another.');
            } else if (error.code === 'auth/username-taken') {
                setSubmitError('This username is already taken. Please choose another.');
            } else if (error.code === 'auth/weak-password') {
                setSubmitError('Password is too weak. Please use at least 8 characters with letters, numbers, and special characters.');
            } else if (error.code === 'auth/invalid-email') {
                setSubmitError('Please enter a valid email address.');
            } else {
                setSubmitError(error.message || 'An error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedPainting = formData.paintings[formData.selectedPaintingIndex];

    const handleCopyLink = () => {
        const fullUrl = window.location.origin + publishedGalleryUrl;
        navigator.clipboard.writeText(fullUrl);
        alert('Link copied to clipboard!');
    };

    const handleVisitGallery = () => {
        // For now, show where it would go (the actual gallery viewer would be a separate app)
        window.open(publishedGalleryUrl, '_blank');
    };

    return (
        <main className={styles.main}>
            <div className="page-container">
                {/* Home Button */}
                <a href="/" className={styles.homeButton}>
                    ← Back to Home
                </a>

                {/* Page Header */}
                <header className="page-header">
                    <h1>Hargao - Create Your Gallery</h1>
                    <p>Build your immersive virtual art exhibition</p>

                    {/* Hero GIF */}
                    <div className={styles.heroGifContainer}>
                        <img
                            src="/gif_for_create_image_v2.gif"
                            alt="Gallery preview"
                            className={styles.heroGif}
                        />
                    </div>

                    <div className={styles.infoNotesContainer}>
                        <span className={styles.infoNote}>⏱️ Approx. 5 mins to fill up and publish!</span>
                        <span className={styles.infoNote}><span className={styles.required}>*</span> is mandatory</span>
                        <span className={styles.infoNote}>🖼️ 1 - 10 images can be inserted</span>
                    </div>
                </header>

                <form onSubmit={(e) => handleSubmit(e, false)}>
                    {/* Step 1: Account & Artist Profile */}
                    <section className="step-card">
                        <div className="step-header">
                            <span className="step-number">1</span>
                            <h2 className="step-title">Account</h2>
                        </div>
                        <div className="step-content">
                            {/* Account Section - Required */}
                            <div className={styles.accountSection}>
                                <h3 className={styles.sectionSubtitle}>Account Details</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Email <span className={styles.required}>*</span></label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="neo-input"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>

                                    <div className={styles.twoColumns}>
                                        <div className="form-group">
                                            <label className="form-label">Password <span className={styles.required}>*</span></label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="neo-input"
                                                placeholder="Min 8 chars, letters, numbers & symbols"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Confirm Password <span className={styles.required}>*</span></label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="neo-input"
                                                placeholder="Repeat password"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className={styles.divider}></div>

                            {/* Artist Profile */}
                            <div className={styles.profileSection}>
                                <h3 className={styles.sectionSubtitle}>Artist Profile</h3>
                                <div className={styles.profileGrid}>
                                    {/* Profile Image Upload */}
                                    <div className={styles.profileImageSection}>
                                        <input
                                            ref={profileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfileImageChange}
                                            hidden
                                        />
                                        <div
                                            className={`upload-box ${styles.profileUpload}`}
                                            onClick={() => profileInputRef.current?.click()}
                                        >
                                            {formData.profileImagePreview ? (
                                                <img
                                                    src={formData.profileImagePreview}
                                                    alt="Profile"
                                                    className={styles.profilePreview}
                                                />
                                            ) : (
                                                <>
                                                    <span className="upload-icon">👤</span>
                                                    <span className="upload-text">Upload Photo</span>
                                                </>
                                            )}
                                        </div>
                                        <span className={styles.optionalLabel}>(Optional)</span>
                                    </div>

                                    {/* Profile Fields */}
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Username <span className={styles.required}>*</span></label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleUsernameChange}
                                                className="neo-input"
                                                placeholder="your-username"
                                                maxLength={CHAR_LIMITS.username}
                                                required
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span className={styles.hint}>Lowercase, no spaces (used in your gallery URL)</span>
                                                <CharCounter current={formData.username.length} max={CHAR_LIMITS.username} />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Bio <span className={styles.optionalTag}>(Optional)</span></label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                className="neo-textarea"
                                                placeholder="Tell us about yourself and your art..."
                                                rows={3}
                                                maxLength={CHAR_LIMITS.bio}
                                            />
                                            <CharCounter current={formData.bio.length} max={CHAR_LIMITS.bio} />
                                        </div>

                                        <div className={styles.twoColumns}>
                                            <div className="form-group">
                                                <label className="form-label">Website <span className={styles.optionalTag}>(Optional)</span></label>
                                                <input
                                                    type="url"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleInputChange}
                                                    className="neo-input"
                                                    placeholder="https://yourwebsite.com"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Instagram <span className={styles.optionalTag}>(Optional)</span></label>
                                                <input
                                                    type="text"
                                                    name="instagram"
                                                    value={formData.instagram}
                                                    onChange={handleInputChange}
                                                    className="neo-input"
                                                    placeholder="@username"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Step 2: Upload Paintings */}
                    <section className="step-card">
                        <div className="step-header" style={{ background: 'var(--color-pink)' }}>
                            <span className="step-number">2</span>
                            <h2 className="step-title">Upload Paintings <span className={styles.required}>*</span> ({formData.paintings.length}/{GALLERY_OPTIONS.maxPaintings})</h2>
                        </div>
                        <div className="step-content">
                            <p className={styles.stepNote}>📌 Drag & drop images here or click to upload</p>
                            {/* Hidden input for adding new paintings via ADD button */}
                            <input
                                ref={addPaintingInputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={handleAddPaintingFile}
                                hidden
                                multiple
                            />
                            {/* Drop Zone with Painting Thumbnails Grid */}
                            <div
                                className={`painting-grid ${isDragging ? styles.dropZoneActive : ''}`}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {isDragging && (
                                    <div className={styles.dropOverlay}>
                                        <span className={styles.dropIcon}>📥</span>
                                        <span className={styles.dropText}>Drop images here</span>
                                    </div>
                                )}
                                {formData.paintings.map((painting, index) => (
                                    <div
                                        key={painting.id}
                                        className={`painting-thumb ${formData.selectedPaintingIndex === index ? 'active' : ''}`}
                                        onClick={() => handleThumbnailClick(index)}
                                    >
                                        {painting.preview ? (
                                            <img src={painting.preview} alt={`Painting ${painting.id}`} />
                                        ) : (
                                            <>
                                                <span className="painting-number">{painting.id}</span>
                                                <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                                                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>Click to upload</span>
                                            </>
                                        )}
                                        {formData.paintings.length > 1 && (
                                            <button
                                                type="button"
                                                className={styles.removeBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemovePainting(index);
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {formData.paintings.length < GALLERY_OPTIONS.maxPaintings && (
                                    <div
                                        className="painting-thumb painting-add"
                                        onClick={handleAddPainting}
                                        title="Click to add new painting"
                                    >
                                        <span className="painting-number">+</span>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>ADD IMAGE</span>
                                    </div>
                                )}
                            </div>

                            {/* Selected Painting Editor */}
                            <div className={styles.paintingEditor}>
                                <div className={styles.paintingEditorHeader}>
                                    <span className={styles.selectedLabel}>✏️ Editing: Painting {selectedPainting.id}</span>
                                </div>

                                <div className={styles.paintingEditorContent}>
                                    {/* Image Upload */}
                                    <input
                                        ref={paintingInputRef}
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handlePaintingImageChange}
                                        hidden
                                    />
                                    <div
                                        className={`upload-box upload-box-large ${styles.paintingUploadBox}`}
                                        onClick={() => paintingInputRef.current?.click()}
                                    >
                                        {selectedPainting.preview ? (
                                            <img
                                                src={selectedPainting.preview}
                                                alt="Painting preview"
                                                className={styles.paintingUploadPreview}
                                            />
                                        ) : (
                                            <>
                                                <span className="upload-icon">🖼️</span>
                                                <span className="upload-text">Click to upload image <span className={styles.required}>*</span></span>
                                            </>
                                        )}
                                    </div>

                                    {/* Painting Details - Optional */}
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Title <span className={styles.optional}>(Optional)</span></label>
                                            <input
                                                type="text"
                                                value={selectedPainting.title}
                                                onChange={(e) => handlePaintingFieldChange('title', e.target.value)}
                                                className="neo-input"
                                                placeholder="Painting title"
                                                maxLength={CHAR_LIMITS.paintingTitle}
                                            />
                                            <CharCounter current={selectedPainting.title.length} max={CHAR_LIMITS.paintingTitle} />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Description <span className={styles.optional}>(Optional)</span></label>
                                            <textarea
                                                value={selectedPainting.description}
                                                onChange={(e) => handlePaintingFieldChange('description', e.target.value)}
                                                className="neo-textarea"
                                                placeholder="Tell us about this painting..."
                                                rows={3}
                                                maxLength={CHAR_LIMITS.paintingDescription}
                                            />
                                            <CharCounter current={selectedPainting.description.length} max={CHAR_LIMITS.paintingDescription} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Step 3: Gallery Settings */}
                    <section className="step-card">
                        <div className="step-header" style={{ background: 'var(--color-cyan)' }}>
                            <span className="step-number">3</span>
                            <h2 className="step-title">Gallery Settings</h2>
                        </div>
                        <div className="step-content">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Gallery Name</label>
                                    <input
                                        type="text"
                                        name="galleryName"
                                        value={formData.galleryName}
                                        onChange={handleGalleryNameChange}
                                        className="neo-input"
                                        placeholder="My Amazing Art Gallery"
                                        maxLength={CHAR_LIMITS.galleryName}
                                        required
                                    />
                                    <CharCounter current={formData.galleryName.length} max={CHAR_LIMITS.galleryName} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Gallery URL</label>
                                    <div className="url-preview">
                                        <span className="url-prefix">/@username/</span>
                                        <span className={styles.slugDisplay}>{formData.gallerySlug}</span>
                                    </div>
                                    <span className={styles.hint}>Auto-generated from gallery name</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description <span className={styles.optionalTag}>(Optional)</span></label>
                                    <textarea
                                        name="galleryDescription"
                                        value={formData.galleryDescription}
                                        onChange={handleInputChange}
                                        className="neo-textarea"
                                        placeholder="Describe your gallery exhibition..."
                                        rows={2}
                                        maxLength={CHAR_LIMITS.galleryDescription}
                                    />
                                    <CharCounter current={formData.galleryDescription.length} max={CHAR_LIMITS.galleryDescription} />
                                </div>

                                {/* Environment Selection */}
                                <div className="form-group">
                                    <label className="form-label">Environment <span className={styles.required}>*</span></label>
                                    <div className={styles.optionGrid}>
                                        {GALLERY_OPTIONS.environments.map((env) => (
                                            <button
                                                key={env.id}
                                                type="button"
                                                className={`${styles.optionCard} ${formData.environment === env.id ? styles.optionCardActive : ''}`}
                                                onClick={() => handleSelectOption('environment', env.id)}
                                            >
                                                <div className={styles.optionImage}>
                                                    <img src={env.image} alt={env.label} />
                                                </div>
                                                <span className={styles.optionLabel}>{env.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Character Selection */}
                                <div className="form-group">
                                    <label className="form-label">Character <span className={styles.required}>*</span></label>
                                    <div className={styles.optionGrid}>
                                        {GALLERY_OPTIONS.characters.map((char) => (
                                            <button
                                                key={char.id}
                                                type="button"
                                                className={`${styles.optionCard} ${formData.character === char.id ? styles.optionCardActive : ''}`}
                                                onClick={() => handleSelectOption('character', char.id)}
                                            >
                                                <div className={styles.optionImage}>
                                                    <img src={char.image} alt={char.label} />
                                                </div>
                                                <span className={styles.optionLabel}>{char.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 
                                  ============================================
                                  FUTURE VERSION FEATURES - Currently disabled
                                  ============================================
                                */}

                                {/* Theme Selection - Coming in future version */}
                                {/* 
                                <div className="form-group">
                                    <label className="form-label">UI Theme</label>
                                    <div className="select-grid">
                                        {GALLERY_OPTIONS.themes.map((theme) => (
                                            <button
                                                key={theme.id}
                                                type="button"
                                                className={`select-chip ${formData.theme === theme.id ? 'active' : ''}`}
                                                onClick={() => handleSelectOption('theme', theme.id)}
                                            >
                                                <span>{theme.icon}</span>
                                                <span>{theme.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                */}

                                {/* Footsteps & Watermark Options - Coming in future version */}
                                {/*
                                <div className={styles.optionsRow}>
                                    <label className="neo-checkbox">
                                        <input
                                            type="checkbox"
                                            name="enableFootsteps"
                                            checked={formData.enableFootsteps}
                                            onChange={handleInputChange}
                                        />
                                        <span>Enable Footsteps</span>
                                    </label>

                                    {formData.enableFootsteps && (
                                        <div className="slider-container">
                                            <span className="form-label">Volume:</span>
                                            <input
                                                type="range"
                                                name="footstepsVolume"
                                                min="0"
                                                max="100"
                                                value={formData.footstepsVolume}
                                                onChange={handleInputChange}
                                                className="neo-range"
                                            />
                                            <span className="slider-value">{formData.footstepsVolume}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.optionsRow}>
                                    <label className="neo-checkbox">
                                        <input
                                            type="checkbox"
                                            name="showWatermark"
                                            checked={formData.showWatermark}
                                            onChange={handleInputChange}
                                        />
                                        <span>Show Watermark</span>
                                    </label>
                                </div>
                                */}
                            </div>
                        </div>
                    </section>

                    {/* Terms & Conditions Checkbox */}
                    <div className={styles.termsContainer}>
                        <label className="neo-checkbox">
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleInputChange}
                            />
                            <span>
                                I agree to the <a href="/terms" target="_blank" className={styles.termsLink}>Terms & Conditions</a> <span className={styles.required}>*</span>
                            </span>
                        </label>
                    </div>

                    {/* Error Popup Modal */}
                    {submitError && (
                        <div className={styles.modalOverlay} onClick={() => setSubmitError(null)}>
                            <div className={styles.errorModal} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.errorModalHeader}>
                                    <span className={styles.errorIcon}>⚠️</span>
                                    <h3>Error</h3>
                                </div>
                                <div className={styles.errorModalContent}>
                                    <p>{submitError}</p>
                                </div>
                                <button
                                    className={styles.errorModalBtn}
                                    onClick={() => setSubmitError(null)}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button
                            type="submit"
                            className="neo-btn neo-btn--primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '⏳ Publishing...' : '🚀 Publish Gallery'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Publishing Modal */}
            {isSubmitting && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Publishing Gallery...</h2>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.spinner}></div>
                            <p>Please wait while we create your gallery</p>
                            <p className={styles.subText}>This may take a few moments</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>🎉 Gallery Published!</h2>
                        </div>
                        <div className={styles.modalContent}>
                            <p>Your gallery is now live and ready to share!</p>
                            <div className={styles.galleryUrlBox}>
                                <span className={styles.galleryUrlLabel}>Gallery URL:</span>
                                <code className={styles.galleryUrl}>{publishedGalleryUrl}</code>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.copyButton}
                                onClick={handleCopyLink}
                            >
                                Copy Link
                            </button>
                            <button
                                type="button"
                                className={styles.visitButton}
                                onClick={handleVisitGallery}
                            >
                                Visit Gallery
                            </button>
                        </div>
                        <button
                            type="button"
                            className={styles.closeModalButton}
                            onClick={() => setShowSuccessModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
