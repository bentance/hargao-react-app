import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className={styles.code}>404</h1>
                <h2 className={styles.title}>Page Not Found</h2>
                <p className={styles.message}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link href="/" className={styles.homeButton}>
                    ← Back to Home
                </Link>
            </div>
        </main>
    );
}
