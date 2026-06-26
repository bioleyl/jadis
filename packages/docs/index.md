---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Jadis'
  text: 'Web Components, Simplified'
  tagline: A minimal JavaScript toolkit for building native Web Components — no virtual DOM, no reactivity system, no compile step. Just clean, readable, native code.
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
    details: No build tools, no transpilation, no runtime overhead. Import and use. Works in any modern browser out of the box.
    link: /guides/installation
  - icon: 📝
    title: Simple Templating
    details: Write HTML templates using tagged template literals. No JSX, no DSL — just plain HTML with interpolation.
    link: /templating/css
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
