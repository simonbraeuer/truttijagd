# Playwright E2E Testing

## Overview

Comprehensive end-to-end testing suite for Trutti Hunt game using Playwright, following professional game development studio best practices.

## Test Coverage

### 1. Game Initialization (`game-initialization.spec.ts`)
- Application loading and rendering
- Start screen display with all difficulty options
- Audio file selection interface
- Difficulty persistence across sessions

### 2. Gameplay Mechanics (`gameplay.spec.ts`)
- Canvas interaction and object clicking
- Score incrementation on successful hits
- Timer countdown functionality
- Continuous object spawning
- Rapid clicking stress testing
- Difficulty-specific behaviors (Andi, Kevin, Mexxx)
- Special turkey mechanics

### 3. Game States (`game-states.spec.ts`)
- Pause and resume functionality
- Timer persistence during pause
- Score maintenance across state changes
- Game over conditions
- Final score display
- Scoreboard visibility
- Game restart capability

### 4. Performance Benchmarks (`performance.spec.ts`)
- Frame rate stability (FPS monitoring)
- High object count handling (Mexxx difficulty)
- Memory leak detection during extended play
- Initial page load performance (< 3 seconds)
- Canvas rendering performance
- Resource cleanup on game restart
- Rapid difficulty changes
- Visibility change handling

### 5. Accessibility (`accessibility.spec.ts`)
- Proper page title and semantic HTML
- Keyboard navigation and focus management
- Keyboard activation of interactive elements
- Color contrast verification
- High contrast mode support
- Focus indicators visibility
- Screen reader support (descriptive labels)
- Touch-friendly mobile buttons (44x44px minimum)
- Responsive design on small screens
- Touch interaction handling

### 6. Cross-Browser Compatibility (`compatibility.spec.ts`)
- Consistent rendering across browsers (Chromium, Firefox, WebKit)
- Canvas support verification
- LocalStorage persistence and fallback handling
- Responsive design at multiple viewport sizes:
  - Desktop HD (1920x1080)
  - Laptop (1366x768)
  - Tablet Portrait (768x1024)
  - Tablet Landscape (1024x768)
  - Mobile Portrait (375x667)
  - Mobile Landscape (667x375)
- Network condition handling (slow 3G, offline)

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Interactive UI Mode
```bash
npm run test:e2e:ui
```

### Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Browser-Specific Tests
```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Mobile Tests Only
```bash
npm run test:e2e:mobile
```

### View Test Report
```bash
npm run test:e2e:report
```

### Run All Tests (Unit + E2E)
```bash
npm run test:all
```

## Test Architecture

### Fixtures (`fixtures.ts`)
Reusable test utilities and page object models:
- `GamePage` interface with helper methods
- `startGame()` - Start game with specified difficulty
- `pauseGame()` / `resumeGame()` - Control game state
- `getScore()` / `getTimeRemaining()` - Extract game data
- `clickObject()` - Simulate gameplay interactions
- `waitForGameOver()` - Synchronize with game completion
- `isGameRunning()` - Verify game state
- `getCanvasSize()` - Check rendering dimensions

### Configuration (`playwright.config.ts`)
Professional-grade setup:
- **Parallel execution** for faster test runs
- **Retry logic** (2 retries on CI)
- **Multiple reporters**: HTML, JSON, JUnit, List
- **Trace collection** on first retry
- **Screenshot/video** on failure only
- **Cross-browser testing**: Desktop Chrome, Firefox, Safari
- **Mobile testing**: Pixel 5, iPhone 12
- **Auto web server**: Starts dev server if not running

## Best Practices Implemented

### 1. **Reliability**
- Explicit waits for elements
- Retry logic for flaky tests
- Proper cleanup between tests
- State isolation with `beforeEach`

### 2. **Performance**
- Parallel test execution
- Conditional video recording (failures only)
- Efficient selectors
- Resource monitoring

### 3. **Maintainability**
- Page Object Model pattern (fixtures)
- Reusable helper functions
- Clear test descriptions
- Organized test suites

### 4. **Visibility**
- Multiple report formats (HTML, JSON, JUnit)
- Screenshots on failure
- Video recordings for debugging
- Comprehensive test naming

### 5. **Coverage**
- Functional testing (gameplay mechanics)
- Non-functional testing (performance, accessibility)
- Cross-browser compatibility
- Mobile responsiveness
- Edge cases and stress testing

## CI/CD Integration

Tests can be integrated into GitHub Actions workflow:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Test Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Metrics and Benchmarks

- **Page Load**: < 3 seconds
- **Minimum Button Size**: 44x44 pixels (mobile)
- **Frame Consistency**: ±200ms variance acceptable
- **Test Execution**: ~5-10 minutes for full suite
- **Browser Coverage**: Chrome, Firefox, Safari (Desktop + Mobile)

## Continuous Improvement

Areas for expansion:
- Visual regression testing with screenshots
- API mocking for isolated testing
- Performance profiling integration
- Automated accessibility audits (axe-core)
- Load testing with multiple concurrent users
- Network interception for edge cases
