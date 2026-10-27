import { Jadis } from '@jadis/core';

class StatusBadge extends Jadis {
  static readonly selector = 'status-badge';

  tone = 'neutral';
}

export class Panel extends Jadis {
  static readonly selector = 'x-panel';

  private readonly _refs = this.useRefs((ref) => ({
    badge: ref(StatusBadge),
    byQuery: ref<HTMLInputElement>('.name'),
    bySelector: ref<StatusBadge>(StatusBadge.selector),
    byTag: ref('button'),
  }));

  read(): unknown[] {
    // A component class gives back an instance of that component.
    const tone: string = this._refs.badge.tone;
    const disabled: boolean = this._refs.byTag.disabled;
    const value: string = this._refs.byQuery.value;
    const sameTone: string = this._refs.bySelector.tone;
    // A known tag name still picks its element type.
    const fromGetElement: boolean = this.getElement('button').disabled;
    // @ts-expect-error A ref found by its class is typed as that class, not as a plain element.
    const missing = this._refs.badge.notAField;
    // @ts-expect-error Only a component class can stand in for a query.
    const notAComponent = this.useRefs((ref) => ({ date: ref(Date) }));

    return [tone, disabled, value, sameTone, fromGetElement, missing, notAComponent];
  }
}
