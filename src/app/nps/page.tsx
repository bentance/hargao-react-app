'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './nps.module.css';

export default function NPSPage() {
    const searchParams = useSearchParams();
    const [score, setScore] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get optional parameters from URL
    const userId = searchParams.get('uid');
    const galleryId = searchParams.get('gid');

    const handleSubmit = async () => {
        if (score === null) {
            setError('Please select a score');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Use 'feedback' collection which has working permissions
            await addDoc(collection(db, 'feedback'), {
                type: 'nps',
                name: 'NPS Response',
                email: null,
                message: `Score: ${score}${comment ? ` | Reason: ${comment}` : ''}${feedback ? ` | Feedback: ${feedback}` : ''}`,
                npsScore: score,
                npsComment: comment.trim() || null,
                npsFeedback: feedback.trim() || null,
                userId: userId || null,
                galleryId: galleryId || null,
                createdAt: serverTimestamp(),
                isRead: false,
            });

            setIsSubmitted(true);
        } catch (err: any) {
            console.error('Error submitting NPS:', err);
            setError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };



    const getScoreLabel = (s: number): string => {
        if (s <= 6) return 'Detractor';
        if (s <= 8) return 'Passive';
        return 'Promoter';
    };

    const getScoreEmoji = (s: number): string => {
        if (s <= 3) return '😞';
        if (s <= 6) return '😐';
        if (s <= 8) return '🙂';
        return '😍';
    };

    if (isSubmitted) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>🎉</div>
                        <h1>Thank You!</h1>
                        <p>Your feedback helps us improve Hargao.</p>
                        <a href="/" className={styles.homeLink}>
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div className={styles.card}>
                    {/* Header */}
                    <div className={styles.header}>
                        <h1>Quick Feedback</h1>
                        <p>Takes less than 30 seconds</p>
                    </div>

                    {/* NPS Question */}
                    <div className={styles.question}>
                        <h2>How likely are you to recommend Hargao to a friend or colleague?</h2>

                        {/* Score Selection */}
                        <div className={styles.scoreGrid}>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                                <button
                                    key={s}
                                    className={`${styles.scoreBtn} ${score === s ? styles.scoreBtnActive : ''} ${s <= 6 ? styles.detractor : s <= 8 ? styles.passive : styles.promoter
                                        }`}
                                    onClick={() => setScore(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Score Labels */}
                        <div className={styles.scaleLabels}>
                            <span>Not at all likely</span>
                            <span>Extremely likely</span>
                        </div>

                        {/* Selected Score Display */}
                        {score !== null && (
                            <div className={styles.selectedScore}>
                                <span className={styles.emoji}>{getScoreEmoji(score)}</span>
                                <span>You selected <strong>{score}</strong> ({getScoreLabel(score)})</span>
                            </div>
                        )}
                    </div>

                    {/* Optional Comment */}
                    <div className={styles.commentSection}>
                        <label htmlFor="comment">
                            What's the main reason for your score? <span className={styles.optional}>(Optional)</span>
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you think..."
                            rows={3}
                            className={styles.textarea}
                        />
                    </div>

                    {/* Optional Feedback */}
                    <div className={styles.commentSection}>
                        <label htmlFor="feedback">
                            Any other feedback? <span className={styles.optional}>(Optional)</span>
                        </label>
                        <textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Suggestions, feature requests, or anything else..."
                            rows={3}
                            className={styles.textarea}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={styles.error}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={isSubmitting || score === null}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>

                    {/* Privacy Note */}
                    <p className={styles.privacy}>
                        Your response is anonymous and helps us improve.
                    </p>
                </div>
            </div>
        </main>
    );
}
