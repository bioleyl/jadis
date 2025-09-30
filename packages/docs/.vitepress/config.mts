import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/jadis/',
  description: 'Jadis official documentation',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        link: '/',
        text: 'Home',
      },
      {
        link: '/pages/examples/index',
        text: 'Examples',
      },
    ],

    sidebar: [
      {
        items: [
          {
            link: '/pages/getting-started/installation',
            text: 'Installation',
          },
          {
            link: '/pages/getting-started/first-component',
            text: 'First component',
          },
        ],
        text: 'Getting Started',
      },
      {
        items: [
          {
            link: '/pages/communication/parent-to-child',
            text: 'Parent to child',
          },
          {
            link: '/pages/communication/child-to-parent',
            text: 'Child to parent',
          },
          {
            link: '/pages/communication/between-anybody',
            text: 'Between anybody',
          },
        ],
        text: 'Communication',
      },
      {
        items: [
          {
            link: '/pages/routing/configuration',
            text: 'Configuration',
          },
          {
            link: '/pages/routing/declaring-routes',
            text: 'Declaring routes',
          },
          {
            link: '/pages/routing/using-route-groups',
            text: 'Using route groups',
          },
          {
            link: '/pages/routing/navigating',
            text: 'Navigating',
          },
        ],
        text: 'Routing',
      },
      {
        items: [
          {
            link: '/pages/helpers/create-element',
            text: 'createElement',
          },
          {
            link: '/pages/helpers/kill-signal',
            text: 'killSignal',
          },
          {
            link: '/pages/helpers/get-element',
            text: 'getElement',
          },
        ],
        text: 'Helpers',
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/bioleyl/jadis' }],
  },
  title: 'Jadis',
});
