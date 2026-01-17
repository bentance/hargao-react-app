'use client';

import styles from './terms.module.css';

export default function TermsPage() {
    return (
        <main className={styles.main}>
            <div className="page-container">
                <header className="page-header">
                    <h1>📜 Hargao Terms of Service</h1>
                    <p>Please read our terms carefully</p>
                </header>

                <section className="step-card">
                    <div className="step-content">
                        <div className={styles.termsContent}>
                            <p className={styles.lastUpdated}>Effective Date: January 17, 2026</p>
                            <p className={styles.intro}>
                                Welcome to Hargao. By using our platform to create, view, or share 3D virtual galleries, you agree to be bound by the following terms.
                            </p>

                            {/* Section 1 */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionNumber}>1</span>
                                    Ownership and Intellectual Property (IP)
                                </h2>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Your Content</h3>
                                    <p>You retain 100% ownership of all artwork, images, and text you upload to Hargao. We do not claim any copyright over your creations.</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Limited License</h3>
                                    <p>To operate the service, you grant Hargao a worldwide, non-exclusive, royalty-free license to host, store, display, and reproduce your content solely for the purpose of displaying your gallery and promoting your work within our "Exploration Mode."</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Platform Rights</h3>
                                    <p>All 3D assets, gallery environments, code, and interface designs provided by Hargao are the exclusive property of Hargao. You may not extract or reverse-engineer our 3D environments for use outside the platform.</p>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionNumber}>2</span>
                                    Data Storage & Management
                                </h2>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Storage</h3>
                                    <p>We provide digital storage for your uploaded artwork. While we take reasonable measures to secure your data, Hargao is not a backup service. You are responsible for maintaining original copies of your work.</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Account Inactivity</h3>
                                    <p>For users on a Free Tier, Hargao reserves the right to remove galleries or data from accounts that have been inactive for more than 12 consecutive months. We will provide 30 days' notice via email before any data removal.</p>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionNumber}>3</span>
                                    Analytics and User Activity
                                </h2>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Usage Tracking</h3>
                                    <p>To improve the 3D experience, we collect data on how visitors interact with galleries (e.g., movement patterns, artwork views, and session duration).</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Data Purpose</h3>
                                    <p>This data is used for internal performance optimization and to provide creators with engagement analytics. All behavioral data is handled in accordance with our Privacy Policy.</p>
                                </div>
                            </div>

                            {/* Section 4 */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionNumber}>4</span>
                                    Communications & Marketing
                                </h2>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Email Consent</h3>
                                    <p>By creating an account, you agree to receive administrative emails (password resets, billing) and occasional promotional emails regarding new features, themes, or community highlights.</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Opt-Out</h3>
                                    <p>You may opt out of promotional communications at any time by clicking the "Unsubscribe" link found at the bottom of our emails.</p>
                                </div>
                            </div>

                            {/* Section 5 */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionNumber}>5</span>
                                    User Conduct & Content Restrictions
                                </h2>

                                <p className={styles.intro}>
                                    You represent that you own the rights to all content you upload.
                                </p>

                                <p className={styles.intro}>
                                    Hargao prohibits the upload of content that is illegal, infringes on another's IP, or contains explicit graphic violence or hate speech. We reserve the right to remove any gallery that violates these standards.
                                </p>
                            </div>

                            {/* Section 6 */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionNumber}>6</span>
                                    Limitation of Liability
                                </h2>

                                <p className={styles.highlight}>
                                    Hargao is provided "as-is." We are not liable for any technical interruptions, loss of data, or the unauthorized use of your shareable gallery links by third parties.
                                </p>
                            </div>

                            {/* Back Link */}
                            <div className={styles.backLink}>
                                <a href="/create">← Back to Create Gallery</a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
