// The fixture's server entry: a render that uses the worker's DOM, Node's fetch, and what the request gave it.

/** What a component's own fetch does during a render: refused, so the page says so. */
async function componentFetch() {
  try {
    await fetch('/api/hello');
    return 'allowed';
  } catch {
    return 'refused';
  }
}

async function fromApi(server) {
  const response = await server.fetch(`${server.origin}/api/hello`);
  return (await response.json()).message;
}

export const render = async (url, request, server) => {
  if (url === '/boom') {
    throw new Error('the render failed');
  }
  const paragraph = document.createElement('p');
  paragraph.textContent = `${url} for ${request?.user ?? 'nobody'}`;
  paragraph.part.toggle('greeting', true);
  const body = [
    paragraph.outerHTML,
    `<span class="api">${await fromApi(server)}</span>`,
    `<span class="fetch">${await componentFetch()}</span>`,
  ].join('');
  return {
    body,
    head: '<title>Fixture</title>',
    headers: { 'x-rendered': 'yes' },
    status: url === '/missing' ? 404 : 200,
  };
};
