# Hargao - Gallery Creator

**Create stunning, immersive 3D virtual art galleries in minutes.**

Hargao is a web application that allows artists, photographers, and creators to build their own virtual art exhibitions. Simply upload your artwork, choose an environment and character, and publish your gallery with a unique shareable URL.

---

## 🎨 What Does This App Do?

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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd gallery-creator

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```
gallery-creator/
├── public/
│   └── images/
│       ├── environments/          # Environment preview thumbnails
│       │   ├── brutalist.jpg
│       │   ├── classical.jpg
│       │   ├── salt-flat.jpg
│       │   └── color-scream.jpg
│       └── characters/            # Character preview thumbnails
│           ├── female.jpg
│           └── mannequin.jpg
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── create/               # Gallery creation form
│   │   │   ├── page.tsx
│   │   │   └── create.module.css
│   │   └── terms/                # Terms & Conditions page
│   │       ├── page.tsx
│   │       └── terms.module.css
│   ├── types/
│   │   └── firebase.ts           # 🔥 Firebase data interfaces
│   ├── config.ts                 # 🔧 Main configuration file
│   └── globals.css               # Global styles
└── README.md
```

---

## ⚙️ Configuration

All app settings are managed in `src/config.ts`:

### Brand Configuration (`BRAND_CONFIG`)
```typescript
{
    name: "Hargao",                    // App name
    tagline: "Create Your Immersive Art Gallery",
    logo: null,                        // Path to logo image or null
    company: "Your Company Name",
    website: "https://example.com",
    colors: { ... },                   // Theme colors
    social: { ... },                   // Social media links
}
```

### Gallery Options (`GALLERY_OPTIONS`)
```typescript
{
    environments: [...],               // Available 3D environments (1-4)
    characters: [...],                 // Available avatar characters (1-2 in form, 0-2 in Babylon)
    uiThemes: [...],                   // UI themes (0-4)
    defaultUI: {
        environment: 1,                // 1=Brutalist, 2=Museum, 3=Salt, 4=Color
        character: 1,                  // 0=Bear, 1=Female, 2=Mannequin
        uiTheme: 4,                    // 0=Dark, 1=Light, 2=Neon, 3=Museum, 4=macOS
    },
    defaultAudio: {
        enableFootsteps: true,
        footstepsVolume: 4,            // 1-10
        backgroundMusicVolume: 5,      // 1-10
    },
    defaultBranding: {
        showWatermark: true,
        customWatermark: null,
    },
    defaultAccess: {
        isPasswordProtected: false,
    },
    defaultTier: "free",               // "free" | "premium" | "admin"
    maxPaintings: 10,
    minPaintings: 1,
}
```

### Firebase Interfaces (`src/types/firebase.ts`)

The app includes TypeScript interfaces that match the Babylon.js app's data structure:

- **`User`** - User account and profile data
- **`Gallery`** - Gallery settings, environment, audio, and paintings
- **`Painting`** - Individual painting metadata and image URL
- **`DEFAULT_USER`** - Default values for new users
- **`DEFAULT_GALLERY`** - Default values for new galleries
- **`TIER_LIMITS`** - Feature limits per subscription tier


---

## 🖼️ Adding Environment & Character Images

Replace the placeholder images in `public/images/`:

| File Path | Recommended Size | Description |
|-----------|------------------|-------------|
| `/images/environments/brutalist.jpg` | 320x200px | Brutalist Art Gallery preview |
| `/images/environments/classical.jpg` | 320x200px | Classical Museum preview |
| `/images/environments/salt-flat.jpg` | 320x200px | Salt Flat preview |
| `/images/environments/color-scream.jpg` | 320x200px | Color Scream preview |
| `/images/characters/female.jpg` | 320x200px | Female character preview |
| `/images/characters/mannequin.jpg` | 320x200px | Mannequin character preview |

---

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/create` | Gallery creation form |
| `/terms` | Terms & Conditions |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules + Global CSS (Neobrutalism design)
- **State:** React useState
- **Future:** Firebase integration for data persistence

---

## 📋 Form Fields

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

## 🚧 Roadmap / Future Features

- [ ] Firebase Authentication
- [ ] Firebase Firestore for gallery storage
- [ ] Firebase Storage for image uploads
- [ ] Live 3D gallery preview
- [ ] UI Theme customization
- [ ] Footstep sounds toggle
- [ ] Watermark options
- [ ] Gallery analytics

---

## 📝 License

[Your License Here]

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

**Built with ❤️ by Hargao Studio**
