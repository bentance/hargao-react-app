import { ArcRotateCamera } from "@babylonjs/core";
import { InputController } from "./inputController";
import { CAMERA_CONFIG, MAIN_CONFIG } from "./config";

/**
 * Utility to detect if the device is mobile/touch-based
 * This is used to enable touch controls (joystick, touch camera rotation)
 */
export function isMobileDevice(): boolean {
    // Check for touch capability
    const hasTouchScreen = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
    );

    // Check user agent for mobile devices
    const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Special check for iPad - iPadOS 13+ reports as Mac in user agent
    // but we can detect it by checking for touch + Mac platform
    const isIPad = (
        navigator.maxTouchPoints > 1 &&
        /Macintosh/i.test(navigator.userAgent)
    );

    // Consider it mobile/tablet if:
    // 1. Has touch screen AND mobile user agent, OR
    // 2. Is an iPad (including iPadOS 13+), OR
    // 3. Has touch screen AND screen is tablet/phone size (max 1366px for landscape tablets)
    return (hasTouchScreen && mobileUserAgent) ||
        isIPad ||
        (hasTouchScreen && window.innerWidth <= 1366);
}

/**
 * Detect if the device is specifically a phone (smaller, less powerful)
 * Used to apply more aggressive performance optimizations
 */
export function isPhoneDevice(): boolean {
    // Check for iPhone specifically
    const isIPhone = /iPhone/i.test(navigator.userAgent);

    // Check for Android phones (not tablets)
    const isAndroidPhone = /Android/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent);

    // Also consider small screens as phones
    const isSmallScreen = window.innerWidth <= 480 ||
        (window.innerWidth <= 896 && window.innerHeight <= 480); // Landscape phone

    return isIPhone || isAndroidPhone || (isMobileDevice() && isSmallScreen);
}

/**
 * Configuration for the virtual joystick
 */
interface JoystickConfig {
    maxRadius: number;
    baseSize: number;
    knobSize: number;
    opacity: number;
    activeOpacity: number;
}

const JOYSTICK_CONFIG: JoystickConfig = {
    maxRadius: 50,
    baseSize: 120,
    knobSize: 50,
    opacity: 0.3,
    activeOpacity: 0.7
};

/**
 * Mobile controller class that handles virtual joystick and touch camera rotation
 */
export class MobileController {
    private inputController: InputController;
    private camera: ArcRotateCamera | null = null;

    // Joystick elements
    private joystickContainer: HTMLDivElement | null = null;
    private joystickBase: HTMLDivElement | null = null;
    private joystickKnob: HTMLDivElement | null = null;

    // Touch tracking
    private joystickTouchId: number | null = null;
    private cameraTouchId: number | null = null;
    private joystickCenter: { x: number; y: number } = { x: 0, y: 0 };
    private lastCameraTouch: { x: number; y: number } = { x: 0, y: 0 };

    // Camera rotation area element
    private cameraRotationArea: HTMLDivElement | null = null;

    // View indicator
    private viewIndicator: HTMLDivElement | null = null;

    // Interaction button
    private interactionButton: HTMLDivElement | null = null;
    private onInteract: (() => void) | null = null;

    // FPS Display
    private fpsElement: HTMLDivElement | null = null;

    private isActive: boolean = false;

    // Flag to block input when UI panels are visible
    private isInputBlocked: boolean = false;

    constructor(inputController: InputController) {
        this.inputController = inputController;

        if (isMobileDevice()) {
            this.initialize();
        }
    }

    /**
     * Set the camera for camera rotation control
     */
    public setCamera(camera: ArcRotateCamera): void {
        this.camera = camera;
    }

    /**
     * Set interaction callback
     */
    public setInteractionCallback(callback: () => void): void {
        this.onInteract = callback;
    }

