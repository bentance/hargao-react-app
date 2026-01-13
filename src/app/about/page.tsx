import Link from 'next/link';
import styles from './about.module.css';

export default function AboutPage() {
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Link href="/" className={styles.backButton}>← Back</Link>

                <header className={styles.header}>
                    <h1>About Hargao</h1>
                </header>

                <section className={styles.content}>
                    <div className={styles.section}>
                        <h2>What is Hargao?</h2>
                        <p>
                            Hargao is a platform that lets artists create immersive 3D virtual
                            art galleries. Share your artwork in a unique, interactive experience
                            that viewers can explore from their browser.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>How it works</h2>
                        <div className={styles.steps}>
                            <div className={styles.step}>
                                <span className={styles.stepNumber}>1</span>
                                <h3>Create</h3>
                                <p>Upload your artwork and customize your gallery environment</p>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.stepNumber}>2</span>
                                <h3>Publish</h3>
                                <p>Get a unique URL to share with anyone</p>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.stepNumber}>3</span>
                                <h3>Explore</h3>
                                <p>Viewers walk through your gallery in 3D</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>Features</h2>
                        <ul className={styles.featureList}>
                            <li>🎨 Multiple gallery environments</li>
                            <li>🖼️ Upload up to 10 paintings per gallery</li>
                            <li>🚶 First-person 3D exploration</li>
                            <li>📱 Works on desktop and mobile</li>
                            <li>🔗 Shareable gallery URLs</li>
                            <li>💰 Free to use</li>
                        </ul>
                    </div>

                    <div className={styles.cta}>
                        <Link href="/create" className={styles.createBtn}>
                            Create Your Gallery
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
