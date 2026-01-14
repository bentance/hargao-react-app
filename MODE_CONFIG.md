# Gallery Application Mode Configuration

## 🎮 Application Modes

The application has different modes controlled by the `userType` setting in `src/babylon/config.ts`:

### Mode Types

1. **`default`** - Single Gallery View
   - Used for viewing a specific user's gallery
   - No navigation arrows
   - URL: `/@username/gallery-slug`

2. **`explore`** - Local Gallery Browser  
   - Browse 5 demo galleries stored locally
   - Navigation arrows appear on screen (◀ ▶)
   - Arrow keys also work
   - URL: `/explore` (to be created)

3. **`admin`** - Admin/Testing Mode
   - Full keyboard controls
   - Can switch levels with `+` and `-` keys
   - Used for development/testing

## 🔧 How to Change Mode

**File:** `src/babylon/config.ts`

```typescript
export const CURRENT_USER = {
    userType: "explore", // Change this: "default" | "explore" | "admin"
    // ...
};
```

## 📍 Route Structure

### Current Routes
- `/` - Home page
- `/create` - Create a new gallery
- `/@username/gallery-slug` - View user gallery (online from Firebase)
- `/admin` - Admin dashboard

### Planned Routes
- `/explore` - Browse local demo galleries (offline)
- `/discover` - Browse all Firebase galleries (online feed)
- `/demo` - Single default gallery (offline)

## 🎨 Navigation Arrows

**Location:** `src/babylon/navigationController.ts`

**When do they appear?**
- Only when `userType === "explore"`
- Automatically positioned:
  - **Desktop:** Bottom center of screen
  - **Mobile:** To the left of the E button

**How to customize?**
- Edit `navigationController.ts`
- Modify `baseStyle` for appearance
- Adjust positioning logic in `createButtons()`

## 🔑 Keyboard Controls

### All Modes
- `WASD` or Arrow Keys - Move
- `E` - Interact with paintings/about
- `Mouse` - Look around

### Explore Mode Only
- `Left/Right Arrow` or `◀ ▶` buttons - Switch galleries

### Admin Mode Only
- `+` / `-` - Switch between the 4 levels
- All explore mode controls

## 📦 Data Sources

### Online Mode (`APP_CONFIG.type === "online"`)
- Loads from Firebase Firestore & Storage
- User galleries from `/@username/slug`
- Requires authentication for uploads

### Offline Mode (`APP_CONFIG.type === "offline"`)  
- Loads from `public/exploration_content/`
- Local demo galleries (gallery_1 to gallery_5)
- No authentication needed

## 🎯 Quick Mode Switching

For development, quickly test different modes:

```typescript
// In src/babylon/config.ts

// Test single gallery view
CURRENT_USER.userType = "default";

// Test local gallery browser  
CURRENT_USER.userType = "explore";

// Test admin features
CURRENT_USER.userType = "admin";
```

## 🚀 Production Configuration

For production deployment:
- Set `userType` based on the route in your component
- Use `setUserType()` function to change dynamically
- Online galleries use `setUserType("default")`
- Explore page uses `setUserType("explore")`