    /**
     * Block or unblock input (used when UI panels are visible)
     */
    public setInputBlocked(blocked: boolean): void {
        this.isInputBlocked = blocked;

        const pointerEvents = blocked ? 'none' : 'auto';

        if (this.joystickContainer) {
            this.joystickContainer.style.pointerEvents = pointerEvents;
        }

        if (this.cameraRotationArea) {
            this.cameraRotationArea.style.pointerEvents = pointerEvents;
        }
    }

    /**
     * Initialize all mobile controls
     */
    private initialize(): void {
        this.isActive = true;
        this.createViewIndicator();
        this.createJoystick();
        this.createCameraRotationArea();
        this.createInteractionButton();
        this.setupTouchEventListeners();
    }

    /**
     * Create the "Phone view" / "Desktop view" indicator
     */
    private createViewIndicator(): void {
        if (!MAIN_CONFIG.showViewIndicators) return;

        this.viewIndicator = document.createElement('div');
        this.viewIndicator.id = 'viewIndicator';

        // Use smaller sizing on phones
        const isPhone = isPhoneDevice();

        Object.assign(this.viewIndicator.style, {
            position: 'fixed',
            top: isPhone ? '45px' : '70px', // Adjust for smaller screens
            right: isPhone ? '10px' : '20px',
            color: 'black',
            fontSize: isPhone ? '9px' : '12px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontWeight: 'bold',
            zIndex: '1001',
            textShadow: '0 0 4px white, 0 0 4px white',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            pointerEvents: 'none'
        });

        this.viewIndicator.textContent = 'Phone View';
        document.body.appendChild(this.viewIndicator);

        // create FPS counter if enabled
        if (MAIN_CONFIG.showFPS) {
            this.fpsElement = document.createElement('div');
            this.fpsElement.id = 'fpsCounter';
            Object.assign(this.fpsElement.style, {
                position: 'fixed',
                top: isPhone ? '60px' : '90px', // below view indicator
                right: isPhone ? '10px' : '20px',
                color: 'black',
                fontSize: isPhone ? '9px' : '12px',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                fontWeight: 'bold',
                zIndex: '1001',
                textShadow: '0 0 4px white, 0 0 4px white',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                pointerEvents: 'none',
                textAlign: 'right'
            });
            this.fpsElement.textContent = "FPS: 0";
            document.body.appendChild(this.fpsElement);
        }
    }

    /**
     * Update FPS display
     */
    public updateFPS(fps: number): void {
        if (this.fpsElement) {
            this.fpsElement.textContent = `FPS: ${Math.floor(fps)}`;
        }
    }

    /**
     * Create the virtual joystick UI elements
     */
    private createJoystick(): void {
        // Container for joystick (left half of screen)
        this.joystickContainer = document.createElement('div');
        this.joystickContainer.id = 'joystickContainer';

        Object.assign(this.joystickContainer.style, {
            position: 'fixed',
            left: '0',
            top: '0',
            width: '50%',
            height: '100%',
            zIndex: '1000',
            pointerEvents: 'auto',
            touchAction: 'none'
        });

        // Joystick base (appears on touch)
        this.joystickBase = document.createElement('div');
        this.joystickBase.id = 'joystickBase';

        Object.assign(this.joystickBase.style, {
            position: 'absolute',
            width: `${JOYSTICK_CONFIG.baseSize}px`,
            height: `${JOYSTICK_CONFIG.baseSize}px`,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            border: '3px solid rgba(255, 255, 255, 0.4)',
            opacity: '0',
            transition: 'opacity 0.15s ease-out',
            pointerEvents: 'none',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.1) inset'
        });

        // Joystick knob (the draggable part)
        this.joystickKnob = document.createElement('div');
        this.joystickKnob.id = 'joystickKnob';

