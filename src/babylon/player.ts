import { Scene, Vector3, MeshBuilder, Mesh, Ray, SceneLoader, AbstractMesh, Quaternion, ShadowGenerator, AnimationGroup } from "@babylonjs/core";
import { InputController } from "./inputController";
import { PlayerState, IdleState, RunState } from "./playerStates";
import { PLAYER_CONFIG, DEBUG_CONFIG, GAME_CONFIG } from "./config";
import { PlayerStateType } from "./types";

export class Player {
    private scene: Scene;
    public mesh: Mesh;
    private characterMesh: AbstractMesh | null = null;

    public input: InputController;

    // State Machine
    private currentState: PlayerState;
    private states: Map<PlayerStateType, PlayerState>;

    // Physics & Gameplay
    public readonly speed: number = PLAYER_CONFIG.movement.speed;
    public gravity: Vector3 = new Vector3(0, PLAYER_CONFIG.physics.gravity, 0);
    public velocity: Vector3 = new Vector3(0, 0, 0);
    public isGrounded: boolean = false;

    private shadowGenerator: ShadowGenerator;

    // Animations
    public idleAnim: AnimationGroup | null = null;
    public runAnim: AnimationGroup | null = null;
    private currentAnim: AnimationGroup | null = null;

    // Animation blending
    private targetAnim: AnimationGroup | null = null;
    private blendProgress: number = 1.0;
    private readonly blendDuration: number = PLAYER_CONFIG.animation.blendDuration;

    // Walking sound (using native HTML5 Audio for better browser compatibility)
    private walkingSound: HTMLAudioElement | null = null;
    private walkingSoundReady: boolean = false;
    private wantsToPlayWalkingSound: boolean = false;

    constructor(scene: Scene, input: InputController, shadowGenerator: ShadowGenerator) {
        this.scene = scene;
        this.input = input;
        this.shadowGenerator = shadowGenerator;
        this.mesh = this.createPlayerMesh();

        // Initialize States
        this.states = new Map();
        this.states.set(PlayerStateType.IDLE, new IdleState(this));
        this.states.set(PlayerStateType.RUN, new RunState(this));

        this.currentState = this.states.get(PlayerStateType.IDLE)!;
        this.currentState.enter();

        // Initialize walking sound if enabled (using native HTML5 Audio)
        if (GAME_CONFIG.enableWalkingSound) {
            // Convert 1-10 scale to 0-1 volume
            const volume = Math.max(0.1, Math.min(1, GAME_CONFIG.walkingSoundVolume / 10));

            this.walkingSound = new Audio("/sounds/walking_sound_0.mp3");
            this.walkingSound.loop = true;
            this.walkingSound.volume = volume;

            this.walkingSound.addEventListener("canplaythrough", () => {
                console.log("Walking sound loaded and ready, volume:", volume);
                this.walkingSoundReady = true;
                // If player was trying to walk before sound loaded, play now
                if (this.wantsToPlayWalkingSound && this.walkingSound) {
                    console.log("Auto-playing sound now that it's ready");
                    this.walkingSound.play().catch(e => console.error("Audio play failed:", e));
                }
            });

            this.walkingSound.load();
        }

        this.scene.onBeforeRenderObservable.add(() => {
            this.update();
        });
    }

    private createPlayerMesh(): Mesh {
        const { height, radius } = PLAYER_CONFIG.capsule;
        const mesh = MeshBuilder.CreateCapsule("player", { height, radius }, this.scene);
        mesh.position = new Vector3(0, 0.5, 10);
        mesh.checkCollisions = true;
        // Use a capsule-shaped ellipsoid for better physics interaction
        const { ellipsoid, ellipsoidOffset } = PLAYER_CONFIG.capsule;
        mesh.ellipsoid = new Vector3(ellipsoid.x, ellipsoid.y, ellipsoid.z);
        mesh.ellipsoidOffset = new Vector3(ellipsoidOffset.x, ellipsoidOffset.y, ellipsoidOffset.z);


        // Make capsule invisible (physics only)
        mesh.visibility = 0;

        this.loadCharacterModel(mesh);

        return mesh;
    }

