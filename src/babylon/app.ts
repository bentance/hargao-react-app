import { Engine, Scene, Vector3, ArcRotateCamera, ShadowGenerator } from "@babylonjs/core";
import "@babylonjs/inspector";
import { Player } from "./player";
import { Environment } from "./environment";
import { InputController } from "./inputController";
import { CAMERA_CONFIG, INTERACTION_CONFIG, getPaintingById, GAME_CONFIG, USER_CONFIG, MAIN_CONFIG, switchGallery } from "./config";
import { InputKey } from "./types";
import { GameUI } from "./ui";
import { LEVELS } from "./levels/list";
import { MobileController, isMobileDevice, isPhoneDevice, createDesktopViewIndicator } from "./mobileController";
import { NavigationController } from "./navigationController";
import { setupLighting, setupSkybox } from "./sceneManager";
import { showLoadingScreen, hideLoadingScreen, showErrorMessage, setupGlobalErrorHandlers } from "./loadingScreen";

/**
 * Main application class - handles game initialization and loop
 */
export class App {
    private engine: Engine;
    private scene!: Scene;
    private player!: Player;
    private camera!: ArcRotateCamera;
    private input!: InputController;
    private shadowGenerator!: ShadowGenerator;
    private environment!: Environment;
    private ui!: GameUI;
    private mobileController: MobileController | null = null;
    private navigationController: NavigationController | null = null;
    private switchSound: HTMLAudioElement | null = null;
    private desktopFPS: HTMLDivElement | null = null;

    constructor(canvas: HTMLCanvasElement) {
        // Create engine with anti-aliasing (can be disabled on phones for performance)
        this.engine = new Engine(canvas, !isPhoneDevice());

        // Apply phone-specific performance optimizations
        if (isPhoneDevice()) {
            // Reduce render resolution on phones to prevent memory issues
            this.engine.setHardwareScalingLevel(2); // Render at half resolution
            console.log("Phone detected - applying performance optimizations");
        }

        // Disable default Babylon.js loading screen to prevent it from showing behind custom UI
        this.engine.displayLoadingUI = () => { };
        this.engine.hideLoadingUI = () => { };

        this.initialize(canvas);

        // Force resize after short delay to fix mobile orientation/safe-area issues
        setTimeout(() => {
            this.engine.resize();
        }, 100);
        setTimeout(() => {
            this.engine.resize();
        }, 500);
    }

    private async initialize(canvas: HTMLCanvasElement): Promise<void> {
        // Setup global error handlers once
        setupGlobalErrorHandlers();

        try {
            await this.setup();
            this.setupInputHandlers(canvas);
            this.run();
        } catch (error) {
            console.error("Failed to initialize app:", error);
            hideLoadingScreen();
            showErrorMessage(error);
        }
    }

