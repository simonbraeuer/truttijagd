# Game Feature Module

This directory contains the main game feature and its related components.

## Structure

```
game/
├── game.ts              # Main game component with core game logic
├── game.html            # Main game template
├── game.css             # Main game styles
└── components/          # Sub-components used within the game
    ├── index.ts         # Barrel export file for components
    ├── start-screen/    # Initial screen before game starts
    ├── game-over/       # Game over screen with score submission
    ├── pause-overlay/   # Overlay shown when game is paused
    └── scoreboard/      # High scores display
```

## Component Organization

Following Angular best practices:
- **Main feature component** (`game.ts`): Contains the core game logic, canvas rendering, and state management
- **Sub-components folder** (`components/`): Contains all UI components specific to the game feature
- **Barrel exports** (`index.ts`): Simplifies imports and maintains clean dependencies

## Component Responsibilities

### GameComponent (Main)
- Canvas rendering and game loop
- Game state management (score, lives, game objects)
- Input handling (mouse clicks, keyboard)
- Audio management
- Local storage for scoreboard

### StartScreenComponent
- Game instructions display
- Audio configuration
- Control explanations
- Accordion-based layout for better UX

### GameOverComponent
- Score display
- Player name input
- Highscore list qualification check
- Score submission

### PauseOverlayComponent
- Game rules review during pause
- Resume instructions

### ScoreboardComponent
- High scores display
- Score entry highlighting
- Back to menu navigation

## Usage

```typescript
import { GameComponent } from './game/game';
```

All sub-components are automatically imported by the main GameComponent and don't need to be imported separately elsewhere.
