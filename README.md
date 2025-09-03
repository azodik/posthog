# @azodik/posthog

A PostHog configuration package for Azodik applications, providing easy setup and utilities for PostHog analytics. **Now supports both Next.js and Vite!** 🚀

## ✨ Features

- 🚀 **Cross-Framework Support**: Works seamlessly with Next.js, Vite, and other React frameworks
- 📱 **React Provider Component**: Automatic setup with error boundary integration
- 🎯 **Event Tracking**: Simple and reliable event tracking utilities
- 👤 **User Identification**: Easy user identification and property management
- 🐛 **Error Tracking**: Comprehensive error tracking and exception handling
- 🔄 **Reset Functionality**: Clean reset and reinitialization capabilities
- 📊 **Distinct ID Management**: Get and manage user distinct IDs
- ⚡ **Performance Optimized**: Lazy loading and efficient client management
- 🛡️ **Error Handling**: Robust error handling with graceful fallbacks
- 🔧 **Configuration Management**: Easy access to current configuration state
- 🖥️ **Node.js Support**: Server-side PostHog client for backend applications

## 📦 Installation

```bash
npm install @azodik/posthog
# or
yarn add @azodik/posthog
# or
pnpm add @azodik/posthog
```

## 🚀 Quick Start

### Browser/Client Usage

```typescript
import { initPosthog, capture, identify, PostHogProvider } from '@azodik/posthog';

// Initialize PostHog
await initPosthog('my-app-name');

// Track events
await capture('user_action', { action: 'button_click' });

// Identify users
await identify('user-123', { name: 'John Doe', plan: 'pro' });
```

### React Provider (Recommended)

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

### Node.js/Server Usage

```typescript
import { getPosthogNode } from '@azodik/posthog';

// Get the PostHog Node.js client
const posthogNode = getPosthogNode();

if (posthogNode) {
  // Track server-side events
  posthogNode.capture({
    distinctId: 'user-123',
    event: 'api_request',
    properties: {
      endpoint: '/api/users',
      method: 'GET'
    }
  });
}
```

## 🌍 Environment Variables

The package automatically detects environment variables from multiple sources:

### Next.js
```env
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Vite
```env
VITE_POSTHOG_KEY=your_posthog_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### Generic (Universal)
```env
POSTHOG_KEY=your_posthog_key
POSTHOG_HOST=https://app.posthog.com
```

### Runtime Injection
```typescript
// For runtime environment variable injection
window.__ENV = {
  POSTHOG_KEY: 'your_key',
  POSTHOG_HOST: 'https://app.posthog.com'
};
```

**Priority Order**: Generic → Framework-specific → Runtime injection

## 📚 API Reference

### Core Functions

- `initPosthog(appName: string)`: Initialize PostHog with the specified app name
- `capture(event: string, properties?: Properties)`: Track an event
- `identify(distinctId: string, properties?: Properties)`: Identify a user
- `reset()`: Reset the PostHog client and clear state
- `captureException(error: Error, properties?: Properties)`: Track an error
- `getDistinctId()`: Get the current distinct ID

### Utility Functions

- `getConfig()`: Get current PostHog configuration
- `isInitialized()`: Check if PostHog is initialized

### Components

- `PostHogProvider`: React provider for automatic PostHog setup with error tracking

### Node.js Functions

- `getPosthogNode()`: Get the PostHog Node.js client for server-side usage

## 🔧 Advanced Usage

### Manual Initialization

```typescript
import { initPosthog, isInitialized } from '@azodik/posthog';

// Check if already initialized
if (!isInitialized()) {
  await initPosthog('my-app');
}
```

### Error Handling

```typescript
import { captureException } from '@azodik/posthog';

try {
  // Your code here
} catch (error) {
  await captureException(error, {
    context: 'user_action',
    userId: 'user-123'
  });
}
```

### Configuration Access

```typescript
import { getConfig } from '@azodik/posthog';

const config = getConfig();
console.log('PostHog Key:', config?.key);
console.log('PostHog Host:', config?.host);
```

### Server-Side Tracking

```typescript
import { getPosthogNode } from '@azodik/posthog';

// In your API route or server function
export async function handleUserAction(userId: string, action: string) {
  const posthogNode = getPosthogNode();
  
  if (posthogNode) {
    await posthogNode.capture({
      distinctId: userId,
      event: 'server_action',
      properties: {
        action,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    });
  }
  
  // Your business logic here
}
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch for changes
pnpm dev

# Clean build artifacts
pnpm clean

# Type checking
pnpm tsc --noEmit
```

## 🔍 Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure you have set the required `POSTHOG_KEY` and `POSTHOG_HOST`
2. **Initialization Errors**: Check browser console for detailed error messages
3. **Framework Compatibility**: The package automatically detects your framework and uses appropriate environment variables
4. **Node.js Client**: Make sure you're using `getPosthogNode()` for server-side operations

### Debug Mode

```typescript
// Check initialization status
import { isInitialized, getConfig } from '@azodik/posthog';

console.log('Initialized:', isInitialized());
console.log('Config:', getConfig());

// Check Node.js client
import { getPosthogNode } from '@azodik/posthog';
const posthogNode = getPosthogNode();
console.log('Node.js Client Available:', !!posthogNode);
```

## 📋 Requirements

- **React**: >= 19.0.0 (peer dependency)
- **Node.js**: >= 18.0.0
- **TypeScript**: >= 5.0.0 (for type definitions)

## 🤝 Contributing

Contributions are welcome! Please ensure all changes include proper TypeScript types and error handling.

## 📄 License

MIT
