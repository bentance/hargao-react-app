/**
 * UI Helpers
 * 
 * Utility functions for Babylon.js GUI components.
 * Extracted to improve code organization without breaking the GameUI class.
 */

import { Rectangle, TextBlock, Control, ScrollViewer, StackPanel } from "@babylonjs/gui";
import { isMobileDevice, isPhoneDevice } from "./mobileController";
import type { UITheme } from "./config";

/**
 * Default padding values based on device type
 */
export function getDefaultPadding(): { top: string; bottom: string; left: string; right: string } {
    const isPhone = isPhoneDevice();
    const isMobile = isMobileDevice();

    return {
        top: isPhone ? "15px" : (isMobile ? "20px" : "30px"),
        bottom: isPhone ? "10px" : "20px",
        left: isPhone ? "10px" : "20px",
        right: isPhone ? "10px" : "20px",
    };
}

/**
 * Default font sizes based on device type
 */
export function getFontSizes(): {
    title: number;
    body: number;
    small: number;
    hint: number;
} {
    const isPhone = isPhoneDevice();
    const isMobile = isMobileDevice();

    return {
        title: isPhone ? 20 : (isMobile ? 28 : 32),
        body: isPhone ? 14 : (isMobile ? 16 : 18),
        small: isPhone ? 12 : 14,
        hint: isPhone ? 12 : (isMobile ? 14 : 18),
    };
}

/**
 * Create a close hint text block for popups
 */
export function createCloseHint(theme: UITheme, text?: string): TextBlock {
    const isPhone = isPhoneDevice();
    const isMobile = isMobileDevice();

    const hintText = text || (isMobile ? "Tap anywhere to close" : "Press 'E' or click to close");

    const closeHint = new TextBlock("closeHint", hintText);
    closeHint.color = theme.textColor || "gray";
    closeHint.fontSize = isPhone ? 12 : (isMobile ? 14 : 18);
    closeHint.textWrapping = true;
    closeHint.resizeToFit = true;
    closeHint.height = isPhone ? "30px" : (isMobile ? "35px" : "40px");
    closeHint.paddingTop = "15px";
    closeHint.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    closeHint.alpha = 0.7;

    return closeHint;
}

/**
 * Create a styled text block
 */
export function createStyledText(
    name: string,
    initialText: string,
    options: {
        fontSize?: number;
        color?: string;
        bold?: boolean;
        height?: string;
        paddingTop?: string;
        paddingBottom?: string;
        textWrapping?: boolean;
    } = {}
): TextBlock {
    const textBlock = new TextBlock(name, initialText);
    textBlock.color = options.color || "white";
    textBlock.fontSize = options.fontSize || 16;
    textBlock.fontWeight = options.bold ? "bold" : "normal";
    textBlock.textWrapping = options.textWrapping !== false;
    textBlock.resizeToFit = true;

    if (options.height) textBlock.height = options.height;
    if (options.paddingTop) textBlock.paddingTop = options.paddingTop;
    if (options.paddingBottom) textBlock.paddingBottom = options.paddingBottom;

    return textBlock;
}

/**
 * Enable touch/drag scrolling for a ScrollViewer
 */
export function enableTouchScrolling(scrollViewer: ScrollViewer): void {
    let isDragging = false;
    let lastY = 0;
    let velocity = 0;
    let animationFrame: number | null = null;

    // Handle pointer down (start drag)
    scrollViewer.onPointerDownObservable.add((eventData) => {
        isDragging = true;
        lastY = eventData.y;
        velocity = 0;

        // Cancel any ongoing momentum animation
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    });

    // Handle pointer move (dragging)
    scrollViewer.onPointerMoveObservable.add((eventData) => {
        if (!isDragging) return;

        const deltaY = lastY - eventData.y;
        velocity = deltaY;
        lastY = eventData.y;

        // Scroll the content
        const scrollSpeed = 0.003; // Adjust for sensitivity
        scrollViewer.verticalBar.value += deltaY * scrollSpeed;

        // Clamp value between 0 and 1
        scrollViewer.verticalBar.value = Math.max(0, Math.min(1, scrollViewer.verticalBar.value));
    });

    // Handle pointer up (end drag with momentum)
    scrollViewer.onPointerUpObservable.add(() => {
        if (!isDragging) return;
        isDragging = false;

        // Apply momentum scrolling
        const applyMomentum = () => {
            if (Math.abs(velocity) < 0.5) {
                velocity = 0;
                animationFrame = null;
                return;
            }

            const scrollSpeed = 0.002;
            scrollViewer.verticalBar.value += velocity * scrollSpeed;
            scrollViewer.verticalBar.value = Math.max(0, Math.min(1, scrollViewer.verticalBar.value));

            // Apply friction
            velocity *= 0.92;

            animationFrame = requestAnimationFrame(applyMomentum);
        };

        applyMomentum();
    });

    // Handle pointer out (stop dragging if cursor leaves)
    scrollViewer.onPointerOutObservable.add(() => {
        isDragging = false;
    });
}

/**
 * Create a popup container with scrolling support
 */
export function createPopupStructure(
    name: string,
    theme: UITheme
): {
    container: Rectangle;
    scrollViewer: ScrollViewer;
    stackPanel: StackPanel;
} {
    const isMobile = isMobileDevice();
    const isPhone = isPhoneDevice();

    // 1. Main Container
    const container = new Rectangle(`${name}Container`);
    container.width = isMobile ? "95%" : "70%";
    container.height = isMobile ? "90%" : "80%";
    container.cornerRadius = theme.cornerRadius;
    container.color = theme.borderColor;
    container.thickness = theme.borderThickness;
    container.background = theme.background;
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    container.isVisible = false;
    container.isPointerBlocker = true;

    // 2. ScrollViewer
    const scrollViewer = new ScrollViewer(`${name}Scroll`);
    scrollViewer.width = "100%";
    scrollViewer.height = "100%";
    scrollViewer.barSize = isPhone ? 16 : 24;
    scrollViewer.thumbLength = 0.3;
    scrollViewer.barColor = "rgba(100, 100, 100, 0.5)";
    scrollViewer.barBackground = "transparent";
    scrollViewer.isPointerBlocker = true;
    scrollViewer.wheelPrecision = 0.05;

    container.addControl(scrollViewer);

    // 3. StackPanel for Content
    const padding = getDefaultPadding();
    const stackPanel = new StackPanel(`${name}Stack`);
    stackPanel.isVertical = true;
    stackPanel.width = "100%";
    stackPanel.paddingTop = padding.top;
    stackPanel.paddingBottom = padding.bottom;
    stackPanel.paddingLeft = padding.left;
    stackPanel.paddingRight = padding.right;
    stackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

    scrollViewer.addControl(stackPanel);

    // 4. Add touch/drag scrolling support
    enableTouchScrolling(scrollViewer);

    return { container, scrollViewer, stackPanel };
}
