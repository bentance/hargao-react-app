import { Scene, MeshBuilder, Vector3, Color3, ShadowGenerator, StandardMaterial, SceneLoader, Mesh, Texture } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { ENVIRONMENT_CONFIG, GAME_CONFIG, getPaintingById, APP_CONFIG, getPaintingsBasePath } from "./config";
import { LEVELS } from "./levels/list";
import type { LevelData } from "./levels/list";
import {
    GalleryBuilder,
    MuseumBuilder,
    FreestandingArtBuilder,
    ColorScreamBuilder,
    type BuilderContext
} from "./builders";

/**
 * Environment class - creates and manages the game world
 * Uses specialized builders for different level types
 */
export class Environment {
    private scene: Scene;
    private shadowGenerator: ShadowGenerator;
    private currentLevel: LevelData;
    public interactiveCubes: Mesh[] = [];

    constructor(scene: Scene, shadowGenerator: ShadowGenerator) {
        this.scene = scene;
        this.shadowGenerator = shadowGenerator;

        console.log("Environment constructor - GAME_CONFIG.currentLevel:", GAME_CONFIG.currentLevel);
        console.log("LEVELS array length:", LEVELS.length);
        console.log("Attempting to load level index:", GAME_CONFIG.currentLevel - 1);

        this.currentLevel = LEVELS[GAME_CONFIG.currentLevel - 1];

        if (!this.currentLevel) {
            console.error(`Failed to load level ${GAME_CONFIG.currentLevel}! LEVELS array:`, LEVELS);
            console.error("Available levels:", LEVELS.map((l, i) => `${i}: ${l.name}`));
            throw new Error(`Invalid level: ${GAME_CONFIG.currentLevel}`);
        }

        console.log("Loaded level:", this.currentLevel.name, "ID:", this.currentLevel.id);
    }

    /**
     * Load the environment assets and geometry
     */
    public async load(): Promise<void> {
        await this.createWorld();
    }

    /**
     * Create all world geometry using appropriate builder
     */
    private async createWorld(): Promise<void> {
        this.createGround();

        // Create builder context
        const context: BuilderContext = {
            scene: this.scene,
            shadowGenerator: this.shadowGenerator,
            level: this.currentLevel,
            interactiveCubes: this.interactiveCubes
        };

        // Use appropriate builder based on level type
        if (this.currentLevel.isGallery) {
            const builder = new GalleryBuilder();
            await builder.build(context);
            return;
        }

        if (this.currentLevel.isMuseumRoom) {
            const builder = new MuseumBuilder();
            await builder.build(context);
            return;
        }

        if (this.currentLevel.hasFreestandingArt) {
            const builder = new FreestandingArtBuilder();
            await builder.build(context);
            return;
        }

        if (this.currentLevel.isColorScream) {
            const builder = new ColorScreamBuilder();
            await builder.build(context);
            return;
        }

        // Default: load GLB or build from platform/slope data
        if (this.currentLevel.filename) {
            await this.loadLevelModel();
        } else {
            this.createSlopes();
            this.createPlatforms();
        }

        await this.createInteractiveCubes();
    }

    /**
     * Create the ground plane (rectangular or circular)
     */
    private createGround(): void {
        console.log("Creating ground for level:", this.currentLevel.name);
        const yOffset = this.currentLevel.groundYOffset ?? 0;

        if (this.currentLevel.isCircular && this.currentLevel.groundRadius) {
            console.log("Creating circular ground with radius:", this.currentLevel.groundRadius);
            this.createCircularGround(this.currentLevel.groundRadius, yOffset);
            return;
        }

        const width = this.currentLevel.groundSize?.width ?? ENVIRONMENT_CONFIG.ground.width;
        const height = this.currentLevel.groundSize?.height ?? ENVIRONMENT_CONFIG.ground.height;

        console.log("Creating rectangular ground:", width, "x", height);

        const ground = MeshBuilder.CreateGround("ground", { width, height }, this.scene);
        ground.position.y = -0.1 + yOffset;
        const groundMat = new StandardMaterial("groundMat", this.scene);

        if (this.currentLevel.floorTexture) {
            const floorTex = new Texture(this.currentLevel.floorTexture, this.scene);
            floorTex.uScale = width / 10;
            floorTex.vScale = height / 10;
            groundMat.diffuseTexture = floorTex;
        } else if (this.currentLevel.groundColor) {
            groundMat.diffuseColor = new Color3(
                this.currentLevel.groundColor.r,
                this.currentLevel.groundColor.g,
                this.currentLevel.groundColor.b
            );
        } else {
            groundMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
        }

        ground.material = groundMat;
        ground.checkCollisions = true;
        ground.receiveShadows = true;

        if (this.currentLevel.hasBoundaryWalls) {
            this.createBoundaryWalls(width, height, yOffset);
        }

        if (this.currentLevel.hasInvisibleWalls) {
            this.createInvisibleWalls(width, height, yOffset);
        }
    }

