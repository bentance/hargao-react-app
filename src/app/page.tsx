import Link from 'next/link';
import { BRAND_CONFIG } from '@/config';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            {BRAND_CONFIG.logo ? (
              <img src={BRAND_CONFIG.logo} alt={BRAND_CONFIG.name} className={styles.logo} />
            ) : (
              BRAND_CONFIG.name
            )}
          </h1>
          <p className={styles.tagline}>{BRAND_CONFIG.tagline}</p>

          <div className={styles.actions}>
            <Link href="/create" className={styles.primaryBtn}>
              Create Your Gallery
            </Link>
          </div>
        </div>

        <div className={styles.decorations}>
          <div className={styles.decoShape1}></div>
          <div className={styles.decoShape2}></div>
          <div className={styles.decoShape3}></div>
        </div>
      </div>
    </main>
  );
}
