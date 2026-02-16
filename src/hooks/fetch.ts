import { useCallback, useEffect, useRef, useState } from "react";

interface UseFetchOptions {
  /** Number of retry attempts on failure (default: 2) */
  retry?: number;
  /** The URL to fetch (required) */
  url?: string;
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number;
  /** Polling interval in ms – if provided, will automatically refetch at this interval */
  interval?: number;
}

export function useFetch({
  retry = 2,
  url = "",
  retryDelay = 1_000,
  interval,
}: UseFetchOptions = {}): any {
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const intervalRef = useRef<number | null>(null);

  const [{ data, loading, error }, setState] = useState<{
    data: any | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: true, error: null });

  const doFetch = useCallback(async () => {
    // Abort any ongoing request
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((s) => ({ ...s, loading: true, error: null }));

    let attempt = 0;
    while (true) {
      try {
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: { data: any } = await res.json();
        if (!mountedRef.current) return;

        setState({ data: json, loading: false, error: null });
        return;
      } catch (err) {
        if (controller.signal.aborted) return;
        if (attempt >= retry) {
          if (mountedRef.current) {
            setState({ data: null, loading: false, error: err as Error });
          }
          return;
        }
        attempt += 1;
        await new Promise((r) => setTimeout(r, retryDelay));
      }
    }
  }, [url, retry, retryDelay]);

  // Set up the initial fetch and polling interval
  useEffect(() => {
    mountedRef.current = true;

    // Clear any previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only fetch and possibly poll if a URL is provided
    if (url) {
      // Initial fetch
      doFetch();

      // Set up polling if interval is provided and > 0
      if (interval && interval > 0) {
        intervalRef.current = window.setInterval(() => {
          doFetch();
        }, interval);
      }
    }

    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [doFetch, url, interval]); // Re-run when url or interval changes

  return {
    data,
    loading,
    error,
    refetch: doFetch,
  };
}