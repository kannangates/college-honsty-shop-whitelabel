import { lazy, ComponentType, LazyExoticComponent } from 'react';

type ComponentModule<T = unknown> = { default: ComponentType<T> };
type NamedComponentModule<T = unknown, K extends string = string> = { [key in K]: ComponentType<T> };

type LazyComponent<T = unknown> = LazyExoticComponent<ComponentType<T>>;

// For default exports
function lazyLoad<T = unknown>(
  importFn: () => Promise<ComponentModule<T>>
): LazyComponent<T> {
  return lazy(importFn);
}

// For named exports
function lazyLoadNamed<T = unknown, K extends string = string>(
  importFn: () => Promise<NamedComponentModule<T, K>>,
  exportName: K
): LazyComponent<T> {
  return lazy(async () => ({
    default: (await importFn())[exportName]
  }));
}

export { lazyLoad, lazyLoadNamed };
