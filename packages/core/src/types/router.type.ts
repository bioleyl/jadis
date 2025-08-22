export type RouterMode = 'hash' | 'history';

export interface RouterOptions {
  /** The mode of the router, either 'hash' or 'history'. */
  mode?: RouterMode;
  /** The base URL for the router, defaults to '/'. */
  baseUrl?: string;
}

export interface Route {
  name?: string;
  path: string;
  componentSelector: string;
}

export interface InternalRoute extends Route {
  regexp: RegExp;
}

export interface MatchedRoute extends InternalRoute {
  urlPath: string;
}
