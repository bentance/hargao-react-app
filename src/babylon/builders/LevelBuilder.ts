import { Scene, ShadowGenerator, Mesh, StandardMaterial, Color3, MeshBuilder, Texture, DynamicTexture, Vector3 } from "@babylonjs/core";
import { USER_CONFIG, getPaintingById, APP_CONFIG, getPaintingsBasePath } from "../config";
import type { LevelData } from "../levels/list";

/**
 * Context passed to level builders containing shared dependencies
 */
export interface BuilderContext {
    scene: Scene;
    shadowGenerator: ShadowGenerator;
    level: LevelData;
    interactiveCubes: Mesh[];
}

/**
 * Base interface for all level builders
 */
export interface ILevelBuilder {
    build(context: BuilderContext): Promise<void>;
}

/**
 * Abstract base class with shared utility methods for level builders
 */
export abstract class BaseLevelBuilder implements ILevelBuilder {
    protected scene!: Scene;
    protected shadowGenerator!: ShadowGenerator;
    protected level!: LevelData;
    protected interactiveCubes!: Mesh[];

    abstract build(context: BuilderContext): Promise<void>;

    protected initialize(context: BuilderContext): void {
        this.scene = context.scene;
        this.shadowGenerator = context.shadowGenerator;
        this.level = context.level;
        this.interactiveCubes = context.interactiveCubes;
    }

    /**
     * Find all painting images by scanning for painting_1 through painting_20
     * In online mode, only use paintings explicitly defined in CURRENT_GALLERY
     */
    protected async findAllPaintingImages(): Promise<number[]> {
        // In online mode, only use paintings from the gallery data
        if (APP_CONFIG.type === "online") {
            const { getPaintings } = await import("../config");
            const paintings = getPaintings();
            // Only return IDs that have non-empty imageUrl/url
            return paintings
                .filter(p => (p.imageUrl || p.url))
                .map(p => p.id);
        }

        // In offline mode, scan for local files
        const foundIds: number[] = [];
        const maxToCheck = 20;

        for (let id = 1; id <= maxToCheck; id++) {
            const hasImage = await this.checkImageExists(id);
            if (hasImage) {
                foundIds.push(id);
            }
        }

        return foundIds;
    }

    /**
     * Check if an image exists for the given painting id
     */
    protected checkImageExists(id: number): Promise<boolean> {
        const paintingConfig = getPaintingById(id);
        if (APP_CONFIG.type === "online" && paintingConfig && paintingConfig.url) {
            return Promise.resolve(true);
        }

        const extensions = ["jpg", "jpeg", "png", "webp", "gif"];
        const basePath = getPaintingsBasePath();

        return new Promise((resolve) => {
            let checked = 0;
            let found = false;

            for (const ext of extensions) {
                const img = new window.Image();
                img.onload = () => {
                    if (!found) {
                        found = true;
                        resolve(true);
                    }
                };
                img.onerror = () => {
                    checked++;
                    if (checked === extensions.length && !found) {
                        resolve(false);
                    }
                };
                img.src = `${basePath}/painting_${id}.${ext}`;
            }
        });
    }

    /**
     * Get image dimensions for a painting to calculate aspect ratio
     */
    protected getImageDimensions(id: number): Promise<{ width: number, height: number }> {
        const paintingConfig = getPaintingById(id);
        if (APP_CONFIG.type === "online" && paintingConfig && paintingConfig.url) {
            const imageUrl = paintingConfig.url;
            return new Promise((resolve) => {
                const img = new window.Image();
                img.onload = () => {
                    resolve({ width: img.naturalWidth, height: img.naturalHeight });
                };
                img.onerror = () => {
                    resolve({ width: 1, height: 1 });
                };
                img.src = imageUrl;
            });
        }

        const extensions = ["jpg", "jpeg", "png", "webp", "gif"];
        const basePath = getPaintingsBasePath();

        return new Promise((resolve) => {
            let found = false;
            let checked = 0;

            for (const ext of extensions) {
                const img = new window.Image();
                img.onload = () => {
                    if (!found) {
                        found = true;
                        resolve({ width: img.naturalWidth, height: img.naturalHeight });
                    }
                };
                img.onerror = () => {
                    checked++;
                    if (checked === extensions.length && !found) {
                        resolve({ width: 1, height: 1 });
                    }
                };
                img.src = `${basePath}/painting_${id}.${ext}`;
            }
        });
    }

    /**
     * Apply painting texture trying multiple extensions
     */
    protected applyPaintingTexture(material: StandardMaterial, id: number): Promise<void> {
        const paintingConfig = getPaintingById(id);
        if (APP_CONFIG.type === "online" && paintingConfig && paintingConfig.url) {
            const imageUrl = paintingConfig.url;
            return new Promise((resolve) => {
                const texture = new Texture(
                    imageUrl,
                    this.scene,
                    undefined,
                    undefined,
                    undefined,
                    () => { resolve(); },
                    () => {
                        console.warn(`Failed to load texture from URL: ${imageUrl}`);
                        resolve();
                    }
                );
                material.diffuseTexture = texture;
                material.emissiveColor = new Color3(0.3, 0.3, 0.3);
            });
        }

        const extensions = ["jpg", "jpeg", "png", "webp", "gif"];
        const basePath = getPaintingsBasePath();

        return new Promise((resolve) => {
            let found = false;
            let checked = 0;

            for (const ext of extensions) {
                const testImg = new window.Image();
                testImg.onload = () => {
                    if (!found) {
                        found = true;
                        material.diffuseTexture = new Texture(`${basePath}/painting_${id}.${ext}`, this.scene);
                        material.emissiveColor = new Color3(0.3, 0.3, 0.3);
                        resolve();
                    }
                };
                testImg.onerror = () => {
                    checked++;
                    if (checked === extensions.length && !found) {
                        resolve();
                    }
                };
                testImg.src = `${basePath}/painting_${id}.${ext}`;
            }
        });
    }

