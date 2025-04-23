import { html, css, Jadis } from '@jadis/core';

const template = html`
  <div class="todo-add">
    <input
      type="text"
      class="todo-input"
      placeholder="Add a new todo..."
      autofocus
    />
    <button class="add-button">Add</button>
  </div>
`;

const style = css`
  .todo-add {
    display: flex;
  }
  .todo-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-right: 8px;
  }
  .add-button {
    padding: 8px 16px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
`;

export class TodoAdd extends Jadis {
  static readonly selector = 'todo-add';
  static readonly template = template;
  static readonly style = style;

  public events = this.useEvents<{
    add: string;
  }>();

  onConnect(): void {
    this.on(this.addButton, 'click', () => this.onAddEvent());
    this.on(this.inputElement, 'keydown', (event) => {
      if (event.key === 'Enter') {
        this.onAddEvent();
      }
    });
  }

  private onAddEvent(): void {
    const value = this.inputElement.value.trim();
    if (value) {
      this.events.emit('add', value);
      this.inputElement.value = '';
    }
  }

  private get addButton(): HTMLButtonElement {
    return this.getElement('.add-button');
  }

  private get inputElement(): HTMLInputElement {
    return this.getElement('.todo-input');
  }
}