    /**
     * Setup input handlers for mouse and keyboard
     */
    private setupInputHandlers(canvas: HTMLCanvasElement): void {
        // Only setup pointer lock on desktop (not supported on mobile)
        if (!isMobileDevice()) {
            // Pointer lock for mouse look
            canvas.addEventListener("click", () => {
                if (canvas.requestPointerLock) {
                    // Check if canvas is still in the document before requesting pointer lock
                    if (document.contains(canvas)) {
                        // Use promise-based handling to catch all pointer lock errors
                        const lockPromise = canvas.requestPointerLock() as Promise<void> | void;
                        if (lockPromise && typeof lockPromise.catch === 'function') {
                            lockPromise.catch(() => {
                                // Silently ignore pointer lock errors (user exited lock, security errors, etc.)
                            });
                        }
                    }
                }
            });

            // Mouse look handling
            document.addEventListener("mousemove", (event) => {
                if (this.input.isBlocked) return;

                if (document.pointerLockElement === canvas && this.camera) {
                    this.camera.alpha -= event.movementX * CAMERA_CONFIG.sensitivity;
                    this.camera.beta -= event.movementY * CAMERA_CONFIG.sensitivity;

                    // Clamp beta to limits
                    this.camera.beta = Math.max(
                        CAMERA_CONFIG.lowerBetaLimit,
                        Math.min(CAMERA_CONFIG.upperBetaLimit, this.camera.beta)
                    );
                }
            });

            // Create desktop view indicator
            const viewElements = createDesktopViewIndicator();
            if (viewElements) {
                this.desktopFPS = viewElements.fpsCounter;
            }
        }

        // Keyboard shortcuts
        window.addEventListener("keydown", (ev) => {
            const key = ev.key.toLowerCase();
            console.log("Key pressed:", key, "UserType:", USER_CONFIG.userType);

            // Restart game
            if (key === InputKey.RESTART) {
                this.reset();
            }

            // Inspector toggle (Ctrl+I) - only if enabled in config
            if (MAIN_CONFIG.isInspectorShortcut && ev.ctrlKey && key === "i") {
                this.toggleInspector();
            }

            // Interact
            if (key === InputKey.INTERACT) {
                this.checkInteraction();
            }

            // Admin Level Switching
            if (USER_CONFIG.userType === "admin") {
                if (key === "-" || key === "_") {
                    this.changeLevel(-1);
                }
                if (key === "+" || key === "=") {
                    this.changeLevel(1);
                }
            }
        });

        // Window resize handling
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    /**
     * Toggle the Babylon.js inspector
     */
    private toggleInspector(): void {
        if (this.scene.debugLayer.isVisible()) {
            this.scene.debugLayer.hide();
        } else {
            this.scene.debugLayer.show();
        }
    }

    /**
     * Check for interaction with cubes
     */
    private checkInteraction(): void {
        if (!this.player || !this.player.mesh || !this.environment) return;

        // If UI is visible, close it regardless of distance if E is pressed
        if (this.ui.isVisible) {
            this.playSwitchSound();
            this.ui.hideMessage();
            return;
        }

        // Check each cube for proximity and show corresponding content
        for (const cube of this.environment.interactiveCubes) {
            if (Vector3.Distance(this.player.mesh.position, cube.position) < INTERACTION_CONFIG.interactionRadius) {
                // Check if this is the About interaction
                if ((cube as any).isAbout) {
                    this.playSwitchSound();
                    this.ui.toggleAbout();
                    return;
                }

                // Otherwise check for painting
                const paintingId = (cube as any).paintingId;
                if (paintingId) {
                    const painting = getPaintingById(paintingId);
                    if (painting) {
                        this.playSwitchSound();
                        this.ui.togglePainting(painting);
                    }
                }
                return;
            }
        }
    }

    /**
     * Play switch sound effect
     */
    private playSwitchSound(): void {
        if (this.switchSound) {
            this.switchSound.currentTime = 0;
            this.switchSound.play().catch(e => console.error("Switch sound failed:", e));
        }
    }

    /**
     * Setup/reset the game scene
     */
    /**
     * Setup/reset the game scene
     */
    private async setup(): Promise<void> {
        // Dispose existing resources
        if (this.player) {
            this.player.dispose();
        }
        if (this.scene) {
            this.scene.dispose();
        }
        if (this.navigationController) {
            this.navigationController.dispose();
            this.navigationController = null;
        }
        if (this.mobileController) {
            this.mobileController.dispose();
            this.mobileController = null;
        }

        this.scene = this.createScene();
        this.setupCamera();

        this.environment = new Environment(this.scene, this.shadowGenerator);
        // Wait for environment to load (especially ground) BEFORE creating player
        await this.environment.load();

        this.input = new InputController(this.scene);
        this.player = new Player(this.scene, this.input, this.shadowGenerator);
        this.ui = new GameUI(this.scene);

        // Initialize switch sound
        this.switchSound = new Audio("/sounds/switch_sound_0.mp3");
        this.switchSound.volume = 0.5;

        // Lock camera target to player mesh
        if (this.player.mesh) {
            this.camera.lockedTarget = this.player.mesh;
        }

        // Initialize mobile controls if on mobile device
        if (isMobileDevice()) {
            this.mobileController = new MobileController(this.input);
            this.mobileController.setCamera(this.camera);
            this.mobileController.setInteractionCallback(() => this.checkInteraction());
        }

        // Hide loading screen when scene is truly ready
        this.scene.executeWhenReady(() => {
            console.log("Scene is ready, hiding loading screen");
            hideLoadingScreen();
        });

        // Connect UI visibility to input blocking (Works for both Mobile & Desktop)
        // Note: This overwrites any previous callback set inside the mobile block
        this.ui.setVisibilityCallback((visible) => {
            // Block/Unblock keyboard (WASD) and Mouse Look
            if (this.input) {
                this.input.setInputBlocked(visible);
            }

            // Block/Unblock mobile controls
            if (this.mobileController) {
                this.mobileController.setInputBlocked(visible);
            }
            // Block/Unblock navigation buttons
            if (this.navigationController) {
                this.navigationController.setBlocked(visible);
            }
        });

        // Initialize Explore Mode Navigation Buttons
        if (USER_CONFIG.userType === "explore") {
            this.navigationController = new NavigationController(
                () => this.changeLevel(-1), // Previous
                () => this.changeLevel(1)   // Next
            );
        }

        // Show welcome message with instruction image
        this.ui.showMessage("Welcome to my gallery!", true);
    }

    /**
     * Setup the third-person camera
     */
    private setupCamera(): void {
        this.camera = new ArcRotateCamera(
            "camera",
            CAMERA_CONFIG.alpha,
            CAMERA_CONFIG.beta,
            CAMERA_CONFIG.distance,
            Vector3.Zero(),
            this.scene
        );

        this.camera.upperBetaLimit = CAMERA_CONFIG.upperBetaLimit;
        this.camera.lowerBetaLimit = CAMERA_CONFIG.lowerBetaLimit;

        // Lock zoom
        this.camera.lowerRadiusLimit = CAMERA_CONFIG.distance;
        this.camera.upperRadiusLimit = CAMERA_CONFIG.distance;

        // Enable camera collision checking
        this.camera.checkCollisions = true;
        this.camera.collisionRadius = new Vector3(0.5, 0.5, 0.5);

        // Attach control for wheel zoom, but remove click-drag rotation and keyboard rotation
        this.camera.attachControl(this.engine.getRenderingCanvas(), true);
        this.camera.inputs.removeByType("ArcRotateCameraPointersInput");
        this.camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");  // Prevent arrow keys from rotating camera
    }

    /**
     * Reset the game to initial state
     */
    /**
     * Reset the game to initial state
     */
    private async reset(): Promise<void> {
        await this.setup();
    }

    /**
     * Change level or gallery based on user type
     * For "explore" users: switches between galleries 1-5
     * For "admin" users: switches between levels
     */
    private async changeLevel(offset: number): Promise<void> {
        showLoadingScreen();
        // Wait a frame to let UI render
        await new Promise(resolve => setTimeout(resolve, 0));

        try {
            console.log(`changeLevel called with offset: ${offset}, userType: ${USER_CONFIG.userType}`);

            // For explore mode, switch galleries instead of levels
            if (USER_CONFIG.userType === "explore") {
                console.log("Explore mode - calling switchGallery...");
                const newGalleryIndex = await switchGallery(offset);
                console.log(`switchGallery returned: ${newGalleryIndex}`);
                if (newGalleryIndex !== null) {
                    console.log(`Switched to Gallery ${newGalleryIndex}, resetting...`);
                    await this.reset();
                } else {
                    console.log("switchGallery returned null - no switch happened");
                }
                return;
            }

            // Admin mode: switch levels
            let newLevel = GAME_CONFIG.currentLevel + offset;
            const maxLevels = LEVELS.length;

            // Wrap around
            if (newLevel < 1) newLevel = maxLevels;
            if (newLevel > maxLevels) newLevel = 1;

            if (newLevel !== GAME_CONFIG.currentLevel) {
                console.log(`Switching to Level ${newLevel}`);
                GAME_CONFIG.currentLevel = newLevel;
                await this.reset();
            }
        } catch (error) {
            console.error("Failed to change level:", error);
            // Hide on error so user isn't stuck
            hideLoadingScreen();
        }
    }

    /**
     * Create and configure the game scene
     */
    private createScene(): Scene {
        const scene = new Scene(this.engine);
        scene.collisionsEnabled = true;
        scene.gravity = new Vector3(0, -9.81, 0);

        // Setup lighting using extracted module
        const { shadowGenerator } = setupLighting(scene);
        this.shadowGenerator = shadowGenerator;

        // Setup skybox using extracted module
        setupSkybox(scene);

        return scene;
    }


    /**
     * Start the render loop
     */
    /**
     * Start the render loop
     */
    private run(): void {
        // Environment loading and ready handler are now handled in setup()

        this.engine.runRenderLoop(() => {
            this.scene?.render();

            // Update FPS
            if (MAIN_CONFIG.showFPS) {
                const fps = this.engine.getFps();
                if (this.mobileController) {
                    this.mobileController.updateFPS(fps);
                } else if (this.desktopFPS) {
                    this.desktopFPS.textContent = `FPS: ${Math.floor(fps)}`;
                }
            }
        });
    }



    /**
     * Dispose of all resources - called when component unmounts
     */
    public dispose(): void {
        console.log("Disposing Babylon.js App...");

        // Dispose controllers
        if (this.navigationController) {
            this.navigationController.dispose();
            this.navigationController = null;
        }
        if (this.mobileController) {
            this.mobileController.dispose();
            this.mobileController = null;
        }

        // Dispose player
        if (this.player) {
            this.player.dispose();
        }

        // Dispose UI
        if (this.ui) {
            this.ui.dispose();
        }

        // Dispose scene
        if (this.scene) {
            this.scene.dispose();
        }

        // Dispose engine
        if (this.engine) {
            this.engine.dispose();
        }

        // Clean up audio
        if (this.switchSound) {
            this.switchSound.pause();
            this.switchSound = null;
        }

        // Remove desktop FPS element
        if (this.desktopFPS) {
            this.desktopFPS.parentElement?.remove();
            this.desktopFPS = null;
        }

        console.log("Babylon.js App disposed successfully");
    }
}
