import { Jadis } from '../../base-component';

export class TestComponent extends Jadis {
  static readonly selector = 'x-test';

  customProp: number = 10;

  templateHtml() {
    const frag = document.createDocumentFragment();
    const div = document.createElement('div');
    const slot = document.createElement('slot');
    div.id = 'inside';
    frag.appendChild(div);
    frag.appendChild(slot);
    return frag;
  }

  templateCss() {
    return ':host { display: block; }';
  }
}

TestComponent.register();

export class TestComponentNoShadow extends Jadis {
  static readonly selector = 'x-test-no-shadow';
  static readonly useShadowDom = false;

  templateHtml() {
    const frag = document.createDocumentFragment();
    const div = document.createElement('div');
    const slot = document.createElement('slot');
    div.id = 'inside-no-shadow';
    frag.appendChild(div);
    frag.appendChild(slot);
    return frag;
  }
}

TestComponentNoShadow.register();