    /**
     * Play animation with crossfade blending
     * @param anim - The animation group to play
     * @param loop - Whether the animation should loop
     */
    public playAnimation(anim: AnimationGroup | null, loop: boolean = true): void {
        if (!anim) return;

        // Skip if this animation is already playing or is the blend target
        if (anim === this.currentAnim || anim === this.targetAnim) return;

        // If we're currently blending, complete the current blend first
        if (this.targetAnim && this.currentAnim) {
            this.currentAnim.stop();
            this.currentAnim = this.targetAnim;
            this.targetAnim = null;
            this.blendProgress = 1.0;
        }

        // If we have a current animation, start blending
        if (this.currentAnim) {
            this.targetAnim = anim;
            this.blendProgress = 0;

            // Start the new animation but with weight 0
            anim.start(loop, 1.0, anim.from, anim.to, false);
            anim.setWeightForAllAnimatables(0);
        } else {
            // No current animation, just start directly
            anim.start(loop, 1.0, anim.from, anim.to, false);
            anim.setWeightForAllAnimatables(1.0);
            this.currentAnim = anim;
        }
    }

    /**
     * Update animation blending each frame
     */
    private updateAnimationBlend(deltaTime: number): void {
        if (!this.targetAnim || !this.currentAnim || this.blendProgress >= 1.0) return;

        this.blendProgress += deltaTime / this.blendDuration;

        if (this.blendProgress >= 1.0) {
            this.blendProgress = 1.0;
            // Blend complete - stop old animation
            this.currentAnim.stop();
            this.targetAnim.setWeightForAllAnimatables(1.0);
            this.currentAnim = this.targetAnim;
            this.targetAnim = null;
        } else {
            // During blend - interpolate weights
            const newWeight = this.blendProgress;
            const oldWeight = 1.0 - this.blendProgress;

            this.currentAnim.setWeightForAllAnimatables(oldWeight);
            this.targetAnim.setWeightForAllAnimatables(newWeight);
        }
    }

    /**
     * Load and setup the character 3D model
     */
    private async loadCharacterModel(parentMesh: Mesh): Promise<void> {
        const { path, filename, scale, yOffset } = PLAYER_CONFIG.model;

        console.log(`Loading character: ${path}${filename} with scale ${scale}`);

        try {
            const result = await SceneLoader.ImportMeshAsync("", path, filename, this.scene);

            console.log(`Character loaded! Meshes: ${result.meshes.length}, AnimGroups: ${result.animationGroups.length}`);

            const root = result.meshes[0];
            this.characterMesh = root;

            // Log available animations in debug mode
            if (DEBUG_CONFIG.logAnimations) {
                console.log("Loaded animations:", result.animationGroups.map(ag => ag.name));
            }

            // Log materials for debugging
            console.log("Character materials:", result.meshes.map(m => ({
                name: m.name,
                material: m.material?.name || 'none'
            })));

            // Find animations by name
            this.idleAnim = result.animationGroups.find(ag =>
                ag.name.toLowerCase().includes("idle")
            ) || null;

            this.runAnim = result.animationGroups.find(ag =>
                ag.name.toLowerCase().includes("run")
            ) || result.animationGroups.find(ag =>
                ag.name.toLowerCase().includes("walk")
            ) || null;

            // Stop all animations initially
            result.animationGroups.forEach(ag => ag.stop());

            // Start idle animation immediately after loading
            if (this.idleAnim) {
                this.idleAnim.start(true, 1.0, this.idleAnim.from, this.idleAnim.to, false);
                this.idleAnim.setWeightForAllAnimatables(1.0);
                this.currentAnim = this.idleAnim;
            }

            // Parent the character to the capsule first
            root.parent = parentMesh;

            // Adjust position/rotation to fit inside capsule
            root.position.y = yOffset;
            root.rotation = Vector3.Zero();
            root.scaling = new Vector3(scale, scale, scale);

            // Apply Cell Shading and shadow casters
            this.setupCharacterMaterials(result.meshes, root);

            if (DEBUG_CONFIG.logModelLoading) {
                console.log("Character loaded with shadow casters:", result.meshes.length, "meshes");
            }
        } catch (error) {
            console.error("Failed to load character model:", error);
        }
    }

    /**
     * Setup shadow casters for character meshes
     */
    private setupCharacterMaterials(meshes: AbstractMesh[], root: AbstractMesh): void {
        // Check if museum room shadow generator exists
        const museumShadowGen = (this.scene as any).museumShadowGenerator as ShadowGenerator | undefined;

        for (const childMesh of meshes) {
            if (childMesh === root) continue;

            // Add as shadow caster to main shadow generator
            this.shadowGenerator.addShadowCaster(childMesh, true);
            childMesh.receiveShadows = true;

            // Also add to museum spotlight shadow generator if it exists
            if (museumShadowGen) {
                museumShadowGen.addShadowCaster(childMesh, true);
            }
        }

        console.log("Added", meshes.length - 1, "player meshes as shadow casters");
    }

