# @azodik/posthog

A PostHog configuration package for Azodik applications, providing easy setup and utilities for PostHog analytics.

## Features

- 🚀 Easy PostHog initialization
- 📱 React provider component for automatic setup
- 🎯 Event tracking utilities
- 👤 User identification helpers
- 🐛 Error tracking and exception handling
- 🔄 Reset functionality
- 📊 Distinct ID management

## Installation

```bash
npm install @azodik/posthog
# or
yarn add @azodik/posthog
# or
pnpm add @azodik/posthog
```

## Usage

### Basic Setup

```typescript
import { initPosthog, capture, identify } from '@azodik/posthog';

// Initialize PostHog
await initPosthog('my-app-name');

// Track events
await capture('user_action', { action: 'button_click' });

// Identify users
await identify('user-123', { name: 'John Doe' });
```

### React Provider

```tsx
import { PostHogProvider } from '@azodik/posthog';

function App() {
  return (
    <PostHogProvider app_name="my-app">
      <YourApp />
    </PostHogProvider>
  );
}
```

### Environment Variables

Set these environment variables in your application:

```env
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## API Reference

### Functions

- `initPosthog(appName: string)`: Initialize PostHog with the specified app name
- `capture(event: string, properties?: Properties)`: Track an event
- `identify(distinctId: string, properties?: Properties)`: Identify a user
- `reset()`: Reset the PostHog client
- `captureException(error: Error, properties?: Properties)`: Track an error
- `getDistinctId()`: Get the current distinct ID

### Components

- `PostHogProvider`: React provider for automatic PostHog setup

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch for changes
pnpm dev

# Clean build artifacts
pnpm clean
```

## License

MIT
