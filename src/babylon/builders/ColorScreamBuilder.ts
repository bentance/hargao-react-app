import { MeshBuilder, Vector3, Color3, StandardMaterial, Mesh } from "@babylonjs/core";
import { BaseLevelBuilder } from "./LevelBuilder";
import type { BuilderContext } from "./LevelBuilder";

/**
 * Builds the Color Scream level with floating shapes and scattered art on walls
 */
export class ColorScreamBuilder extends BaseLevelBuilder {
    private readonly colors = [
        Color3.FromHexString("#E63946"), // Console Red
        Color3.FromHexString("#7AE03D"), // Acid Green
        Color3.FromHexString("#225DB7"), // Retro Blue
        Color3.FromHexString("#F19EAA"), // Bubblegum Pink
        Color3.FromHexString("#FCD84A")  // Vibrant Yellow
    ];

    async build(context: BuilderContext): Promise<void> {
        this.initialize(context);

        // Create floating shapes
        this.createFloatingShapes();

        // Add paintings and about on walls
        await this.createArtWalls();

        console.log("Created Color Scream level with floating shapes and scattered art");
    }

    private createFloatingShapes(): void {
        const shapeCount = 100;
        const groundWidth = this.level.groundSize?.width || 60;
        const groundHeight = this.level.groundSize?.height || 60;

        for (let i = 0; i < shapeCount; i++) {
            let mesh: Mesh;
            const shapeType = Math.floor(Math.random() * 4);
            const size = 0.5 + Math.random() * 4.5;

            switch (shapeType) {
                case 0:
                    mesh = MeshBuilder.CreateBox(`shape_${i}`, { size }, this.scene);
                    break;
                case 1:
                    mesh = MeshBuilder.CreateSphere(`shape_${i}`, { diameter: size }, this.scene);
                    break;
                case 2:
                    mesh = MeshBuilder.CreateCylinder(`shape_${i}`, { height: size, diameter: size }, this.scene);
                    break;
                case 3:
                default:
                    mesh = MeshBuilder.CreateTorus(`shape_${i}`, { diameter: size, thickness: size / 3 }, this.scene);
                    break;
            }

            const x = (Math.random() - 0.5) * groundWidth;
            const z = (Math.random() - 0.5) * groundHeight;
            const y = 2 + Math.random() * 10;

            // Keep clear area for spawn
            if (Math.abs(x) < 5 && Math.abs(z - 10) < 5) {
                i--;
                mesh.dispose();
                continue;
            }

            mesh.position = new Vector3(x, y, z);
            mesh.rotation = new Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const mat = new StandardMaterial(`shapeMat_${i}`, this.scene);
            mat.diffuseColor = color;
            mat.emissiveColor = color.scale(0.3);
            mesh.material = mat;

            mesh.receiveShadows = true;
            this.shadowGenerator.addShadowCaster(mesh);
            mesh.checkCollisions = true;

            // Floating animation
            const uniqueOffset = i * 0.1;
            this.scene.onBeforeRenderObservable.add(() => {
                mesh.rotation.x += 0.01;
                mesh.rotation.y += 0.01;
                mesh.position.y += Math.sin((Date.now() * 0.001) + uniqueOffset) * 0.02;
            });
        }
    }

    private async createArtWalls(): Promise<void> {
        const paintingIds = await this.findAllPaintingImages();
        const hasUserImage = this.hasUserDisplayImage();

        // Skip art walls if no paintings AND no user display image
        if (paintingIds.length === 0 && !hasUserImage) {
            console.log("No paintings or artist image found - skipping art walls");
            return;
        }

        const itemsToPlace: { type: string, id: number }[] = paintingIds.map(id => ({ type: 'painting', id }));

        // Only add About wall if user has a display image
        if (hasUserImage) {
            itemsToPlace.push({ type: 'about', id: 0 });
        }

        const groundWidth = this.level.groundSize?.width || 60;
        const groundHeight = this.level.groundSize?.height || 60;
        const fixedPaintingHeight = 2.5;
        const wallThickness = 0.5;
        const wallHeight = 4.0;
        const displayHeight = wallHeight / 2;

        const positions = this.generateSpiralPositions(itemsToPlace.length, 12, Math.min(groundWidth, groundHeight) * 0.45);

        for (let i = 0; i < itemsToPlace.length; i++) {
            const item = itemsToPlace[i];
            const { x, z } = positions[i];
            const faceAngle = Math.atan2(-x, -z) + Math.PI;
            const toCenter = new Vector3(-x, 0, -z).normalize();

            if (item.type === 'about') {
                await this.createAboutWall(x, z, faceAngle, wallThickness, wallHeight, displayHeight, toCenter);
            } else {
                await this.createPaintingWall(item.id, x, z, faceAngle, wallThickness, wallHeight, displayHeight, toCenter, fixedPaintingHeight);
            }
        }
    }

