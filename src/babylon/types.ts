// Player state types as const object for type safety
export const PlayerStateType = {
    IDLE: "idle",
    RUN: "run",
    JUMP: "jump",
    FALL: "fall"
} as const;

export type PlayerStateType = typeof PlayerStateType[keyof typeof PlayerStateType];

// Input key bindings as const object
export const InputKey = {
    MOVE_FORWARD: "w",
    MOVE_FORWARD_ALT: "arrowup",
    MOVE_BACKWARD: "s",
    MOVE_BACKWARD_ALT: "arrowdown",
    MOVE_LEFT: "a",
    MOVE_LEFT_ALT: "arrowleft",
    MOVE_RIGHT: "d",
    MOVE_RIGHT_ALT: "arrowright",
    RESTART: "r",
    INTERACT: "e"
} as const;

export type InputKey = typeof InputKey[keyof typeof InputKey];
