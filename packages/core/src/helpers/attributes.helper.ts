export function useAttributes<T extends string[]>(...attributes: T) {
  type AttributeType = T[number];

  function setObservedAttributes() {
    return attributes;
  }

  function setAttributesCallback(
    callbacks: Partial<Record<AttributeType, (value: string) => void>>
  ) {
    return callbacks as Record<
      AttributeType,
      (value: string, oldValue: string) => void
    >;
  }

  return { setObservedAttributes, setAttributesCallback };
}

export function useAttributesBis<T extends readonly string[]>() {
  const callbacks = new Map<
    T[number],
    (value: string, oldValue?: string) => void
  >();
  const observedAttributes = new Set<T[number]>();

  function getObservedAttributes(): Array<T[number]> {
    return Array.from(observedAttributes);
  }

  function setObservedAttributes(...attributes: T): Array<T[number]> {
    attributes.forEach((attribute) => observedAttributes.add(attribute));
    return Array.from(observedAttributes);
  }

  function getAttributesCallback(): Map<
    T[number],
    (value: string, oldValue?: string) => void
  > {
    return callbacks;
  }

  function setAttributesCallback(
    callbacks: Partial<Record<T[number], (value: string) => void>>
  ) {
    return callbacks as Record<
      T[number],
      (value: string, oldValue: string) => void
    >;
  }

  return {
    getObservedAttributes,
    setObservedAttributes,
    getAttributesCallback,
    setAttributesCallback,
  };
}
