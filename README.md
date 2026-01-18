# Hargao - Gallery Creator

**Create stunning, immersive 3D virtual art galleries in minutes.**

Hargao is a web application that allows artists, photographers, and creators to build their own virtual art exhibitions. Simply upload your artwork, choose an environment and character, and publish your gallery with a unique shareable URL.

---

## What Does This App Do?

Hargao Gallery Creator is a **drag-and-drop gallery builder** that transforms your 2D artwork into an immersive 3D walking experience. Here's what you can do:

### For Artists & Creators
- **Upload 1-10 paintings/images** to display in your virtual gallery
- **Choose from 4 unique environments:**
  - Brutalist Art Gallery
  - Classical Museum
  - Salt Flat
  - Color Scream
- **Select your avatar character** (Female or Mannequin)
- **Add titles and descriptions** to each artwork (optional)
- **Get a unique URL** to share your gallery with the world

### For Visitors
- **Walk through galleries** in first-person 3D
- **View artwork** in an immersive environment
- **Experience art** like never before

---

## Application Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with navigation to Create, Explore, Featured |
| `/create` | Gallery creation form - build your own gallery |
| `/explore` | Babylon.js 3D viewer in explore mode (offline galleries) |
| `/featured` | Babylon.js 3D viewer showcasing featured galleries |
| `/default` | Babylon.js 3D viewer - single local demo gallery |
| `/feedback` | Submit feedback to help improve the platform |
| `/nps` | Net Promoter Score feedback form |
| `/signin` | User sign-in page |
| `/about` | About page |
| `/terms` | Terms & Conditions |
| `/@username/gallery-slug` | View a specific user's published gallery |
| `/danbo666` | Admin dashboard (password protected) |

---

## Application Modes

The Babylon.js viewer has 3 viewing modes:

1. **Default Mode** - Single gallery view (for `/@username/slug` routes)
2. **Explore Mode** - Browse local demo galleries with navigation arrows (for `/explore` and `/featured`)
3. **Admin Mode** - Development/testing with extra controls

**Navigation Arrows:** Appear automatically in Explore mode at the bottom center of the screen!

---

## Admin Dashboard (`/danbo666`)

The admin dashboard provides tools for managing the platform:

### Users Tab
- View all registered users
- See user details (email, username, tier, galleries count)
- View user galleries with paintings thumbnails and **view counts**
- Toggle "Featured" status on galleries
- Delete users (with password confirmation)

### Feedback Tab
- View all user-submitted feedback
- See feedback type (suggestion, bug, feature, other)
- View submission date and user contact info

### Featured Tab
- View all currently featured galleries
- Quick links to visit each gallery
- Remove galleries from featured list

### Net Promoter Score Tab
- View all NPS responses from users
- See average score and breakdown (Promoters, Passives, Detractors)
- View individual scores with comments and feedback

---

## Analytics & Tracking

### View Count (Built-in)
- Each gallery visit is tracked in Firestore
- View counts displayed in admin dashboard per gallery
- Simple, fast, no external dependencies

### PostHog Analytics (Optional)
- Rich analytics: page views, sessions, user flows
- Session recordings: watch how users navigate
- Automatic tracking once configured
- Add `NEXT_PUBLIC_POSTHOG_KEY` to `.env.local` to enable

---

## Form Validation

### Character Limits

| Field | Max Characters |
|-------|---------------|
| Username | 30 |
| Bio | 500 |
| Gallery Name | 50 |
| Gallery Description | 1000 |
| Painting Title | 100 |
| Painting Description | 500 |

### Username Requirements
- Lowercase letters only (a-z)
- Numbers allowed (0-9)
- Hyphens and underscores allowed (- _)
- **No spaces** (automatically converted to hyphens)
- Used in gallery URLs: `/@username/gallery-slug`

---

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm, yarn, pnpm, or bun
- Firebase project (for online galleries)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd gallery-creator

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Firebase config to .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Environment Variables

