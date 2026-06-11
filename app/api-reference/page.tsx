'use client';

import { useEffect, useRef } from 'react';

const customCss = `
  :root {
    --scalar-color-1: #1b1c19;
    --scalar-color-2: #5f5e5e;
    --scalar-color-accent: #2d4f41;
    --scalar-background-1: #faf9f4;
    --scalar-background-2: #ffffff;
    --scalar-background-3: #efeee9;
    --scalar-border-color: #c1c8c3;
    --scalar-font: "Hanken Grotesk", "Segoe UI", Arial, sans-serif;
    --scalar-font-code: "JetBrains Mono", monospace;
    --scalar-radius: 0px;
    --scalar-radius-lg: 0px;
  }
`;

export default function ApiReferencePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let instance: { unmount?: () => void; destroy?: () => void } | undefined;
    let cancelled = false;

    import('@scalar/api-reference').then(({ createApiReference }) => {
      if (cancelled || !el) return;
      instance = createApiReference(el, {
        url: '/openapi.json',
        hideModels: true,
        defaultHttpClient: { targetKey: 'shell', clientKey: 'curl' },
        customCss,
      });
    });

    return () => {
      cancelled = true;
      instance?.unmount?.();
      instance?.destroy?.();
      if (el) el.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} style={{ minHeight: '100vh' }} />;
}
