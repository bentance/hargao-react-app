import { Scene } from "@babylonjs/core";

import { AdvancedDynamicTexture, Rectangle, TextBlock, Control, Image, StackPanel, ScrollViewer } from "@babylonjs/gui";
import type { PaintingData, UITheme } from "./config";
import { USER_CONFIG, getCurrentTheme, getPaintingById, APP_CONFIG, MAIN_CONFIG, getPaintingsBasePath } from "./config";
import { isMobileDevice, isPhoneDevice } from "./mobileController";

export class GameUI {
    private uiTexture!: AdvancedDynamicTexture;
    private messageContainer!: Rectangle;
    private messageText!: TextBlock;
    private theme!: UITheme;

    // Dark backdrop overlay
    private backdropOverlay!: Rectangle;

    // Painting display elements
    private paintingContainer!: Rectangle;
    private paintingImage!: Image;
    private paintingTitle!: TextBlock;
    private paintingDescription!: TextBlock;
    private paintingCloseHint!: TextBlock;

    // About display elements
    private aboutContainer!: Rectangle;
    private aboutImage!: Image;
    private aboutHeader!: TextBlock;
    private aboutName!: TextBlock;
    private aboutDetails!: TextBlock;
    private aboutWebsite!: TextBlock;
    private aboutInstagram!: TextBlock;
    private aboutCloseHint!: TextBlock;

    // Callback for visibility changes (to block mobile input)
    private onVisibilityChange: ((visible: boolean) => void) | null = null;

    constructor(scene: Scene) {
        this.theme = getCurrentTheme();

        // Create the UI texture
        this.uiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

        this.createBackdropOverlay();
        this.createMessageContainer();
        this.createPaintingContainer();
        this.createAboutContainer();
        this.createWatermark();
    }

    /**
     * Set callback for when UI visibility changes (used to block mobile input)
     */
    public setVisibilityCallback(callback: (visible: boolean) => void): void {
        this.onVisibilityChange = callback;
    }

    /**
     * Helper to create a standardized scrollable popup container
     */
    private createPopup(name: string): { container: Rectangle, scrollViewer: ScrollViewer, stackPanel: StackPanel } {
        const isMobile = isMobileDevice();
        const isPhone = isPhoneDevice();

        // 1. Main Container
        const container = new Rectangle(`${name}Container`);
        container.width = isMobile ? "95%" : "70%";
        container.height = isMobile ? "90%" : "80%";
        container.cornerRadius = this.theme.cornerRadius;
        container.color = this.theme.borderColor;
        container.thickness = this.theme.borderThickness;
        container.background = this.theme.background;
        container.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        container.isVisible = false;
        container.isPointerBlocker = true; // IMPORTANT for touch interaction

        this.uiTexture.addControl(container);

        // 2. ScrollViewer
        const scrollViewer = new ScrollViewer(`${name}Scroll`);
        scrollViewer.width = "100%";
        scrollViewer.height = "100%";
        scrollViewer.barSize = isPhone ? 16 : 24;
        scrollViewer.thumbLength = 0.3;
        scrollViewer.barColor = "rgba(100, 100, 100, 0.5)";
        scrollViewer.barBackground = "transparent";
        scrollViewer.isPointerBlocker = true;
        container.addControl(scrollViewer);

        // 3. StackPanel for Content
        const stackPanel = new StackPanel(`${name}Stack`);
        stackPanel.isVertical = true;
        stackPanel.width = "100%";
        // Standard padding defaults
        stackPanel.paddingTop = isPhone ? "15px" : (isMobile ? "20px" : "30px");
        stackPanel.paddingBottom = isPhone ? "10px" : "20px";
        stackPanel.paddingLeft = isPhone ? "10px" : "20px";
        stackPanel.paddingRight = isPhone ? "10px" : "20px";

        // Revert to TOP alignment because ScrollViewer ignores Center
        stackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        scrollViewer.addControl(stackPanel);



        return { container, scrollViewer, stackPanel };
    }

    private createBackdropOverlay(): void {
        // Dark overlay that dims the background when UI is visible
        this.backdropOverlay = new Rectangle("backdropOverlay");
        this.backdropOverlay.width = "100%";
        this.backdropOverlay.height = "100%";
        this.backdropOverlay.background = "rgba(0, 0, 0, 0.7)";
        this.backdropOverlay.thickness = 0;
        this.backdropOverlay.isVisible = false;
        this.uiTexture.addControl(this.backdropOverlay);
    }

