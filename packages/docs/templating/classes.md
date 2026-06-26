# Toggle Classes

The `toggleClass()` method conditionally adds or removes a CSS class on the component element itself. Combined with the `:host()` pseudo-class selector, this enables dynamic styling based on component state.

## Signature

```typescript
this.toggleClass(className: string, condition: boolean): void;
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `className` | `string` | The CSS class to add or remove |
| `condition` | `boolean` | If `true`, the class is added. If `false`, it is removed. |

### Return Value

`void`

## Basic Example

```typescript
import { Jadis, css, html, createSelector } from '@jadis/core';

class StatusBadge extends Jadis {
  static selector = createSelector('status-badge');

  private isError = false;

  templateCss(): string {
    return css`
      :host {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
      }
      :host(.error) {
        background: #fee2e2;
        color: #dc2626;
      }
      :host(.success) {
        background: #dcfce7;
        color: #16a34a;
      }
    `;
  }

  templateHtml(): DocumentFragment {
    return html`<span>Active</span>`;
  }

  onConnect(): void {
    this.on(this.getElement('span'), 'click', () => {
      this.isError = !this.isError;
      this.toggleClass('error', this.isError);
      this.toggleClass('success', !this.isError);
    });
  }
}
```

## Usage Pattern

The typical pattern is:

1. Maintain a boolean state property (e.g., `private isError = false`).
2. Update the state in an event handler.
3. Call `toggleClass()` with the class name and the condition.
4. Style the component using `:host(.className)` in `templateCss()`.

## See Also

- [Styles](./css.md) — Adding CSS to components.
- [useChange()](../state/use-change.md) — Managing boolean state reactively.
