'use client';

import styles from './terms.module.css';

export default function TermsPage() {
    return (
        <main className={styles.main}>
            <div className="page-container">
                <header className="page-header">
                    <h1>📜 Terms & Conditions</h1>
                    <p>Please read our terms carefully</p>
                </header>

                <section className="step-card">
                    <div className="step-content">
                        <div className={styles.termsContent}>
                            <p className={styles.lastUpdated}>Last Updated: January 2026</p>

                            {/* Section 1 */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionNumber}>1</span>
                                    Intellectual Property & Content License
                                </h2>
                                <p className={styles.intro}>
                                    By using Hargao to create 3D portfolios, you agree to the following regarding your creative work:
                                </p>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Ownership</h3>
                                    <p>You retain full ownership of the original 2D assets (images, illustrations, photographs) that you upload to the Hargao platform.</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>The Hargao License</h3>
                                    <p>To display your work in a 3D environment, you grant Hargao a worldwide, non-exclusive, royalty-free license to host, store, and render your content within our architectural templates. This includes the right to generate thumbnails and previews for your portfolio's unique URL.</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Template Ownership</h3>
                                    <p>While you own your art, Hargao owns the 3D templates, architectural assets, lighting systems, and code used to generate the gallery. You may not export the 3D environment itself for use in other software without permission.</p>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionNumber}>2</span>
                                    Data Usage & Privacy
                                </h2>
                                <p className={styles.intro}>
                                    Hargao is designed to be a "drag-and-drop" experience. To make this possible:
                                </p>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Behavioral Data</h3>
                                    <p>We collect data on how you interact with our 3D editor (e.g., which themes are most popular) to improve our templates.</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Public Access</h3>
                                    <p>By clicking "Publish," you acknowledge that your 3D gallery and the assets within it are accessible to anyone with your unique URL.</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Asset Storage</h3>
                                    <p>We store your uploaded images on our cloud servers. If you delete your account, we will remove your assets from our active database, though cached versions may persist for a limited time.</p>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionNumber}>3</span>
                                    Prohibited Content & Community Guidelines
                                </h2>
                                <p className={styles.intro}>
                                    To maintain the "epic" and professional feel of Hargao, we strictly prohibit the following. Hargao reserves the right to remove any content or terminate accounts that display:
                                </p>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Illegal & Harmful Content</h3>
                                    <p>Anything that promotes illegal acts, violence, or self-harm.</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Hate Speech</h3>
                                    <p>Content that promotes discrimination or disparages individuals or groups based on race, religion, disability, age, nationality, veteran status, sexual orientation, gender, or gender identity.</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Sexual & Explicit Content</h3>
                                    <p>While we support artistic expression, Hargao is a professional portfolio tool. We prohibit the posting of non-consensual sexual content, real-world pornography, or imagery depicting sexual violence.</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Harassment</h3>
                                    <p>Any content intended to bully, stalk, or harass other creators or individuals.</p>
                                </div>

                                <div className={styles.term}>
                                    <h3 className={styles.termTitle}>Deceptive Content</h3>
                                    <p>You may not upload work that is not your own or for which you do not have the legal right to display. Impersonating other artists will result in an immediate ban.</p>
                                </div>
                            </div>

                            {/* Section 4 */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionNumber}>4</span>
                                    Limitation of Liability & "As-Is" Service
                                </h2>

                                <div className={styles.subsection}>
                                    <h3 className={styles.subsectionTitle}>4.1 Service "As-Is" and "As-Available"</h3>
                                    <p className={styles.intro}>
                                        Hargao provides a browser-based 3D environment that relies on the user's hardware (GPU) and internet connection. You acknowledge that:
                                    </p>
                                    <ul className={styles.bulletList}>
                                        <li>The appearance of your portfolio (lighting, textures, and frame rate) may vary significantly across different devices, browsers, and hardware specifications.</li>
                                        <li>Hargao is currently in its Minimum Viable Product (MVP) stage. We do not guarantee that the service will be uninterrupted, bug-free, or compatible with all web browsers at all times.</li>
                                    </ul>
                                </div>

                                <div className={styles.subsection}>
                                    <h3 className={styles.subsectionTitle}>4.2 High-Stakes Usage Disclaimer</h3>
                                    <p className={styles.intro}>
                                        Hargao is a tool for creative presentation. However, Hargao is not liable for any professional or financial loss resulting from:
                                    </p>

                                    <div className={styles.term}>
                                        <h3 className={styles.termTitle}>Service Downtime</h3>
                                        <p>If a gallery link fails to load during a live client pitch, job interview, or agency presentation.</p>
                                    </div>

                                    <div className={styles.term}>
                                        <h3 className={styles.termTitle}>Data Loss</h3>
                                        <p>While we aim to protect your work, we are not a permanent backup service. You are responsible for maintaining original copies of all uploaded 2D assets.</p>
                                    </div>

                                    <div className={styles.term}>
                                        <h3 className={styles.termTitle}>Visual Discrepancies</h3>
                                        <p>Variations in "Time of Day" sliders or lighting effects that may result in your art appearing differently than intended on a viewer's screen.</p>
                                    </div>
                                </div>

                                <div className={styles.subsection}>
                                    <h3 className={styles.subsectionTitle}>4.3 Cap on Liability</h3>
                                    <p className={styles.highlight}>
                                        To the maximum extent permitted by law, Hargao's total liability for any claim arising out of the use of the platform—whether in contract, tort, or otherwise—is limited to the total amount paid by you to Hargao in the twelve (12) months prior to the event, or <strong>$50.00 USD</strong>, whichever is greater.
                                    </p>
                                </div>
                            </div>

                            {/* Section 5 */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionNumber}>5</span>
                                    Indemnification
                                </h2>
                                <p className={styles.intro}>
                                    You agree to indemnify and hold harmless Hargao and its team from any claims, damages, or legal fees arising from:
                                </p>
                                <ul className={styles.bulletList}>
                                    <li>Your violation of the Prohibited Content rules (e.g., if you upload copyrighted work you don't own).</li>
                                    <li>Any third-party claims regarding the content displayed in your 3D gallery.</li>
                                </ul>
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
