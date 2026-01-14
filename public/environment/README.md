# Environment Assets

Place environment model files here:

## Supported formats
- `.glb` - Recommended (binary GLTF)
- `.gltf` - GLTF with separate files
- `.babylon` - Babylon.js native format

## Usage in code
```typescript
import { SceneLoader } from "@babylonjs/core";

// Load environment model
const result = await SceneLoader.ImportMeshAsync(
    "", 
    "./environment/", 
    "level1.glb", 
    scene
);

// Access loaded meshes
result.meshes.forEach(mesh => {
    mesh.checkCollisions = true;
    mesh.receiveShadows = true;
});
```

## Recommended assets
- `level1.glb` - Main level geometry
- `props.glb` - Decorative objects
- `trees.glb` - Trees and vegetation
