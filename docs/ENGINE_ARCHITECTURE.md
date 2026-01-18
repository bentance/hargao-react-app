# 3D Engine Architecture & Three.js Migration Guide

This document describes the engine abstraction layer architecture and provides a complete guide for migrating from Babylon.js to Three.js.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Core Interfaces](#core-interfaces)
4. [Gallery Data Structures](#gallery-data-structures)
5. [Three.js Migration Guide](#threejs-migration-guide)
6. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

The application uses an **Engine Abstraction Layer** that allows swapping between different 3D rendering engines (Babylon.js, Three.js, etc.) without modifying the React application code.

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                        │
│  (Next.js pages, components, forms)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Engine Abstraction Layer                   │
│  - I3DEngine interface                                      │
│  - EngineFactory                                            │
│  - EngineGalleryViewer component                           │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│    BabylonEngine        │     │    ThreeEngine          │
│   (Current - Working)   │     │   (Placeholder)         │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   src/babylon/          │     │   (To be implemented)   │
│   - app.ts              │     │   - Scene setup         │
│   - player.ts           │     │   - Player controller   │
│   - ui.ts               │     │   - UI overlay          │
│   - builders/           │     │   - Level builders      │
└─────────────────────────┘     └─────────────────────────┘
```

---

## Directory Structure

```
src/
├── engine/                          # Engine Abstraction Layer
│   ├── index.ts                     # Main exports
│   ├── types.ts                     # Core interfaces
│   ├── EngineFactory.ts             # Engine creation factory
│   ├── babylon/                     # Babylon.js implementation
│   │   ├── index.ts
│   │   └── BabylonEngine.ts         # Adapter for Babylon.js App
│   └── threejs/                     # Three.js implementation
│       ├── index.ts
│       └── ThreeEngine.ts           # Placeholder (implement this)
│
├── babylon/                         # Current Babylon.js code
│   ├── app.ts                       # Main application class
│   ├── config.ts                    # Runtime configuration
│   ├── environment.ts               # Level/environment creation
│   ├── player.ts                    # Player controller
│   ├── ui.ts                        # UI overlay system
│   ├── mobileController.ts          # Touch controls
│   ├── inputController.ts           # Keyboard/mouse input
│   ├── navigationController.ts      # Gallery navigation
│   ├── builders/                    # Level builders
│   │   ├── LevelBuilder.ts          # Base class
│   │   ├── GalleryBuilder.ts        # Brutalist gallery
│   │   ├── MuseumBuilder.ts         # Classical museum
│   │   ├── FreestandingArtBuilder.ts # Salt flat
│   │   └── ColorScreamBuilder.ts    # Abstract level
│   └── levels/                      # Level configurations
│       ├── list.ts                  # Level registry
│       ├── level1.ts - level4.ts    # Individual levels
│
├── components/
│   ├── GalleryViewer.tsx            # Original Babylon.js viewer
│   └── EngineGalleryViewer.tsx      # New engine-agnostic viewer
│
└── types/
    └── firebase.ts                  # Data type definitions
```

---

## Core Interfaces

### I3DEngine Interface

This is the main interface that any 3D engine must implement:

```typescript
interface I3DEngine {
    // Identification
    readonly name: string;      // e.g., "Babylon.js" or "Three.js"
    readonly version: string;   // e.g., "7.0"

    // Lifecycle
    initialize(canvas: HTMLCanvasElement, config: EngineConfig): Promise<void>;
    dispose(): void;
    isInitialized(): boolean;

    // Data
    setGalleryData(data: EngineGalleryData): void;
    setUserData(data: EngineUserData): void;

    // Navigation
    changeLevel(levelId: number): Promise<void>;
    changeGallery(offset: number): Promise<void>;

    // Rendering
    run(): void;
    pause(): void;
    resume(): void;

    // Utilities
    screenshot(): Promise<Blob>;

    // Events
    on<K extends keyof EngineEvents>(event: K, handler: EngineEvents[K]): void;
    off<K extends keyof EngineEvents>(event: K, handler?: EngineEvents[K]): void;
}
```

### EngineConfig

Configuration passed when initializing the engine:

```typescript
interface EngineConfig {
    mode: 'default' | 'explore' | 'admin';
    source: 'online' | 'offline';
    galleryData?: EngineGalleryData;
    userData?: EngineUserData;
}
```

---

## Gallery Data Structures

These are the JSON structures the 3D engine needs to render a gallery.

### Gallery Data (from Firebase/API)

```json
{
    "environment": {
        "level": 1,
        "character": 1,
        "uiTheme": 4
    },
    "audio": {
        "enableFootsteps": true,
        "footstepsVolume": 4
    },
    "branding": {
        "showWatermark": true
    },
    "paintings": [
        {
            "id": 1,
            "title": "Sunset Dreams",
            "description": "An abstract representation of a coastal sunset.",
            "imageUrl": "https://firebasestorage.googleapis.com/.../painting_1.jpg"
        },
        {
            "id": 2,
            "title": "Urban Rhythm",
            "description": "City life captured in bold strokes.",
            "imageUrl": "https://firebasestorage.googleapis.com/.../painting_2.jpg"
        }
    ]
}
```

### User/Artist Data

```json
{
    "displayName": "Jane Artist",
    "bio": "Contemporary artist exploring the intersection of nature and technology.",
    "photoURL": "https://firebasestorage.googleapis.com/.../profile.jpg",
    "links": {
        "website": "https://janeartist.com",
        "instagram": "@janeartist"
    }
}
```

### Complete Gallery Document (Firebase Firestore)

```json
{
    "id": "abc123",
    "ownerId": "user_uid_here",
    "ownerUsername": "janeartist",
    "slug": "my-first-gallery",
    
    "name": "My First Gallery",
    "description": "A collection of my recent works.",
    
    "isPublished": true,
    "publishedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-10T14:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    
    "access": {
        "isPasswordProtected": false,
        "passwordHash": null
    },
    
    "branding": {
        "showWatermark": true,
        "customWatermark": null
    },
    
    "environment": {
        "level": 1,
        "character": 1,
        "uiTheme": 4
    },
    
    "audio": {
        "enableFootsteps": true,
        "footstepsVolume": 4,
        "backgroundMusic": null,
        "backgroundMusicVolume": 5
    },
    
    "paintings": [
        {
            "id": 1,
            "title": "Artwork Title",
            "description": "Description of the artwork",
            "imageUrl": "https://..."
        }
    ],
    
    "stats": {
        "viewCount": 142,
        "uniqueVisitors": 89,
        "lastViewedAt": "2024-01-20T08:45:00Z"
    }
}
```

### User Document (Firebase Firestore)

```json
{
    "uid": "firebase_auth_uid",
    "username": "janeartist",
    "email": "jane@example.com",
    
    "displayName": "Jane Artist",
    "photoURL": "https://...",
    "bio": "Contemporary artist...",
    
    "links": {
        "website": "https://janeartist.com",
        "instagram": "@janeartist",
        "twitter": null,
        "youtube": null
    },
    
    "tier": "free",
    "maxGalleries": 3,
    "galleriesCount": 1,
    
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Level Configuration

Each level has this structure (used by builders):

```typescript
interface LevelData {
    id: number;                          // 1-4
    name: string;                        // "Brutalist Art Gallery"
    description: string;                 // "Outdoor wall gallery"
    
    // Ground settings
    groundSize?: { width: number; height: number };
    groundTexture?: string;              // Path to texture file
    groundColor?: { r: number; g: number; b: number };
    
    // Wall settings (for enclosed levels)
    hasWalls?: boolean;
    hasCeiling?: boolean;
    wallHeight?: number;
    wallColor?: { r: number; g: number; b: number };
    ceilingColor?: { r: number; g: number; b: number };
    
    // Environment type
    hasFreestandingArt?: boolean;        // Salt Flat style
    hasFloatingShapes?: boolean;         // Color Scream style
    
    // Skybox
    skyboxType?: 'procedural' | 'cubemap';
    skyboxPath?: string;
    
    // Lighting
    lightIntensity?: number;
    ambientColor?: { r: number; g: number; b: number };
    
    // Player spawn
    spawnPosition?: { x: number; y: number; z: number };
}
```

### Environment Levels Reference

| Level ID | Name | Description | Builder Class |
|----------|------|-------------|---------------|
| 1 | Brutalist Art Gallery | Outdoor single wall gallery | `GalleryBuilder` |
| 2 | Classical Museum | Indoor 4-wall room with ceiling | `MuseumBuilder` |
| 3 | Salt Flat | Freestanding displays on white ground | `FreestandingArtBuilder` |
| 4 | Color Scream | Abstract floating shapes | `ColorScreamBuilder` |

### Character IDs

| ID | Character |
|----|-----------|
| 1 | Female |
| 2 | Mannequin |

### UI Theme IDs

| ID | Theme | Description |
|----|-------|-------------|
| 0 | Classic Dark | Gold accents on dark |
| 1 | Light Minimal | Clean white |
| 2 | Neon Cyberpunk | Pink/cyan glow |
| 3 | Elegant Museum | Warm brown tones |
| 4 | Classic macOS | Aqua-inspired (default) |

---

## Three.js Migration Guide

### Step 1: Install Dependencies

```bash
npm install three @types/three
npm install @react-three/fiber @react-three/drei  # Optional: React bindings
```

### Step 2: Create Core Three.js Setup

Create `src/engine/threejs/core/`:

```typescript
// Renderer.ts
import { WebGLRenderer } from 'three';

export function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer {
    const renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    return renderer;
}
```

```typescript
// Scene.ts
import { Scene, Color } from 'three';

export function createScene(): Scene {
    const scene = new Scene();
    scene.background = new Color(0x87ceeb); // Sky blue
    return scene;
}
```

```typescript
// Camera.ts
import { PerspectiveCamera } from 'three';

export function createCamera(): PerspectiveCamera {
    const camera = new PerspectiveCamera(
        75,                                    // FOV
        window.innerWidth / window.innerHeight, // Aspect
        0.1,                                   // Near
        1000                                   // Far
    );
    camera.position.set(0, 1.6, 5);
    return camera;
}
```

### Step 3: Implement ThreeEngine

Update `src/engine/threejs/ThreeEngine.ts`:

```typescript
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import type { I3DEngine, EngineConfig, EngineGalleryData, EngineUserData } from '../types';

export class ThreeEngine implements I3DEngine {
    readonly name = 'Three.js';
    readonly version = 'r158';

    private renderer: WebGLRenderer | null = null;
    private scene: Scene | null = null;
    private camera: PerspectiveCamera | null = null;
    private animationId: number | null = null;
    private initialized = false;

    async initialize(canvas: HTMLCanvasElement, config: EngineConfig): Promise<void> {
        // Create renderer
        this.renderer = new WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        // Create scene
        this.scene = new Scene();

        // Create camera
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 5);

        // Load level based on config
        await this.loadLevel(config.galleryData?.environment.level || 1);

        // Load paintings
        if (config.galleryData?.paintings) {
            await this.loadPaintings(config.galleryData.paintings);
        }

        this.initialized = true;
    }

    private async loadLevel(levelId: number): Promise<void> {
        // Create ground, walls, lighting based on level
        // Use different builders similar to Babylon.js
    }

    private async loadPaintings(paintings: EngineGalleryData['paintings']): Promise<void> {
        // Create plane meshes for each painting
        // Load textures from imageUrl
    }

    run(): void {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            this.renderer?.render(this.scene!, this.camera!);
        };
        animate();
    }

    dispose(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.renderer?.dispose();
        this.scene = null;
        this.camera = null;
        this.initialized = false;
    }

    // ... implement other interface methods
}
```

### Step 4: Create Level Builders

Create Three.js equivalents of the Babylon.js builders:

```typescript
// src/engine/threejs/builders/BaseBuilder.ts
import { Scene, Mesh, PlaneGeometry, MeshStandardMaterial, TextureLoader } from 'three';

export abstract class BaseThreeBuilder {
    protected scene: Scene;
    protected textureLoader: TextureLoader;

    constructor(scene: Scene) {
        this.scene = scene;
        this.textureLoader = new TextureLoader();
    }

    protected createPaintingPlane(
        width: number,
        height: number,
        imageUrl: string,
        position: { x: number; y: number; z: number }
    ): Mesh {
        const geometry = new PlaneGeometry(width, height);
        const material = new MeshStandardMaterial();
        
        this.textureLoader.load(imageUrl, (texture) => {
            material.map = texture;
            material.needsUpdate = true;
        });

        const mesh = new Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        this.scene.add(mesh);
        
        return mesh;
    }

    abstract build(): Promise<void>;
}
```

### Step 5: Create Player Controller

```typescript
// src/engine/threejs/controllers/PlayerController.ts
import { PerspectiveCamera, Vector3 } from 'three';

export class ThreePlayerController {
    private camera: PerspectiveCamera;
    private velocity = new Vector3();
    private moveSpeed = 5;
    private keys = { w: false, a: false, s: false, d: false };

    constructor(camera: PerspectiveCamera) {
        this.camera = camera;
        this.setupInputListeners();
    }

    private setupInputListeners(): void {
        document.addEventListener('keydown', (e) => {
            if (e.key in this.keys) this.keys[e.key as keyof typeof this.keys] = true;
        });
        document.addEventListener('keyup', (e) => {
            if (e.key in this.keys) this.keys[e.key as keyof typeof this.keys] = false;
        });
    }

    update(deltaTime: number): void {
        const direction = new Vector3();
        if (this.keys.w) direction.z -= 1;
        if (this.keys.s) direction.z += 1;
        if (this.keys.a) direction.x -= 1;
        if (this.keys.d) direction.x += 1;
        
        direction.normalize().multiplyScalar(this.moveSpeed * deltaTime);
        this.camera.position.add(direction);
    }
}
```

### Step 6: Babylonjs → Three.js Equivalents

| Babylon.js | Three.js |
|------------|----------|
| `Engine` | `WebGLRenderer` |
| `Scene` | `Scene` |
| `ArcRotateCamera` | `PerspectiveCamera` + `OrbitControls` |
| `UniversalCamera` | `PerspectiveCamera` + custom controls |
| `HemisphericLight` | `HemisphereLight` |
| `DirectionalLight` | `DirectionalLight` |
| `StandardMaterial` | `MeshStandardMaterial` |
| `MeshBuilder.CreateBox()` | `new BoxGeometry()` + `new Mesh()` |
| `MeshBuilder.CreatePlane()` | `new PlaneGeometry()` + `new Mesh()` |
| `MeshBuilder.CreateGround()` | `new PlaneGeometry()` rotated |
| `Texture` | `TextureLoader().load()` |
| `ShadowGenerator` | `DirectionalLight.shadow` |
| `SceneLoader.ImportMesh()` | `GLTFLoader().load()` |
| `AdvancedDynamicTexture` (GUI) | HTML/CSS overlay or `troika-three-text` |

---

## Implementation Checklist

### Phase 1: Core Setup
- [ ] Install Three.js and types
- [ ] Create basic renderer, scene, camera
- [ ] Implement `ThreeEngine.initialize()`
- [ ] Implement `ThreeEngine.run()` with render loop
- [ ] Implement `ThreeEngine.dispose()`
- [ ] Test with empty scene

### Phase 2: Level Building
- [ ] Create `BaseThreeBuilder` class
- [ ] Implement ground/floor creation
- [ ] Implement wall creation
- [ ] Implement lighting setup
- [ ] Port `GalleryBuilder` (Level 1)
- [ ] Port `MuseumBuilder` (Level 2)
- [ ] Port `FreestandingArtBuilder` (Level 3)
- [ ] Port `ColorScreamBuilder` (Level 4)

### Phase 3: Content Loading
- [ ] Implement painting texture loading
- [ ] Implement painting mesh creation with correct aspect ratios
- [ ] Implement artist image loading
- [ ] Implement character/player model loading
- [ ] Test with real gallery data

### Phase 4: Player Controller
- [ ] Implement keyboard input (WASD)
- [ ] Implement mouse look
- [ ] Implement collision detection
- [ ] Implement mobile touch controls
- [ ] Port pointer lock functionality

### Phase 5: UI System
- [ ] Create HTML overlay for popups
- [ ] Implement painting info popup
- [ ] Implement artist info popup
- [ ] Implement navigation controls
- [ ] Port mobile joystick

### Phase 6: Polish
- [ ] Implement skybox/environment
- [ ] Add shadows
- [ ] Add post-processing effects
- [ ] Optimize performance
- [ ] Test on mobile devices

### Phase 7: Integration
- [ ] Switch `EngineGalleryViewer` to use Three.js
- [ ] Test all gallery routes
- [ ] Compare performance with Babylon.js
- [ ] Document any differences

---

## Quick Reference: Using the Abstraction

### Current Usage (Babylon.js)

```tsx
import EngineGalleryViewer from '@/components/EngineGalleryViewer';

<EngineGalleryViewer
    galleryData={gallery}
    userData={user}
    mode="default"
    source="online"
/>
```

### Future Usage (Three.js)

```tsx
import EngineGalleryViewer from '@/components/EngineGalleryViewer';
import { EngineType } from '@/engine';

<EngineGalleryViewer
    engine={EngineType.THREEJS}  // Just add this prop!
    galleryData={gallery}
    userData={user}
    mode="default"
    source="online"
/>
```

---

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) (optional React bindings)
- [Drei Helpers](https://github.com/pmndrs/drei) (useful Three.js React components)
- [Three.js Journey](https://threejs-journey.com/) (comprehensive course)

---

*Last updated: January 2026*
