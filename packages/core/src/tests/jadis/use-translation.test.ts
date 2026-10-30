import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Jadis } from '../../base-component';
import { defineTranslations } from '../../helpers/translation.helper';
import { Translator } from '../../translation/translator';

const en = defineTranslations({
  items: { one: '{count} item', other: '{count} items' },
  title: 'Welcome',
});

const fr = defineTranslations(en, {
  items: { one: '{count} article', other: '{count} articles' },
  title: 'Bienvenue',
});

const createTranslator = () => new Translator({ en }, { fr });

let i18n = createTranslator();

/** Draws its title and its count of items in the language shown; getElement throws until its template exists. */
class Cart extends Jadis {
  static readonly selector = 'x-translated-cart';

  readonly draws = vi.fn<(locale: string) => void>();
  readonly count = this.useChange(1, () => this.drawTexts());

  constructor() {
    super();
    this.useTranslation(i18n, () => this.drawTexts());
  }

  templateHtml() {
    const root = document.createElement('div');
    root.append(document.createElement('h1'), document.createElement('p'));
    return root;
  }

  get shownTitle(): string | null {
    return this.getElement('h1').textContent;
  }

  get shownItems(): string | null {
    return this.getElement('p').textContent;
  }

  private drawTexts(): void {
    this.draws(i18n.locale);
    this.getElement('h1').textContent = i18n.t('title');
    this.getElement('p').textContent = i18n.t('items', { count: this.count.get() });
  }
}

Cart.register();

/** Follows the language only once asked, to call useTranslation on a connected component. */
class LateCart extends Jadis {
  static readonly selector = 'x-late-cart';

  templateHtml() {
    return document.createElement('h1');
  }

  follow(): void {
    this.useTranslation(i18n, () => {
      this.getElement('h1').textContent = i18n.t('title');
    });
  }
}

LateCart.register();

describe('useTranslation', () => {
  beforeEach(() => {
    i18n = createTranslator();
    document.body.replaceChildren();
  });

  it('draws nothing before the component is connected', () => {
    const cart = new Cart();

    expect(cart.draws).not.toHaveBeenCalled();
  });

  it('draws the texts during the connection, before onConnect and the paint', () => {
    const cart = document.body.appendChild(new Cart());

    expect(cart.shownTitle).toBe('Welcome');
    expect(cart.shownItems).toBe('1 item');
    expect(cart.draws).toHaveBeenCalledOnce();
  });

  it('draws the texts again at each language change', async () => {
    const cart = document.body.appendChild(new Cart());

    await i18n.setLocale('fr');

    expect(cart.shownTitle).toBe('Bienvenue');
    expect(cart.shownItems).toBe('1 article');
    expect(cart.draws).toHaveBeenLastCalledWith('fr');
  });

  it('leaves a parameter change to the component', () => {
    const cart = document.body.appendChild(new Cart());

    cart.count.set(3);

    expect(cart.shownItems).toBe('3 items');
  });

  it('stops following the language once disconnected', async () => {
    const cart = document.body.appendChild(new Cart());
    cart.remove();

    await i18n.setLocale('fr');

    expect(cart.draws).toHaveBeenCalledOnce();
    expect(cart.shownTitle).toBe('Welcome');
  });

  it('draws the language changed while it was away when it comes back', async () => {
    const cart = document.body.appendChild(new Cart());
    cart.remove();
    await i18n.setLocale('fr');

    document.body.appendChild(cart);

    expect(cart.shownTitle).toBe('Bienvenue');
  });

  it('follows the language once, however often it reconnects', async () => {
    const cart = document.body.appendChild(new Cart());
    cart.remove();
    document.body.appendChild(cart);
    cart.draws.mockClear();

    await i18n.setLocale('fr');

    expect(cart.draws).toHaveBeenCalledOnce();
  });

  it('draws at once when the component is already connected', async () => {
    const cart = document.body.appendChild(new LateCart());

    cart.follow();
    expect(cart.shadowRoot?.querySelector('h1')?.textContent).toBe('Welcome');

    await i18n.setLocale('fr');
    expect(cart.shadowRoot?.querySelector('h1')?.textContent).toBe('Bienvenue');
  });
});