Required environment variables in `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Dashboard
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password

# Email Notifications (Gmail SMTP)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# PostHog Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Base URL (for email links)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```


---

## Firebase Collections

### `users`
User profile and account data.

### `galleries`
Gallery configurations, paintings, and settings.
- `isFeatured: boolean` - Admin-curated featured galleries
- `isPublished: boolean` - Public visibility

### `feedback`
User feedback submissions.
- `name`, `email`, `type`, `message`, `createdAt`, `isRead`

### `usernames`
Username reservation mapping.

---

## Firebase Security Rules

Recommended Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /galleries/{galleryId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null 
                    || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isFeatured']);
      allow delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    match /feedback/{feedbackId} {
      allow create: if true;
      allow read: if true;
    }
    
    match /usernames/{username} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

---

## Project Structure

```
gallery-creator/
├── public/
│   ├── images/
│   │   ├── environments/          # Environment preview thumbnails
│   │   └── characters/            # Character preview thumbnails
│   ├── ui/
│   │   ├── Desktop_View_Instructions_v0.jpg  # Desktop loading screen
│   │   └── Mobile_View_Instructions_v0.jpg   # Mobile loading screen
│   └── exploration_content/       # Offline demo galleries
│       ├── gallery_1/
│       ├── gallery_2/
│       └── ...
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── create/               # Gallery creation form
│   │   ├── explore/              # Babylon.js explore mode
│   │   ├── featured/             # Featured galleries viewer
│   │   ├── default/              # Single demo gallery
│   │   ├── feedback/             # Feedback form
│   │   ├── danbo666/             # Admin dashboard
│   │   ├── signin/               # Sign in page
│   │   └── [username]/[slug]/    # Dynamic gallery routes
│   ├── babylon/                  # Babylon.js 3D engine
│   │   ├── app.ts               # Main Babylon app
│   │   ├── config.ts            # Game configuration
│   │   └── ...
│   ├── components/
│   │   └── GalleryViewer.tsx    # React wrapper for Babylon.js
│   ├── types/
│   │   └── firebase.ts          # TypeScript interfaces
│   └── lib/
│       └── firebase.ts          # Firebase initialization
└── README.md
```

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **3D Engine:** Babylon.js
- **Language:** TypeScript
- **Styling:** CSS Modules + Global CSS (Neobrutalism design)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **State:** React useState

---

## Typography

The application uses Google Fonts for a modern, clean aesthetic:

### Primary Fonts

| Font | Variable | Usage | Weights |
|------|----------|-------|---------|
| **Space Grotesk** | `--font-heading` | Headings, body text, buttons, inputs | 400, 500, 600, 700 |
| **Space Mono** | `--font-mono` | Code blocks, URL previews, monospace text | 400, 700 |

### System Fallbacks

- **Space Grotesk** falls back to: `system-ui, sans-serif`
- **Space Mono** falls back to: `monospace`

### Additional System Fonts (Babylon.js viewer)

| Font | Usage |
|------|-------|
| `-apple-system, monospace` | 3D viewer UI elements (loading screen, debug info) |

### Font CDN

Fonts are loaded via Google Fonts CDN in `globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
```

---

## Loading Screen

The Babylon.js viewer includes a custom loading screen with:
- Device-specific instruction images (desktop/mobile)
- "hargao studio" branding
- Animated spinner
- Automatic fade-out when loaded

Loading screen images location:
- Desktop: `/public/ui/Desktop_View_Instructions_v0.jpg`
- Mobile: `/public/ui/Mobile_View_Instructions_v0.jpg`

---

## Form Fields

### Required Fields (marked with *)
- Email
- Password / Confirm Password
- Username
- Gallery Name (auto-generates URL slug)
- Environment selection
- Character selection
- At least 1 painting
- Agree to Terms & Conditions

### Optional Fields
- Profile photo
- Bio
- Website
- Instagram
- Painting titles & descriptions

---

## License

[Your License Here]

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

**Built with love by Hargao Studio**
