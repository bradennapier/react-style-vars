import { CSSVariableContext } from './types';
import flattenObject from './flatten-object';

export function* walkContexts(
  contextValue: CSSVariableContext<any, any>,
): Generator<CSSVariableContext<any, any>, void, unknown> {
  let currentContext = contextValue;
  yield currentContext;

  while (!contextValue.isRoot) {
    if (contextValue.parent) {
      currentContext = contextValue.parent;
      yield currentContext;
    } else {
      return;
    }
  }
}

export const getVarName = (name: string, isNameFormatted?: boolean) =>
  isNameFormatted || name[0] === '-' ? name : `--${name}`;

export const getVarValue = (value: string | null | number): null | string =>
  value === null ? value : String(value);

export function getElementRef(
  contextValue: CSSVariableContext<any, any>,
): HTMLElement {
  const { ref } = contextValue.styles;
  if (!ref) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[WARN] | CSSVariablesProvider | Tried to use an element ref which is currently invalid.',
        {
          isRoot: contextValue.isRoot,
          vars: contextValue.styles.default,
        },
      );
    }
    throw new Error('Invalid css style variable ref');
  }
  return ref;
}

export function createFlattenedStyleVarObject(
  vars: Record<string, any>,
): { [key: string]: string | number } {
  const flattened = flattenObject(vars, true, '--');
  return flattened;
}

export function setStylesRef(
  stylesRef: { [key: string]: string | number },
  varName: string,
  value: string | number | null,
) {
  if (value === null) {
    // eslint-disable-next-line no-param-reassign
    delete stylesRef[varName];
  } else {
    // eslint-disable-next-line no-param-reassign
    stylesRef[varName] = value;
  }
}

export function mergeStyleVars<
  C extends {
    [key: string]: any;
  },
  F extends true | false | undefined
>(
  toContext: CSSVariableContext<any, any>,
  changes: C,
  isFlattened: F,
  isFlattenedAndFormatted: undefined | boolean,
): string[] {
  if (!toContext || !toContext.styles.ref) {
    return [];
  }
  const flattened = isFlattened
    ? changes
    : createFlattenedStyleVarObject(changes);
  const keysToChange = Object.keys(flattened);
  for (const name of keysToChange) {
    const varName = isFlattenedAndFormatted ? name : getVarName(name);
    const value = flattened[name];
    toContext.styles.ref.style.setProperty(varName, getVarValue(value));
    setStylesRef(toContext.styles.stylesRef.current, varName, value);
  }
  return keysToChange;
}
