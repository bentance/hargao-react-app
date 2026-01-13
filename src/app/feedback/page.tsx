'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './feedback.module.css';

export default function FeedbackPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [type, setType] = useState('suggestion');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // TODO: Send to Firebase or email service
        // For now, just simulate submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSubmitted(true);
        setIsSubmitting(false);
    };

    if (isSubmitted) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.successCard}>
                        <h1>🎉 Thank You!</h1>
                        <p>Your feedback has been received. We appreciate you taking the time to help us improve!</p>
                        <Link href="/" className={styles.homeBtn}>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Link href="/" className={styles.backButton}>← Back</Link>

                <div className={styles.formCard}>
                    <header className={styles.header}>
                        <h1>Provide Feedback</h1>
                        <p>Help us make Hargao better</p>
                    </header>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Name (optional)</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="neo-input"
                                    placeholder="Your name"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email (optional)</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="neo-input"
                                    placeholder="For follow-up"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Feedback Type</label>
                            <div className={styles.typeOptions}>
                                {['suggestion', 'bug', 'feature', 'other'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        className={`${styles.typeBtn} ${type === t ? styles.active : ''}`}
                                        onClick={() => setType(t)}
                                    >
                                        {t === 'suggestion' && '💡'}
                                        {t === 'bug' && '🐛'}
                                        {t === 'feature' && '✨'}
                                        {t === 'other' && '💬'}
                                        {' '}{t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="message">Your Feedback *</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="neo-textarea"
                                placeholder="Tell us what you think..."
                                rows={5}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isSubmitting || !message.trim()}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Feedback'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
