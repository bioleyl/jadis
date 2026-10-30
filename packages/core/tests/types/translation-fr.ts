import { defineTranslations } from '@jadis/core';

import en from './translation-en';

export default defineTranslations(en, {
  cart: {
    // French has its own plural forms.
    items: { many: '{count} d’articles', one: '{count} article', other: '{count} articles' },
    // Placeholders in another order.
    summary: '{name} : {count} articles',
    total: 'Total : {amount}',
  },
  home: {
    greeting: 'Bonjour {name} !',
    title: 'Bienvenue',
  },
  test: 'test {num} nombre',
});
