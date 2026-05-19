# Dental Recovery Guide

Mobile-first React app for dental surgery recovery instructions.

## Recommended GitHub repo name

Use this repository name:

```text
dental-recovery
```

The app is already configured for this URL format:

```text
https://YOUR-GITHUB-USERNAME.github.io/dental-recovery/
```

## How to publish to GitHub Pages

1. Create a new GitHub repository named `dental-recovery`.
2. Upload all files from this folder to the repository.
3. Go to repository **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - Source: **GitHub Actions**
5. Go to **Actions** tab.
6. Run or wait for **Deploy to GitHub Pages**.
7. Open the Pages URL shown after deployment.

## If you use a different repository name

Edit `vite.config.js`:

```js
base: "/YOUR-REPO-NAME/",
```

## Local test on computer

```bash
npm install
npm run dev
```

## QR code

After GitHub Pages creates your link, use the final URL:

```text
https://YOUR-GITHUB-USERNAME.github.io/dental-recovery/
```
