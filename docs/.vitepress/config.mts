import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Jadis',
  description: 'Jadis official documentation',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/pages/examples/index' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        link: '/pages/getting-started',
      },
      {
        text: 'Communication',
        items: [
          { text: 'With children', link: '/pages/communication/with-children' },
          { text: 'With parent', link: '/pages/communication/with-parent' },
          { text: 'From anywhere', link: '/pages/communication/from-anywhere' },
        ],
      },
      {
        text: 'Routing',
        items: [
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
