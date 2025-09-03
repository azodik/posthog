import type { PostHog, Properties } from "posthog-js";

// TypeScript declarations for Vite environment variables
declare global {
  interface ImportMeta {
    readonly env: Record<string, string | undefined>;
  }
}

type PosthogClient = PostHog;

// Runtime environment interface for window.__ENV
interface RuntimeEnv {
  POSTHOG_KEY?: string;
  POSTHOG_HOST?: string;
  NEXT_PUBLIC_POSTHOG_KEY?: string;
  NEXT_PUBLIC_POSTHOG_HOST?: string;
  VITE_POSTHOG_KEY?: string;
  VITE_POSTHOG_HOST?: string;
  [key: string]: string | undefined;
}

type WindowWithEnv = Window & typeof globalThis & { __ENV?: RuntimeEnv };

// Global state
let cachedClient: PosthogClient | null = null;
let initialized = false;
let config: { key: string; host: string; appName: string } | null = null;

/**
 * Get environment variable with fallback support for different frameworks
 */
function getEnvVar(key: string): string | null {
  // Check process.env (Node.js/Next.js)
  if (typeof process !== "undefined" && process.env) {
    const value = process.env[key];
    if (value) return value;
  }

  // Check import.meta.env (Vite)
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const value = import.meta.env[key];
    if (value) return value;
  }

  // Check window.__ENV (runtime injection)
  if (typeof window !== "undefined") {
    const w = window as WindowWithEnv;
    if (w.__ENV?.[key]) return w.__ENV[key];
  }

  return null;
}

/**
 * Get PostHog configuration from environment variables
 */
function getPostHogConfig(): { key: string; host: string } | null {
  // Try different environment variable patterns
  const key =
    getEnvVar("POSTHOG_KEY") ||
    getEnvVar("NEXT_PUBLIC_POSTHOG_KEY") ||
    getEnvVar("VITE_POSTHOG_KEY");

  const host =
    getEnvVar("POSTHOG_HOST") ||
    getEnvVar("NEXT_PUBLIC_POSTHOG_HOST") ||
    getEnvVar("VITE_POSTHOG_HOST");

  if (!key || !host) {
    console.warn(
      "PostHog: Missing required environment variables. Please set POSTHOG_KEY and POSTHOG_HOST"
    );
    return null;
  }

  return { key, host };
}

/**
 * Get or create PostHog client instance
 */
async function getClient(): Promise<PosthogClient | null> {
  if (typeof window === "undefined") return null;

  if (cachedClient) return cachedClient;

  try {
    const { default: client } = await import("posthog-js");
    cachedClient = client as unknown as PosthogClient;
    return cachedClient;
  } catch (error) {
    console.error("PostHog: Failed to load posthog-js:", error);
    return null;
  }
}

/**
 * Initialize PostHog with the specified app name
 */
export async function initPosthog(appName = "default"): Promise<void> {
  if (initialized && config?.appName === appName) return;

  const client = await getClient();
  if (!client) return;

  const envConfig = getPostHogConfig();
  if (!envConfig) return;

  // Store config for future reference
  config = { ...envConfig, appName };

  try {
    client.init(envConfig.key, {
      api_host: envConfig.host,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      before_send: (event) => event,
    });

    client.register({
      app_name: appName,
    });

    initialized = true;
  } catch (error) {
    console.error("PostHog: Failed to initialize:", error);
  }
}

/**
 * Track an event
 */
export async function capture(
  event: string,
  properties?: Properties
): Promise<void> {
  const client = await getClient();
  if (!client) return;

  if (!initialized) {
    await initPosthog();
  }

  try {
    client.capture(event, properties);
  } catch (error) {
    console.error("PostHog: Failed to capture event:", error);
  }
}

/**
 * Identify a user
 */
export async function identify(
  distinctId: string,
  properties?: Properties
): Promise<void> {
  const client = await getClient();
  if (!client) return;

  if (!initialized) {
    await initPosthog();
  }

  try {
    client.identify(distinctId, properties);
  } catch (error) {
    console.error("PostHog: Failed to identify user:", error);
  }
}

/**
 * Reset PostHog client
 */
export async function reset(): Promise<void> {
  const client = await getClient();
  if (client) {
    try {
      client.reset();
    } catch (error) {
      console.error("PostHog: Failed to reset:", error);
    }
  }

  cachedClient = null;
  initialized = false;
  config = null;
}

/**
 * Capture an exception/error
 */
export async function captureException(
  error: Error,
  properties?: Properties
): Promise<void> {
  const client = await getClient();
  if (!client) return;

  if (!initialized) {
    await initPosthog();
  }

  try {
    client.captureException(error, properties);
  } catch (err) {
    console.error("PostHog: Failed to capture exception:", err);
  }
}

/**
 * Get the current distinct ID
 */
export async function getDistinctId(): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;

  try {
    return client.get_distinct_id();
  } catch (error) {
    console.error("PostHog: Failed to get distinct ID:", error);
  }
  return null;
}

/**
 * Get current PostHog configuration
 */
export function getConfig() {
  return config;
}

/**
 * Check if PostHog is initialized
 */
export function isInitialized(): boolean {
  return initialized;
}

// Default export with all methods
const posthog = {
  initPosthog,
  capture,
  identify,
  reset,
  captureException,
  getDistinctId,
  getConfig,
  isInitialized,
};

export default posthog;
