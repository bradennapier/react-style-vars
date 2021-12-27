/* eslint-disable consistent-return */

export function getWindow(): (Window & typeof globalThis) | void {
  if (typeof window !== 'undefined') {
    return window;
  }
}

export function getDocument(): Document | void {
  if (typeof document !== 'undefined') {
    return document;
  }
}
