import { Bus, Jadis, Translator } from '@jadis/core';

import en from './translation-en';

import type { TranslationSource } from '@jadis/core';

const i18n = new Translator({ en }, { fr: () => import('./translation-fr') });

/** Anything whose bus emits `change` can be followed, not only a translator. */
const theme: TranslationSource<'light' | 'dark'> = { bus: new Bus<{ change: 'light' | 'dark' }>() };

class Cart extends Jadis {
  static readonly selector = 'x-cart';

  private readonly _refs = this.useRefs((ref) => ({ items: ref('p'), title: ref('h1') }));
  readonly count = this.useChange(0, () => this.drawTexts());

  constructor() {
    super();
    this.useTranslation(i18n, () => this.drawTexts());
    this.useTranslation(theme, () => undefined);

    // @ts-expect-error A translator, not its bus.
    this.useTranslation(i18n.bus, () => undefined);
    // @ts-expect-error Its bus must emit change.
    this.useTranslation({ bus: new Bus<{ other: string }>() }, () => undefined);
    // @ts-expect-error The texts are drawn from the translator: draw takes no argument.
    this.useTranslation(i18n, (locale: string) => locale);
  }

  private drawTexts(): void {
    this._refs.title.textContent = i18n.t('home.title');
    this._refs.items.textContent = i18n.t('cart.items', { count: this.count.get() });
  }
}

// @ts-expect-error useTranslation belongs to the component.
new Cart().useTranslation(i18n, () => undefined);
