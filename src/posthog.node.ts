import { PostHog } from "posthog-node";

let _posthogNode: PostHog | null = null;

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
      "PostHog Node: Missing required environment variables. Please set POSTHOG_KEY and POSTHOG_HOST"
    );
    return null;
  }

  return { key, host };
}

export const getPosthogNode = (): PostHog | null => {
  const config = getPostHogConfig();
  if (!config) return null;

  if (_posthogNode) return _posthogNode;

  try {
    _posthogNode = new PostHog(config.key, {
      host: config.host,
      flushAt: 1,
      flushInterval: 0,
      disableGeoip: false,
    });
    return _posthogNode;
  } catch (error) {
    console.error("PostHog Node: Failed to create client:", error);
    return null;
  }
};
