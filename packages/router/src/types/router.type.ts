export type RouterMode = 'hash' | 'history';

export interface RouterOptions {
  mode?: RouterMode;
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
