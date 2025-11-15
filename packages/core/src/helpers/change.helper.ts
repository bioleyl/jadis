export class ChangeHandler<T> {
  private _value: T;

  constructor(
    initialValue: T,
    private onChange: (newValue: T, oldValue: T) => void
  ) {
    this._value = initialValue;
  }

  get() {
    return this._value;
  }
  set(setter: T | ((val: T) => T)) {
    const oldValue = structuredClone(this._value);
    this._value = typeof setter === 'function' ? (setter as (val: T) => T)(this._value) : setter;
    this.onChange(this._value, oldValue);
  }
}
