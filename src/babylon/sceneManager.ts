/**
 * Scene Manager
 * 
 * Handles scene creation, lighting, and skybox setup.
 * Extracted from app.ts for better modularity.
 */

import {
    Scene,
    Vector3,
    HemisphericLight,
    DirectionalLight,
    Color3,
    Color4,
    MeshBuilder,
    ShadowGenerator,
    CubeTexture,
    Texture,
    StandardMaterial,
    DynamicTexture
} from "@babylonjs/core";
import { SkyMaterial } from "@babylonjs/materials";
import { LIGHTING_CONFIG, GAME_CONFIG } from "./config";
import { LEVELS } from "./levels/list";
import { isPhoneDevice } from "./mobileController";

export interface LightingResult {
    shadowGenerator: ShadowGenerator;
}

/**
 * Setup scene lighting
 */
export function setupLighting(scene: Scene): LightingResult {
    const { hemispheric, directional, shadow } = LIGHTING_CONFIG;
    const currentLevel = LEVELS[GAME_CONFIG.currentLevel - 1];
    const isIndoor = currentLevel?.disableSunLight;

    // Ambient Light - brighter for indoor scenes
    const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
    hemiLight.intensity = isIndoor ? 1.2 : hemispheric.intensity;
    hemiLight.diffuse = new Color3(
        hemispheric.diffuseColor.r,
        hemispheric.diffuseColor.g,
        hemispheric.diffuseColor.b
    );
    hemiLight.groundColor = new Color3(
        hemispheric.groundColor.r,
        hemispheric.groundColor.g,
        hemispheric.groundColor.b
    );

    // Directional Light - disable for indoor levels
    const dirLight = new DirectionalLight(
        "dirLight",
        new Vector3(directional.direction.x, directional.direction.y, directional.direction.z),
        scene
    );
    dirLight.position = new Vector3(
        directional.position.x,
        directional.position.y,
        directional.position.z
    );

    let shadowGenerator: ShadowGenerator;

    // For indoor levels, use focused Directional Light now that ceiling is gone
    if (isIndoor) {
        dirLight.intensity = 1.5;
        dirLight.position = new Vector3(10, 20, 10); // Offset position to match angle
        dirLight.direction = new Vector3(-0.5, -0.7, -0.4).normalize(); // Stronger angle for visible shadows

        // Tight shadow frustum for the room
        dirLight.autoUpdateExtends = false;
        dirLight.shadowMinZ = -20;
        dirLight.shadowMaxZ = 100;
        dirLight.orthoLeft = -30;
        dirLight.orthoRight = 30;
        dirLight.orthoTop = 30;
        dirLight.orthoBottom = -30;

        // Shadow Generator - use lower resolution on phones
        const shadowMapSize = isPhoneDevice() ? 512 : 2048;
        shadowGenerator = new ShadowGenerator(shadowMapSize, dirLight);

        // Use simpler filtering on phones
        if (isPhoneDevice()) {
            shadowGenerator.usePoissonSampling = true;
        } else {
            shadowGenerator.usePercentageCloserFiltering = true;
            shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
        }
        shadowGenerator.darkness = 0.3;
    } else {
        dirLight.intensity = directional.intensity;

        // Configure orthographic frustum for shadows to cover entire play area
        dirLight.autoUpdateExtends = false;
        dirLight.shadowMinZ = shadow.minZ;
        dirLight.shadowMaxZ = shadow.maxZ;
        dirLight.orthoLeft = -shadow.orthoSize;
        dirLight.orthoRight = shadow.orthoSize;
        dirLight.orthoTop = shadow.orthoSize;
        dirLight.orthoBottom = -shadow.orthoSize;

        // Shadow Generator for sun - use much lower resolution on phones
        const shadowMapSize = isPhoneDevice() ? 512 : shadow.mapSize;
        shadowGenerator = new ShadowGenerator(shadowMapSize, dirLight);

        // Use simpler filtering on phones
        if (isPhoneDevice()) {
            shadowGenerator.usePoissonSampling = true;
        } else {
            shadowGenerator.usePercentageCloserFiltering = true;
            shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
        }
    }

    // Common settings
    shadowGenerator.bias = 0.0001;
    shadowGenerator.normalBias = 0.01;

    // Store reference globally for player to access
    (scene as any).mainShadowGenerator = shadowGenerator;

    console.log("Shadow generator created, indoor:", isIndoor, "phone:", isPhoneDevice());

    return { shadowGenerator };
}

/**
 * Setup skybox (procedural or cubemap based on level)
 */
export function setupSkybox(scene: Scene): void {
    const currentLevel = LEVELS[GAME_CONFIG.currentLevel - 1];
    const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);

    // For indoor levels with no sun, use dark navy background
    if (currentLevel?.disableSunLight) {
        const navyColor = new Color3(0.05, 0.05, 0.15);
        scene.clearColor = new Color4(navyColor.r, navyColor.g, navyColor.b, 1);

        const skyboxMaterial = new StandardMaterial("skyBoxMat", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.emissiveColor = navyColor;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }
    // Check for Color Scream level (Twilight Gradient)
    else if (currentLevel?.isColorScream) {
        const skyboxMaterial = new StandardMaterial("skyBoxMat", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;

        const texture = new DynamicTexture("skyGradient", 512, scene, true);
        const ctx = texture.getContext();

        // Create vertical gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, "#2c003e"); // Deep Purple (Top)
        gradient.addColorStop(1, "#ff9a00"); // Orange (Bottom)

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        texture.update();

        skyboxMaterial.emissiveTexture = texture;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }
    // Check if level has a custom cubemap skybox
    else if (currentLevel?.skyboxPath) {
        // Use cubemap texture
        const skyboxMaterial = new StandardMaterial("skyBoxMat", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture(currentLevel.skyboxPath, scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    } else {
        // Use procedural sky
        const skyboxMaterial = new SkyMaterial("skyMaterial", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.inclination = 0;      // Sun elevation (0 = noon)
        skyboxMaterial.azimuth = 0.25;       // Sun rotation
        skyboxMaterial.luminance = 1.0;
        skyboxMaterial.turbidity = 2;        // Haze
        skyboxMaterial.rayleigh = 2;         // Atmosphere scattering
        skybox.material = skyboxMaterial;
    }
}
