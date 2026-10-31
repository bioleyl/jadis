import { defineRouteGroup, defineRoutes, Jadis, Router } from '@jadis/core';

import type { ActiveRoute } from '@jadis/core';

class Page extends Jadis {
  static readonly selector = 'x-page';
}

const router = new Router(
  defineRoutes({
    admin: defineRouteGroup('/admin', { user: { page: Page, path: '/user/:id' } }),
    home: { page: Page, path: '/' },
    post: { page: Page, path: '/user/:id/post/:postId' },
    user: { page: Page, path: '/user/:id' },
  })
);

// A route without parameters takes none.
router.goto('home');
// @ts-expect-error home has no parameter.
router.goto('home', { id: '42' });

// Each parameter of the path is required, by its name.
router.goto('user', { id: '42' });
router.goto('post', { id: '1', postId: '2' });
router.goto('adminUser', { id: '7' });
// @ts-expect-error user needs its id.
router.goto('user');
// @ts-expect-error id, not uid.
router.goto('user', { uid: '42' });
// @ts-expect-error post needs its postId too.
router.goto('post', { id: '1' });
// @ts-expect-error A parameter is a string.
router.goto('user', { id: 42 });

// Only the routes defined have names.
// @ts-expect-error No such route.
router.goto('nowhere');

// replace takes a route's parameters as goto does.
router.replace('user', { id: '42' });
// @ts-expect-error user needs its id.
router.replace('user');
// @ts-expect-error No such route.
router.replace('nowhere');

// A path is only known at run time: it is checked when navigating, and match finds its route or nothing.
router.gotoPath('/user/42?tab=posts');
router.replacePath('/user/42');
const found: ActiveRoute | undefined = router.match('/user/42');

// The bus says each route shown.
router.bus.register('change', (route) => route.params, new AbortController().signal);

// show puts each new page in the document.
router.mountOn(document.body, {
  show: (next, current) => document.body.replaceChildren(next, ...(current ? [current] : [])),
});
// @ts-expect-error show gives the page elements, not routes.
router.mountOn(document.body, { show: (next: ActiveRoute) => next });

void found;
