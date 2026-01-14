'use client';

import { useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import styles from './admin.module.css';

interface UserData {
    uid: string;
    username: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
    tier: string;
    galleriesCount: number;
    createdAt: any;
}

interface GalleryData {
    id: string;
    name: string;
    slug: string;
    paintingsCount: number;
    isPublished: boolean;
    paintings: any[];
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState<UserData[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [userGalleries, setUserGalleries] = useState<GalleryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Delete confirmation state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Admin password from environment variable
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
            loadUsers();
        } else {
            setError('Invalid password');
        }
    };

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData: UserData[] = [];
            usersSnapshot.forEach((doc) => {
                usersData.push({ uid: doc.id, ...doc.data() } as UserData);
            });
            // Sort by createdAt descending
            usersData.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
            setUsers(usersData);
        } catch (err: any) {
            console.error('Error loading users:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadUserGalleries = async (user: UserData) => {
        setSelectedUser(user);
        setIsLoading(true);
        try {
            const galleriesSnapshot = await getDocs(collection(db, 'galleries'));
            const galleries: GalleryData[] = [];
            galleriesSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.ownerId === user.uid) {
                    galleries.push({
                        id: doc.id,
                        name: data.name,
                        slug: data.slug,
                        paintingsCount: data.paintings?.length || 0,
                        isPublished: data.isPublished,
                        paintings: data.paintings || [],
                    });
                }
            });
            setUserGalleries(galleries);
        } catch (err: any) {
            console.error('Error loading galleries:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        // Verify password
        if (deletePassword !== ADMIN_PASSWORD) {
            setDeleteError('Invalid admin password');
            return;
        }

        setIsDeleting(true);
        setDeleteError('');

        try {
            const uid = selectedUser.uid;
            const username = selectedUser.username;

            console.log(`🗑️ Starting deletion for user: ${username} (${uid})`);

            // 1. Delete user's galleries from Firestore
            for (const gallery of userGalleries) {
                console.log(`  Deleting gallery: ${gallery.id}`);

                // Try to delete gallery images from Storage
                try {
                    const galleryStorageRef = ref(storage, `galleries/${gallery.id}`);
                    const files = await listAll(galleryStorageRef);
                    for (const fileRef of files.items) {
                        await deleteObject(fileRef);
                        console.log(`    Deleted file: ${fileRef.name}`);
                    }
                } catch (storageErr: any) {
                    console.log(`    Storage cleanup skipped: ${storageErr.message}`);
                }

                // Delete gallery document
                await deleteDoc(doc(db, 'galleries', gallery.id));
            }

            // 2. Delete user's profile image from Storage
            try {
                const profileRef = ref(storage, `users/${uid}/profile.jpg`);
                await deleteObject(profileRef);
                console.log('  Deleted profile image');
            } catch (storageErr: any) {
                console.log('  Profile image cleanup skipped');
            }

            // 3. Delete username from usernames collection
            try {
                await deleteDoc(doc(db, 'usernames', username.toLowerCase()));
                console.log('  Deleted username reservation');
            } catch (err) {
                console.log('  Username cleanup skipped');
            }

            // 4. Delete user document from Firestore
            await deleteDoc(doc(db, 'users', uid));
            console.log('  Deleted user document');

            console.log(`✅ User ${username} deleted successfully!`);
            console.log('⚠️ NOTE: Firebase Auth user must be deleted manually from Firebase Console');

            // Refresh UI
            setShowDeleteModal(false);
            setDeletePassword('');
            setSelectedUser(null);
            setUserGalleries([]);
            loadUsers();

            alert(`User @${username} deleted!\n\n⚠️ Remember to manually delete the Auth user from Firebase Console → Authentication`);

        } catch (err: any) {
            console.error('❌ Error deleting user:', err);
            setDeleteError(err.message || 'Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    // Password gate
    if (!isAuthenticated) {
        return (
            <main className={styles.main}>
                <div className={styles.loginContainer}>
                    <h1>Admin Access</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            className={styles.passwordInput}
                            autoFocus
                        />
                        <button type="submit" className={styles.loginButton}>
                            Enter
                        </button>
                        {error && <p className={styles.error}>{error}</p>}
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <h1>Admin Dashboard</h1>
                    <span className={styles.stats}>
                        Total Users: <strong>{users.length}</strong>
                    </span>
                </header>

                <div className={styles.content}>
                    {/* Users List */}
                    <aside className={styles.sidebar}>
                        <h2>Users</h2>
                        {isLoading && !selectedUser ? (
                            <p>Loading...</p>
                        ) : (
                            <ul className={styles.userList}>
                                {users.map((user) => (
                                    <li
                                        key={user.uid}
                                        className={`${styles.userItem} ${selectedUser?.uid === user.uid ? styles.active : ''}`}
                                        onClick={() => loadUserGalleries(user)}
                                    >
                                        <span className={styles.username}>@{user.username}</span>
                                        <span className={styles.email}>{user.email}</span>
                                        <span className={styles.tier}>{user.tier}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </aside>

                    {/* User Details */}
                    <section className={styles.details}>
                        {selectedUser ? (
                            <>
                                <div className={styles.userHeader}>
                                    <h2>@{selectedUser.username}</h2>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        🗑️ Delete User
                                    </button>
                                </div>
                                <div className={styles.userInfo}>
                                    {selectedUser.photoURL && (
                                        <div className={styles.profileImageContainer}>
                                            <img
                                                src={selectedUser.photoURL}
                                                alt={selectedUser.displayName}
                                                className={styles.profileImage}
                                            />
                                        </div>
                                    )}
                                    <p><strong>Email:</strong> {selectedUser.email}</p>
                                    <p><strong>Display Name:</strong> {selectedUser.displayName}</p>
                                    <p><strong>Tier:</strong> {selectedUser.tier}</p>
                                    <p><strong>Galleries:</strong> {selectedUser.galleriesCount}</p>
                                    <p><strong>UID:</strong> <code>{selectedUser.uid}</code></p>
                                </div>

                                <h3>Galleries ({userGalleries.length})</h3>
                                {userGalleries.length === 0 ? (
                                    <p className={styles.empty}>No galleries yet</p>
                                ) : (
                                    userGalleries.map((gallery) => (
                                        <div key={gallery.id} className={styles.galleryCard}>
                                            <div className={styles.galleryHeader}>
                                                <h4>{gallery.name}</h4>
                                                <span className={gallery.isPublished ? styles.published : styles.draft}>
                                                    {gallery.isPublished ? '🟢 Published' : '🟡 Draft'}
                                                </span>
                                            </div>
                                            <p>
                                                <strong>Gallery Link:</strong>{' '}
                                                <a
                                                    href={`/@${selectedUser.username}/${gallery.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.galleryLink}
                                                >
                                                    /@{selectedUser.username}/{gallery.slug}
                                                </a>
                                            </p>
                                            <p>Paintings: {gallery.paintingsCount}</p>

                                            {gallery.paintings.length > 0 && (
                                                <div className={styles.paintingsGrid}>
                                                    {gallery.paintings.map((painting: any, idx: number) => (
                                                        <div key={idx} className={styles.paintingThumb}>
                                                            <img
                                                                src={painting.imageUrl}
                                                                alt={painting.title || `Painting ${idx + 1}`}
                                                            />
                                                            <span>{painting.title || `#${painting.id}`}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </>
                        ) : (
                            <div className={styles.placeholder}>
                                <p>👈 Select a user to view their details</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className={styles.modalOverlay}>
                    <div className={styles.deleteModal}>
                        <h2>⚠️ Delete User</h2>
                        <p>You are about to permanently delete:</p>
                        <div className={styles.deleteInfo}>
                            <strong>@{selectedUser.username}</strong>
                            <span>{selectedUser.email}</span>
                        </div>
                        <p className={styles.deleteWarning}>
                            This will delete:
                            <br />• User profile from Firestore
                            <br />• All galleries ({userGalleries.length})
                            <br />• All paintings from Storage
                            <br />• Username reservation
                        </p>
                        <p className={styles.deleteNote}>
                            ⚠️ You must manually delete the Auth user from Firebase Console
                        </p>
                        <div className={styles.deleteForm}>
                            <label>Enter admin password to confirm:</label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Admin password"
                                className={styles.passwordInput}
                            />
                            {deleteError && <p className={styles.error}>{deleteError}</p>}
                        </div>
                        <div className={styles.deleteActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword('');
                                    setDeleteError('');
                                }}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmDeleteButton}
                                onClick={handleDeleteUser}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : '🗑️ Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
