'use client';

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { BRAND_CONFIG, GALLERY_OPTIONS } from '@/config';
import styles from './create.module.css';

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
    theme: string;
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
        environment: 1,
        character: 1,
        // Future versions - defaults
        theme: 'dark',
        enableFootsteps: true,
        footstepsVolume: 50,
        showWatermark: true,

        paintings: [
            { id: 1, file: null, preview: null, title: '', description: '' }
        ],
        selectedPaintingIndex: 0,

        // Terms & Conditions
        agreeToTerms: false,
    });

    const profileInputRef = useRef<HTMLInputElement>(null);
    const paintingInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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

    const handleAddPainting = () => {
        if (formData.paintings.length < GALLERY_OPTIONS.maxPaintings) {
            const newId = formData.paintings.length + 1;
            setFormData(prev => ({
                ...prev,
                paintings: [
                    ...prev.paintings,
                    { id: newId, file: null, preview: null, title: '', description: '' }
                ],
                selectedPaintingIndex: prev.paintings.length,
            }));
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

    const handleSubmit = (e: FormEvent, isDraft: boolean) => {
        e.preventDefault();

        // Basic validation
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.username) {
            alert('Please fill in all required fields (marked with *)');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (!formData.paintings.some(p => p.file)) {
            alert('Please upload at least one painting');
            return;
        }

        if (!formData.agreeToTerms) {
            alert('Please agree to the Terms & Conditions');
            return;
        }

        console.log('Form submitted:', { ...formData, isDraft });
        // TODO: Implement form submission logic
        alert(isDraft ? 'Draft saved!' : 'Gallery published!');
    };

    const selectedPainting = formData.paintings[formData.selectedPaintingIndex];

    return (
        <main className={styles.main}>
            <div className="page-container">
                {/* Page Header */}
                <header className="page-header">
                    <h1>Hargao - Create Your Gallery</h1>
                    <p>Build your immersive virtual art exhibition</p>
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
                                                placeholder="Enter password"
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
                                                onChange={handleInputChange}
                                                className="neo-input"
                                                placeholder="Your username"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Bio</label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                className="neo-textarea"
                                                placeholder="Tell us about yourself and your art..."
                                                rows={3}
                                            />
                                        </div>

                                        <div className={styles.twoColumns}>
                                            <div className="form-group">
                                                <label className="form-label">Website</label>
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
                                                <label className="form-label">Instagram</label>
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
                            <p className={styles.stepNote}>📌 At least one painting is required</p>
                            {/* Painting Thumbnails Grid */}
                            <div className="painting-grid">
                                {formData.paintings.map((painting, index) => (
                                    <div
                                        key={painting.id}
                                        className={`painting-thumb ${formData.selectedPaintingIndex === index ? 'active' : ''}`}
                                        onClick={() => handleSelectPainting(index)}
                                    >
                                        {painting.preview ? (
                                            <img src={painting.preview} alt={`Painting ${painting.id}`} />
                                        ) : (
                                            <>
                                                <span className="painting-number">{painting.id}</span>
                                                <span style={{ fontSize: '1.5rem' }}>🖼️</span>
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
                                    >
                                        <span className="painting-number">+</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>ADD</span>
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
                                        accept="image/*"
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
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Description <span className={styles.optional}>(Optional)</span></label>
                                            <textarea
                                                value={selectedPainting.description}
                                                onChange={(e) => handlePaintingFieldChange('description', e.target.value)}
                                                className="neo-textarea"
                                                placeholder="Tell us about this painting..."
                                                rows={3}
                                            />
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
                                    <label className="form-label">Gallery Name <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        name="galleryName"
                                        value={formData.galleryName}
                                        onChange={handleGalleryNameChange}
                                        className="neo-input"
                                        placeholder="My Amazing Art Gallery"
                                        required
                                    />
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
                                    <label className="form-label">Description</label>
                                    <textarea
                                        name="galleryDescription"
                                        value={formData.galleryDescription}
                                        onChange={handleInputChange}
                                        className="neo-textarea"
                                        placeholder="Describe your gallery exhibition..."
                                        rows={2}
                                    />
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

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button type="submit" className="neo-btn neo-btn--primary">
                            🚀 Publish Gallery
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
