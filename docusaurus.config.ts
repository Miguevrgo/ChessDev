import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'ChessDev',
  tagline: 'Wiki de programación de ajedrez para el engine Oxide',
  favicon: 'img/favicon.ico',

  // Configuración para GitHub Pages
  url: 'https://miguevrgo.github.io',
  baseUrl: '/ChessDev/',
  organizationName: 'Miguevrgo',
  projectName: 'ChessDev',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Miguevrgo/ChessDev/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/Miguevrgo/ChessDev/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/pawn.png',
    navbar: {
      title: 'ChessDev',
      logo: {
        alt: 'ChessDev Logo',
        src: 'img/pawn.png', // Cambia por tu logo si tienes uno
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Wiki',
        },
      ],
    },
    footer: {
      style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} ChessDev. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['cpp', 'rust', 'python', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
