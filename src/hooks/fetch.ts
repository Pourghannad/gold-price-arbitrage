import { useCallback, useEffect, useRef, useState } from "react";

interface UseFetchOptions {
  retry?: number;
  url?: string;
  retryDelay?: number;
}

export function useFetch({
  retry = 2,
  url = "",
  retryDelay = 1_000,
}: UseFetchOptions = {}): any {
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const [{ data, loading, error }, setState] = useState<{
    data: any | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: true, error: null });

  const doFetch = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((s) => ({ ...s, loading: true, error: null }));

    let attempt = 0;
    while (true) {
      try {
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) throw new Error(`HTTP${res.status}`);

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

  
  useEffect(() => {
    mountedRef.current = true;
    doFetch();
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, [doFetch]);

  return {
    data,
    loading,
    error,
    refetch: doFetch,
  };
}
