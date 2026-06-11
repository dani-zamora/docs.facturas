import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog — Facturas API',
  description: 'Novedades y cambios de la API',
};

export default function ChangelogPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1>Changelog</h1>
      <p style={{ color: 'var(--ui-text-muted)' }}>
        Novedades y cambios de la API de Facturas.
      </p>
      <hr style={{ borderColor: 'var(--ui-border)', margin: '2rem 0' }} />
      <p style={{ color: 'var(--ui-text-muted)' }}>
        Las notas de versión estarán disponibles próximamente.
      </p>
    </main>
  );
}
