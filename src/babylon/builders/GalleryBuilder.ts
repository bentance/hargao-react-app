import { MeshBuilder, Vector3, Color3, StandardMaterial } from "@babylonjs/core";
import { BaseLevelBuilder } from "./LevelBuilder";
import type { BuilderContext } from "./LevelBuilder";

/**
 * Builds gallery wall levels with paintings on a single wall
 */
export class GalleryBuilder extends BaseLevelBuilder {
    async build(context: BuilderContext): Promise<void> {
        this.initialize(context);

        const paintingIds = await this.findAllPaintingImages();
        const paintingCount = Math.min(paintingIds.length, 10);
        const hasUserImage = this.hasUserDisplayImage();

        // Skip wall creation if no paintings AND no user display image
        if (paintingCount === 0 && !hasUserImage) {
            console.log("No paintings or artist image found - skipping gallery wall");
            return;
        }

        const fixedPaintingHeight = 3;
        const spacing = 1;
        const wallHeight = 5;
        const wallDepth = 0.3;

        // Get all painting dimensions to calculate total wall length
        const paintingDimensions: { width: number, height: number, id: number }[] = [];
        let totalPaintingsWidth = 0;

        for (let i = 0; i < paintingCount; i++) {
            const id = paintingIds[i];
            const dimensions = await this.getImageDimensions(id);
            const aspectRatio = dimensions.width / dimensions.height;
            const paintingWidth = fixedPaintingHeight * aspectRatio;
            paintingDimensions.push({ width: paintingWidth, height: fixedPaintingHeight, id: id });
            totalPaintingsWidth += paintingWidth;
        }

        const wallLength = totalPaintingsWidth + (paintingCount + 1) * spacing;

        // Create the wall
        const wall = MeshBuilder.CreateBox("galleryWall", {
            width: wallLength,
            height: wallHeight,
            depth: wallDepth
        }, this.scene);
        wall.position = new Vector3(0, wallHeight / 2, 15);
        wall.checkCollisions = true;

        const wallMat = new StandardMaterial("wallMat", this.scene);
        wallMat.diffuseColor = new Color3(0.2, 0.2, 0.25);
        wall.material = wallMat;
        wall.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(wall);

        // Create paintings on the wall
        let currentX = -wallLength / 2 + spacing;

        for (let i = 0; i < paintingCount; i++) {
            const { width: paintingWidth, height: paintingHeight, id } = paintingDimensions[i];
            const x = currentX + paintingWidth / 2;
            currentX += paintingWidth + spacing;

            const paintingPlane = MeshBuilder.CreatePlane(`painting_${i}`, {
                width: paintingWidth,
                height: paintingHeight
            }, this.scene);
            paintingPlane.position = new Vector3(x, wallHeight / 2, 15 - wallDepth / 2 - 0.01);

            const paintingMat = new StandardMaterial(`paintingMat_${i}`, this.scene);
            await this.applyPaintingTexture(paintingMat, id);
            paintingPlane.material = paintingMat;

            // Interaction zone
            const interactionZone = MeshBuilder.CreateBox(`interaction_${i}`, {
                width: paintingWidth,
                height: paintingHeight,
                depth: 2
            }, this.scene);
            interactionZone.position = new Vector3(x, wallHeight / 2, 15 - wallDepth / 2 - 1.5);
            interactionZone.visibility = 0;
            interactionZone.checkCollisions = false;
            (interactionZone as any).paintingId = id;
            this.interactiveCubes.push(interactionZone);
        }

        // Create "About" sign only if user has display image
        if (hasUserImage) {
            await this.createAboutSign(wallLength, wallHeight, wallDepth);
        }

        // Add sun and moon for level 2
        if (this.level.id === 2) {
            this.createSunAndMoon();
        }

        const aboutNote = hasUserImage ? " and About section" : "";
        console.log(`Created gallery with ${paintingCount} paintings${aboutNote}`);
    }

    private async createAboutSign(wallLength: number, wallHeight: number, wallDepth: number): Promise<void> {
        // Get the user display image dimensions to calculate aspect ratio
        const dimensions = await this.getUserImageDimensions();
        const aspectRatio = dimensions.width / dimensions.height;
        const fixedHeight = 3;
        const aboutWidth = fixedHeight * aspectRatio;
        const aboutHeight = fixedHeight;

        const aboutX = wallLength / 2 + aboutWidth / 2 + 1.5;

        // About sign collision box
        const aboutCollider = MeshBuilder.CreateBox("aboutCollider", {
            width: aboutWidth + 0.6,
            height: aboutHeight + 0.6,
            depth: 0.3
        }, this.scene);
        aboutCollider.position = new Vector3(aboutX, wallHeight / 2, 15 - wallDepth / 2);
        aboutCollider.visibility = 0;
        aboutCollider.checkCollisions = true;

        // About sign frame
        const aboutFrame = MeshBuilder.CreatePlane("aboutFrame", {
            width: aboutWidth + 0.5,
            height: aboutHeight + 0.5
        }, this.scene);
        aboutFrame.position = new Vector3(aboutX, wallHeight / 2, 15 - wallDepth / 2 - 0.01);

        const frameMat = new StandardMaterial("frameMat", this.scene);
        frameMat.diffuseColor = new Color3(0.1, 0.1, 0.15);
        frameMat.emissiveColor = new Color3(0.02, 0.02, 0.03);
        aboutFrame.material = frameMat;

        // About content - now with correct aspect ratio
        const aboutContent = MeshBuilder.CreatePlane("aboutContent", {
            width: aboutWidth,
            height: aboutHeight
        }, this.scene);
        aboutContent.position = new Vector3(aboutX, wallHeight / 2, 15 - wallDepth / 2 - 0.02);

        const contentMat = new StandardMaterial("contentMat", this.scene);
        await this.applyUserDisplayImage(contentMat);
        aboutContent.material = contentMat;

        // About interaction zone
        const aboutInteraction = MeshBuilder.CreateBox("aboutInteraction", {
            width: aboutWidth + 0.5,
            height: aboutHeight + 0.5,
            depth: 2
        }, this.scene);
        aboutInteraction.position = new Vector3(aboutX, wallHeight / 2, 15 - wallDepth / 2 - 1.5);
        aboutInteraction.visibility = 0;
        aboutInteraction.checkCollisions = false;
        (aboutInteraction as any).isAbout = true;
        this.interactiveCubes.push(aboutInteraction);
    }
}
