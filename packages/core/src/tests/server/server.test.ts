import { describe, expect, it, vi } from 'vitest';

import { Jadis } from '../../base-component';
import { defineRouteGroup, defineRoutes } from '../../helpers/router.helper';
import { serializeHtml } from '../../server/html-writer';
import { renderRoute } from '../../server/route-render';
import { renderToHtml } from '../../server/server-render';

class ServerGreeting extends Jadis {
  static readonly selector = 'server-greeting';

  readonly name = this.useChange(
    'stranger',
    (value) => {
      this.getElement('#name').textContent = value;
    },
    { attribute: 'name' }
  );

  readonly connections = vi.fn();

  onConnect(): void {
    this.connections();
    this.getElement('#status').textContent = 'connected';
  }

  templateHtml(): Node {
    const fragment = document.createDocumentFragment();
    const paragraph = document.createElement('p');
    paragraph.append('Hello, ', Object.assign(document.createElement('span'), { id: 'name' }));
    fragment.append(paragraph, Object.assign(document.createElement('em'), { id: 'status' }));
    fragment.append(document.createElement('slot'));
    return fragment;
  }

  templateCss(): string {
    return ':host > p { color: red; }';
  }
}

class ServerFrame extends Jadis {
  static readonly selector = 'server-frame';

  templateHtml(): Node {
    const greeting = document.createElement(ServerGreeting.selector);
    greeting.setAttribute('name', 'inner');
    return greeting;
  }
}

class ServerLight extends Jadis {
  static readonly selector = 'server-light';
  static readonly useShadowDom = false;

  templateHtml(): Node {
    return Object.assign(document.createElement('b'), { textContent: 'light' });
  }
}

const jsonList =
  (fallback: string[]) =>
  (value: string | null): string[] =>
    value === null ? fallback : JSON.parse(value);

class ServerState extends Jadis {
  static readonly selector = 'server-state';

  readonly label = this.useChange('', () => undefined, { attribute: 'label' });
  readonly count = this.useChange(0, () => undefined, { attribute: 'count' });
  readonly open = this.useChange(false, () => undefined, { attribute: 'open' });
  readonly items = this.useChange<string[]>([], () => undefined, { attribute: 'items', parse: jsonList([]) });
  readonly when = this.useChange<Date>(new Date(0), () => undefined, {
    attribute: 'when',
    parse: (value) => new Date(Number(value ?? 0)),
  });
  readonly unbound = this.useChange('kept in code', () => undefined);

  static readonly useShadowDom = false;
}

ServerGreeting.register();
ServerState.register();
ServerFrame.register();
ServerLight.register();

const element = (html: string): Element => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.firstElementChild as Element;
};