    /**
     * Create a circular ground (disc)
     */
    private createCircularGround(radius: number, yOffset: number): void {
        const ground = MeshBuilder.CreateDisc("ground", {
            radius: radius,
            tessellation: 64,
            sideOrientation: Mesh.DOUBLESIDE
        }, this.scene);
        ground.rotation.x = Math.PI / 2;
        ground.position.y = -0.1 + yOffset;

        const groundMat = new StandardMaterial("groundMat", this.scene);

        if (this.currentLevel.floorTexture) {
            const floorTex = new Texture(this.currentLevel.floorTexture, this.scene);
            floorTex.uScale = radius / 5;
            floorTex.vScale = radius / 5;
            groundMat.diffuseTexture = floorTex;
        } else {
            groundMat.diffuseColor = new Color3(0.9, 0.9, 0.9);
        }

        ground.material = groundMat;
        ground.checkCollisions = true;
        ground.receiveShadows = true;

        if (this.currentLevel.hasInvisibleWalls) {
            this.createInvisibleCylinderBoundary(radius, yOffset);
        }
    }

    /**
     * Create invisible walls around rectangular ground
     */
    private createInvisibleWalls(groundWidth: number, groundHeight: number, yOffset: number = 0): void {
        const wallHeight = 50;
        const wallThickness = 1;

        const frontWall = MeshBuilder.CreateBox("frontInvWall", {
            width: groundWidth, height: wallHeight, depth: wallThickness
        }, this.scene);
        frontWall.position = new Vector3(0, wallHeight / 2 + yOffset, groundHeight / 2);
        frontWall.isVisible = false;
        frontWall.checkCollisions = true;

        const backWall = MeshBuilder.CreateBox("backInvWall", {
            width: groundWidth, height: wallHeight, depth: wallThickness
        }, this.scene);
        backWall.position = new Vector3(0, wallHeight / 2 + yOffset, -groundHeight / 2);
        backWall.isVisible = false;
        backWall.checkCollisions = true;

        const leftWall = MeshBuilder.CreateBox("leftInvWall", {
            width: wallThickness, height: wallHeight, depth: groundHeight
        }, this.scene);
        leftWall.position = new Vector3(-groundWidth / 2, wallHeight / 2 + yOffset, 0);
        leftWall.isVisible = false;
        leftWall.checkCollisions = true;

        const rightWall = MeshBuilder.CreateBox("rightInvWall", {
            width: wallThickness, height: wallHeight, depth: groundHeight
        }, this.scene);
        rightWall.position = new Vector3(groundWidth / 2, wallHeight / 2 + yOffset, 0);
        rightWall.isVisible = false;
        rightWall.checkCollisions = true;

        console.log("Created invisible boundary walls");
    }

    /**
     * Create invisible cylindrical boundary
     */
    private createInvisibleCylinderBoundary(radius: number, yOffset: number): void {
        const wallHeight = 10;
        const segments = 32;

        for (let i = 0; i < segments; i++) {
            const angle1 = (i / segments) * Math.PI * 2;
            const angle2 = ((i + 1) / segments) * Math.PI * 2;
            const segmentWidth = (2 * Math.PI * radius) / segments;
            const midAngle = (angle1 + angle2) / 2;
            const x = Math.cos(midAngle) * radius;
            const z = Math.sin(midAngle) * radius;

            const wall = MeshBuilder.CreateBox(`invisibleWall_${i}`, {
                width: segmentWidth * 1.1,
                height: wallHeight,
                depth: 0.5
            }, this.scene);

            wall.position = new Vector3(x, wallHeight / 2 - 0.1 + yOffset, z);
            wall.rotation.y = -midAngle + Math.PI / 2;
            wall.visibility = 0;
            wall.checkCollisions = true;
        }

        console.log(`Created invisible cylindrical boundary with ${segments} segments`);
    }

