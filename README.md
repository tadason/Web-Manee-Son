# Web-Manee-Son

Vite + React + TypeScript site with Firebase Authentication, Firestore-backed AppTada, and a Three.js animated background.

## Run Locally

1. Install dependencies
   `npm install`
2. Create `.env` with Firebase config (see below)
3. Start dev server
   `npm run dev`

Note: Tailwind CSS is required for all UI styling. Do not remove the Tailwind pipeline (`index.css` imports `tailwindcss`) or the UI will render without styles.

## Environment Variables

Required for Firebase auth and Firestore (`.env`):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Optional access control for AppTada:

```
VITE_ALLOWED_EMAILS=someone@company.com,another@company.com
VITE_ADMIN_EMAILS=admin@company.com,ceo@company.com
```

## Auth Flow (Firebase, Email/Password)

Centralized in `context/AuthContext.tsx`:

- `onAuthStateChanged` keeps `user`, `authLoading`, and `authError` in sync with Firebase.
- `loginWithEmail(email, password)` uses `signInWithEmailAndPassword`.
- `logout()` calls `signOut`.
- `resolveRole(user)` checks Firebase custom claims (`role=ADMIN` or `admin=true`) and falls back to `VITE_ADMIN_EMAILS`.

Login UI lives in `components/LoginModal.tsx`:

- `redirectTo` controls the post-login destination.
- Shows Firebase errors directly in the modal.
- Uses `loginWithEmail` only.

Protected routes are guarded in `App.tsx`:

- `ProtectedRoute` saves `postLoginRedirect` to `sessionStorage` and redirects to `/`.
- `/apptada.tsx` and `/apptada` are protected.
- `/dashboard` and `/admin` are role protected.

## Pages and Features

### Landing
`pages/Landing.tsx`

- Opens the login modal.
- Redirects authenticated users to `/apptada.tsx` by default.
- If redirected from a protected route, uses the saved target.

### UX Workflow (MVP Loop)

1. User visits `/apptada.tsx` (or `/apptada`) without auth  
   → `ProtectedRoute` saves the target and redirects to `/`  
   → Landing opens the login modal.
2. Login success  
   → navigate to saved target (default `/apptada.tsx`).
3. Login failure  
   → stay on the modal and show Firebase error text.
4. Logout from any protected page  
   → Firebase signOut → `ProtectedRoute` redirects back to `/`.

### AppTada
`pages/apptada.tsx`

AppTada is a Firebase-authenticated tool for storing app descriptions.

Key functions:
- `handleGenerate()` calls `POST /api/describe-app` with `{ url }` and expects `{ description }`.
- `handleSave()` writes to Firestore `apps` collection with `serverTimestamp()`.
- `handleCopy()` copies the formatted description to clipboard.

Access control:
- Requires Firebase login.
- Optional allowlist via `VITE_ALLOWED_EMAILS`. Empty list = all Firebase users allowed.

Firestore collection:
- `apps` documents store `{ url, description, createdAt, createdBy }`.

### Admin / Employee Dashboards
`pages/AdminPortal.tsx`, `pages/EmployeeDashboard.tsx`

- Both are protected routes.
- Role is determined in `AuthContext` (`UserRole.ADMIN` vs `UserRole.EMPLOYEE`).

### Three.js Background
`components/ThreeBackground.tsx`

- `DigitalWave` instanced mesh animation rendered with `@react-three/fiber`.
- Canvas is mounted as a fixed background layer behind all pages.

## Service Worker

`index.tsx` registers `sw.js`:

- Network-first for navigation (avoids stale HTML causing blank screen).
- Cache-first for other assets.

## Common Problems

1. AppTada can log in but cannot read/write Firestore
   - Check Firestore rules for the `apps` collection.
2. `/apptada.tsx` does not redirect after login
   - Clear `sessionStorage` and try again.

## Project Structure (key files)

- `App.tsx` - routes + ProtectedRoute
- `context/AuthContext.tsx` - Firebase auth wrapper
- `components/LoginModal.tsx` - login UI
- `pages/Landing.tsx` - landing + login launcher
- `pages/apptada.tsx` - AppTada (Firestore)
- `firebaseClient.ts` + `firebaseConfig.ts` - Firebase setup
- `components/ThreeBackground.tsx` - animated background
