import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
    try {
        const { score, comment, feedback, userId, galleryId } = await request.json();

        // Validate required fields
        if (score === undefined || score === null || score < 0 || score > 10) {
            return NextResponse.json(
                { error: 'Invalid score. Must be between 0 and 10.' },
                { status: 400 }
            );
        }

        console.log('📊 NPS submission:', { score, comment, feedback, userId, galleryId });
        console.log('📊 Firebase DB object exists:', !!db);
        console.log('📊 Firebase Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

        // Save to Firestore
        const docRef = await addDoc(collection(db, 'nps_responses'), {
            score,
            comment: comment?.trim() || null,
            feedback: feedback?.trim() || null,
            userId: userId || null,
            galleryId: galleryId || null,
            createdAt: serverTimestamp(),
            submittedVia: 'api',
        });

        console.log('✅ NPS saved:', docRef.id);

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error: any) {
        console.error('❌ NPS submission error:', error.message || error);
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Failed to submit feedback', details: error.message },
            { status: 500 }
        );
    }
}
