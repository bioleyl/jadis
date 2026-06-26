# createSelector()

Validates and creates a component selector string for use in `static selector`. Ensures the name follows the Custom Elements naming convention (contains a hyphen, no leading/trailing hyphens).

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

Throws if the name does not contain a hyphen or has invalid formatting.

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

Returns `true` if the string matches the pattern `^[^-]+-[^-]+$` (at least one character before and after the hyphen, no leading or trailing hyphens).

### Example

```typescript
isComponentSelector('my-component');  // true
isComponentSelector('invalid');       // false (no hyphen)
isComponentSelector('-bad');          // false (leading hyphen)
isComponentSelector('bad-');          // false (trailing hyphen)
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
