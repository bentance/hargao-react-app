import { MeshBuilder, Vector3, Color3, StandardMaterial } from "@babylonjs/core";
import { BaseLevelBuilder } from "./LevelBuilder";
import type { BuilderContext } from "./LevelBuilder";

/**
 * Builds museum room levels with paintings on 4 walls
 */
export class MuseumBuilder extends BaseLevelBuilder {
    async build(context: BuilderContext): Promise<void> {
        this.initialize(context);

        const paintingIds = await this.findAllPaintingImages();
        const hasUserImage = this.hasUserDisplayImage();

        // Skip art display creation if no paintings AND no user display image
        if (paintingIds.length === 0 && !hasUserImage) {
            console.log("No paintings or artist image found - skipping museum art displays");
            return;
        }

        const roomWidth = this.level.groundSize?.width || 25;
        const roomDepth = this.level.groundSize?.height || 25;
        const wallHeight = 5;
        const wallDepth = 0.3;

        // Create ceiling if enabled
        if (this.level.hasCeiling) {
            this.createCeiling(roomWidth, roomDepth, wallHeight);
        }

        const fixedPaintingHeight = 2.5;
        const paintingY = 2.2;

        // Distribute paintings + about across 4 walls
        const aboutCount = hasUserImage ? 1 : 0;
        const totalItems = Math.min(paintingIds.length + aboutCount, 20);
        const itemsPerWall = Math.ceil(totalItems / 4);

        type WallItem = { type: 'painting' | 'about', id?: number };
        const wallItems: WallItem[][] = [[], [], [], []];

        // Add paintings
        let itemIndex = 0;
        const maxPaintings = hasUserImage ? totalItems - 1 : totalItems;
        for (let i = 0; i < paintingIds.length && itemIndex < maxPaintings; i++) {
            const wallIndex = Math.floor(itemIndex / itemsPerWall) % 4;
            wallItems[wallIndex].push({ type: 'painting', id: paintingIds[i] });
            itemIndex++;
        }

        // Add About to wall with least items (only if user has display image)
        if (hasUserImage) {
            const wallWithLeast = wallItems.reduce((minIdx, wall, idx, arr) =>
                wall.length < arr[minIdx].length ? idx : minIdx, 0);
            wallItems[wallWithLeast].push({ type: 'about' });
        }

        // Wall configurations
        const inset = wallDepth + 0.1;
        const wallConfigs: [number, number, number, boolean][] = [
            [0, roomDepth / 2 - inset, 0, false],
            [0, -roomDepth / 2 + inset, Math.PI, false],
            [-roomWidth / 2 + inset, 0, -Math.PI / 2, true],
            [roomWidth / 2 - inset, 0, Math.PI / 2, true]
        ];

        for (let wallIndex = 0; wallIndex < 4; wallIndex++) {
            const items = wallItems[wallIndex];
            if (items.length === 0) continue;

            const [wallX, wallZ, rotationY, isXAxis] = wallConfigs[wallIndex];
            const wallLength = isXAxis ? roomDepth : roomWidth;

            const itemWidths: number[] = [];
            for (const item of items) {
                if (item.type === 'about') {
                    itemWidths.push(2.5);
                } else {
                    const dimensions = await this.getImageDimensions(item.id!);
                    const aspectRatio = dimensions.width / dimensions.height;
                    itemWidths.push(fixedPaintingHeight * aspectRatio);
                }
            }

            const totalItemWidth = itemWidths.reduce((a, b) => a + b, 0);
            const availableSpace = wallLength - totalItemWidth;
            const gapSize = availableSpace / (items.length + 1);
            let currentPos = -wallLength / 2 + gapSize;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const itemWidth = itemWidths[i];
                const centerPos = currentPos + itemWidth / 2;

                let x: number, z: number;
                if (isXAxis) {
                    x = wallX;
                    z = centerPos;
                } else {
                    x = centerPos;
                    z = wallZ;
                }

                if (item.type === 'about') {
                    await this.createAboutDisplay(x, z, paintingY, rotationY, isXAxis, wallX, wallZ);
                } else {
                    await this.createPaintingDisplay(item.id!, x, z, paintingY, rotationY, isXAxis, wallX, wallZ, itemWidth, fixedPaintingHeight);
                }

                currentPos += itemWidth + gapSize;
            }
        }