    private createMessageContainer(): void {
        // ===== Welcome/Message Container =====
        // Now using shared popup helper for consistency
        const popup = this.createPopup("message");
        this.messageContainer = popup.container;
        const messageStack = popup.stackPanel;

        // Manual centering for short Welcome message
        messageStack.paddingTop = "35%";

        // Message text
        this.messageText = new TextBlock("messageText");
        this.messageText.text = "";
        this.messageText.color = this.theme.textColor;
        this.messageText.fontSize = isMobileDevice() ? 18 : 24;
        this.messageText.fontFamily = this.theme.fontFamily;
        this.messageText.textWrapping = true;
        this.messageText.resizeToFit = true; // Auto resize height
        this.messageText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        messageStack.addControl(this.messageText);
    }

    private createPaintingContainer(): void {
        const popup = this.createPopup("painting");
        this.paintingContainer = popup.container;
        const paintingStack = popup.stackPanel;

        // Slight shift down for visual balance
        paintingStack.paddingTop = "10%";

        const isMobile = isMobileDevice();
        const isPhone = isPhoneDevice();

        // Painting image - responsive size (phone < tablet < desktop)
        this.paintingImage = new Image("paintingImage", "");
        if (isPhone) {
            this.paintingImage.width = "280px";
            this.paintingImage.height = "220px";
        } else if (isMobile) {
            // Tablet/iPad - larger images
            this.paintingImage.width = "500px";
            this.paintingImage.height = "400px";
        } else {
            // Desktop
            this.paintingImage.width = "650px";
            this.paintingImage.height = "520px";
        }
        this.paintingImage.stretch = Image.STRETCH_UNIFORM;
        this.paintingImage.paddingBottom = isPhone ? "10px" : "20px";
        paintingStack.addControl(this.paintingImage);

        // Painting title
        this.paintingTitle = new TextBlock("paintingTitle");
        this.paintingTitle.text = "";
        this.paintingTitle.color = this.theme.titleColor;
        this.paintingTitle.fontSize = isPhone ? 18 : (isMobile ? 24 : 32);
        this.paintingTitle.fontFamily = this.theme.fontFamily;
        this.paintingTitle.fontWeight = "bold";
        this.paintingTitle.height = isPhone ? "30px" : (isMobile ? "40px" : "50px");
        this.paintingTitle.resizeToFit = true;
        this.paintingTitle.textWrapping = true;
        this.paintingTitle.paddingBottom = "10px";
        paintingStack.addControl(this.paintingTitle);

        // Painting description
        this.paintingDescription = new TextBlock("paintingDescription");
        this.paintingDescription.text = "";
        this.paintingDescription.color = this.theme.textColor;
        this.paintingDescription.fontSize = isPhone ? 12 : (isMobile ? 16 : 20);
        this.paintingDescription.fontFamily = this.theme.fontFamily;
        this.paintingDescription.textWrapping = true;
        this.paintingDescription.resizeToFit = true;
        this.paintingDescription.paddingLeft = isPhone ? "5px" : (isMobile ? "10px" : "40px");
        this.paintingDescription.paddingRight = isPhone ? "5px" : (isMobile ? "10px" : "40px");
        paintingStack.addControl(this.paintingDescription);

        // Close hint for painting
        this.paintingCloseHint = new TextBlock("paintingCloseHint");
        this.paintingCloseHint.text = isMobile ? "(Tap E to close)" : "(Press E to close)";
        this.paintingCloseHint.color = this.theme.hintColor;
        this.paintingCloseHint.fontSize = isPhone ? 12 : (isMobile ? 14 : 18);
        this.paintingCloseHint.fontFamily = this.theme.fontFamily;
        this.paintingCloseHint.height = isPhone ? "25px" : (isMobile ? "30px" : "40px");
        this.paintingCloseHint.paddingTop = "15px";
        paintingStack.addControl(this.paintingCloseHint);
    }