        Object.assign(this.joystickKnob.style, {
            position: 'absolute',
            width: `${JOYSTICK_CONFIG.knobSize}px`,
            height: `${JOYSTICK_CONFIG.knobSize}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(200, 200, 200, 0.8))',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(255, 255, 255, 0.2) inset',
            opacity: '0',
            transition: 'opacity 0.15s ease-out',
            pointerEvents: 'none',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
        });

        this.joystickBase.appendChild(this.joystickKnob);
        this.joystickContainer.appendChild(this.joystickBase);
        document.body.appendChild(this.joystickContainer);
    }

    /**
     * Create the camera rotation touch area
     */
    private createCameraRotationArea(): void {
        this.cameraRotationArea = document.createElement('div');
        this.cameraRotationArea.id = 'cameraRotationArea';

        Object.assign(this.cameraRotationArea.style, {
            position: 'fixed',
            right: '0',
            top: '0',
            width: '50%',
            height: '100%',
            zIndex: '999',
            pointerEvents: 'auto',
            touchAction: 'none'
        });

        document.body.appendChild(this.cameraRotationArea);
    }

    /**
     * Create the interaction button (E key equivalent)
     */
    private createInteractionButton(): void {
        this.interactionButton = document.createElement('div');
        this.interactionButton.id = 'interactionButton';

        Object.assign(this.interactionButton.style, {
            position: 'fixed',
            right: '30px',
            bottom: '100px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '3px solid rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'rgba(0, 0, 0, 0.7)',
            zIndex: '1002',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'transform 0.1s ease, background 0.1s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
        });

        this.interactionButton.textContent = 'E';

        // Touch event for interaction
        this.interactionButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.interactionButton) {
                this.interactionButton.style.transform = 'scale(0.9)';
                this.interactionButton.style.background = 'rgba(0, 0, 0, 0.2)';
            }

            if (this.onInteract) {
                this.onInteract();
            }
        });

        this.interactionButton.addEventListener('touchend', () => {
            if (this.interactionButton) {
                this.interactionButton.style.transform = 'scale(1)';
                this.interactionButton.style.background = 'rgba(255, 255, 255, 0.15)';
            }
        });

        document.body.appendChild(this.interactionButton);
    }

    /**
     * Setup all touch event listeners
     */
    private setupTouchEventListeners(): void {
        if (!this.joystickContainer || !this.cameraRotationArea) return;

        // Joystick touch events
        this.joystickContainer.addEventListener('touchstart', this.handleJoystickTouchStart.bind(this), { passive: false });
        this.joystickContainer.addEventListener('touchmove', this.handleJoystickTouchMove.bind(this), { passive: false });
        this.joystickContainer.addEventListener('touchend', this.handleJoystickTouchEnd.bind(this), { passive: false });
        this.joystickContainer.addEventListener('touchcancel', this.handleJoystickTouchEnd.bind(this), { passive: false });

        // Camera rotation touch events
        this.cameraRotationArea.addEventListener('touchstart', this.handleCameraTouchStart.bind(this), { passive: false });
        this.cameraRotationArea.addEventListener('touchmove', this.handleCameraTouchMove.bind(this), { passive: false });
        this.cameraRotationArea.addEventListener('touchend', this.handleCameraTouchEnd.bind(this), { passive: false });
        this.cameraRotationArea.addEventListener('touchcancel', this.handleCameraTouchEnd.bind(this), { passive: false });
    }

    /**
     * Handle joystick touch start
     */
    private handleJoystickTouchStart(event: TouchEvent): void {
        event.preventDefault();

        // Block input when UI is visible
        if (this.isInputBlocked) return;

        // Only track one touch for joystick
        if (this.joystickTouchId !== null) return;

        const touch = event.changedTouches[0];
        this.joystickTouchId = touch.identifier;

        // Set flag to prevent keyboard from overriding joystick input
        this.inputController.isMobileInputActive = true;

        // Position joystick at touch location
        this.joystickCenter = { x: touch.clientX, y: touch.clientY };

        if (this.joystickBase && this.joystickKnob) {
            const halfBase = JOYSTICK_CONFIG.baseSize / 2;

            this.joystickBase.style.left = `${touch.clientX - halfBase}px`;
            this.joystickBase.style.top = `${touch.clientY - halfBase}px`;
            this.joystickBase.style.opacity = String(JOYSTICK_CONFIG.activeOpacity);
            this.joystickKnob.style.opacity = '1';
            this.joystickKnob.style.left = '50%';
            this.joystickKnob.style.top = '50%';
        }
    }

    /**
     * Handle joystick touch move
     */
    private handleJoystickTouchMove(event: TouchEvent): void {
        event.preventDefault();

        if (this.joystickTouchId === null) return;

        // Find our tracked touch
        let touch: Touch | null = null;
        for (let i = 0; i < event.changedTouches.length; i++) {
            if (event.changedTouches[i].identifier === this.joystickTouchId) {
                touch = event.changedTouches[i];
                break;
            }
        }

        if (!touch) return;

        // Calculate offset from center
        let deltaX = touch.clientX - this.joystickCenter.x;
        let deltaY = touch.clientY - this.joystickCenter.y;

        // Calculate distance
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Clamp to max radius
        if (distance > JOYSTICK_CONFIG.maxRadius) {
            const scale = JOYSTICK_CONFIG.maxRadius / distance;
            deltaX *= scale;
            deltaY *= scale;
        }

        // Update knob position
        if (this.joystickKnob) {
            const halfKnob = JOYSTICK_CONFIG.knobSize / 2;
            const halfBase = JOYSTICK_CONFIG.baseSize / 2;

            this.joystickKnob.style.left = `${halfBase + deltaX - halfKnob}px`;
            this.joystickKnob.style.top = `${halfBase + deltaY - halfKnob}px`;
            this.joystickKnob.style.transform = 'none';
        }

        // Update input controller values (-1 to 1)
        const normalizedX = deltaX / JOYSTICK_CONFIG.maxRadius;
        const normalizedY = deltaY / JOYSTICK_CONFIG.maxRadius;

        // Map to horizontal/vertical (note: Y is inverted for forward/backward)
        this.inputController.horizontal = normalizedX;
        this.inputController.vertical = -normalizedY; // Negative because pushing up should move forward
    }

    /**
     * Handle joystick touch end
     */
    private handleJoystickTouchEnd(event: TouchEvent): void {
        // Check if our tracked touch ended
        let touchEnded = false;
        for (let i = 0; i < event.changedTouches.length; i++) {
            if (event.changedTouches[i].identifier === this.joystickTouchId) {
                touchEnded = true;
                break;
            }
        }

        if (!touchEnded) return;

        this.joystickTouchId = null;

        // Clear mobile input flag
        this.inputController.isMobileInputActive = false;

        // Reset joystick visual
        if (this.joystickBase && this.joystickKnob) {
            this.joystickBase.style.opacity = '0';
            this.joystickKnob.style.opacity = '0';
            this.joystickKnob.style.left = '50%';
            this.joystickKnob.style.top = '50%';
            this.joystickKnob.style.transform = 'translate(-50%, -50%)';
        }

        // Reset input values
        this.inputController.horizontal = 0;
        this.inputController.vertical = 0;
    }

    /**
     * Handle camera touch start
     */
    private handleCameraTouchStart(event: TouchEvent): void {
        event.preventDefault();

        // Block input when UI is visible
        if (this.isInputBlocked) return;

        // Ignore touches on the interaction button
        const touch = event.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.id === 'interactionButton') return;

        // Only track one touch for camera
        if (this.cameraTouchId !== null) return;

        this.cameraTouchId = touch.identifier;
        this.lastCameraTouch = { x: touch.clientX, y: touch.clientY };
    }

    /**
     * Handle camera touch move
     */
    private handleCameraTouchMove(event: TouchEvent): void {
        if (this.cameraTouchId === null || !this.camera) return;

        // Find our tracked touch
        let touch: Touch | null = null;
        for (let i = 0; i < event.changedTouches.length; i++) {
            if (event.changedTouches[i].identifier === this.cameraTouchId) {
                touch = event.changedTouches[i];
                break;
            }
        }

        if (!touch) return;

        // Calculate delta movement
        const deltaX = touch.clientX - this.lastCameraTouch.x;
        const deltaY = touch.clientY - this.lastCameraTouch.y;

        // Update camera rotation (similar to mouse look)
        const sensitivity = CAMERA_CONFIG.sensitivity * 1.5; // Slightly higher for touch
        this.camera.alpha -= deltaX * sensitivity;
        this.camera.beta -= deltaY * sensitivity;

        // Clamp beta
        this.camera.beta = Math.max(
            CAMERA_CONFIG.lowerBetaLimit,
            Math.min(CAMERA_CONFIG.upperBetaLimit, this.camera.beta)
        );

        // Update last position
        this.lastCameraTouch = { x: touch.clientX, y: touch.clientY };
    }

    /**
     * Handle camera touch end
     */
    private handleCameraTouchEnd(event: TouchEvent): void {
        // Check if our tracked touch ended
        for (let i = 0; i < event.changedTouches.length; i++) {
            if (event.changedTouches[i].identifier === this.cameraTouchId) {
                this.cameraTouchId = null;
                break;
            }
        }
    }

    /**
     * Check if mobile controls are active
     */
    public get isMobileActive(): boolean {
        return this.isActive;
    }

    /**
     * Dispose of all mobile controls
     */
    public dispose(): void {
        if (this.joystickContainer) {
            this.joystickContainer.remove();
            this.joystickContainer = null;
        }
        if (this.cameraRotationArea) {
            this.cameraRotationArea.remove();
            this.cameraRotationArea = null;
        }
        if (this.viewIndicator) {
            this.viewIndicator.remove();
            this.viewIndicator = null;
        }
        if (this.fpsElement) {
            this.fpsElement.remove();
            this.fpsElement = null;
        }
        if (this.interactionButton) {
            this.interactionButton.remove();
            this.interactionButton = null;
        }

        this.joystickBase = null;
        this.joystickKnob = null;
        this.isActive = false;
    }
}

/**
 * Create the desktop view indicator (shown on desktop)
 */
export function createDesktopViewIndicator(): { indicator: HTMLDivElement, fpsCounter: HTMLDivElement | null } | null {
    if (isMobileDevice() || !MAIN_CONFIG.showViewIndicators) return null;

    const indicator = document.createElement('div');
    indicator.id = 'viewIndicator';

    Object.assign(indicator.style, {
        position: 'fixed',
        top: '70px',
        right: '20px',
        color: 'black',
        fontSize: '12px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontWeight: 'bold',
        zIndex: '1001',
        textShadow: '0 0 4px white, 0 0 4px white',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        pointerEvents: 'none'
    });

    indicator.textContent = 'Desktop View';
    document.body.appendChild(indicator);

    // Add "press 'Esc' to show cursor" hint at top center
    const cursorHint = document.createElement('div');
    cursorHint.id = 'cursorHint';

    Object.assign(cursorHint.style, {
        position: 'fixed',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'black',
        fontSize: '12px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontWeight: 'bold',
        zIndex: '1001',
        textShadow: '0 0 4px white, 0 0 4px white',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        pointerEvents: 'none'
    });

    cursorHint.textContent = "press 'Esc' to show cursor";
    document.body.appendChild(cursorHint);

    let fpsCounter: HTMLDivElement | null = null;
    if (MAIN_CONFIG.showFPS) {
        fpsCounter = document.createElement('div');
        fpsCounter.id = 'fpsCounter';
        Object.assign(fpsCounter.style, {
            position: 'fixed',
            top: '90px', // below view indicator
            right: '20px',
            color: 'black',
            fontSize: '12px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontWeight: 'bold',
            zIndex: '1001',
            textShadow: '0 0 4px white, 0 0 4px white',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            textAlign: 'right'
        });
        fpsCounter.textContent = "FPS: 0";
        document.body.appendChild(fpsCounter);
    }

    return { indicator, fpsCounter };
}