    /**
     * Apply user display image or fallback to blank/ABOUT text
     * In online mode, leaves blank if no photoURL
     * In offline mode, falls back to ABOUT text
     */
    protected applyUserDisplayImage(material: StandardMaterial): Promise<void> {
        // Online mode: only use Firebase URL if it exists, otherwise leave blank
        if (APP_CONFIG.type === "online") {
            if (USER_CONFIG.userImageUrl) {
                const imageUrl = USER_CONFIG.userImageUrl;
                return new Promise((resolve) => {
                    const texture = new Texture(
                        imageUrl,
                        this.scene,
                        undefined,
                        undefined,
                        undefined,
                        () => {
                            console.log("Artist image loaded from Firebase:", imageUrl);
                            resolve();
                        },
                        () => {
                            console.warn(`Failed to load artist image from Firebase URL: ${imageUrl}`);
                            // Leave blank - don't apply ABOUT text in online mode
                            resolve();
                        }
                    );
                    material.diffuseTexture = texture;
                    material.emissiveColor = new Color3(0.2, 0.2, 0.2);
                });
            } else {
                // No photoURL in online mode - leave blank
                console.log("No artist photoURL provided, leaving blank");
                return Promise.resolve();
            }
        }

        // Offline mode: try to load local file or show ABOUT text
        if (!USER_CONFIG.displayImage) {
            this.applyAboutText(material);
            return Promise.resolve();
        }

        const extensions = ["jpg", "jpeg", "png", "webp", "gif"];
        const filename = USER_CONFIG.displayImage;
        const basePath = getPaintingsBasePath();

        return new Promise((resolve) => {
            let found = false;
            let checked = 0;

            for (const ext of extensions) {
                const testImg = new window.Image();
                testImg.onload = () => {
                    if (!found) {
                        found = true;
                        material.diffuseTexture = new Texture(`${basePath}/${filename}.${ext}`, this.scene);
                        material.emissiveColor = new Color3(0.2, 0.2, 0.2);
                        resolve();
                    }
                };
                testImg.onerror = () => {
                    checked++;
                    if (checked === extensions.length && !found) {
                        this.applyAboutText(material);
                        resolve();
                    }
                };
                testImg.src = `${basePath}/${filename}.${ext}`;
            }
        });
    }

    /**
     * Check if user display image is configured (either online URL or local file)
     */
    protected hasUserDisplayImage(): boolean {
        // Check for online user image URL
        if (APP_CONFIG.type === "online" && USER_CONFIG.userImageUrl) {
            return true;
        }
        // Check for local display image filename
        if (USER_CONFIG.displayImage && USER_CONFIG.displayImage.trim() !== "") {
            return true;
        }
        return false;
    }

    /**
     * Create a dynamic texture with "ABOUT" text
     */
    protected applyAboutText(material: StandardMaterial): void {
        const textureSize = 512;
        const dynamicTexture = new DynamicTexture("aboutTexture", textureSize, this.scene, true);

        const ctx = dynamicTexture.getContext() as CanvasRenderingContext2D;

        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, textureSize, textureSize);

        ctx.font = "bold 80px Arial";
        ctx.fillStyle = "#00CED1";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ABOUT", textureSize / 2, textureSize / 2);

        dynamicTexture.update();

        material.diffuseTexture = dynamicTexture;
        material.emissiveColor = new Color3(0.1, 0.1, 0.15);
    }

    /**
     * Create sun and moon decorative elements
     */
    protected createSunAndMoon(): void {
        const sun = MeshBuilder.CreateSphere("sun", { diameter: 5, segments: 32 }, this.scene);
        sun.position = new Vector3(20, 12, 15);

        const sunMat = new StandardMaterial("sunMat", this.scene);
        sunMat.diffuseColor = new Color3(1, 0.9, 0.3);
        sunMat.emissiveColor = new Color3(1, 0.85, 0.3);
        sunMat.specularColor = new Color3(0, 0, 0);
        sun.material = sunMat;

        const moon = MeshBuilder.CreateSphere("moon", { diameter: 4, segments: 32 }, this.scene);
        moon.position = new Vector3(-20, 10, 15);

        const moonMat = new StandardMaterial("moonMat", this.scene);
        moonMat.diffuseColor = new Color3(0.9, 0.9, 0.95);
        moonMat.emissiveColor = new Color3(0.4, 0.4, 0.5);
        moonMat.specularColor = new Color3(0, 0, 0);
        moon.material = moonMat;

        console.log("Created sun and moon in the sky");
    }
}
