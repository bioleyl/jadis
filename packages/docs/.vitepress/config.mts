import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/jadis/',
  description: 'Jadis official documentation',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local',
    },
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
            link: '/pages/templating/create-template',
            text: 'Basics of templating',
          },
          {
            link: '/pages/templating/add-style',
            text: 'Add css style to components',
          },
          {
            link: '/pages/templating/toggle-class',
            text: 'Toggle classes in components'
          },
          {
            link: '/pages/templating/use-attributes',
            text: 'Use attributes in your component'
          },
          {
            link: '/pages/templating/get-element',
            text: 'Get elements from template'
          },
          {
            link: '/pages/templating/use-slots',
            text: 'Use slots in your component'
          },
          {
            link: '/pages/templating/to-template',
            text: 'Add components to template'
          }, 
          {
            link: '/pages/templating/use-refs',
            text: 'Point to an element in the DOM'
          },
          {
            link: '/pages/templating/use-change',
            text: 'React to a property change'
          },
          {
            link: '/pages/templating/event-handling',
            text: 'Handle events with simplicity'
          }
        ],
        text: 'Templating',
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
            link: '/pages/communication/cross-components',
            text: 'Cross-Components ',
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
        ],
        text: 'Helpers',
      },
      {
        items: [
          {
            link: '/pages/customization/extending-jadis',
            text: 'Extending Jadis',
          }
        ],
        text: 'Customization',
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/bioleyl/jadis' }],
  },
  title: 'Jadis',
});
