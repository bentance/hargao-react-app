import { isMobileDevice } from "./mobileController";

/**
 * Controller for "Explore" mode UI navigation buttons
 */
export class NavigationController {
    private prevButton: HTMLDivElement | null = null;
    private nextButton: HTMLDivElement | null = null;

    private onPrev: () => void;
    private onNext: () => void;

    constructor(onPrev: () => void, onNext: () => void) {
        this.onPrev = onPrev;
        this.onNext = onNext;
        this.createButtons();
    }

    private createButtons(): void {
        // Base styles matching the mobile "E" button
        const baseStyle: Partial<CSSStyleDeclaration> = {
            position: 'fixed',
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
            backdropFilter: 'blur(5px)'
        };

        const isMobile = isMobileDevice();

        // Previous Button (Left Arrow)
        this.prevButton = document.createElement('div');
        Object.assign(this.prevButton.style, baseStyle);
        this.prevButton.textContent = '◀';

        // Next Button (Right Arrow)
        this.nextButton = document.createElement('div');
        Object.assign(this.nextButton.style, baseStyle);
        this.nextButton.textContent = '▶';

        // Positioning logic
        if (isMobile) {
            // On Mobile: Left of the E button (which is at right: 30px)
            // Next button to left of E, Prev to left of Next.
            // Spacing: 20px gap.
            // E button right: 30px
            // Next button right: 30 + 60 + 20 = 110px
            // Prev button right: 110 + 60 + 20 = 190px

            this.nextButton.style.right = '110px';
            this.nextButton.style.bottom = '130px';

            this.prevButton.style.right = '190px';
            this.prevButton.style.bottom = '130px';
        } else {
            // On Desktop: Bottom middle of screen
            // Centering two 60px buttons with 20px gap
            // Total width: 60 + 20 + 60 = 140px
            // Left start: calc(50% - 70px)

            this.prevButton.style.left = 'calc(50% - 70px)';
            this.prevButton.style.bottom = '30px';

            this.nextButton.style.left = 'calc(50% + 10px)';
            this.nextButton.style.bottom = '30px';
        }

        // Add Event Listeners
        this.setupButtonEvents(this.prevButton, this.onPrev);
        this.setupButtonEvents(this.nextButton, this.onNext);

        document.body.appendChild(this.prevButton);
        document.body.appendChild(this.nextButton);
    }

    private setupButtonEvents(button: HTMLDivElement, action: () => void): void {
        const handleStart = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            button.style.transform = 'scale(0.9)';
            button.style.background = 'rgba(0, 0, 0, 0.2)';
            action();
        };

        const handleEnd = () => {
            button.style.transform = 'scale(1)';
            button.style.background = 'rgba(255, 255, 255, 0.15)';
        };

        // Touch events
        button.addEventListener('touchstart', handleStart);
        button.addEventListener('touchend', handleEnd);

        // Mouse events (for desktop)
        button.addEventListener('mousedown', handleStart);
        button.addEventListener('mouseup', handleEnd);
        button.addEventListener('mouseleave', handleEnd);
    }

    public dispose(): void {
        if (this.prevButton) {
            this.prevButton.remove();
            this.prevButton = null;
        }
        if (this.nextButton) {
            this.nextButton.remove();
            this.nextButton = null;
        }
    }

    public setBlocked(blocked: boolean): void {
        const pointerEvents = blocked ? 'none' : 'auto';
        const opacity = blocked ? '0' : '1';

        if (this.prevButton) {
            this.prevButton.style.pointerEvents = pointerEvents;
            this.prevButton.style.opacity = opacity;
        }
        if (this.nextButton) {
            this.nextButton.style.pointerEvents = pointerEvents;
            this.nextButton.style.opacity = opacity;
        }
    }
}
