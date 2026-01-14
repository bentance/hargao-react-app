import { Scene, ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import { InputKey } from "./types";

/**
 * Handles keyboard input for player controls
 */
export class InputController {
    private inputMap: Record<string, boolean> = {};

    public horizontal: number = 0;
    public vertical: number = 0;

    // Flag to indicate if mobile input is active (prevents keyboard override)
    public isMobileInputActive: boolean = false;

    // Flag to globally block input (e.g. when UI is open)
    public isBlocked: boolean = false;

    constructor(scene: Scene) {
        scene.actionManager = new ActionManager(scene);

        // Register key down
        scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
                this.inputMap[evt.sourceEvent.key.toLowerCase()] = true;
            })
        );

        // Register key up
        scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
                this.inputMap[evt.sourceEvent.key.toLowerCase()] = false;
            })
        );

        // Update input values each frame
        scene.onBeforeRenderObservable.add(() => {
            this.updateFromKeyboard();
        });
    }

    /**
     * Check if a key is currently pressed
     */
    private isKeyPressed(key: InputKey): boolean {
        return this.inputMap[key] === true;
    }

    public setInputBlocked(blocked: boolean): void {
        this.isBlocked = blocked;
    }

    /**
     * Update horizontal and vertical input values from keyboard state
     * Only updates if mobile input is NOT active
     */
    private updateFromKeyboard(): void {
        // If inputs are globally blocked (UI open), force values to 0
        if (this.isBlocked) {
            this.horizontal = 0;
            this.vertical = 0;
            return;
        }

        // Skip keyboard update if mobile input is currently active
        // This allows the MobileController to set these values directly
        if (this.isMobileInputActive) {
            return;
        }

        // Reset values before reading keyboard
        this.horizontal = 0;
        this.vertical = 0;

        // Vertical movement (forward/backward)
        if (this.isKeyPressed(InputKey.MOVE_FORWARD) || this.isKeyPressed(InputKey.MOVE_FORWARD_ALT)) {
            this.vertical = 1;
        }
        if (this.isKeyPressed(InputKey.MOVE_BACKWARD) || this.isKeyPressed(InputKey.MOVE_BACKWARD_ALT)) {
            this.vertical = -1;
        }

        // Horizontal movement (left/right)
        if (this.isKeyPressed(InputKey.MOVE_RIGHT) || this.isKeyPressed(InputKey.MOVE_RIGHT_ALT)) {
            this.horizontal = 1;
        }
        if (this.isKeyPressed(InputKey.MOVE_LEFT) || this.isKeyPressed(InputKey.MOVE_LEFT_ALT)) {
            this.horizontal = -1;
        }
    }
}
