# Sound Assets

Place sound files here:

## Supported formats
- `.mp3` - Best for music
- `.ogg` - Best for sound effects  
- `.wav` - Uncompressed audio

## Usage in code
```typescript
import { Sound } from "@babylonjs/core";

// Load and play a sound
const jumpSound = new Sound("jump", "./sounds/jump.mp3", scene, null, {
    loop: false,
    autoplay: false
});

// Play the sound
jumpSound.play();
```

## Recommended sounds
- `jump.mp3` - Jump sound effect
- `footstep.mp3` - Walking footsteps
- `land.mp3` - Landing sound
- `music.mp3` - Background music
