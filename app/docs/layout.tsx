import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/app/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{ title: 'Facturas API' }}
      links={[
        { type: 'main', text: 'Documentación', url: '/docs' },
        { type: 'main', text: 'Referencia API', url: '/api-reference' },
        { type: 'main', text: 'Changelog', url: '/changelog' },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