        console.log(`Created museum room with ${paintingIds.length} paintings and About section on 4 walls`);
    }

    private createCeiling(roomWidth: number, roomDepth: number, wallHeight: number): void {
        const ceiling = MeshBuilder.CreateBox("ceiling", {
            width: roomWidth,
            height: 0.2,
            depth: roomDepth
        }, this.scene);
        ceiling.position = new Vector3(0, wallHeight, 0);

        const ceilingMat = new StandardMaterial("ceilingMat", this.scene);
        const ceilingColor = this.level.ceilingColor || { r: 0.05, g: 0.05, b: 0.15 };
        ceilingMat.diffuseColor = new Color3(ceilingColor.r, ceilingColor.g, ceilingColor.b);
        ceilingMat.emissiveColor = new Color3(ceilingColor.r * 0.3, ceilingColor.g * 0.3, ceilingColor.b * 0.3);
        ceiling.material = ceilingMat;
        ceiling.receiveShadows = false;
    }

    private async createAboutDisplay(
        x: number, z: number, paintingY: number, rotationY: number,
        isXAxis: boolean, wallX: number, wallZ: number
    ): Promise<void> {
        // Default size, will be adjusted based on image aspect ratio
        let aboutWidth = 2.5;
        let aboutHeight = 2.5;

        // Try to get image dimensions to maintain aspect ratio
        const { APP_CONFIG, USER_CONFIG } = await import("../config");

        if (APP_CONFIG.type === "online" && USER_CONFIG.userImageUrl) {
            // Load image to get dimensions
            const img = new Image();
            try {
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                        // Calculate aspect ratio
                        const aspectRatio = img.width / img.height;
                        const maxSize = 2.5;

                        if (aspectRatio > 1) {
                            // Landscape
                            aboutWidth = maxSize;
                            aboutHeight = maxSize / aspectRatio;
                        } else {
                            // Portrait or square
                            aboutHeight = maxSize;
                            aboutWidth = maxSize * aspectRatio;
                        }
                        resolve();
                    };
                    img.onerror = () => {
                        console.warn("Failed to load artist image for sizing");
                        resolve(); // Continue with default square size
                    };
                    img.src = USER_CONFIG.userImageUrl!;
                });
            } catch (error) {
                console.warn("Error loading artist image dimensions:", error);
            }
        }

        const aboutBacking = MeshBuilder.CreateBox("aboutBacking", {
            width: aboutWidth + 0.3,
            height: aboutHeight + 0.3,
            depth: 0.1
        }, this.scene);
        aboutBacking.position = new Vector3(x, paintingY, z);
        aboutBacking.rotation.y = rotationY;

        const backingMat = new StandardMaterial("aboutBackingMat", this.scene);
        backingMat.diffuseColor = new Color3(0.1, 0.1, 0.12);
        aboutBacking.material = backingMat;
        aboutBacking.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(aboutBacking);

        const aboutContent = MeshBuilder.CreatePlane("aboutContent", {
            width: aboutWidth,
            height: aboutHeight
        }, this.scene);

        const offsetDist = 0.06;
        const offsetX = isXAxis ? (wallX < 0 ? offsetDist : -offsetDist) : 0;
        const offsetZ = isXAxis ? 0 : (wallZ < 0 ? offsetDist : -offsetDist);
        aboutContent.position = new Vector3(x + offsetX, paintingY, z + offsetZ);
        aboutContent.rotation.y = rotationY;

        const contentMat = new StandardMaterial("aboutContentMat", this.scene);
        await this.applyUserDisplayImage(contentMat);
        aboutContent.material = contentMat;

        const interaction = MeshBuilder.CreateBox("aboutInteraction", {
            width: aboutWidth + 1,
            height: aboutHeight + 1,
            depth: 4
        }, this.scene);
        const interactOffset = 2.0;
        const interactX = isXAxis ? (wallX < 0 ? x + interactOffset : x - interactOffset) : x;
        const interactZ = isXAxis ? z : (wallZ < 0 ? z + interactOffset : z - interactOffset);
        interaction.position = new Vector3(interactX, paintingY, interactZ);
        interaction.visibility = 0;
        interaction.checkCollisions = false;
        (interaction as any).isAbout = true;
        this.interactiveCubes.push(interaction);
    }

    private async createPaintingDisplay(
        id: number, x: number, z: number, paintingY: number, rotationY: number,
        isXAxis: boolean, wallX: number, wallZ: number,
        paintingWidth: number, paintingHeight: number
    ): Promise<void> {
        const backing = MeshBuilder.CreateBox(`painting_backing_${id}`, {
            width: paintingWidth + 0.2,
            height: paintingHeight + 0.2,
            depth: 0.1
        }, this.scene);
        backing.position = new Vector3(x, paintingY, z);
        backing.rotation.y = rotationY;

        const backingMat = new StandardMaterial(`backingMat_${id}`, this.scene);
        backingMat.diffuseColor = new Color3(0.65, 0.55, 0.35);
        backing.material = backingMat;
        backing.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(backing);

        const paintingPlane = MeshBuilder.CreatePlane(`painting_${id}`, {
            width: paintingWidth,
            height: paintingHeight
        }, this.scene);

        const offsetDist = 0.06;
        const offsetX = isXAxis ? (wallX < 0 ? offsetDist : -offsetDist) : 0;
        const offsetZ = isXAxis ? 0 : (wallZ < 0 ? offsetDist : -offsetDist);
        paintingPlane.position = new Vector3(x + offsetX, paintingY, z + offsetZ);
        paintingPlane.rotation.y = rotationY;

        const paintingMat = new StandardMaterial(`paintingMat_${id}`, this.scene);
        await this.applyPaintingTexture(paintingMat, id);
        paintingPlane.material = paintingMat;

        const interaction = MeshBuilder.CreateBox(`interaction_${id}`, {
            width: paintingWidth + 1,
            height: paintingHeight + 1,
            depth: 4
        }, this.scene);
        const interactOffset = 2.0;
        const interactX = isXAxis ? (wallX < 0 ? x + interactOffset : x - interactOffset) : x;
        const interactZ = isXAxis ? z : (wallZ < 0 ? z + interactOffset : z - interactOffset);
        interaction.position = new Vector3(interactX, paintingY, interactZ);
        interaction.rotation.y = rotationY;
        interaction.visibility = 0;
        interaction.checkCollisions = false;
        (interaction as any).paintingId = id;
        this.interactiveCubes.push(interaction);
    }
}
