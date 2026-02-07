# Trutti Hunt - Deployment Guide

## Overview
This repository contains "Trutti Hunt", a browser-based turkey hunting game built with Angular 21 and deployed to GitHub Pages.

## Repository Structure
```
truttijagd/
├── .github/workflows/
│   └── deploy.yml          # Automated deployment workflow
├── trutti-hunt/            # Angular application
│   ├── docs/               # Built files for GitHub Pages
│   ├── src/                # Source code
│   ├── public/assets/      # Static assets (add audio here)
│   └── package.json
├── .gitignore
└── README.md
```

## GitHub Pages Setup

### Manual Setup (First Time)
1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select:
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/docs`
4. Click "Save"
5. Wait a few minutes for the deployment
6. Your game will be available at: `https://simonbraeuer.github.io/truttijagd/`

### Automated Deployment
The repository includes a GitHub Actions workflow that automatically:
- Builds the Angular app when you push to the main branch
- Deploys to GitHub Pages
- Ensures all dependencies are installed
- Runs the cross-platform build script

The workflow file is at `.github/workflows/deploy.yml`.

## Local Development

### Prerequisites
- Node.js 20 or higher
- npm (comes with Node.js)

### Getting Started
```bash
cd trutti-hunt
npm install
npm start
```

The game will be available at `http://localhost:4200/`

### Building for Production
```bash
cd trutti-hunt
npm run build:gh-pages
```

This will create optimized production files in the `docs/` directory.

## Adding Background Music
The game supports background music but requires you to add the audio file due to copyright:

1. Obtain a copy of "Freed from Desire" (or another song)
2. Convert it to MP3 format
3. Place it at: `trutti-hunt/public/assets/audio/freed-from-desire.mp3`
4. Rebuild and redeploy

The game works without the audio file but will show a warning in the browser console.

## Game Controls
- **Click/Tap**: Photograph objects
- **Regular Turkeys**: +$10
- **Special Turkeys (1-9)**: +$50 each
- **Bikini Girls**: -$50 penalty
- **Bikini Girls with 💕**: +$100 bonus
- **Complete Collection**: +$500 bonus for all 9 special turkeys

## Troubleshooting

### GitHub Pages not showing content
- Verify the `.nojekyll` file exists in `trutti-hunt/docs/`
- Check that the base href in `docs/index.html` is set to `/truttijagd/`
- Ensure GitHub Pages is configured to use the `/docs` folder

### Build fails on Windows
- The build script uses cross-platform tools (cpy-cli and Node.js)
- Ensure you have the latest npm packages: `npm install`

### Audio doesn't play
- This is expected if you haven't added the audio file
- Check browser console for helpful messages
- Add the audio file as described above

## Technology Stack
- **Framework**: Angular 21
- **Language**: TypeScript
- **Rendering**: HTML5 Canvas
- **Audio**: Web Audio API
- **Build Tool**: Angular CLI
- **Deployment**: GitHub Pages with GitHub Actions

## Support
For issues or questions, please open an issue in the repository.
