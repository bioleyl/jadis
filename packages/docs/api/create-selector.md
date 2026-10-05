# createSelector()

Validates and creates a component selector string for use in `static selector`. Ensures the name is a valid custom element name: lowercase, starting with a letter, with at least one hyphen (`my-card`, `my-big-card`).

## Import

```typescript
import { createSelector, isComponentSelector } from '@jadis/core';
```

## createSelector()

### Signature

```typescript
createSelector(name: string): ComponentSelector;
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `name` | `string` | The desired custom element name |

### Returns

The validated selector string.

### Throws

Throws if the name is not a valid custom element name: no hyphen, an uppercase letter, a leading, trailing or doubled hyphen, or a name the HTML specification reserves (`font-face`, `annotation-xml`, …).

### Example

```typescript
import { Jadis, createSelector } from '@jadis/core';

class MyComponent extends Jadis {
  static selector = createSelector('my-component');
}
```

## isComponentSelector()

### Signature

```typescript
isComponentSelector(key: string): key is ComponentSelector;
```

Returns `true` for a valid custom element name: it starts with a lowercase letter, holds lowercase letters, digits, `.` and `_`, and joins its parts with single hyphens (`^[a-z][a-z0-9._]*(-[a-z0-9._]+)+$`). The names the HTML specification reserves for SVG and MathML are refused.

### Example

```typescript
isComponentSelector('my-component');      // true
isComponentSelector('my-big-component');  // true
isComponentSelector('invalid');           // false (no hyphen)
isComponentSelector('-bad');              // false (leading hyphen)
isComponentSelector('bad-');              // false (trailing hyphen)
isComponentSelector('My-Card');           // false (uppercase)
isComponentSelector('font-face');         // false (reserved)
```

## Best Practices

- Always use `createSelector()` for runtime validation.
- In TypeScript, you can also use a plain string literal if you are confident in the naming:

  ```typescript
  static readonly selector = 'my-component';
  ```

- Use kebab-case for all custom element names.

## See Also

- [Jadis Class](./jadis-class.md) — The `selector` property.
