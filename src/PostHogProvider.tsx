import { useEffect, ReactNode } from "react";
import posthog, { captureException } from "./index";

interface Props {
  children: ReactNode;
  app_name: string;
}

export function PostHogProvider({ children, app_name }: Props) {
  useEffect(() => {
    // Initialize PostHog
    posthog.initPosthog(app_name).catch((error) => {
      console.error("PostHog: Failed to initialize in provider:", error);
    });

    // Track JS runtime errors
    const handleError = (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ) => {
      const errorObj =
        error ||
        new Error(typeof message === "string" ? message : "Unknown error");
      captureException(errorObj, {
        source,
        lineno,
        colno,
        context: "runtime_error",
      }).catch(console.error);
    };

    // Track unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      captureException(error, {
        type: "unhandled_promise_rejection",
        context: "promise_rejection",
      }).catch(console.error);
    };

    // Add event listeners
    window.addEventListener("error", handleError as any);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("error", handleError as any);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [app_name]);

  return <>{children}</>;
}
