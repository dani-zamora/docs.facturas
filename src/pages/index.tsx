import React, { useEffect } from 'react';
import Head from '@docusaurus/Head';

const TAILWIND_THEME = {
  darkMode: "class",
  // Limita Tailwind a la landing: sin reset global y utilidades con scope.
  important: ".landing-root",
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        "surface-container-highest": "#e3e3de",
        "on-tertiary-container": "#b8b7b7",
        "surface-variant": "#e3e3de",
        "primary-fixed": "#c5ebd8",
        "on-background": "#1b1c19",
        "primary-container": "#2d4f41",
        "secondary-container": "#e2dfde",
        "on-surface": "#1b1c19",
        "tertiary-fixed": "#e4e2e2",
        "error": "#ba1a1a",
        "on-primary-fixed-variant": "#2b4d3f",
        "secondary-fixed": "#e5e2e1",
        "on-primary": "#ffffff",
        "inverse-primary": "#a9cfbc",
        "secondary-fixed-dim": "#c8c6c5",
        "on-primary-fixed": "#002116",
        "on-primary-container": "#9bc0ae",
        "surface-container-low": "#f5f4ef",
        "outline-variant": "#c1c8c3",
        "on-tertiary": "#ffffff",
        "tertiary": "#313232",
        "surface-container-lowest": "#ffffff",
        "surface-container": "#efeee9",
        "tertiary-container": "#484848",
        "inverse-surface": "#30312e",
        "on-secondary-fixed": "#1c1b1b",
        "secondary": "#5f5e5e",
        "on-secondary-container": "#636262",
        "primary": "#15382b",
        "on-tertiary-fixed": "#1b1c1c",
        "outline": "#717974",
        "on-surface-variant": "#414844",
        "on-error": "#ffffff",
        "on-tertiary-fixed-variant": "#464747",
        "surface-tint": "#436556",
        "surface-container-high": "#e9e8e3",
        "on-error-container": "#93000a",
        "inverse-on-surface": "#f2f1ec",
        "on-secondary-fixed-variant": "#474746",
        "tertiary-fixed-dim": "#c7c6c6",
        "error-container": "#ffdad6",
        "on-secondary": "#ffffff",
        "surface-dim": "#dbdad5",
        "background": "#faf9f4",
        "surface": "#faf9f4",
        "surface-bright": "#faf9f4",
        "primary-fixed-dim": "#a9cfbc"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "gutter": "24px",
        "margin-mobile": "20px",
        "container-max": "1280px",
        "margin-desktop": "64px",
        "unit": "8px"
      },
      fontFamily: {
        "display-lg": ["EB Garamond"],
        "label-sm": ["Hanken Grotesk"],
        "label-md": ["Hanken Grotesk"],
        "body-md": ["Hanken Grotesk"],
        "headline-sm": ["EB Garamond"],
        "headline-md": ["EB Garamond"],
        "display-lg-mobile": ["EB Garamond"],
        "body-lg": ["Hanken Grotesk"]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-sm": ["24px", { lineHeight: "32px", fontWeight: "500" }],
        "headline-md": ["32px", { lineHeight: "40px", fontWeight: "500" }],
        "display-lg-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }]
      }
    }
  }
};

const CUSTOM_STYLES = `
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}
/* Reset mínimo (preflight de Tailwind está desactivado para no afectar a las docs) */
.landing-root, .landing-root * {
  box-sizing: border-box;
}
.landing-root {
  background-color: #faf9f4;
  -webkit-font-smoothing: antialiased;
}
.landing-root .editorial-rule {
  height: 1px;
  background-color: #e5e4de;
}
.landing-root .glass-header {
  backdrop-filter: blur(8px);
  background-color: rgba(250, 249, 244, 0.8);
}
/* Reset Infima link styles inside landing */
.landing-root a {
  color: inherit;
  text-decoration: none;
}
.landing-root a:hover {
  color: inherit;
  text-decoration: none;
}
/* Navbar Docusaurus oculta en landing */
.navbar, .footer {
  display: none !important;
}
`;