describe('serializeHtml', () => {
  it('writes an open shadow root as a declarative template, before the light children', () => {
    const host = document.createElement('div');
    host.attachShadow({ mode: 'open' }).innerHTML = '<slot></slot>';
    host.append('light');

    expect(serializeHtml(host)).toBe('<div><template shadowrootmode="open"><slot></slot></template>light</div>');
  });

  it('writes the options of a shadow root', () => {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ delegatesFocus: true, mode: 'open' });
    // jsdom keeps neither option on the shadow root.
    Object.defineProperties(shadow, { clonable: { value: true }, delegatesFocus: { value: true } });

    expect(serializeHtml(host)).toContain(
      '<template shadowrootmode="open" shadowrootdelegatesfocus shadowrootclonable>'
    );
  });

  it('leaves a closed shadow root out', () => {
    const host = document.createElement('div');
    host.attachShadow({ mode: 'closed' }).innerHTML = '<p>hidden</p>';

    expect(serializeHtml(host)).toBe('<div></div>');
  });

  it('escapes text and attribute values', () => {
    const paragraph = document.createElement('p');
    paragraph.title = 'a "quote" & <tag>';
    paragraph.textContent = '1 < 2 & 3 > 2 !';

    expect(serializeHtml(paragraph)).toBe(
      '<p title="a &quot;quote&quot; &amp; &lt;tag&gt;">1 &lt; 2 &amp; 3 &gt; 2&nbsp;!</p>'
    );
  });

  it('writes the text of a style element as it is', () => {
    const style = document.createElement('style');
    style.textContent = ':host > p { content: "&"; }';

    expect(serializeHtml(style)).toBe('<style>:host > p { content: "&"; }</style>');
  });

  it('writes an empty attribute bare and a void element without end tag', () => {
    expect(serializeHtml(element('<img alt="" src="a.png">'))).toBe('<img alt src="a.png">');
  });

  it('keeps the case of SVG elements and attributes', () => {
    const html = '<svg viewBox="0 0 24 24"><linearGradient id="g"></linearGradient><path d="M0 0"></path></svg>';

    expect(serializeHtml(element(html))).toBe(html);
  });

  it('writes the content of a template', () => {
    expect(serializeHtml(element('<template><p>inert</p></template>'))).toBe('<template><p>inert</p></template>');
  });

  it('writes comments, and a document with its doctype', () => {
    const doc = document.implementation.createHTMLDocument('');
    doc.body.append(doc.createComment(' note '));

    expect(serializeHtml(doc)).toBe(
      '<!DOCTYPE html><html><head><title></title></head><body><!-- note --></body></html>'
    );
  });

  describe('form fields', () => {
    it('writes the value of a text field set in code', () => {
      const input = element('<input value="first">') as HTMLInputElement;
      input.value = 'typed';

      expect(serializeHtml(input)).toBe('<input value="typed">');
    });

    it('writes the checked state of a box, not its value', () => {
      const box = element('<input type="checkbox" checked value="yes">') as HTMLInputElement;
      box.checked = false;
      const radio = element('<input type="radio">') as HTMLInputElement;
      radio.checked = true;

      expect(serializeHtml(box)).toBe('<input type="checkbox" value="yes">');
      expect(serializeHtml(radio)).toBe('<input type="radio" checked>');
    });

    it('never writes the value of a password', () => {
      const input = element('<input type="password" value="kept">') as HTMLInputElement;
      input.value = 'secret';

      expect(serializeHtml(input)).toBe('<input type="password">');
    });

    it('writes the value of a text area as its text', () => {
      const area = element('<textarea>first</textarea>') as HTMLTextAreaElement;
      area.value = 'a < b';

      expect(serializeHtml(area)).toBe('<textarea>a &lt; b</textarea>');
    });

    it('writes the option chosen in a select', () => {
      const select = element('<select><option value="a" selected>A</option><option value="b">B</option></select>');
      (select as HTMLSelectElement).value = 'b';

      expect(serializeHtml(select)).toBe(
        '<select><option value="a">A</option><option value="b" selected>B</option></select>'
      );
    });
  });
});

describe('serializeHtml, the state of a component', () => {
  const state = (html: string): ServerState => {
    document.body.innerHTML = html;
    return document.body.firstElementChild as ServerState;
  };

  it('writes the values its attribute-bound fields were given in code as those attributes', () => {
    const element = state('<server-state></server-state>');
    element.label.set('Orders & "more"');
    element.count.set(3);
    element.open.set(true);
    element.items.set(['a', 'b']);

    expect(serializeHtml(element)).toBe(
      '<server-state label="Orders &amp; &quot;more&quot;" count="3" open items="[&quot;a&quot;,&quot;b&quot;]"></server-state>'
    );
  });

  it('removes an attribute whose field was turned off in code', () => {
    const element = state('<server-state open label="Kept"></server-state>');
    element.open.set(false);

    expect(serializeHtml(element)).toBe('<server-state label="Kept"></server-state>');
  });

  it('leaves out a value its own parser does not read back, and a field bound to no attribute', () => {
    const element = state('<server-state></server-state>');
    element.when.set(new Date(5));
    element.count.set(Number.NaN);
    element.unbound.set('changed');

    expect(serializeHtml(element)).toBe('<server-state></server-state>');
  });

  it('writes nothing before the first connection, when the fields have not read their attributes', () => {
    const element = document.createElement(ServerState.selector) as ServerState;
    element.setAttribute('count', '2');

    expect(serializeHtml(element)).toBe('<server-state count="2"></server-state>');
  });

  it('writes nothing for values the attributes already give', () => {
    expect(serializeHtml(state('<server-state count="2" items=\'["x"]\'></server-state>'))).toBe(
      '<server-state count="2" items="[&quot;x&quot;]"></server-state>'
    );
  });
});

