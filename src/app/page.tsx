import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <p className={styles.greeting}>Hello beautiful</p>
          <h1 className={styles.title}>Welcome to HARGAO</h1>
          <p className={styles.subtitle}>Build your immersive virtual art exhibition</p>
        </header>

        {/* Hero GIF */}
        <div className={styles.heroGifContainer}>
          <Image
            src="/gif_for_homepage_v0.gif"
            alt="HARGAO Gallery Preview"
            className={styles.heroGif}
            width={400}
            height={300}
            unoptimized
          />
        </div>

        {/* Main Actions - Two cards */}
        <div className={styles.actionCards}>
          <Link href="/create" className={`${styles.actionCard} ${styles.cardCreate}`}>
            <h2>Create</h2>
            <p>~2 mins</p>
            <p>no credit cards needed</p>
          </Link>

          <Link href="/explore" className={`${styles.actionCard} ${styles.cardExplore}`}>
            <h2>Explore</h2>
            <p>no login required</p>
          </Link>
        </div>

        {/* Footer Links */}
        <nav className={styles.footerLinks}>
          <Link href="/about" className={styles.footerLink}>about</Link>
          <Link href="/featured" className={styles.footerLink}>featured</Link>
          <Link href="/signin" className={styles.footerLink}>sign in</Link>
        </nav>

        {/* Feedback Button */}
        <div className={styles.feedbackContainer}>
          <Link href="/feedback" className={styles.feedbackBtn}>
            provide feedback
          </Link>
        </div>
      </div>

      {/* Decorative Shapes */}
      <div className={styles.decorations}>
        <div className={styles.decoShape1}></div>
        <div className={styles.decoShape2}></div>
        <div className={styles.decoShape3}></div>
      </div>
    </main>
  );
}
