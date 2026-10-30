import { defineTranslations } from '@jadis/core';

export default defineTranslations({
  cart: {
    items: { one: '{count} item', other: '{count} items' },
    summary: '{count} items for {name}',
    total: 'Total: {amount}',
  },
  home: {
    greeting: 'Hello {name}!',
    title: 'Welcome',
  },
  test: 'test {num} nombre',
});
