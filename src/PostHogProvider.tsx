"use client";

import { useEffect, ReactNode } from "react";
import posthog, { captureException } from "./index";

interface Props {
  children: ReactNode;
  app_name: string;
}

export function PostHogProvider({ children, app_name }: Props) {
  useEffect(() => {
    posthog.initPosthog(app_name);

    // Track JS runtime errors
    window.onerror = (message, source, lineno, colno, error) => {
      captureException(error || new Error(String(message)), {
        source,
        lineno,
        colno,
      });
    };

    // Track unhandled promise rejections
    window.onunhandledrejection = (event) => {
      captureException(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        {
          type: "unhandled_promise_rejection",
        }
      );
    };

    // Optional: Cleanup on unmount
    return () => {
      window.onerror = null;
      window.onunhandledrejection = null;
    };
  }, []);

  return <>{children}</>;
}