    /**
     * Create boundary walls around ground
     */
    private createBoundaryWalls(groundWidth: number, groundHeight: number, yOffset: number = 0): void {
        const wallHeight = 5;
        const wallThickness = 0.5;

        const frontBackWallMat = new StandardMaterial("frontBackWallMat", this.scene);
        const sideWallMat = new StandardMaterial("sideWallMat", this.scene);

        if (this.currentLevel.wallTexture) {
            const tileSize = 5;

            const frontBackTex = new Texture(this.currentLevel.wallTexture, this.scene);
            frontBackTex.wAng = -Math.PI / 2;
            frontBackTex.uScale = wallHeight / tileSize;
            frontBackTex.vScale = groundWidth / tileSize;
            frontBackWallMat.diffuseTexture = frontBackTex;

            const sideTex = new Texture(this.currentLevel.wallTexture, this.scene);
            sideTex.uScale = groundHeight / tileSize;
            sideTex.vScale = wallHeight / tileSize;
            sideWallMat.diffuseTexture = sideTex;

            if (this.currentLevel.wallColor) {
                const color = new Color3(
                    this.currentLevel.wallColor.r,
                    this.currentLevel.wallColor.g,
                    this.currentLevel.wallColor.b
                );
                frontBackWallMat.diffuseColor = color;
                sideWallMat.diffuseColor = color;
            }
        } else if (this.currentLevel.wallColor) {
            const color = new Color3(
                this.currentLevel.wallColor.r,
                this.currentLevel.wallColor.g,
                this.currentLevel.wallColor.b
            );
            frontBackWallMat.diffuseColor = color;
            sideWallMat.diffuseColor = color;
        } else {
            frontBackWallMat.diffuseColor = new Color3(0.3, 0.3, 0.35);
            sideWallMat.diffuseColor = new Color3(0.3, 0.3, 0.35);
        }

        const frontWall = MeshBuilder.CreateBox("frontWall", {
            width: groundWidth, height: wallHeight, depth: wallThickness
        }, this.scene);
        frontWall.position = new Vector3(0, wallHeight / 2 - 0.1 + yOffset, groundHeight / 2);
        frontWall.material = frontBackWallMat;
        frontWall.checkCollisions = true;
        frontWall.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(frontWall);

        const backWall = MeshBuilder.CreateBox("backWall", {
            width: groundWidth, height: wallHeight, depth: wallThickness
        }, this.scene);
        backWall.position = new Vector3(0, wallHeight / 2 - 0.1 + yOffset, -groundHeight / 2);
        backWall.material = frontBackWallMat;
        backWall.checkCollisions = true;
        backWall.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(backWall);

        const leftWall = MeshBuilder.CreateBox("leftWall", {
            width: wallThickness, height: wallHeight, depth: groundHeight
        }, this.scene);
        leftWall.position = new Vector3(-groundWidth / 2, wallHeight / 2 - 0.1 + yOffset, 0);
        leftWall.material = sideWallMat;
        leftWall.checkCollisions = true;
        leftWall.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(leftWall);

        const rightWall = MeshBuilder.CreateBox("rightWall", {
            width: wallThickness, height: wallHeight, depth: groundHeight
        }, this.scene);
        rightWall.position = new Vector3(groundWidth / 2, wallHeight / 2 - 0.1 + yOffset, 0);
        rightWall.material = sideWallMat;
        rightWall.checkCollisions = true;
        rightWall.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(rightWall);

        console.log("Created boundary walls around ground");
    }

    /**
     * Load level from GLB file
     */
    private async loadLevelModel(): Promise<void> {
        console.log("Attempting to load level model:", this.currentLevel.filename);
        const scale = this.currentLevel.scale || 1.0;
        try {
            const result = await SceneLoader.ImportMeshAsync(
                "",
                "/environment/",
                this.currentLevel.filename,
                this.scene
            );

            console.log("Model loaded successfully. Meshes:", result.meshes.length);

            if (result.meshes.length > 0) {
                result.meshes[0].scaling = new Vector3(scale, scale, scale);
                result.meshes[0].computeWorldMatrix(true);
                result.meshes.forEach(m => m.computeWorldMatrix(true));

                const { min } = result.meshes[0].getHierarchyBoundingVectors(true);
                const bottomY = min.y;
                const manualOffset = this.currentLevel.yOffset || 0;
                result.meshes[0].position = new Vector3(0, -bottomY + manualOffset, 0);

                console.log(`Level grounded. Shift: ${-bottomY}`);
            }

            result.meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.receiveShadows = true;
                if (mesh.name.toLowerCase().indexOf("ground") === -1) {
                    this.shadowGenerator.addShadowCaster(mesh);
                }
            });

