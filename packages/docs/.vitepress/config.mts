import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/jadis/',
  description: 'Jadis — A minimal JavaScript toolkit for building web interfaces with native Web Components.',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local',
    },
    nav: [
      {
        link: '/',
        text: 'Docs',
      },
      {
        link: '/guides/examples',
        text: 'Examples',
      },
      {
        link: 'https://github.com/bioleyl/jadis',
        text: 'GitHub',
      },
    ],

    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            {
              link: '/guides/installation',
              text: 'Installation',
            },
            {
              link: '/guides/first-component',
              text: 'Your First Component',
            },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            {
              link: '/guides/lifecycle',
              text: 'Lifecycle',
            },
            {
              link: '/guides/templates',
              text: 'Templates',
            },
            {
              link: '/guides/shadow-dom',
              text: 'Shadow DOM',
            },
          ],
        },
        {
          text: 'Templating',
          items: [
            {
              link: '/templating/css',
              text: 'Styles',
            },
            {
              link: '/templating/classes',
              text: 'Toggle Classes',
            },
            {
              link: '/templating/attributes',
              text: 'Attributes',
            },
            {
              link: '/templating/slots',
              text: 'Slots',
            },
            {
              link: '/templating/to-template',
              text: 'toTemplate()',
            },
          ],
        },
        {
          text: 'DOM Helpers',
          items: [
            {
              link: '/dom/get-element',
              text: 'getElement()',
            },
            {
              link: '/dom/use-refs',
              text: 'useRefs()',
            },
          ],
        },
        {
          text: 'State & Events',
          items: [
            {
              link: '/state/use-change',
              text: 'useChange()',
            },
            {
              link: '/state/event-handling',
              text: 'Event Handling',
            },
            {
              link: '/state/use-events',
              text: 'useEvents()',
            },
          ],
        },
        {
          text: 'Communication',
          items: [
            {
              link: '/communication/parent-to-child',
              text: 'Parent to Child',
            },
            {
              link: '/communication/child-to-parent',
              text: 'Child to Parent',
            },
            {
              link: '/communication/cross-components',
              text: 'Cross-Component',
            },
          ],
        },
        {
          text: 'Routing',
          items: [
            {
              link: '/routing/overview',
              text: 'Overview',
            },
            {
              link: '/routing/routes',
              text: 'Declaring Routes',
            },
            {
              link: '/routing/route-groups',
              text: 'Route Groups',
            },
          ],
        },
        {
          text: 'API Reference',
          items: [
            {
              link: '/api/jadis-class',
              text: 'Jadis Class',
            },
            {
              link: '/api/html-css-helpers',
              text: 'html() / css()',
            },
            {
              link: '/api/create-element',
              text: 'createElement()',
            },
            {
              link: '/api/bus-class',
              text: 'Bus Class',
            },
            {
              link: '/api/create-selector',
              text: 'createSelector()',
            },
            {
              link: '/api/router-class',
              text: 'Router Class',
            },
          ],
        },
        {
          text: 'Customization',
          items: [
            {
              link: '/guides/extending-jadis',
              text: 'Extending Jadis',
            },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/bioleyl/jadis' }],
  },
  title: 'Jadis',
});
