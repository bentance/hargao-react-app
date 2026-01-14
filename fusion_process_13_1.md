Step-by-Step Instructions
Step 1: Create Babylon folder in Next.js
bash
# In your Next.js project root
mkdir -p src/babylon
Step 2: Copy Source Files
Copy entire src/ folder contents to src/babylon/:

FROM: babylon-platformer/src/
TO:   your-nextjs-app/src/babylon/
Files to copy:

✅ 
app.ts
✅ 
config.ts
✅ 
environment.ts
✅ 
player.ts
✅ 
playerStates.ts
✅ 
inputController.ts
✅ 
mobileController.ts
✅ 
navigationController.ts
✅ 
ui.ts
✅ 
types.ts
✅ builders/ (entire folder)
✅ levels/ (entire folder)
✅ types/ (entire folder with 
firebase.ts
)
DON'T copy:

❌ 
main.ts
 (Next.js handles app initialization differently)
❌ 
style.css
 (will be handled by Next.js CSS)
❌ 
counter.ts
 (Vite example file)
❌ 
typescript.svg
 (Vite example file)
Step 3: Copy Public Assets
Merge into Next.js public/ folder:

FROM: babylon-platformer/public/
TO:   your-nextjs-app/public/
Copy these folders:

✅ models/ (character GLB files)
✅ paintings/ (default artwork)
✅ sounds/ (audio files)
✅ textures/ (environment textures)
✅ 
ui/
 (instruction images)
✅ exploration_content/ (gallery configs - optional for testing)
✅ environment/ (skyboxes etc)
Step 4: Install Babylon.js Dependencies
bash
# In your Next.js project
npm install @babylonjs/core @babylonjs/loaders @babylonjs/gui @babylonjs/materials
Step 5: Create Gallery Viewer Component
Create a new file src/components/GalleryViewer.tsx:

tsx
'use client';
import { useEffect, useRef } from 'react';
interface GalleryViewerProps {
  galleryData: {
    environment: { level: number; character: number; uiTheme: number };
    paintings: { id: number; title: string; description: string; imageUrl: string }[];
  };
  userData?: {
    displayName: string;
    bio: string;
    photoURL: string | null;
    links: { website: string | null; instagram: string | null };
  };
}
export default function GalleryViewer({ galleryData, userData }: GalleryViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    // Dynamic import to avoid SSR issues
    const initBabylon = async () => {
      const { App } = await import('@/babylon/app');
      const { setGalleryData, setUserData } = await import('@/babylon/config');
      
      // Set data before initializing
      setGalleryData(galleryData);
      if (userData) setUserData(userData);
      
      // Create app
      appRef.current = new App(canvasRef.current!);
    };
    initBabylon();
    return () => {
      // Cleanup
      appRef.current?.dispose();
    };
  }, [galleryData, userData]);
  return (
    <canvas 
      ref={canvasRef} 
      id="renderCanvas"
      style={{ width: '100%', height: '100vh' }}
    />
  );
}


Summary
What to Move	From	To
Babylon source code	src/*	src/babylon/*
3D assets	public/*	public/* (merge)
Firebase types	
src/types/firebase.ts
src/babylon/types/firebase.ts
What NOT to Move	Reason
main.ts
Next.js handles initialization
index.html
Next.js has its own
package.json
Merge dependencies instead
vite.config.ts	Not needed in Next.js
node_modules/	Reinstall in Next.js
