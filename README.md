# Truttijagd

Like Moorhuhnjagd but different - A fun turkey hunting game!

## About

Trutti Hunt is a browser-based game inspired by the classic Moorhuhnjagd (Crazy Chicken) game. Click on flying turkeys to earn money, but watch out for bikini girls!

## Features

- 🦃 Hunt regular and special turkeys (Truttis)
- 🎯 9 collectible special Truttis - catch them all for a bonus!
- 💰 Earn money for each successful photograph
- 🎵 Bring your own background music (configurable audio URL)
- 👙 Bonus opportunities (and penalties!) with bikini girls
- ⏸️ Pause anytime to review the rules (Press **P** or **Pause**)
- 🏆 Compete on the high score leaderboard (top 10)
- ⏱️ Game ends when the last Trutti is caught or escapes
- 🚪 Exit early with **Escape** key

## Game Rules

- **Regular Turkeys**: +$10 per photograph
- **Special Truttis (1-9)**: +$50 each
- **Bikini Girls**: -$50 penalty (Don't photograph!)
- **Bikini Girls in delicate situations**: +$100 bonus!
- **Catch all 9 Truttis**: +$500 completion bonus
- **Game ends** when the last uncaught Trutti is captured or leaves the screen

## Controls

- **Mouse Click**: Take photograph
- **P / Pause Key**: Pause game and view rules
- **Escape Key**: End game early
- All scores are automatically saved to your browser's local storage

## Play Online

The game is deployed on GitHub Pages: [Play Trutti Hunt](https://simonbraeuer.github.io/truttijagd/)

## Configuration

### Background Music

To avoid licensing issues, you can provide your own background music:
1. Enter a valid audio file URL on the start screen
2. The URL will be saved in your browser for future sessions
3. Leave empty to play without music

## Development

The game is built with Angular. See the [trutti-hunt folder](./trutti-hunt/) for development details.

### Quick Start

```bash
cd trutti-hunt
npm install
npm start
```

Visit `http://localhost:4200/` to play locally.

### Build for Production

```bash
cd trutti-hunt
npm run build:gh-pages
```

## Deployment

The game is configured for GitHub Pages deployment. The built files are in the `trutti-hunt/docs/` directory, which is set as the GitHub Pages source.

## Technical Features

- Built with Angular and TypeScript
- HTML5 Canvas for game rendering
- LocalStorage for persisting:
  - High scores (top 10)
  - Audio URL configuration
- Responsive game controls
- Smooth animations and particle effects

## License

This is a fun project inspired by Moorhuhnjagd.
