import { defineRouteGroup, defineRoutes, Jadis, Router } from '@jadis/core';

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
