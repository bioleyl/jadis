import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Jadis',
  description: 'Jadis official documentation',
  base: '/jadis/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/pages/examples/index' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/pages/getting-started/installation' },
          {
            text: 'First component',
            link: '/pages/getting-started/first-component',
          },
        ],
      },
      {
        text: 'Communication',
        items: [
          {
            text: 'Parent to child',
            link: '/pages/communication/parent-to-child',
          },
          {
            text: 'Child to parent',
            link: '/pages/communication/child-to-parent',
          },
          {
            text: 'Between anybody',
            link: '/pages/communication/between-anybody',
          },
        ],
      },
      {
        text: 'Routing',
        items: [
          { text: 'Configuration', link: '/pages/routing/configuration' },
          { text: 'Declaring routes', link: '/pages/routing/declaring-routes' },
          { text: 'Navigating', link: '/pages/routing/navigating' },
        ],
      },
      {
        text: 'Helpers',
        items: [
          { text: 'createElement', link: '/pages/helpers/create-element' },
          { text: 'killSignal', link: '/pages/helpers/kill-signal' },
          { text: 'getElement', link: '/pages/helpers/get-element' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/bioleyl/jadis' }],
  },
});
