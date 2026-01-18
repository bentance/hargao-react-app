/**
 * Loading Screen Manager
 * 
 * Handles custom loading UI and global error handlers.
 * Extracted from app.ts for better modularity.
 */

/**
 * Show the custom loading screen
 */
export function showLoadingScreen(): void {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
        loadingScreen.style.display = "flex";
        // Force reflow
        void loadingScreen.offsetWidth;
        loadingScreen.style.opacity = "1";
    }
}

/**
 * Hide the custom loading screen with fade out
 */
export function hideLoadingScreen(): void {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
        loadingScreen.style.opacity = "0";
        setTimeout(() => {
            // Only hide if opacity is still 0 (in case it was shown again quickly)
            if (loadingScreen.style.opacity === "0") {
                loadingScreen.style.display = "none";
            }
        }, 500);
    }
}

/**
 * Show an error message to the user
 */
export function showErrorMessage(error: unknown): void {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#333;color:#fff;padding:20px;border-radius:10px;text-align:center;z-index:9999;max-width:80%;';
    errorDiv.innerHTML = `<h3>Failed to load</h3><p>Please try refreshing the page.</p><p style="font-size:12px;color:#999;">${error}</p>`;
    document.body.appendChild(errorDiv);
}

/**
 * Setup global error handlers for debugging
 * Call this once at app initialization
 */
export function setupGlobalErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
        console.error("Global error:", event);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: #c0392b;
            color: white;
            padding: 15px;
            z-index: 99999;
            font-family: -apple-system, monospace;
            font-size: 12px;
            word-break: break-word;
        `;
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${event.message}<br>
            <small>File: ${event.filename?.split('/').pop() || 'unknown'}<br>
            Line: ${event.lineno}</small>
        `;
        document.body.appendChild(errorDiv);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        console.error("Unhandled rejection:", event.reason);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: #8e44ad;
            color: white;
            padding: 15px;
            z-index: 99999;
            font-family: -apple-system, monospace;
            font-size: 12px;
            word-break: break-word;
        `;
        errorDiv.innerHTML = `
            <strong>Promise Error:</strong> ${event.reason}<br>
        `;
        document.body.appendChild(errorDiv);
    });
}