export default function Home(): React.ReactNode {
  useEffect(() => {
    // Inyectar Tailwind CDN y config en orden correcto
    if (!document.getElementById('tailwind-cdn')) {
      const cdn = document.createElement('script');
      cdn.id = 'tailwind-cdn';
      cdn.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
      cdn.onload = () => {
        (window as any).tailwind.config = TAILWIND_THEME;
      };
      document.head.appendChild(cdn);
    } else if ((window as any).tailwind) {
      (window as any).tailwind.config = TAILWIND_THEME;
    }

    // Smooth scroll
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = (anchor as HTMLAnchorElement).getAttribute('href');
        if (href) document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      const header = document.querySelector<HTMLElement>('.landing-root header');
      if (header) {
        header.style.transition = 'transform 0.3s ease-in-out';
        header.style.transform =
          currentScroll > lastScroll && currentScroll > 100
            ? 'translateY(-100%)'
            : 'translateY(0)';
      }
      lastScroll = currentScroll;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Head>
        <title>Facturas API — Facturación electrónica para desarrolladores</title>
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <style>{CUSTOM_STYLES}</style>
      </Head>

      <div className="landing-root bg-background text-on-surface font-body-md">
        {/* Nav */}
        <header className="w-full h-20 border-b border-secondary-container glass-header sticky top-0 z-50">
          <nav className="flex justify-between items-center max-w-container-max mx-auto px-margin-desktop h-full">
            <div className="font-headline-sm text-headline-sm font-medium text-primary">Facturas API</div>
            <div className="hidden md:flex gap-10 items-center">
              <a className="font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200" href="/primeros-pasos">
                Documentación
              </a>
              <a className="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200" href="/api-reference">
                Referencia API
              </a>
              <a className="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200" href="/changelog">
                Changelog
              </a>
              <a className="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200" href="https://app.facturas.app">
                Empresa
              </a>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://app.facturas.app"
                className="bg-primary-container text-on-primary-container px-6 py-2.5 font-label-md text-label-md hover:opacity-90 active:opacity-80 transition-all"
              >
                Acceder
              </a>
            </div>
          </nav>
        </header>

        <main className="max-w-container-max mx-auto px-margin-desktop">
          {/* Hero */}
          <section className="py-24 grid grid-cols-12 gap-gutter items-center">
            <div className="col-span-12 lg:col-span-7 pr-12">
              <span className="font-label-md text-label-md text-primary tracking-widest uppercase mb-6 block">
                API REST · VeriFactu · TicketBAI · Peppol
              </span>
              <h1 className="font-display-lg text-display-lg md:text-display-lg lg:text-[64px] lg:leading-[72px] text-on-background mb-8 italic">
                Facturación electrónica conforme, integrada en minutos.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-10">
                Una API diseñada para desarrolladores que necesitan emitir, validar y enviar facturas
                cumpliendo con VeriFactu, TicketBAI y Peppol BIS 3.0, sin gestionar XML ni certificados.
              </p>
              <div className="flex gap-4">
                <a href="/primeros-pasos" className="bg-primary-container text-on-primary-container px-8 py-4 font-label-md text-label-md hover:shadow-lg transition-all">
                  Empezar gratis
                </a>
                <a href="/api-reference" className="border border-outline px-8 py-4 font-label-md text-label-md text-on-surface hover:bg-surface-container transition-all">
                  Ver referencia API
                </a>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-5 mt-12 lg:mt-0">
              <div className="relative overflow-hidden border border-secondary-container bg-surface-container p-8">
                <pre className="font-mono text-sm text-on-surface-variant overflow-x-auto leading-relaxed">{`POST /api/v1/invoices
Authorization: Bearer {api_key}

{
  "issuer": { "nif": "B12345678" },
  "recipient": { "nif": "A87654321" },
  "lines": [{
    "description": "Servicio de consultoría",
    "quantity": 1,
    "unit_price": 1000.00,
    "tax_rate": 21
  }]
}`}</pre>
                <div className="mt-6 pt-6 border-t border-secondary-container flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary-container inline-block" />
                  <span className="font-label-sm text-label-sm text-secondary">Responde en &lt;200ms · Disponible 99.9%</span>
                </div>
              </div>
            </div>
          </section>

          <div className="editorial-rule my-12" />

          {/* Endpoints table */}
          <section className="py-16">
            <div className="flex justify-between items-end mb-12">
              <div className="max-w-md">
                <h2 className="font-headline-md text-headline-md text-on-background mb-2">Endpoints principales</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Cobertura completa del ciclo de vida de una factura: emisión, validación, envío y consulta.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="font-label-sm text-label-sm text-secondary px-3 py-1 bg-surface-container rounded-sm border border-secondary-container">
                  v1 · Estable
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-on-background">
                    <th className="py-4 font-label-md text-label-md text-on-background uppercase tracking-wider">Método</th>
                    <th className="py-4 font-label-md text-label-md text-on-background uppercase tracking-wider">Endpoint</th>
                    <th className="py-4 font-label-md text-label-md text-on-background uppercase tracking-wider">Descripción</th>
                    <th className="py-4 font-label-md text-label-md text-on-background uppercase tracking-wider text-right">Estándar</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {[
                    { method: 'POST', path: '/invoices', desc: 'Emitir factura y enviar a AEAT', std: 'VeriFactu' },
                    { method: 'GET', path: '/invoices/{id}', desc: 'Consultar estado y PDF', std: 'REST' },
                    { method: 'POST', path: '/invoices/validate', desc: 'Validar antes de emitir', std: 'EN16931' },
                    { method: 'POST', path: '/invoices/{id}/peppol', desc: 'Enviar por red Peppol', std: 'BIS 3.0' },
                  ].map(({ method, path, desc, std }) => (
                    <tr key={path} className="border-b border-secondary-container hover:bg-surface-container-low transition-colors">
                      <td className="py-6 font-medium">
                        <span className="font-mono text-sm px-2 py-0.5 bg-primary-container text-on-primary-container">{method}</span>
                      </td>
                      <td className="py-6 font-mono text-sm text-secondary">{path}</td>
                      <td className="py-6">{desc}</td>
                      <td className="py-6 text-right">
                        <span className="px-2 py-0.5 border border-outline text-label-sm">{std}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Features section */}
          <section className="py-24">
            <div className="grid grid-cols-12 gap-gutter">
              <div className="col-span-12 lg:col-span-4 flex flex-col justify-between">
                <div>
                  <span className="font-label-md text-label-md text-primary border-l-4 border-primary pl-4 mb-8 block">
                    Integraciones disponibles
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-background mb-6">
                    Conecta con tu stack en una tarde.
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                    SDKs oficiales para los lenguajes más comunes. Webhooks para eventos clave.
                    Panel de administración incluido para tu equipo de operaciones.
                  </p>
                </div>
                <a className="group flex items-center gap-2 font-label-md text-label-md text-primary" href="/primeros-pasos">
                  Ver guías de integración
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
              </div>
              <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <article className="p-8 border border-secondary-container hover:border-primary transition-all group">
                  <span className="font-label-sm text-label-sm text-secondary mb-4 block">CUMPLIMIENTO FISCAL</span>
                  <h4 className="font-headline-sm text-headline-sm mb-4">VeriFactu y TicketBAI out-of-the-box</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Generación automática de huellas, registros de alta y anulación. Compatible con todas
                    las provincias de régimen foral.
                  </p>
                  <div className="editorial-rule mb-6" />
                  <div className="flex items-center gap-3">
                    <span className="font-label-md text-label-md">AEAT · Bizkaia · Gipuzkoa · Álava</span>
                  </div>
                </article>
                <article className="p-8 border border-secondary-container hover:border-primary transition-all group">
                  <span className="font-label-sm text-label-sm text-secondary mb-4 block">FORMATO ESTÁNDAR</span>
                  <h4 className="font-headline-sm text-headline-sm mb-4">Peppol BIS 3.0 y UBL 2.1 nativos</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Emisión directa a la red Peppol. Validación contra EN 16931 y los esquemas
                    XSD oficiales antes de cada envío.
                  </p>
                  <div className="editorial-rule mb-6" />
                  <div className="flex items-center gap-3">
                    <span className="font-label-md text-label-md">Peppol · EN16931 · UBL · CII</span>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24 mb-12">
            <div className="bg-surface-container-low p-12 lg:p-20 border border-secondary-container flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="max-w-xl text-center lg:text-left">
                <h2 className="font-headline-md text-headline-md text-on-background mb-4">
                  Empieza a integrar hoy.
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Crea tu cuenta, obtén tu API key y emite tu primera factura en menos de 15 minutos.
                  Sin tarjeta de crédito.
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <a
                  href="https://app.facturas.app/register"
                  className="bg-primary-container text-on-primary-container px-10 py-4 font-label-md text-label-md hover:opacity-90 transition-all text-center"
                >
                  Crear cuenta gratis
                </a>
                <a
                  href="/api-reference"
                  className="border border-outline px-10 py-4 font-label-md text-label-md text-on-surface hover:bg-surface-container transition-all text-center"
                >
                  Explorar la API
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-surface-container-highest w-full py-12 border-t border-secondary-container">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto px-margin-desktop">
            <div className="mb-8 md:mb-0">
              <div className="font-headline-sm text-headline-sm text-primary mb-2">Facturas API</div>
              <div className="font-label-sm text-label-sm text-secondary">
                © {new Date().getFullYear()} VeriFactu. Todos los derechos reservados.
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="/primeros-pasos">
                Documentación
              </a>
              <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="/api-reference">
                Referencia API
              </a>
              <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="/changelog">
                Changelog
              </a>
              <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="https://app.facturas.app/legal/privacy">
                Privacidad
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
