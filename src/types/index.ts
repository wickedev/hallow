export interface ClientOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface StubOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

export interface SuspenseResource<T> {
  read(): T;
}

export interface HooksAPI<T> {
  [key: string]: () => SuspenseResource<T>;
}