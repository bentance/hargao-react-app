import { Player } from "./player";
import { PLAYER_CONFIG } from "./config";
import { PlayerStateType } from "./types";

/**
 * Base class for player states
 */
export class PlayerState {
    protected player: Player;

    constructor(player: Player) {
        this.player = player;
    }

    /** Called when entering this state */
    enter(): void { }

    /** Called every frame while in this state */
    update(_deltaTime: number): void { }

    /** Called when exiting this state */
    exit(): void { }
}

/**
 * Idle state - player is standing still
 */
export class IdleState extends PlayerState {
    override enter(): void {
        this.player.playAnimation(this.player.idleAnim, true);
        // Stop walking sound when idle
        this.player.stopWalkingSound();
    }

    override update(_deltaTime: number): void {
        // Check for movement input
        if (this.player.input.horizontal !== 0 || this.player.input.vertical !== 0) {
            this.player.transitionTo(PlayerStateType.RUN);
            return;
        }

        // Apply friction/stop horizontal movement
        this.player.velocity.x = 0;
        this.player.velocity.z = 0;
    }

    override exit(): void { }
}

/**
 * Run state - player is moving
 */
export class RunState extends PlayerState {
    private stopTimer: number = 0;
    private readonly stopDelay: number = PLAYER_CONFIG.animation.idleTransitionDelay;

    override enter(): void {
        this.stopTimer = 0;
        this.player.playAnimation(this.player.runAnim, true);
        // Start walking sound when running
        this.player.playWalkingSound();
    }

    override update(deltaTime: number): void {
        const hasInput = this.player.input.horizontal !== 0 || this.player.input.vertical !== 0;

        if (!hasInput) {
            // No input - increment timer
            this.stopTimer += deltaTime;

            // Only transition to idle after grace period
            if (this.stopTimer >= this.stopDelay) {
                this.player.transitionTo(PlayerStateType.IDLE);
                return;
            }
        } else {
            // Has input - reset timer
            this.stopTimer = 0;
        }

        this.player.processMovement();
    }

    override exit(): void {
        this.stopTimer = 0;
        // Stop walking sound when exiting run state
        this.player.stopWalkingSound();
    }
}
