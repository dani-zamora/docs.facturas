import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type * as Redocusaurus from 'redocusaurus';

const config: Config = {
  title: 'Facturas API',
  tagline: 'Documentación para desarrolladores',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.facturas.app',
  baseUrl: '/',

  organizationName: 'verifactu',
  projectName: 'docs.facturas',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'redocusaurus',
      {
        specs: [
          {
            id: 'api',
            spec: 'static/openapi.json',
            route: '/api-reference',
          },
        ],
        theme: {
          primaryColor: '#1a73e8',
        },
      } satisfies Redocusaurus.PresetEntry,
    ],
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: {
          path: 'changelog',
          routeBasePath: 'changelog',
          blogTitle: 'Changelog',
          blogDescription: 'Novedades y cambios de la API',
          showReadingTime: false,
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Facturas API',
      logo: {
        alt: 'Facturas',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentación',
        },
        {to: '/api-reference', label: 'Referencia API', position: 'left'},
        {to: '/changelog', label: 'Changelog', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentación',
          items: [
            {label: 'Referencia API', to: '/api-reference'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Facturas. Construido con Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
