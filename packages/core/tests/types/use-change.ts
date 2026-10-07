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

void Bound;
