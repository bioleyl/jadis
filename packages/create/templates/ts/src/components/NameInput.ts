import { html, Jadis } from '@jadis/core';

export default class NameInput extends Jadis {
  static readonly selector = 'name-input';

  readonly events = this.useEvents<{
    greet: string;
  }>();
  readonly placeholder = this.useChange('', (val) => {
    this._refs.input.setAttribute('placeholder', val);
  });
  readonly label = this.useChange('', (val) => {
    this._refs.name.textContent = val;
  });

  private readonly _refs = this.useRefs((ref) => ({
    greetButton: ref('button'),
    input: ref('input'),
    name: ref('span'),
  }));

  templateHtml(): DocumentFragment {
    return html`
      <label>
        <span></span>:<input type="text"/>
      </label>
      <button>Greet</button>
    `;
  }

  onConnect(): void {
    this.on(this._refs.greetButton, 'click', () => {
      const name = this._refs.input.value;
      this.events.emit('greet', name);
    });
  }
}

NameInput.register();