            console.log("Level loaded:", this.currentLevel.name);
        } catch (error) {
            console.error("Error loading level model:", error);
        }
    }

    /**
     * Create slopes based on level data
     */
    private createSlopes(): void {
        const { startX, z, width, count } = this.currentLevel.slopes;

        for (let i = 0; i < count; i++) {
            this.createSlope(i, startX, z, width);
        }
    }

    private createSlope(index: number, startX: number, z: number, width: number): void {
        const angleDeg = (index + 1) * 10;
        const angleRad = angleDeg * (Math.PI / 180);
        const length = 10;

        const slope = MeshBuilder.CreateBox(
            `slope_${angleDeg}`,
            { width, height: 0.5, depth: length },
            this.scene
        );

        slope.position.x = startX + (index * 8);
        slope.position.z = z;
        slope.position.y = (Math.sin(angleRad) * length) / 2;
        slope.rotation.x = -angleRad;

        const mat = new StandardMaterial(`slopeMat_${angleDeg}`, this.scene);
        mat.diffuseColor = new Color3(
            0.3 + (index * 0.05),
            0.3,
            0.8 - (index * 0.05)
        );

        slope.material = mat;
        slope.checkCollisions = true;
        this.shadowGenerator.addShadowCaster(slope);
        slope.receiveShadows = true;
    }

    /**
     * Create platforms based on level data
     */
    private createPlatforms(): void {
        this.currentLevel.platforms.forEach((config, index) => {
            this.createPlatform(config, index);
        });
    }

    private createPlatform(config: { x: number, y: number, z: number, width: number, depth: number }, index: number): void {
        const box = MeshBuilder.CreateBox(
            `platform_${index}`,
            { width: config.width, height: 0.5, depth: config.depth },
            this.scene
        );

        box.position = new Vector3(config.x, config.y, config.z);

        const mat = new StandardMaterial(`platMat_${index}`, this.scene);
        mat.diffuseColor = new Color3(0.8, 0.5, 0.2);

        box.material = mat;
        box.checkCollisions = true;
        this.shadowGenerator.addShadowCaster(box);
        box.receiveShadows = true;
    }

    /**
     * Create interactive cubes for default level types
     */
    private async createInteractiveCubes(): Promise<void> {
        const allPositions = [
            new Vector3(5, 1, 5),
            new Vector3(-5, 1, 5),
            new Vector3(5, 1, -5),
            new Vector3(-5, 1, -5),
            new Vector3(0, 1, 20),
            new Vector3(10, 1, 10),
            new Vector3(-10, 1, 10),
            new Vector3(10, 1, -10),
            new Vector3(-10, 1, -10),
            new Vector3(0, 1, -15)
        ];

        const paintingIds = await this.findAllPaintingImages();
        const cubeCount = Math.min(paintingIds.length, 10);

        const mat = new StandardMaterial("cubeMat", this.scene);
        mat.diffuseColor = new Color3(1, 0.8, 0);

        for (let i = 0; i < cubeCount; i++) {
            const cube = MeshBuilder.CreateBox(`interactive_cube_${i}`, { size: 1 }, this.scene);
            cube.position = allPositions[i];
            cube.material = mat;
            cube.checkCollisions = true;

            this.shadowGenerator.addShadowCaster(cube);
            cube.receiveShadows = true;

            (cube as any).paintingId = paintingIds[i];
            this.interactiveCubes.push(cube);
        }

        console.log(`Created ${cubeCount} interactive cubes for painting images`);
    }

    /**
     * Find all painting images
     */
    private async findAllPaintingImages(): Promise<number[]> {
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
     * Check if painting image exists
     */
    private checkImageExists(id: number): Promise<boolean> {
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
}
