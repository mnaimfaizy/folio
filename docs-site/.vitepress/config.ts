import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid({
  title: 'Folio Docs',
  description:
    'Documentation for Folio — self-hosted personal book collection manager',

  base: '/folio-docs/',

  head: [['link', { rel: 'icon', href: '/folio-docs/favicon.ico' }]],

  // Ignore localhost:* links and placeholder GitHub links — they aren't resolvable at build time
  ignoreDeadLinks: [
    /^http:\/\/localhost/,
    /yourusername\.github\.io/,
    /github\.com\/yourusername/,
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Folio',

    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'User Guide',
        link: '/user/',
        activeMatch: '/user/',
      },
      {
        text: 'Developer Guide',
        link: '/dev/',
        activeMatch: '/dev/',
      },
    ],

    sidebar: {
      '/user/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'What is Folio?', link: '/user/' },
            { text: 'Prerequisites', link: '/user/getting-started' },
            { text: 'Your First Login', link: '/user/first-use' },
          ],
        },
        {
          text: 'Choose Your Use Case',
          items: [
            { text: 'Usage Profiles', link: '/user/profiles' },
            {
              text: 'Personal Library',
              link: '/user/profiles#single-user-personal-library',
            },
            {
              text: 'Team / Library',
              link: '/user/profiles#library-team-mode',
            },
            { text: 'Public Showcase', link: '/user/profiles#public-showcase' },
          ],
        },
        {
          text: 'Using Folio',
          items: [
            { text: 'Managing Books', link: '/user/books' },
            { text: 'Managing Authors', link: '/user/authors' },
            { text: 'Loans & Requests', link: '/user/loans' },
            { text: 'Admin Settings', link: '/user/admin-settings' },
          ],
        },
        {
          text: 'Help',
          items: [{ text: 'Troubleshooting', link: '/user/troubleshooting' }],
        },
      ],

      '/dev/': [
        {
          text: 'Overview',
          items: [
            { text: 'Introduction', link: '/dev/' },
            { text: 'Architecture', link: '/dev/architecture' },
            { text: 'Project Structure', link: '/dev/project-structure' },
          ],
        },
        {
          text: 'Development',
          items: [
            { text: 'Local Setup', link: '/dev/local-setup' },
            { text: 'API Guide', link: '/dev/api-guide' },
            { text: 'Adding Features', link: '/dev/adding-features' },
            { text: 'Shared Library', link: '/dev/shared-lib' },
          ],
        },
        {
          text: 'Data & Infra',
          items: [
            { text: 'Database', link: '/dev/database' },
            { text: 'Deployment', link: '/dev/deployment' },
            { text: 'Environment Config', link: '/dev/env-config' },
          ],
        },
        {
          text: 'Quality & Process',
          items: [
            { text: 'Testing', link: '/dev/testing' },
            { text: 'Contributing', link: '/dev/contributing' },
            { text: 'Docs Contribution', link: '/dev/docs-contributing' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/mnaimfaizy/folio' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Folio Contributors',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/mnaimfaizy/folio/edit/main/docs-site/:path',
      text: 'Edit this page on GitHub',
    },

    lastUpdated: {
      text: 'Last updated',
    },
  },

  mermaid: {
    theme: 'default',
  },

  mermaidPlugin: {
    class: 'mermaid',
  },
});
