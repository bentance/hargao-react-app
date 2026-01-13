'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './signin.module.css';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // TODO: Implement Firebase sign in
        // For now, show coming soon message
        setTimeout(() => {
            setError('Sign in coming soon! For now, create a new gallery.');
            setIsLoading(false);
        }, 1000);
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Link href="/" className={styles.backButton}>← Back</Link>

                <div className={styles.formCard}>
                    <header className={styles.header}>
                        <h1>Sign In</h1>
                        <p>Access your galleries</p>
                    </header>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="neo-input"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="neo-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p>Don't have an account?</p>
                        <Link href="/create" className={styles.createLink}>
                            Create a gallery instead
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
