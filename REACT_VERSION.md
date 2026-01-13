# Hargao React App v0

**Version:** 0.1.0  
**Last Updated:** January 2026

This document details the data structures, variables, and Firebase writes for the Hargao Gallery Creator React application.

---

## Table of Contents

1. [Form Data Structure](#form-data-structure)
2. [Firebase Collections](#firebase-collections)
3. [User Document](#user-document)
4. [Gallery Document](#gallery-document)
5. [Usernames Document](#usernames-document)
6. [Firebase Storage Structure](#firebase-storage-structure)
7. [Environment Variables](#environment-variables)
8. [Examples](#examples)

---

## Form Data Structure

The create form collects the following data:

```typescript
interface FormData {
    // Account (Required)
    email: string;              // User's email address
    password: string;           // Password (min 8 chars, letters, numbers, special chars)
    confirmPassword: string;    // Must match password

    // Artist Profile
    profileImage: File | null;       // Profile photo file
    profileImagePreview: string | null;  // Base64 preview URL
    username: string;           // Unique username (lowercase, no spaces)
    bio: string;                // Artist biography (optional)
    website: string;            // Website URL (optional)
    instagram: string;          // Instagram handle (optional)

    // Gallery Settings
    galleryName: string;        // Display name for gallery
    gallerySlug: string;        // URL-safe slug (auto-generated from galleryName)
    galleryDescription: string; // Gallery description (optional)
    environment: number;        // Environment/level ID (0-3)
    character: number;          // Character type ID (0-1)
    
    // Future versions (hidden in v0)
    uiTheme: number;            // UI theme ID (0-4), default: 4
    enableFootsteps: boolean;   // Enable footstep sounds, default: true
    footstepsVolume: number;    // Volume 0-100, default: 50
    showWatermark: boolean;     // Show Hargao watermark, default: true

    // Paintings
    paintings: Painting[];      // Array of painting objects
    selectedPaintingIndex: number;  // Currently selected painting

    // Terms & Conditions
    agreeToTerms: boolean;      // Must be true to submit
}

interface Painting {
    id: number;                 // Unique ID (1-10)
    file: File | null;          // Image file
    preview: string | null;     // Base64 preview URL
    title: string;              // Painting title (optional)
    description: string;        // Painting description (optional)
}
```

### Environment Options

| ID | Name | Description |
|----|------|-------------|
| 0 | Brutalist Art Gallery | Modern brutalist architecture |
| 1 | Classical Museum | Traditional museum setting |
| 2 | Salt Flat | Open desert environment |
| 3 | Color Scream | Vibrant colorful space |

### Character Options

| ID | Name | Description |
|----|------|-------------|
| 0 | Female | Female character model |
| 1 | Mannequin | Gender-neutral mannequin |

### UI Theme Options

| ID | Name | Description |
|----|------|-------------|
| 0 | Light | Light mode interface |
| 1 | Dark | Dark mode interface |
| 2 | Minimal | Minimal UI elements |
| 3 | Retro | Retro-styled interface |
| 4 | Classic macOS | Classic Mac OS style (default) |

---

## Firebase Collections

The app writes to the following Firestore collections:

### 1. `users` Collection

Stores user profile information.

**Document ID:** Firebase Auth UID

```typescript
interface User {
    uid: string;
    email: string;
    username: string;           // Lowercase, unique
    displayName: string;
    photoURL: string | null;    // Storage URL
    bio: string;
    links: {
        website: string | null;
        instagram: string | null;
        twitter: string | null;
        youtube: string | null;
    };
    tier: 'free' | 'pro' | 'enterprise' | 'admin';
    maxGalleries: number;       // 3 for free, 10 for pro, unlimited for enterprise
    galleriesCount: number;     // Current gallery count
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
```

### 2. `galleries` Collection

Stores gallery data including paintings.

**Document ID:** Auto-generated

```typescript
interface Gallery {
    id: string;                 // Firestore document ID
    ownerId: string;            // User's UID
    ownerUsername: string;      // User's username
    name: string;               // Gallery display name
    slug: string;               // URL-safe slug
    description: string;
    
    // Environment settings
    environment: {
        level: number;          // 0-3
        character: number;      // 0-1
    };
    
    // UI settings
    uiTheme: number;            // 0-4
    
    // Audio settings
    audio: {
        enableFootsteps: boolean;
        footstepsVolume: number;
    };
    
    // Branding
    branding: {
        showWatermark: boolean;
    };
    
    // Paintings array
    paintings: GalleryPainting[];
    
    // Stats
    viewCount: number;
    
    // Status
    isPublished: boolean;
    
    // Timestamps
    createdAt: Timestamp;
    updatedAt: Timestamp;
    publishedAt: Timestamp | null;
}

interface GalleryPainting {
    id: number;                 // 1-10
    imageUrl: string;           // Storage download URL
    storagePath: string;        // Full storage path
    title: string;
    description: string;
    width: number;              // Image width in pixels
    height: number;             // Image height in pixels
    order: number;              // Display order
}
```

### 3. `usernames` Collection

Lookup table for username uniqueness checking.

**Document ID:** Username (lowercase)

```typescript
interface UsernameDoc {
    uid: string;                // Owner's UID
    createdAt: Timestamp;
}
```

---

## Firebase Storage Structure

```
storage/
├── users/
│   └── {userId}/
│       └── profile.jpg        # Profile image
│
└── galleries/
    └── {galleryId}/
        ├── painting_1.jpg     # Painting images
        ├── painting_2.jpg
        └── ...
```

### Image Specifications

| Type | Max Size | Formats | Notes |
|------|----------|---------|-------|
| Profile Image | 5MB | JPG, PNG, GIF, WebP | Stored as `profile.jpg` |
| Painting Image | 10MB | JPG, PNG, GIF, WebP | Named `painting_{id}.{ext}` |

---

## Environment Variables

Required in `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Admin
NEXT_PUBLIC_ADMIN_PASSWORD=your-admin-password
```

---

## Examples

### Example 1: New User Registration

**Input (Form Data):**
```javascript
{
    email: "artist@example.com",
    password: "SecureP@ss123!",
    username: "johndoe",
    bio: "Digital artist from NYC",
    website: "https://johndoe.art",
    instagram: "johndoe_art"
}
```

**Writes to Firestore `users` collection:**
```javascript
// Document ID: "abc123xyz" (Firebase Auth UID)
{
    uid: "abc123xyz",
    email: "artist@example.com",
    username: "johndoe",
    displayName: "johndoe",
    photoURL: null,
    bio: "Digital artist from NYC",
    links: {
        website: "https://johndoe.art",
        instagram: "johndoe_art",
        twitter: null,
        youtube: null
    },
    tier: "free",
    maxGalleries: 3,
    galleriesCount: 0,
    createdAt: Timestamp,
    updatedAt: Timestamp
}
```

**Writes to Firestore `usernames` collection:**
```javascript
// Document ID: "johndoe"
{
    uid: "abc123xyz",
    createdAt: Timestamp
}
```

---

### Example 2: Gallery Creation

**Input (Form Data):**
```javascript
{
    galleryName: "Abstract Dreams",
    gallerySlug: "abstract-dreams",
    galleryDescription: "A collection of abstract digital art",
    environment: 1,  // Classical Museum
    character: 0,    // Female
    paintings: [
        { id: 1, file: File, title: "Sunset Waves", description: "Ocean at dusk" },
        { id: 2, file: File, title: "City Lights", description: "" }
    ]
}
```

**Writes to Firebase Storage:**
```
galleries/gal_xyz123/painting_1.jpg  → Returns URL
galleries/gal_xyz123/painting_2.jpg  → Returns URL
```

**Writes to Firestore `galleries` collection:**
```javascript
// Document ID: "gal_xyz123" (auto-generated)
{
    id: "gal_xyz123",
    ownerId: "abc123xyz",
    ownerUsername: "johndoe",
    name: "Abstract Dreams",
    slug: "abstract-dreams",
    description: "A collection of abstract digital art",
    environment: {
        level: 1,
        character: 0
    },
    uiTheme: 4,
    audio: {
        enableFootsteps: true,
        footstepsVolume: 50
    },
    branding: {
        showWatermark: true
    },
    paintings: [
        {
            id: 1,
            imageUrl: "https://firebasestorage.googleapis.com/.../painting_1.jpg",
            storagePath: "galleries/gal_xyz123/painting_1.jpg",
            title: "Sunset Waves",
            description: "Ocean at dusk",
            width: 1920,
            height: 1080,
            order: 1
        },
        {
            id: 2,
            imageUrl: "https://firebasestorage.googleapis.com/.../painting_2.jpg",
            storagePath: "galleries/gal_xyz123/painting_2.jpg",
            title: "City Lights",
            description: "",
            width: 1600,
            height: 1200,
            order: 2
        }
    ],
    viewCount: 0,
    isPublished: true,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    publishedAt: Timestamp
}
```

**Updates Firestore `users` collection:**
```javascript
// Increments galleriesCount
{
    galleriesCount: 1  // Was 0, now 1
}
```

---

### Example 3: Gallery URL Structure

After creation, the gallery is accessible at:

```
https://yourdomain.com/@{username}/{gallery-slug}
```

Example:
```
https://hargao.io/@johndoe/abstract-dreams
```

---

## Reserved Usernames

The following usernames are blocked:

```javascript
const RESERVED_USERNAMES = [
    'admin', 'administrator', 'root', 'system',
    'moderator', 'mod', 'support', 'help',
    'hargao', 'api', 'www', 'mail', 'ftp',
    'localhost', 'null', 'undefined', 'test', 'demo'
];
```

---

## Password Requirements

- Minimum 8 characters
- Must contain at least one letter (a-z, A-Z)
- Must contain at least one number (0-9)
- Must contain at least one special character (!@#$%^&*...)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | Jan 2026 | Initial release - Create gallery form, Firebase integration |

---

## Future Versions

### v0.2.0 (Planned)
- [ ] User login/dashboard
- [ ] Edit existing galleries
- [ ] Delete own galleries

### v0.3.0 (Planned)
- [ ] UI Theme selection (currently hidden)
- [ ] Audio settings (currently hidden)
- [ ] Watermark toggle (currently hidden)

### v1.0.0 (Planned)
- [ ] Pro tier features
- [ ] Analytics dashboard
- [ ] Custom domains
