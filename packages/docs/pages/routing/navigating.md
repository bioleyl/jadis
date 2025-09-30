# 🚪 How to Navigate Between Pages

Jadis provides two programmatic ways to trigger navigation between pages: by using a **route name** or by using a **direct URL**. While both methods work, using route names is the recommended approach for flexibility and maintainability.

## 🧭 Route Name Navigation

When defining a route, the third parameter assigns a **name** to the route. This name acts as a reference, allowing you to navigate without relying on hardcoded paths. If the route includes parameters, you must provide them when navigating.

```javascript
const myRouter = new Router();

myRouter.addRoute('/hello/:name', HelloPage.selector, { name: 'hello' });

myRouter.gotoName('hello', { name: 'World' });
```

This approach makes your code more resilient to future URL structure changes.

## 🚫 Route Path Navigation

You can also navigate by passing the full path directly. However, this method performs no validation and assumes the path exists. It’s best to avoid this approach in favor of named routes.

```javascript
const myRouter = new Router();

myRouter.addRoute('/hello/:name', HelloPage.selector);

myRouter.gotoPath('/hello/World');
```