    private createAboutContainer(): void {
        // ===== About Display Container =====
        const popup = this.createPopup("about");
        this.aboutContainer = popup.container;
        const aboutStack = popup.stackPanel;

        // Slight shift down for visual balance
        aboutStack.paddingTop = "10%";

        const isMobile = isMobileDevice();
        const isPhone = isPhoneDevice();

        // About header
        this.aboutHeader = new TextBlock("aboutHeader");
        this.aboutHeader.text = "ABOUT";
        this.aboutHeader.color = this.theme.titleColor;
        this.aboutHeader.fontSize = isPhone ? 16 : (isMobile ? 20 : 24);
        this.aboutHeader.fontFamily = this.theme.fontFamily;
        this.aboutHeader.fontWeight = "bold";
        this.aboutHeader.height = isPhone ? "22px" : "30px";
        this.aboutHeader.paddingBottom = "10px";
        aboutStack.addControl(this.aboutHeader);

        // About image - responsive size (phone < tablet < desktop)
        this.aboutImage = new Image("aboutImage", "");
        if (isPhone) {
            this.aboutImage.width = "180px";
            this.aboutImage.height = "180px";
        } else if (isMobile) {
            // Tablet/iPad - larger images
            this.aboutImage.width = "350px";
            this.aboutImage.height = "350px";
        } else {
            // Desktop
            this.aboutImage.width = "500px";
            this.aboutImage.height = "500px";
        }
        this.aboutImage.stretch = Image.STRETCH_UNIFORM;
        this.aboutImage.paddingBottom = isPhone ? "8px" : "15px";
        aboutStack.addControl(this.aboutImage);

        // About name
        this.aboutName = new TextBlock("aboutName");
        this.aboutName.text = "";
        this.aboutName.color = this.theme.titleColor;
        this.aboutName.fontSize = isPhone ? 14 : (isMobile ? 18 : 24);
        this.aboutName.fontFamily = this.theme.fontFamily;
        this.aboutName.fontWeight = "bold";
        this.aboutName.height = isPhone ? "20px" : (isMobile ? "25px" : "30px");
        this.aboutName.paddingBottom = "5px";
        aboutStack.addControl(this.aboutName);

        // About details
        this.aboutDetails = new TextBlock("aboutDetails");
        this.aboutDetails.text = "";
        this.aboutDetails.color = this.theme.textColor;
        this.aboutDetails.fontSize = isPhone ? 11 : (isMobile ? 14 : 16);
        this.aboutDetails.fontFamily = this.theme.fontFamily;
        this.aboutDetails.textWrapping = true;
        this.aboutDetails.resizeToFit = true;
        this.aboutDetails.paddingBottom = isPhone ? "5px" : "10px";
        this.aboutDetails.paddingLeft = isPhone ? "5px" : "10px";
        this.aboutDetails.paddingRight = isPhone ? "5px" : "10px";
        aboutStack.addControl(this.aboutDetails);

        // About website (clickable link)
        this.aboutWebsite = new TextBlock("aboutWebsite");
        this.aboutWebsite.text = "";
        this.aboutWebsite.color = this.theme.subtitleColor;
        this.aboutWebsite.fontSize = isPhone ? 11 : (isMobile ? 14 : 16);
        this.aboutWebsite.fontFamily = this.theme.fontFamily;
        this.aboutWebsite.height = isPhone ? "18px" : "25px";
        this.aboutWebsite.isPointerBlocker = true;

        // Store original color for hover effect
        const websiteOriginalColor = this.theme.subtitleColor;

        // Hover effects
        this.aboutWebsite.onPointerEnterObservable.add(() => {
            this.aboutWebsite.color = this.theme.titleColor;
            this.aboutWebsite.fontWeight = "bold";
            document.body.style.cursor = "pointer";
        });
        this.aboutWebsite.onPointerOutObservable.add(() => {
            this.aboutWebsite.color = websiteOriginalColor;
            this.aboutWebsite.fontWeight = "normal";
            document.body.style.cursor = "default";
        });

        // Click handler
        this.aboutWebsite.onPointerClickObservable.add(() => {
            if (USER_CONFIG.website) {
                const url = USER_CONFIG.website.startsWith('http')
                    ? USER_CONFIG.website
                    : `https://${USER_CONFIG.website}`;
                window.open(url, '_blank');
            }
        });

        aboutStack.addControl(this.aboutWebsite);

        // About instagram (clickable link)
        this.aboutInstagram = new TextBlock("aboutInstagram");
        this.aboutInstagram.text = "";
        this.aboutInstagram.color = this.theme.subtitleColor;
        this.aboutInstagram.fontSize = isPhone ? 11 : (isMobile ? 14 : 16);
        this.aboutInstagram.fontFamily = this.theme.fontFamily;
        this.aboutInstagram.height = isPhone ? "18px" : "25px";
        this.aboutInstagram.isPointerBlocker = true;

        // Store original color for hover effect
        const instagramOriginalColor = this.theme.subtitleColor;

        // Hover effects
        this.aboutInstagram.onPointerEnterObservable.add(() => {
            this.aboutInstagram.color = this.theme.titleColor;
            this.aboutInstagram.fontWeight = "bold";
            document.body.style.cursor = "pointer";
        });
        this.aboutInstagram.onPointerOutObservable.add(() => {
            this.aboutInstagram.color = instagramOriginalColor;
            this.aboutInstagram.fontWeight = "normal";
            document.body.style.cursor = "default";
        });

        // Click handler - opens Instagram profile
        this.aboutInstagram.onPointerClickObservable.add(() => {
            if (USER_CONFIG.instagram) {
                // Remove @ if present and construct Instagram URL
                const handle = USER_CONFIG.instagram.replace(/^@/, '');
                window.open(`https://instagram.com/${handle}`, '_blank');
            }
        });

        aboutStack.addControl(this.aboutInstagram);

        // Close hint for about
        this.aboutCloseHint = new TextBlock("aboutCloseHint");
        this.aboutCloseHint.text = isMobile ? "(Tap E to close)" : "(Press E to close)";
        this.aboutCloseHint.color = this.theme.hintColor;
        this.aboutCloseHint.fontSize = isPhone ? 10 : (isMobile ? 12 : 14);
        this.aboutCloseHint.fontFamily = this.theme.fontFamily;
        this.aboutCloseHint.height = isPhone ? "22px" : "30px";
        this.aboutCloseHint.paddingTop = isPhone ? "5px" : "10px";
        aboutStack.addControl(this.aboutCloseHint);
    }

