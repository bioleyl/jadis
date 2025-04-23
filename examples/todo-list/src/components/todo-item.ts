import { html, css, Jadis } from '@jadis/core';

const template = html`
  <div class="todo-item">
    <input type="checkbox" class="todo-checkbox" />
    <span class="todo-text"></span>
    <button class="delete-button">Delete</button>
  </div>
`;

const style = css`
  .todo-item {
    display: flex;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #ccc;
  }
  .todo-checkbox {
    margin-right: 8px;
  }
  .todo-text {
    flex: 1;
  }
  .delete-button {
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    height: 24px;
  }
`;

export class TodoItem extends Jadis {
  static readonly selector = 'todo-item';
  static readonly template = template;
  static readonly style = style;

  events = this.useEvents<{
    delete: undefined;
    checked: boolean;
  }>();

  onConnect(): void {
    this.on(this.deleteButton, 'click', () => {
      this.events.emit('delete');
    });

    this.on(this.inputElement, 'change', () => {
      const isChecked = this.inputElement.checked;
      this.events.emit('checked', isChecked);
    });
  }

  set text(text: string) {
    this.todoText.textContent = text;
  }

  private get deleteButton(): HTMLButtonElement {
    return this.getElement('.delete-button');
  }

  private get todoText(): HTMLElement {
    return this.getElement('.todo-text');
  }

  private get inputElement(): HTMLInputElement {
    return this.getElement('.todo-checkbox');
  }
}