    /**
     * Transition to a new state
     */
    public transitionTo(stateKey: PlayerStateType): void {
        const nextState = this.states.get(stateKey);
        if (nextState && nextState !== this.currentState) {
            this.currentState.exit();
            this.currentState = nextState;
            this.currentState.enter();
        }
    }

    /**
     * Main update loop - called every frame
     */
    private update(): void {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

        this.checkGround();
        this.currentState.update(deltaTime);
        this.updateAnimationBlend(deltaTime);
        this.applyPhysics(deltaTime);
        this.mesh.moveWithCollisions(this.velocity);
    }

    /**
     * Check if player is grounded using raycast
     */
    private checkGround(): void {
        const ray = new Ray(
            this.mesh.position,
            Vector3.Down(),
            PLAYER_CONFIG.physics.groundCheckDistance
        );
        const pick = this.scene.pickWithRay(ray, (mesh) =>
            mesh.isPickable && mesh !== this.mesh && !mesh.isDescendantOf(this.mesh)
        );
        this.isGrounded = pick?.hit ?? false;
    }

    /**
     * Process camera-relative movement
     */
    public processMovement(): void {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;
        const moveVector = Vector3.Zero();

        if (this.scene.activeCamera) {
            const forward = this.scene.activeCamera.getForwardRay().direction;
            forward.y = 0;
            forward.normalize();

            const right = Vector3.Cross(Vector3.Up(), forward);

            if (this.input.vertical !== 0) {
                moveVector.addInPlace(forward.scale(this.input.vertical));
            }
            if (this.input.horizontal !== 0) {
                moveVector.addInPlace(right.scale(this.input.horizontal));
            }
        }

        if (moveVector.length() > 0) {
            moveVector.normalize().scaleInPlace(this.speed * deltaTime * 60);

            // Rotate character to face movement direction
            this.rotateCharacterTowards(moveVector, deltaTime);
        }

        this.velocity.x = moveVector.x;
        this.velocity.z = moveVector.z;
    }

    /**
     * Smoothly rotate character towards movement direction
     */
    private rotateCharacterTowards(moveVector: Vector3, deltaTime: number): void {
        if (!this.characterMesh) return;

        const targetAngle = Math.atan2(moveVector.x, moveVector.z);
        const targetQuaternion = Quaternion.FromEulerAngles(0, targetAngle, 0);

        if (!this.characterMesh.rotationQuaternion) {
            this.characterMesh.rotationQuaternion = Quaternion.Identity();
        }

        this.characterMesh.rotationQuaternion = Quaternion.Slerp(
            this.characterMesh.rotationQuaternion,
            targetQuaternion,
            PLAYER_CONFIG.movement.rotationSpeed * deltaTime
        );
    }

    /**
     * Apply physics (gravity) to velocity
     */
    private applyPhysics(deltaTime: number): void {
        // Apply gravity
        this.velocity.y += this.gravity.y * deltaTime * 60;

        // Terminal velocity
        if (this.velocity.y < PLAYER_CONFIG.physics.terminalVelocity) {
            this.velocity.y = PLAYER_CONFIG.physics.terminalVelocity;
        }

        // Ground stick
        if (this.isGrounded && this.velocity.y < 0) {
            this.velocity.y = PLAYER_CONFIG.physics.groundStickForce;
        }
    }

    /**
     * Play walking sound (looped)
     */
    public playWalkingSound(): void {
        this.wantsToPlayWalkingSound = true;

        if (this.walkingSound) {
            if (this.walkingSoundReady && this.walkingSound.paused) {
                console.log("Playing walking sound");
                this.walkingSound.play().catch(e => console.error("Audio play failed:", e));
            } else if (!this.walkingSoundReady) {
                console.log("Walking sound not ready yet, will play when loaded");
            }
        }
    }

    /**
     * Stop walking sound
     */
    public stopWalkingSound(): void {
        this.wantsToPlayWalkingSound = false;

        if (this.walkingSound && !this.walkingSound.paused) {
            console.log("Stopping walking sound");
            this.walkingSound.pause();
            this.walkingSound.currentTime = 0;
        }
    }
    /**
     * Clean up resources
     */
    public dispose(): void {
        this.stopWalkingSound();
        if (this.walkingSound) {
            this.walkingSound.pause();
            this.walkingSound = null;
        }
    }
}
