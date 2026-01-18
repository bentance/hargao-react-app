import { MeshBuilder, Vector3, Color3, StandardMaterial } from "@babylonjs/core";
import { BaseLevelBuilder } from "./LevelBuilder";
import type { BuilderContext } from "./LevelBuilder";

/**
 * Builds freestanding art display levels with paintings on stands in a spiral pattern
 */
export class FreestandingArtBuilder extends BaseLevelBuilder {
    async build(context: BuilderContext): Promise<void> {
        this.initialize(context);

        const paintingIds = await this.findAllPaintingImages();
        const paintingCount = Math.min(paintingIds.length, 10);
        const hasUserImage = this.hasUserDisplayImage();

        // Skip art display creation if no paintings AND no user display image
        if (paintingCount === 0 && !hasUserImage) {
            console.log("No paintings or artist image found - skipping freestanding art displays");
            return;
        }

        const fixedPaintingHeight = 2.5;
        const frameThickness = 0.15;
        const backingDepth = 0.1;
        const displayHeight = 1.5;

        // Generate positions using golden spiral
        const groundRadius = this.level.groundRadius || 50;
        const maxRadius = groundRadius * 0.95;
        const minRadius = 8;
        const positions = this.generateSpiralPositions(paintingCount, minRadius, maxRadius);

        for (let i = 0; i < paintingCount; i++) {
            const id = paintingIds[i];
            const { x, z } = positions[i];

            const dimensions = await this.getImageDimensions(id);
            const aspectRatio = dimensions.width / dimensions.height;
            const paintingHeight = fixedPaintingHeight;
            const paintingWidth = paintingHeight * aspectRatio;

            const faceAngle = Math.atan2(-x, -z) + Math.PI;

            // Create backing
            const backing = MeshBuilder.CreateBox(`artBacking_${i}`, {
                width: paintingWidth + frameThickness * 2,
                height: paintingHeight + frameThickness * 2,
                depth: backingDepth
            }, this.scene);
            backing.position = new Vector3(x, displayHeight, z);
            backing.rotation.y = faceAngle;

            const backingMat = new StandardMaterial(`backingMat_${i}`, this.scene);
            backingMat.diffuseColor = new Color3(0.15, 0.15, 0.18);
            backing.material = backingMat;
            backing.checkCollisions = true;
            backing.receiveShadows = true;
            this.shadowGenerator.addShadowCaster(backing);

            // Create painting plane
            const paintingPlane = MeshBuilder.CreatePlane(`painting_${i}`, {
                width: paintingWidth,
                height: paintingHeight
            }, this.scene);

            const dirX = -x / Math.sqrt(x * x + z * z);
            const dirZ = -z / Math.sqrt(x * x + z * z);
            paintingPlane.position = new Vector3(
                x + dirX * (backingDepth / 2 + 0.02),
                displayHeight,
                z + dirZ * (backingDepth / 2 + 0.02)
            );
            paintingPlane.rotation.y = faceAngle;

            const paintingMat = new StandardMaterial(`paintingMat_${i}`, this.scene);
            await this.applyPaintingTexture(paintingMat, id);
            paintingPlane.material = paintingMat;

            // Create stand
            const stand = MeshBuilder.CreateBox(`artStand_${i}`, {
                width: 0.3,
                height: displayHeight - paintingHeight / 2,
                depth: 0.3
            }, this.scene);
            stand.position = new Vector3(x, (displayHeight - paintingHeight / 2) / 2, z);

            const standMat = new StandardMaterial(`standMat_${i}`, this.scene);
            standMat.diffuseColor = new Color3(0.2, 0.2, 0.22);
            stand.material = standMat;
            stand.checkCollisions = true;
            stand.receiveShadows = true;
            this.shadowGenerator.addShadowCaster(stand);

            // Interaction zone
            const interactionZone = MeshBuilder.CreateBox(`interaction_${i}`, {
                width: paintingWidth + 1,
                height: paintingHeight + 1,
                depth: 2
            }, this.scene);
            const interactionOffsetX = dirX * 1.5;
            const interactionOffsetZ = dirZ * 1.5;
            interactionZone.position = new Vector3(x + interactionOffsetX, displayHeight, z + interactionOffsetZ);
            interactionZone.rotation.y = faceAngle;
            interactionZone.visibility = 0;
            interactionZone.checkCollisions = false;
            (interactionZone as any).paintingId = id;
            this.interactiveCubes.push(interactionZone);
        }

        // Create About stand in center (only if user has display image)
        if (hasUserImage) {
            await this.createAboutStand();
        }

        const aboutNote = hasUserImage ? " and About stand" : "";
        console.log(`Created ${paintingCount} freestanding art displays${aboutNote}`);
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

    private async createAboutStand(): Promise<void> {
        const fixedHeight = 2.5; // Fixed height, width will adjust based on aspect ratio
        const displayHeight = 1.5;
        const backingDepth = 0.1;

        // Get the user display image dimensions to calculate aspect ratio
        const dimensions = await this.getUserImageDimensions();
        const aspectRatio = dimensions.width / dimensions.height;
        const aboutWidth = fixedHeight * aspectRatio;
        const aboutHeight = fixedHeight;

        const aboutBacking = MeshBuilder.CreateBox("aboutBacking", {
            width: aboutWidth + 0.3,
            height: aboutHeight + 0.3,
            depth: backingDepth
        }, this.scene);
        aboutBacking.position = new Vector3(0, displayHeight, 0);
        aboutBacking.rotation.y = Math.PI;

        const backingMat = new StandardMaterial("aboutBackingMat", this.scene);
        backingMat.diffuseColor = new Color3(0.1, 0.1, 0.12);
        aboutBacking.material = backingMat;
        aboutBacking.checkCollisions = true;
        aboutBacking.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(aboutBacking);

        // Create plane with correct aspect ratio
        const aboutContent = MeshBuilder.CreatePlane("aboutContent", {
            width: aboutWidth,
            height: aboutHeight
        }, this.scene);
        aboutContent.position = new Vector3(0, displayHeight, backingDepth / 2 + 0.01);
        aboutContent.rotation.y = Math.PI;

        const contentMat = new StandardMaterial("aboutContentMat", this.scene);
        await this.applyUserDisplayImage(contentMat);
        aboutContent.material = contentMat;

        const stand = MeshBuilder.CreateCylinder("aboutStand", {
            height: displayHeight - aboutHeight / 2,
            diameter: 0.4
        }, this.scene);
        stand.position = new Vector3(0, (displayHeight - aboutHeight / 2) / 2, 0);

        const standMat = new StandardMaterial("aboutStandMat", this.scene);
        standMat.diffuseColor = new Color3(0.2, 0.2, 0.22);
        stand.material = standMat;
        stand.checkCollisions = true;
        stand.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(stand);

        const aboutInteraction = MeshBuilder.CreateBox("aboutInteraction", {
            width: aboutWidth + 1,
            height: aboutHeight + 1,
            depth: 2
        }, this.scene);
        aboutInteraction.position = new Vector3(0, displayHeight, 1.5);
        aboutInteraction.visibility = 0;
        aboutInteraction.checkCollisions = false;
        (aboutInteraction as any).isAbout = true;
        this.interactiveCubes.push(aboutInteraction);
    }
}
