/**
 * Engine Factory
 * 
 * Creates the appropriate 3D engine based on configuration.
 * This is the main entry point for engine creation.
 */

import type { I3DEngine } from './types';
import { EngineType } from './types';

/**
 * Factory configuration
 */
interface EngineFactoryConfig {
    preferredEngine?: EngineType;
    fallbackToDefault?: boolean;
}

/**
 * Default engine to use
 */
const DEFAULT_ENGINE = EngineType.BABYLON;

/**
 * Create a 3D engine instance
 * 
 * @param config Configuration options
 * @returns A 3D engine instance
 * 
 * @example
 * // Create Babylon.js engine
 * const engine = await createEngine({ preferredEngine: EngineType.BABYLON });
 * 
 * @example
 * // Create with default (Babylon.js)
 * const engine = await createEngine();
 */
export async function createEngine(config: EngineFactoryConfig = {}): Promise<I3DEngine> {
    const engineType = config.preferredEngine ?? DEFAULT_ENGINE;

    console.log(`EngineFactory: Creating ${engineType} engine...`);

    switch (engineType) {
        case EngineType.BABYLON: {
            const { BabylonEngine } = await import('./babylon');
            return new BabylonEngine();
        }

        case EngineType.THREEJS: {
            const { ThreeEngine } = await import('./threejs');
            // Note: ThreeEngine is a placeholder, will throw if used
            console.warn('EngineFactory: Three.js engine is not yet implemented');
            return new ThreeEngine();
        }

        default:
            if (config.fallbackToDefault) {
                console.warn(`EngineFactory: Unknown engine type "${engineType}", falling back to ${DEFAULT_ENGINE}`);
                const { BabylonEngine } = await import('./babylon');
                return new BabylonEngine();
            }
            throw new Error(`EngineFactory: Unknown engine type "${engineType}"`);
    }
}

/**
 * Get list of available engines
 */
export function getAvailableEngines(): { type: EngineType; name: string; implemented: boolean }[] {
    return [
        { type: EngineType.BABYLON, name: 'Babylon.js', implemented: true },
        { type: EngineType.THREEJS, name: 'Three.js', implemented: false },
    ];
}

/**
 * Check if an engine type is available
 */
export function isEngineAvailable(type: EngineType): boolean {
    const engines = getAvailableEngines();
    const engine = engines.find(e => e.type === type);
    return engine?.implemented ?? false;
}