    private createWatermark(): void {
        if (!USER_CONFIG.isWatermark) return;

        const isMobile = isMobileDevice();
        // Use HTML element instead of Babylon GUI for sharpness (unaffected by hardware scaling)
        const watermark = document.createElement('div');
        watermark.id = "brandWatermark";

        Object.assign(watermark.style, {
            position: 'fixed',
            top: isMobile ? '10px' : '20px',
            right: isMobile ? '10px' : '20px',
            backgroundColor: '#FFFFE0', // Light yellow
            color: 'black',
            padding: isMobile ? '2px 6px' : '5px 10px',
            border: '1px solid black',
            borderRadius: '0px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: isMobile ? '10px' : '16px',
            fontWeight: 'bold',
            zIndex: '1000', // Below Babylon GUI (often 1000+) but distinct
            pointerEvents: 'auto',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        });

        watermark.textContent = MAIN_CONFIG.brandName;

        // Add click listener for invalidating brandWebsite
        watermark.addEventListener('click', () => {
            const url = (MAIN_CONFIG.brandWebsite || "youtube.com"); // Fallback just in case
            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
            window.open(fullUrl, '_blank');
        });

        document.body.appendChild(watermark);
    }

    public showMessage(text: string): void {
        this.backdropOverlay.isVisible = true;

        const closeText = isMobileDevice() ? "(Tap E to close)" : "(Press E to close)";
        this.messageText.text = `${text}\n\n${closeText}`;

        this.messageContainer.isVisible = true;
        this.paintingContainer.isVisible = false;
        this.aboutContainer.isVisible = false;

        // Notify visibility change
        if (this.onVisibilityChange) this.onVisibilityChange(true);
    }

    public showPainting(painting: PaintingData): void {
        // Clear old image immediately to prevent flash
        this.paintingImage.source = "";
        this.paintingImage.isVisible = false;

        // Only show title if it exists
        if (painting.title && painting.title.trim() !== "") {
            this.paintingTitle.text = painting.title;
            this.paintingTitle.isVisible = true;
        } else {
            this.paintingTitle.text = "";
            this.paintingTitle.isVisible = false;
        }

        // Only show description if it exists
        if (painting.description && painting.description.trim() !== "") {
            this.paintingDescription.text = painting.description;
            this.paintingDescription.isVisible = true;
        } else {
            this.paintingDescription.text = "";
            this.paintingDescription.isVisible = false;
        }

        this.backdropOverlay.isVisible = true;
        this.paintingContainer.isVisible = true;
        this.messageContainer.isVisible = false;
        this.aboutContainer.isVisible = false;

        // Try loading image with different extensions
        this.tryLoadPaintingImage(painting.id);

        // Notify visibility change
        if (this.onVisibilityChange) this.onVisibilityChange(true);
    }

