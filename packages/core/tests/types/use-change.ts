import { Jadis } from '@jadis/core';

type Size = 'small' | 'large';
const parseSize = (value: string | null): Size => (value === 'large' ? 'large' : 'small');

class Bound extends Jadis {
  static readonly selector = 'x-bound';

  // Strings, numbers and booleans have a default parser.
  readonly label = this.useChange('', () => undefined, { attribute: 'label' });
  readonly count = this.useChange(0, () => undefined, { attribute: 'count' });
  readonly open = this.useChange(false, () => undefined, { attribute: 'open' });
  readonly size = this.useChange<Size>('small', () => undefined, { attribute: 'size', parse: parseSize });

  // @ts-expect-error A union of strings needs its own parser: the default one would accept any text.
  readonly unparsedSize = this.useChange<Size>('small', () => undefined, { attribute: 'size' });
  // @ts-expect-error A nullable value needs its own parser.
  readonly unparsedMin = this.useChange<number | null>(null, () => undefined, { attribute: 'min' });
  // @ts-expect-error A parser without an attribute has nothing to read.
  readonly orphanParser = this.useChange('', () => undefined, { parse: (value) => value ?? '' });
}

/** A component typed by the values it chooses between: `Choice<'list' | 'grid'>`. */
abstract class Choice<Value extends string = string> extends Jadis {
  static readonly selector = 'x-choice';

  protected abstract readonly choices: readonly Value[];

  // A field of the type parameter takes the parser it is given.
  readonly value = this.useChange<Value | null>(null, () => undefined, {
    attribute: 'value',
    parse: (value) => this.choices.find((choice) => choice === value) ?? null,
  });
  readonly picked = this.useChange<Value[]>([], () => undefined, { attribute: 'picked', parse: () => [] });

  // @ts-expect-error The type parameter has no default parser: it can be any union of strings.
  readonly unparsedValue = this.useChange<Value | null>(null, () => undefined, { attribute: 'value' });
}

void Bound;
void Choice;