    private generateSpiralPositions(count: number, minRadius: number, maxRadius: number): { x: number, z: number }[] {
        const positions: { x: number, z: number }[] = [];
        const phi = (1 + Math.sqrt(5)) / 2;
        const goldenAngle = 2 * Math.PI * (1 - 1 / phi);

        for (let i = 0; i < count; i++) {
            const n = i + 1;
            const radiusParam = (i + 1) / count;
            const currentRadius = minRadius + (maxRadius - minRadius) * Math.sqrt(radiusParam);
            const theta = n * goldenAngle;

            positions.push({
                x: Math.cos(theta) * currentRadius,
                z: Math.sin(theta) * currentRadius
            });
        }

        return positions;
    }

    private async createAboutWall(
        x: number, z: number, faceAngle: number,
        wallThickness: number, wallHeight: number, displayHeight: number,
        toCenter: Vector3
    ): Promise<void> {
        const aboutSize = 2.5;
        const totalWidth = aboutSize + 1.0;

        const wall = MeshBuilder.CreateBox("aboutWall", {
            width: totalWidth,
            height: wallHeight,
            depth: wallThickness
        }, this.scene);
        wall.position = new Vector3(x, wallHeight / 2, z);
        wall.rotation.y = faceAngle;

        const wallMat = new StandardMaterial("aboutWallMat", this.scene);
        wallMat.diffuseColor = new Color3(0.2, 0.2, 0.25);
        wall.material = wallMat;
        wall.checkCollisions = true;
        wall.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(wall);

        const aboutContent = MeshBuilder.CreatePlane("aboutContent", {
            width: aboutSize,
            height: aboutSize
        }, this.scene);
        aboutContent.position = new Vector3(
            x + toCenter.x * (wallThickness / 2 + 0.02),
            displayHeight,
            z + toCenter.z * (wallThickness / 2 + 0.02)
        );
        aboutContent.rotation.y = faceAngle;

        const contentMat = new StandardMaterial("aboutContentMat", this.scene);
        await this.applyUserDisplayImage(contentMat);
        aboutContent.material = contentMat;

        const interaction = MeshBuilder.CreateBox("aboutInteraction", {
            width: totalWidth,
            height: wallHeight,
            depth: 3
        }, this.scene);
        interaction.position = new Vector3(
            x + toCenter.x * 1.5,
            displayHeight,
            z + toCenter.z * 1.5
        );
        interaction.rotation.y = faceAngle;
        interaction.visibility = 0;
        interaction.checkCollisions = false;
        (interaction as any).isAbout = true;
        this.interactiveCubes.push(interaction);
    }

    private async createPaintingWall(
        id: number, x: number, z: number, faceAngle: number,
        wallThickness: number, wallHeight: number, displayHeight: number,
        toCenter: Vector3, fixedPaintingHeight: number
    ): Promise<void> {
        const dimensions = await this.getImageDimensions(id);
        const aspectRatio = dimensions.width / dimensions.height;
        const paintingHeight = fixedPaintingHeight;
        const paintingWidth = paintingHeight * aspectRatio;
        const totalWidth = paintingWidth + 1.0;

        const wall = MeshBuilder.CreateBox(`paintingWall_${id}`, {
            width: totalWidth,
            height: wallHeight,
            depth: wallThickness
        }, this.scene);
        wall.position = new Vector3(x, wallHeight / 2, z);
        wall.rotation.y = faceAngle;

        const wallMat = new StandardMaterial(`wallMat_${id}`, this.scene);
        wallMat.diffuseColor = new Color3(0.2, 0.2, 0.25);
        wall.material = wallMat;
        wall.checkCollisions = true;
        wall.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(wall);

        const paintingPlane = MeshBuilder.CreatePlane(`painting_${id}`, {
            width: paintingWidth,
            height: paintingHeight
        }, this.scene);
        paintingPlane.position = new Vector3(
            x + toCenter.x * (wallThickness / 2 + 0.02),
            displayHeight,
            z + toCenter.z * (wallThickness / 2 + 0.02)
        );
        paintingPlane.rotation.y = faceAngle;

        const paintingMat = new StandardMaterial(`paintingMat_${id}`, this.scene);
        await this.applyPaintingTexture(paintingMat, id);
        paintingPlane.material = paintingMat;

        const interaction = MeshBuilder.CreateBox(`interaction_${id}`, {
            width: totalWidth,
            height: wallHeight,
            depth: 3
        }, this.scene);
        interaction.position = new Vector3(
            x + toCenter.x * 1.5,
            displayHeight,
            z + toCenter.z * 1.5
        );
        interaction.rotation.y = faceAngle;
        interaction.visibility = 0;
        interaction.checkCollisions = false;
        (interaction as any).paintingId = id;
        this.interactiveCubes.push(interaction);
    }
}