    public showAbout(): void {
        // Clear old image
        this.aboutImage.source = "";
        this.aboutImage.isVisible = false;

        // Set display name
        if (USER_CONFIG.displayname) {
            this.aboutName.text = USER_CONFIG.displayname;
            this.aboutName.isVisible = true;
        } else {
            this.aboutName.isVisible = false;
        }

        // Set details
        if (USER_CONFIG.details) {
            this.aboutDetails.text = USER_CONFIG.details;
            this.aboutDetails.isVisible = true;
        } else {
            this.aboutDetails.isVisible = false;
        }

        // Set website
        if (USER_CONFIG.website) {
            this.aboutWebsite.text = `🌐 ${USER_CONFIG.website}`;
            this.aboutWebsite.isVisible = true;
        } else {
            this.aboutWebsite.isVisible = false;
        }

        // Set instagram
        if (USER_CONFIG.instagram) {
            this.aboutInstagram.text = `📷 ${USER_CONFIG.instagram}`;
            this.aboutInstagram.isVisible = true;
        } else {
            this.aboutInstagram.isVisible = false;
        }

        this.backdropOverlay.isVisible = true;
        this.aboutContainer.isVisible = true;
        this.messageContainer.isVisible = false;
        this.paintingContainer.isVisible = false;

        // Notify visibility change
        if (this.onVisibilityChange) this.onVisibilityChange(true);

        // Try loading display image
        if (APP_CONFIG.type === "online") {
            // Online mode: only load if userImageUrl exists (don't use local fallback)
            if (USER_CONFIG.userImageUrl) {
                this.aboutImage.source = USER_CONFIG.userImageUrl;
                this.aboutImage.isVisible = true;
            }
            // Otherwise leave image hidden (no fallback to local files in online mode)
        } else {
            // Offline mode: try to load local display image
            if (USER_CONFIG.displayImage) {
                this.tryLoadAboutImage(USER_CONFIG.displayImage);
            }
        }
    }

    private tryLoadPaintingImage(id: number, extensions: string[] = ["jpg", "jpeg", "png", "webp", "gif"], index: number = 0): void {
        // Check for URL - ONLY if Online Mode is enabled
        const paintingConfig = getPaintingById(id);
        if (APP_CONFIG.type === "online" && paintingConfig && paintingConfig.url) {
            this.paintingImage.source = paintingConfig.url;
            this.paintingImage.isVisible = true;
            return;
        }

        if (index >= extensions.length) {
            console.error(`Could not find image for painting_${id}`);
            return;
        }

        const basePath = getPaintingsBasePath();
        const ext = extensions[index];
        const testImg = new window.Image();
        testImg.onload = () => {
            this.paintingImage.source = `${basePath}/painting_${id}.${ext}`;
            this.paintingImage.isVisible = true;
        };
        testImg.onerror = () => {
            this.tryLoadPaintingImage(id, extensions, index + 1);
        };
        testImg.src = `${basePath}/painting_${id}.${ext}`;
    }

    private tryLoadAboutImage(filename: string, extensions: string[] = ["jpg", "jpeg", "png", "webp", "gif"], index: number = 0): void {
        if (index >= extensions.length) {
            console.warn(`Could not find about image: ${filename}`);
            return;
        }

        const basePath = getPaintingsBasePath();
        const ext = extensions[index];
        const testImg = new window.Image();
        testImg.onload = () => {
            this.aboutImage.source = `${basePath}/${filename}.${ext}`;
            this.aboutImage.isVisible = true;
        };
        testImg.onerror = () => {
            this.tryLoadAboutImage(filename, extensions, index + 1);
        };
        testImg.src = `${basePath}/${filename}.${ext}`;
    }

    public hideMessage(): void {
        this.backdropOverlay.isVisible = false;
        this.messageContainer.isVisible = false;
        this.paintingContainer.isVisible = false;
        this.aboutContainer.isVisible = false;

        // Notify visibility change
        if (this.onVisibilityChange) this.onVisibilityChange(false);
    }

    public toggleMessage(text: string): void {
        if (this.isVisible) {
            this.hideMessage();
        } else {
            this.showMessage(text);
        }
    }

    public togglePainting(painting: PaintingData): void {
        if (this.paintingContainer.isVisible) {
            this.hideMessage();
        } else {
            this.showPainting(painting);
        }
    }

    public toggleAbout(): void {
        if (this.aboutContainer.isVisible) {
            this.hideMessage();
        } else {
            this.showAbout();
        }
    }

    public get isVisible(): boolean {
        return this.messageContainer.isVisible || this.paintingContainer.isVisible || this.aboutContainer.isVisible;
    }

    /**
     * Dispose of UI resources
     */
    public dispose(): void {
        if (this.uiTexture) {
            this.uiTexture.dispose();
        }
        // Remove watermark HTML element
        const watermark = document.getElementById("brandWatermark");
        if (watermark) {
            watermark.remove();
        }
    }
}
