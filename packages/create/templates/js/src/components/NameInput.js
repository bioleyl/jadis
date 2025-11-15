import { createSelector, html, Jadis } from '@jadis/core';

export default class NameInput extends Jadis {
  static selector = createSelector('name-input');

  /** @type {import('@jadis/core').UseEventsHandler<{greet: string}>} */
  events = this.useEvents();
  placeholder = this.useChange('', (val) => {
    this.refs.input.setAttribute('placeholder', val);
  });
  label = this.useChange('', (val) => {
    this.refs.label.textContent = val;
  });

  refs = this.useRefs((ref) => ({
    greetButton: ref('button'),
    input: ref('input'),
    label: ref('span'),
  }));

  templateHtml() {
    return html`
      <label>
        <span></span>:<input type="text"/>
      </label>
      <button>Greet</button>
    `;
  }

  onConnect() {
    this.on(this.refs.greetButton, 'click', () => {
      const name = this.refs.input.value;
      this.events.emit('greet', name);
    });
  }
}

NameInput.register();