describe('renderToHtml', () => {
  it('writes a component as it draws once connected: attributes, changes, styles and onConnect', async () => {
    const html = await renderToHtml('<server-greeting name="Ada">slotted</server-greeting>');

    expect(html).toBe(
      '<server-greeting name="Ada"><template shadowrootmode="open"><style>:host > p { color: red; }</style>'
        + '<p>Hello, <span id="name">Ada</span></p><em id="status">connected</em><slot></slot></template>'
        + 'slotted</server-greeting>'
    );
  });

  it('writes the shadow roots of the components a template holds', async () => {
    const html = await renderToHtml('<server-frame></server-frame>');

    expect(html).toContain('<server-frame><template shadowrootmode="open"><server-greeting name="inner">');
    expect(html).toContain('<span id="name">inner</span>');
  });

  it('takes a node, and writes a property set before the render', async () => {
    const greeting = document.createElement(ServerGreeting.selector) as ServerGreeting;
    greeting.name.set('from code');

    expect(await renderToHtml(greeting)).toContain('<span id="name">from code</span>');
  });

  it('writes a component without shadow root with its template in the light DOM, after a mark', async () => {
    expect(await renderToHtml('<server-light><i>given</i></server-light>')).toBe(
      '<server-light><i>given</i><!--jadis-template--><b>light</b></server-light>'
    );
  });

  it('lets a component without shadow root replace the template the server wrote, keeping its children', () => {
    document.body.innerHTML =
      '<div><server-light><i>given</i><!--jadis-template--><b>server</b></server-light></div>';

    expect(document.body.innerHTML).toBe('<div><server-light><i>given</i><b>light</b></server-light></div>');
  });

  it('takes the content out of the document once written: the components disconnect', async () => {
    const greeting = document.createElement(ServerGreeting.selector) as ServerGreeting;
    await renderToHtml(greeting);
    await Promise.resolve();

    expect(greeting.isConnected).toBe(false);
    expect(greeting.parentElement?.isConnected).toBe(false);
  });

  it('waits for ready, after onConnect, before writing', async () => {
    const greeting = document.createElement(ServerGreeting.selector) as ServerGreeting;
    const ready = async (): Promise<void> => {
      expect(greeting.connections).toHaveBeenCalledOnce();
      await new Promise((resolve) => setTimeout(resolve));
      greeting.name.set('loaded');
    };

    expect(await renderToHtml(greeting, { ready })).toContain('<span id="name">loaded</span>');
  });
});

describe('renderRoute', () => {
  class RouteFrame extends Jadis {
    static readonly selector = 'route-frame';

    templateHtml(): Node {
      return document.createElement('slot');
    }
  }

  RouteFrame.register();

  const routes = defineRoutes({
    ...defineRouteGroup(
      '/people',
      { person: { page: ServerGreeting, path: '/:id' } },
      {
        rootComponentSelector: 'route-frame',
      }
    ),
    home: { page: ServerGreeting, path: '/' },
  });

  it('renders the route of a path as the router mounts it: the root component, the page, the parameters', async () => {
    const rendered = await renderRoute(routes, '/people/ada?tab=1');

    expect(rendered?.route).toMatchObject({ name: 'person', params: { id: 'ada' } });
    expect(rendered?.route.query.get('tab')).toBe('1');
    expect(rendered?.body).toMatch(
      /^<route-frame id="ada"><template shadowrootmode="open"><slot><\/slot><\/template>/
    );
    expect(rendered?.body).toContain('<server-greeting id="ada"><template shadowrootmode="open">');
  });

  it('lets the app give the page its data before the render', async () => {
    const rendered = await renderRoute(routes, '/people/ada', {
      prepare: async (page, route) => (page as ServerGreeting).name.set(`person ${route.params.id}`),
    });

    expect(rendered?.body).toContain('<server-greeting id="ada" name="person ada">');
    expect(rendered?.body).toContain('<span id="name">person ada</span>');
    expect((rendered?.page as ServerGreeting).name.get()).toBe('person ada');
  });

  it('gives nothing for a path no route matches', async () => {
    expect(await renderRoute(routes, '/nowhere/at/all')).toBeUndefined();
  });
});
