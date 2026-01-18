import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
    try {
        const { galleryId } = await request.json();

        if (!galleryId) {
            return NextResponse.json(
                { error: 'Gallery ID is required' },
                { status: 400 }
            );
        }

        const galleryRef = doc(db, 'galleries', galleryId);
        const galleryDoc = await getDoc(galleryRef);

        if (!galleryDoc.exists()) {
            return NextResponse.json(
                { error: 'Gallery not found' },
                { status: 404 }
            );
        }

        const currentCount = galleryDoc.data().viewCount || 0;

        await updateDoc(galleryRef, {
            viewCount: increment(1)
        });

        return NextResponse.json({
            success: true,
            viewCount: currentCount + 1
        });
    } catch (error: any) {
        console.error('View tracking error:', error.message || error);
        return NextResponse.json(
            { error: 'Failed to track view', details: error.message },
            { status: 500 }
        );
    }
}
