# Trutti Hunt - Testing Quick Reference

## Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test turkey.spec.ts

# Run with coverage
npm test -- --coverage
```

**91 tests** covering game logic, components, and object behaviors.

---

## E2E Tests (Playwright)

### Basic Commands

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Interactive UI mode (best for development)
npm run test:e2e:ui

# See tests run in browser
npm run test:e2e:headed

# Debug mode with step-through
npm run test:e2e:debug

# View last test report
npm run test:e2e:report
```

### Browser-Specific

```bash
# Chrome only (fastest)
npm run test:e2e:chromium

# Firefox only
npm run test:e2e:firefox

# Safari/WebKit only
npm run test:e2e:webkit

# Mobile devices only
npm run test:e2e:mobile
```

### Run Everything

```bash
# Unit tests + E2E tests
npm run test:all
```

---

## Test Suites

### E2E Test Files

1. **game-initialization.spec.ts** - App loading, start screen, difficulty selection
2. **gameplay.spec.ts** - Core mechanics, clicking, scoring, object spawning
3. **game-states.spec.ts** - Pause/resume, game over, restarts
4. **performance.spec.ts** - FPS, load times, memory, stress testing
5. **accessibility.spec.ts** - Keyboard nav, screen readers, mobile touch
6. **compatibility.spec.ts** - Cross-browser, responsive design, network

**~80 E2E tests** covering functional and non-functional requirements.

---

## CI/CD

Tests run automatically on GitHub Actions:
- Unit tests run before build
- E2E tests (Chromium) run before deployment
- Test reports uploaded as artifacts

---

## Quick Tips

- Use `test:e2e:ui` for interactive debugging
- Use `test:e2e:chromium` for fast feedback during development
- Run `test:all` before pushing to catch all issues
- Check `playwright-report/` for detailed failure analysis
- E2E tests require dev server running (auto-started by Playwright)
