'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Babylon.js
const GalleryViewer = dynamic(() => import('@/components/GalleryViewer'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'sans-serif'
        }}>
            Loading Featured Galleries...
        </div>
    )
});

export default function FeaturedPage() {
    return (
        <main style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <GalleryViewer
                mode="explore"
                source="offline"
            />
        </main>
    );
}
