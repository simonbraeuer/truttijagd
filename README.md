# Truttijagd

Like Moorhuhnjagd but different - A fun turkey hunting game!

## About

Trutti Hunt is a browser-based game inspired by the classic Moorhuhnjagd (Crazy Chicken) game. Click on flying turkeys to earn money, but watch out for bikini girls!

## Features

- 🦃 Hunt regular and special turkeys (Truttis)
- 🎯 9 collectible special Truttis - catch them all for a bonus!
- 💰 Earn money for each successful photograph
- � Three difficulty levels with unique challenges
- 🎵 Bring your own background music (configurable audio URL)
- 👙 Bonus opportunities (and penalties!) with bikini girls
- ⏸️ Pause anytime to review the rules (Press **P** or **Pause**)
- 🏆 Compete on the high score leaderboard with detailed stats (top 5, difficulty-tracked)
- ⏱️ 90-second timer - beat the clock!
- 📱 Mobile-friendly with touch support and landscape optimization
- 🚪 Exit early with **Escape** key

## Difficulty Levels

- **🐔 Andi**: Large turkeys (9% of canvas), normal speed - Perfect for beginners
- **🦃 Schuh**: Medium turkeys (6% width, 8% height), 1.5x speed - Balanced challenge
- **🔥 Mexxx**: Small turkeys (5.5% of canvas), 2x speed, random bouncing - Expert mode

## Game Rules

- **Regular Turkeys**: +$10 per photograph
- **Special Truttis (1-9)**: +$50 each (spawn rate: 30%)
- **Bikini Girls**: -$50 penalty (Don't photograph!)
- **Bikini Girls in delicate situations (💕)**: +$100 bonus!
- **Catch all 9 Truttis**: +$500 completion bonus (game ends automatically)
- **Timer**: 90 seconds to maximize your score
- **Game ends** when time runs out or all 9 special Truttis are caught

## Controls

- **Mouse Click / Touch**: Take photograph (mousedown/touchstart for quick response)
- **P / Pause Key**: Pause game and view rules
- **Escape Key**: End game early
- High scores (with time left, Truttis caught, and clicks) are saved in IndexedDB
- Audio settings and difficulty are saved in your browser's local storage

## Play Online

The game is deployed on GitHub Pages: [Play Trutti Hunt](https://simonbraeuer.github.io/truttijagd/)

## Configuration

### Background Music

To avoid licensing issues, you can provide your own background music:
1. Enter a valid audio file URL on the start screen
2. The URL will be saved in your browser for future sessions
3. Leave empty to play without music

## Development

The game is built with Angular 21.1.0. See the [trutti-hunt folder](./trutti-hunt/) for development details.

### Project Structure

```
trutti-hunt/src/app/game/
├── game.ts                    # Main game component (~550 lines)
├── game.html                  # Game template
├── game.css                   # Game styles
├── game-object.ts             # Abstract base class and interfaces
├── turkey.ts                  # Turkey and SpecialTurkey classes
├── bikini-girl.ts             # BikiniGirl class
├── game-objects.ts            # Barrel exports
└── components/
    ├── start-screen/          # Difficulty selector and game start
    ├── game-over/             # Game over screen with score entry
    ├── pause-overlay/         # Pause menu with rules
    └── scoreboard/            # Top 5 leaderboard display
```

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

The game is configured for GitHub Pages deployment using the gh-pages package. The build output is in `dist/trutti-hunt/browser/` and is deployed to the `gh-pages` branch.

To deploy manually:
```bash
cd trutti-hunt
npm run deploy
```

Automated deployment via GitHub Actions pushes to the main branch trigger a build and deploy.

## Technical Features

- **Angular 21.1.0** with standalone components
- **TypeScript** with strict mode and override checking
- **HTML5 Canvas** for game rendering with requestAnimationFrame loop (~60fps)
- **OOP Architecture**:
  - Abstract GameObject base class with polymorphic behavior
  - Modular file structure (game-object.ts, turkey.ts, bikini-girl.ts)
  - Inversion of Control pattern for click handling
  - SOLID principles throughout
- **Manual Change Detection** for Set mutations and timer updates
- **IndexedDB** for persisting high scores with detailed stats
- **LocalStorage** for persisting:
  - Selected difficulty level
  - Audio URL configuration
- **Responsive Design**:
  - 4:3 aspect ratio on desktop
  - 16:9 aspect ratio on mobile landscape
  - Touch event support (mousedown/touchstart)
- **Performance Optimizations**:
  - Static constants for repeated values (TWO_PI, color arrays)
  - Pre-calculated dimensions to reduce property access
  - Reusable drawing methods to eliminate code duplication
- **Game Loop Timer**: Timestamp-based with ChangeDetectorRef integration

## License

This is a fun project inspired by Moorhuhnjagd.
