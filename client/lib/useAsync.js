"use client";
import { useCallback, useEffect, useState } from "react";

// Tiny data-loading hook: { data, loading, error, reload }
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await fn()); } catch (e) { setError(e); } finally { setLoading(false); }
  }, deps);
  useEffect(() => { run(); }, [run]);
  return { data, loading, error, reload: run };
}
