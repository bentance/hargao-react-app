# Exploration Content - Gallery Configuration Guide

This folder contains the demo galleries used in **Explore** and **Featured** modes. Each gallery is stored in its own subfolder (`gallery_1/`, `gallery_2/`, etc.).

---

## Folder Structure

Each gallery folder should contain:

```
gallery_X/
├── gallery_config.json      ← Required: Gallery configuration
├── painting_1.jpg           ← Painting images (supports .jpg, .jpeg, .png, .webp, .gif)
├── painting_2.jpg
├── painting_3.jpg
├── ...
└── user_displayImage.jpg    ← Optional: Artist profile photo
```

---

## gallery_config.json Reference

Below is a complete example with explanations for each field:

```json
{
    "name": "My Gallery Name",
    "slug": "my-gallery-name",
    "description": "A brief description of this gallery.",

    "environment": {
        "level": 2,
        "character": 1,
        "uiTheme": 4
    },

    "audio": {
        "enableFootsteps": true,
        "footstepsVolume": 4
    },

    "artist": {
        "displayName": "Artist Name",
        "bio": "Artist biography or gallery description text.",
        "photoURL": null,
        "links": {
            "website": "artist-website.com",
            "instagram": "@artisthandle",
            "twitter": null,
            "youtube": null
        }
    },

    "paintings": [
        {
            "id": 1,
            "title": "Painting Title",
            "description": "Description of the painting.",
            "imageUrl": ""
        }
    ]
}
```

---

## Field Descriptions

### Root Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name of the gallery |
| `slug` | string | Yes | URL-friendly identifier (lowercase, hyphens) |
| `description` | string | No | Brief description of the gallery |

---

### Environment Object

Controls the 3D environment settings.

| Field | Type | Required | Options | Description |
|-------|------|----------|---------|-------------|
| `level` | number | Yes | 1, 2, 3, 4 | The 3D environment to use |
| `character` | number | No | 1, 2 | Avatar character model |
| `uiTheme` | number | No | 0, 1, 2, 3, 4 | UI color theme |

#### Level Options:
| Value | Environment |
|-------|-------------|
| 1 | Brutalist Art Gallery |
| 2 | Classical Museum |
| 3 | Salt Flat |
| 4 | Color Scream |

#### Character Options:
| Value | Character |
|-------|-----------|
| 1 | Female |
| 2 | Mannequin |

#### UI Theme Options:
| Value | Theme |
|-------|-------|
| 0 | Classic Dark |
| 1 | Light Minimal |
| 2 | Neon Cyberpunk |
| 3 | Elegant Museum |
| 4 | Classic macOS |

---

### Audio Object

Controls sound settings.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `enableFootsteps` | boolean | No | true | Enable walking sound effects |
| `footstepsVolume` | number | No | 4 | Volume level (0-10) |

---

### Artist Object

Information about the gallery creator/artist.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `displayName` | string | Yes | Artist's display name |
| `bio` | string | No | Artist biography or about text |
| `photoURL` | string/null | No | URL to profile image (or null to use local file) |
| `links.website` | string/null | No | Artist's website URL |
| `links.instagram` | string/null | No | Instagram handle (include @) |
| `links.twitter` | string/null | No | Twitter/X handle |
| `links.youtube` | string/null | No | YouTube channel URL |

> **Note:** If `photoURL` is `null`, the system will look for `user_displayImage.jpg` (or .png, .webp, .gif) in the gallery folder.

---

### Paintings Array

Array of paintings to display in the gallery.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Unique identifier (1, 2, 3, ...) |
| `title` | string | No | Painting title (can be empty) |
| `description` | string | No | Painting description (can be empty) |
| `imageUrl` | string | No | Leave empty ("") for local files |

> **Important:** The `id` field determines which image file is loaded. For `id: 3`, the system looks for `painting_3.jpg` (or .png, .jpeg, .webp, .gif).

---

## Image Files

### Supported Formats
- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.gif`

### Naming Convention

| Image Type | Filename Pattern | Example |
|------------|------------------|---------|
| Paintings | `painting_{id}.{ext}` | `painting_1.jpg`, `painting_5.png` |
| Artist Photo | `user_displayImage.{ext}` | `user_displayImage.jpg` |

---

## Adding a New Gallery

1. Create a new folder: `gallery_6/` (or next available number)

2. Add your `gallery_config.json` file

3. Add your painting images (`painting_1.jpg`, `painting_2.jpg`, etc.)

4. Optionally add `user_displayImage.jpg` for the artist photo

5. Update `TOTAL_GALLERIES` in `src/babylon/config.ts`:
   ```typescript
   const TOTAL_GALLERIES = 6;  // Change from 5 to 6
   ```

---

## Example: Minimal Configuration

```json
{
    "name": "Simple Gallery",
    "slug": "simple-gallery",
    "environment": {
        "level": 2
    },
    "artist": {
        "displayName": "Artist Name",
        "bio": "",
        "photoURL": null,
        "links": {
            "website": null,
            "instagram": null,
            "twitter": null,
            "youtube": null
        }
    },
    "paintings": [
        { "id": 1, "title": "", "description": "", "imageUrl": "" },
        { "id": 2, "title": "", "description": "", "imageUrl": "" },
        { "id": 3, "title": "", "description": "", "imageUrl": "" }
    ]
}
```

---

## Tips

- **Paintings with empty title/description** will still display, but the info popup may appear minimal
- **Image resolution**: Recommended max 2048x2048 pixels for best performance
- **File size**: Keep images under 5MB each for faster loading
- The gallery will automatically detect and load images based on the painting `id`

---

**Built with ❤️ by Hargao Studio**
