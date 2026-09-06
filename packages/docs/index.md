---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Jadis'
  text: 'Web Components, Simplified'
  tagline: A minimal JavaScript toolkit for building native Web Components — no virtual DOM, no reactivity system, no framework runtime. Use JSX or direct DOM helpers.
  image:
    src: /logo.svg
    alt: Jadis
  actions:
    - theme: brand
      text: Get Started
      link: /guides/installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/bioleyl/jadis

features:
  - icon: 🧩
    title: Native Web Components
    details: Build with the platform, not against it. Jadis works directly with Custom Elements and Shadow DOM — no abstraction leaks.
    link: /guides/first-component
  - icon: ⚡
    title: Zero Dependencies
    details: No runtime dependencies or virtual DOM. Use JSX with your existing build tool, or use createElement() directly in the browser.
    link: /guides/installation
  - icon: 📝
    title: Simple Templating
    details: Build real DOM with JSX, or use createElement() when you do not need a JSX transform.
    link: /guides/templates
  - icon: 🔌
    title: Type-Safe APIs
    details: Full TypeScript support with automatic type inference. JSDoc-friendly for JavaScript projects too.
    link: /api/jadis-class
  - icon: 🗺️
    title: Built-in Router
    details: A lightweight router with route groups, dynamic parameters, and root component injection. No external dependency needed.
    link: /routing/overview
  - icon: 🔄
    title: Event-Driven Communication
    details: Communicate between components using a type-safe event bus, custom events, or direct property access.
    link: /communication/cross-components
---
