/**
 * 3D Engine Abstraction Layer - Main Export
 * 
 * This module provides a unified interface for working with different 3D engines.
 * Currently supports Babylon.js with a placeholder for Three.js.
 * 
 * @example
 * // Using the factory (recommended)
 * import { createEngine, EngineType } from '@/engine';
 * const engine = await createEngine({ preferredEngine: EngineType.BABYLON });
 * await engine.initialize(canvas, config);
 * engine.run();
 * 
 * @example
 * // Direct engine import
 * import { BabylonEngine } from '@/engine';
 * const engine = new BabylonEngine();
 */

// Types
export type {
    I3DEngine,
    EngineConfig,
    EngineGalleryData,
    EnginePainting,
    EngineUserData,
    EngineEvents,
    EngineMode,
    EngineSource,
    EngineCapabilities,
} from './types';

export { EngineType } from './types';

// Factory
export { createEngine, getAvailableEngines, isEngineAvailable } from './EngineFactory';

// Engines (direct access if needed)
export { BabylonEngine } from './babylon';
export { ThreeEngine } from './threejs';
