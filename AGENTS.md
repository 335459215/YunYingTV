# AGENTS.md

This file provides guidance to AI assistants (Codex, Claude, etc.) when working with code in this repository.

## Project Overview

云影TV (OrionTV/YunYingTV) is a React Native TVOS application for streaming video content, built with Expo and designed specifically for TV platforms (Apple TV and Android TV). This is a frontend-only application that connects to external APIs and includes a built-in remote control server for external device control.

## Key Commands

**Important**: This project uses `npm` (not yarn). Always use npm commands.

### Development Commands

#### TV Development (Apple TV & Android TV)
- `npm start` - Start Metro bundler
- `npm run android` - Build and run on Android TV
- `npm run ios` - Build and run on Apple TV (macOS only)
- `npm run prebuild` - Generate native project files (run after dependency changes)
- `npm run build` - Build Android Release APK

#### Testing Commands
- `npm test` - Run Jest tests with watch mode
- `npm run test-ci` - Run Jest tests for CI with coverage
- `npm run lint` - Run ESLint checks
- `npm run typecheck` - Run TypeScript type checking

#### Build and Deployment
- `npm run build-debug` - Build Android Debug APK
- `npm run clean` - Clean cache and build artifacts
- `npm run clean-modules` - Reinstall all node modules

## Architecture Overview

### Multi-Platform Responsive Design

云影TV implements a sophisticated responsive architecture supporting multiple device types:
- **Device Detection**: Width-based breakpoints (mobile <768px, tablet 768-1023px, TV ≥1024px)
- **Component Variants**: Platform-specific files with `.tv.tsx`, `.mobile.tsx`, `.tablet.tsx` extensions
- **Responsive Utilities**: `DeviceUtils` and `ResponsiveStyles` for adaptive layouts and scaling
- **Adaptive Navigation**: Different interaction patterns per device type (touch vs remote control)

### State Management Architecture (Zustand)

Domain-specific stores with consistent patterns:
- **homeStore.ts** - Home screen content, categories, Douban API data, and play records
- **playerStore.ts** - Video player state, controls, and episode management
- **settingsStore.ts** - App settings, API configuration, and user preferences
- **remoteControlStore.ts** - Remote control server functionality and HTTP bridge
- **authStore.ts** - User authentication state
- **updateStore.ts** - Automatic update checking and version management
- **favoritesStore.ts** - User favorites management
- **detailStore.ts** - Video detail and source management

### Service Layer Pattern

Clean separation of concerns across service modules:
- **api.ts** - External API integration with error handling and caching
- **apiAdapter.ts** - Runtime API response adaptation layer
- **lunaTVAdapter.ts** - LunaTV-specific API client
- **storage.ts** - AsyncStorage wrapper with typed interfaces
- **remoteControlService.ts** - TCP-based HTTP server for external device control
- **updateService.ts** - Automatic version checking and APK download management
- **tcpHttpServer.ts** - Low-level TCP server implementation
- **m3u.ts** - M3U playlist parser for live channels
- **m3u8.ts** - M3U8 HLS resolution detector

### TV Remote Control System

Sophisticated TV interaction handling:
- **useTVRemoteHandler** - Centralized hook for TV remote event processing
- **Hardware Events** - HWEvent handling for TV-specific controls (play/pause, seek, menu)
- **Focus Management** - TV-specific focus states and navigation flows
- **Gesture Support** - Long press, directional seeking, auto-hide controls

### Logging System

All logging uses the centralized `Logger` utility (`utils/Logger.ts`):
- **DO NOT use `console.*`** - Use `Logger.*` instead
- `Logger.info()` - General information
- `Logger.warn()` - Warnings
- `Logger.error()` - Errors
- `Logger.debug()` - Debug information (production-safe)
- `Logger.withTag()` - Create a namespaced logger for a module

## Key Technologies

- **React Native 0.76.3** - Core framework
- **Expo SDK 52** - Development platform providing native capabilities
- **TypeScript 5.7** - Complete type safety with `@/*` path mapping
- **Zustand 5.0** - Lightweight state management
- **Expo Router** - File-based routing system with typed routes
- **Expo AV** - Video playback with TV-optimized controls

