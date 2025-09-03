import { PostHog } from 'posthog-node';

let _posthogNode: PostHog | null = null;

export const getPosthogNode = (): PostHog | null => {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || !host) return null;
  if (_posthogNode) return _posthogNode;
  _posthogNode = new PostHog(key, {
    host,
    flushAt: 1,
    flushInterval: 0,
    disableGeoip: false,
  });
  return _posthogNode;
};
