import type { PostHog, Properties } from 'posthog-js';
type PosthogClient = PostHog;

let cachedClient: PosthogClient | null = null;
let initialized = false;

// Add back the window typing for runtime-injected env vars
type RuntimeEnv = {
  NEXT_PUBLIC_POSTHOG_KEY?: string;
  NEXT_PUBLIC_POSTHOG_HOST?: string;
  [k: string]: string | undefined;
};

type WindowWithEnv = Window & typeof globalThis & { __ENV?: RuntimeEnv };

async function getClient(): Promise<PosthogClient | null> {
  if (typeof window === 'undefined') return null;
  if (cachedClient) return cachedClient;
  const { default: client } = await import('posthog-js');
  cachedClient = client as unknown as PosthogClient;
  return cachedClient;
}

export async function initPosthog(name = 'default'): Promise<void> {
  if (initialized) return;
  const client = await getClient();
  if (!client) return;

  const w: WindowWithEnv | undefined =
    typeof window !== 'undefined' ? (window as unknown as WindowWithEnv) : undefined;

  // Use static access so Next can inline in dev; fallback to runtime window.__ENV in prod
  const key: string | null =
    (process.env.NEXT_PUBLIC_POSTHOG_KEY as string | undefined) ??
    w?.__ENV?.NEXT_PUBLIC_POSTHOG_KEY ??
    null;
  const host: string | null =
    (process.env.NEXT_PUBLIC_POSTHOG_HOST as string | undefined) ??
    w?.__ENV?.NEXT_PUBLIC_POSTHOG_HOST ??
    null;

  if (!key || !host) return;

  client.init(key, {
    api_host: host,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    before_send: (event) => {
      return event;
    },
  });
  client.register({
    app_name: name,
  });
  initialized = true;
}

export async function capture(event: string, properties?: Properties): Promise<void> {
  const client = await getClient();
  if (!client) return;
  if (!initialized) await initPosthog();
  client.capture(event, properties);
}

export async function identify(distinctId: string, properties?: Properties): Promise<void> {
  const client = await getClient();
  if (!client) return;
  if (!initialized) await initPosthog();
  client.identify(distinctId, properties);
}

export async function reset(): Promise<void> {
  const client = await getClient();
  if (!client) return;
  client.reset();
  initialized = false;
}

export async function captureException(error: Error, properties?: Properties): Promise<void> {
  const client = await getClient();
  if (!client) return;
  console.log('captureException', error, properties);
  client.captureException(error, properties);
}

export async function getDistinctId(): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;
  return client.get_distinct_id();
}

const posthog = {
  initPosthog,
  capture,
  identify,
  reset,
  captureException,
  getDistinctId,
};
export default posthog;