## Development Workflow

### TV-First Development Pattern

This project uses a TV-first approach with responsive adaptations:
- **Primary Target**: Apple TV and Android TV with remote control interaction
- **Secondary Targets**: Mobile and tablet with touch-optimized responsive design
- **Build Environment**: TV-specific features enabled by default
- **Component Strategy**: Shared components with platform-specific variants using file extensions

### Testing Strategy

- **Unit Tests**: Test coverage for utilities (`utils/__tests__/`)
- **Jest Configuration**: Expo preset with Babel transpilation
- **Test Patterns**: Mock-based testing for React Native modules and external dependencies
- **Coverage Reporting**: CI-compatible coverage reports

### Important Development Notes

- Run `npm run prebuild` after adding new dependencies for native builds
- Use `npm run build-debug` for local testing
- TV components require focus management and remote control support
- Test on both TV devices and responsive mobile/tablet layouts
- All API calls are centralized in `/services` directory
- Storage operations use AsyncStorage wrapper in `storage.ts`
- Use Logger instead of console.* for all logging

## Code Review Checklist

Before submitting changes, verify:

### General
- [ ] No `console.*` calls remain (use `Logger.*` instead)
- [ ] ESLint passes: `npm run lint`
- [ ] TypeScript passes: `npm run typecheck`
- [ ] No TypeScript errors or warnings

### State Management
- [ ] Store updates use Zustand patterns consistently
- [ ] No direct state mutation
- [ ] Async operations properly handled

### API Integration
- [ ] API calls have error handling
- [ ] Loading states properly managed
- [ ] No sensitive data logged

### UI Components
- [ ] Responsive design works on all device types
- [ ] Focus states properly handled for TV
- [ ] No hardcoded dimensions (use responsive utilities)

### Performance
- [ ] No unnecessary re-renders
- [ ] Heavy operations properly throttled/debounced
- [ ] Images properly lazy loaded

## Common Development Tasks

### Adding New Components
1. Create base component in `/components` directory
2. Add platform-specific variants (`.tv.tsx`) if needed
3. Import and use responsive utilities from `@/utils/DeviceUtils`
4. Test across device types for proper responsive behavior

### Working with State
1. Identify appropriate Zustand store in `/stores` directory
2. Follow existing patterns for actions and state structure
3. Use TypeScript interfaces for type safety
4. Consider cross-store dependencies and data flow

### API Integration
1. Add new endpoints to `/services/api.ts`
2. Implement proper error handling and loading states
3. Use caching strategies for frequently accessed data
4. Update relevant Zustand stores with API responses

### Adding Logging
```typescript
import Logger from '@/utils/Logger';
const logger = Logger.withTag('ModuleName');

// Use appropriate log level
logger.info('Operation started');
logger.warn('Potential issue detected');
logger.error('Operation failed:', error);
```

## File Structure

```
/app                 - Expo Router screens and navigation
/components          - Reusable UI components (including .tv.tsx variants)
/components/navigation - Navigation components
/components/settings - Settings-related components
/stores             - Zustand state management stores
/services           - API, storage, remote control, and update services
/hooks              - Custom React hooks including useTVRemoteHandler
/constants          - App constants, theme definitions, and update configuration
/utils              - Utility functions including Logger
/types              - TypeScript type definitions
/assets             - Static assets including TV-specific icons and banners
/docs               - Project documentation
/docs/archive       - Historical/archived documents
```

## Troubleshooting

### Build Issues
- Clean cache: `npm run clean`
- Reinstall dependencies: `npm run clean-modules`
- Regenerate native files: `npm run prebuild`

### Type Errors
- Run `npm run typecheck` to identify issues
- Check for proper TypeScript interfaces
- Ensure all imports are correct

### Runtime Errors
- Check Logger output for error details
- Verify API configuration in settings
- Test on target device type

## References

- [React Native Documentation](https://reactnative.dev/)
- [Expo SDK Documentation](https://docs.expo.dev/)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Project Optimization Plan](./PROJECT_OPTIMIZATION_PLAN.md)
