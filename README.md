# DJ PERFECT EVENTS V2

## Included
- React + Vite customer website
- Admin dashboard
- QR ticket creation
- QR scanner
- Catalog, orders, booking management
- Vercel deployment config
- Responsive mobile layout

## Demo login
Admin PIN: `4545`

## Deploy to GitHub + Vercel
1. Delete the old files from the repository or upload these files and folders to replace them.
2. The repository root must contain:
   - `package.json`
   - `vite.config.js`
   - `vercel.json`
   - `index.html`
   - `src/`
3. Commit to the `main` branch.
4. Vercel should detect Vite automatically.
5. Build command: `npm run build`
6. Output directory: `dist`

## Important
This version stores data in browser localStorage for testing. It is not a shared online database.
Firebase Authentication, Firestore and Storage must be connected for secure real-world multi-device use.
