import React from 'react';

import {
  ExactPartial,
  FlattenedObject,
  CSSVariableContext,
  GetParentCSSVariableContext,
  GetRootCSSVariableContext,
  CSSVariableContextConfig,
} from '../utils/types';
import { useFlattenedObject } from './useFlattenedObject';
import {
  mergeStyleVars,
  walkContexts,
  getElementRef,
  getVarName,
  getVarValue,
  setStylesRef,
} from '../utils/helpers';

export function useVariableContext<
  V extends { [key: string]: any },
  P extends { [key: string]: any } | null = CSSVariableContext<
    any,
    any
  > extends CSSVariableContext<infer PO, any>
    ? PO
    : never
>(
  vars: V,
  ref: HTMLElement | null,
  parent: GetParentCSSVariableContext<P>,
  config: CSSVariableContextConfig,
): CSSVariableContext<V, P> {
  React.useDebugValue('[CSSVariableProvider] | useVariableContext');

  const isRoot = parent === null;

  const isInitialRenderRef = React.useRef(true);

  const styles = useFlattenedObject(config, vars);

  const stylesRef = React.useRef({ ...styles });

  const contextValue: CSSVariableContext<V, P> = React.useMemo(() => {
    return {
      isRoot,
      config,
      styles: {
        default: vars,
        initial: styles,
        get stylesRef() {
          // memo sets to frozen otherwise
          return stylesRef;
        },
        get ref() {
          return ref;
        },
      },

      get root(): GetRootCSSVariableContext<V, P> {
        if (!parent) {
          return (contextValue as unknown) as GetRootCSSVariableContext<V, P>;
        }
        return parent.root as GetRootCSSVariableContext<V, P>;
      },

      parent,

      getAllStyleVars: () => contextValue.styles.stylesRef.current,

      mergeStyleVars<F extends true | false, O extends { [key: string]: any }>(
        changes: F extends true ? FlattenedObject<V, O> : ExactPartial<V, O>,
        isFlattened?: F,
        isFlattenedAndFormatted?: boolean,
      ) {
        mergeStyleVars<typeof changes, F | undefined>(
          contextValue,
          changes,
          isFlattened,
          isFlattenedAndFormatted,
        );
      },

      mergeRootStyleVars(
        changes: { [key: string]: any },
        isFlattened?: boolean,
        isFlattenedAndFormatted?: boolean,
        resetAncestors?: boolean,
      ) {
        const removeKeys = mergeStyleVars(
          contextValue.getRootContext(),
          changes,
          isFlattened,
          isFlattenedAndFormatted,
        );
        if (resetAncestors) {
          for (const contextToReset of walkContexts(contextValue)) {
            if (!contextToReset.isRoot) {
              contextToReset.removeStyleVars(removeKeys, true);
            }
          }
        }
      },

      setStyleVar(
        name: string,
        value: string | number | null,
        priority?: string,
        isNameFormatted?: boolean,
      ) {
        const refToUse = getElementRef(contextValue);

        const varName = getVarName(name, isNameFormatted);

        refToUse.style.setProperty(varName, getVarValue(value), priority);
        setStylesRef(contextValue.styles.stylesRef.current, varName, value);
        return true;
      },

      removeStyleVars: <
        N extends string,
        NA extends N | readonly N[],
        A extends readonly string[] = NA extends string ? readonly [NA] : NA,
        R extends { [key: string]: string | undefined } = {
          [K in A[any]]?: string;
        }
      >(
        name: NA,
        isNameFormatted?: boolean,
      ): R => {
        const refToUse = getElementRef(contextValue);

        const removeKeys: readonly N[] = Array.isArray(name)
          ? name
          : ([name] as [N]);

        const values = removeKeys.reduce((obj, vname) => {
          const varName = isNameFormatted ? vname : getVarName(vname);
          const removedValue = refToUse.style.removeProperty(varName);
          if (removedValue) {
            // eslint-disable-next-line no-param-reassign
            obj[varName] = removedValue as string;
          }
          return obj;
        }, {} as { [key: string]: string | undefined });

        return values as R;
      },

      setStyleVarOnElement(
        refToUse: HTMLElement,
        name: string,
        value: string | number | null,
        priority?: string,
        isNameFormatted?: boolean,
      ) {
        const varName = getVarName(name, isNameFormatted);
        refToUse.style.setProperty(varName, getVarValue(value), priority);
        return true;
      },

      getStyleVarOnElement(
        refToUse: HTMLElement,
        name: string,
        isNameFormatted?: boolean,
      ) {
        const varName = getVarName(name, isNameFormatted);
        return refToUse.style.getPropertyValue(varName) || undefined;
      },

      setRootStyleVar: (
        name: string,
        value: string | number | null,
        priority?: string,
        resetAncestors?: boolean,
        isNameFormatted?: boolean,
      ) => {
        const rootContext = contextValue.getRootContext();

        if (!rootContext.styles.ref) {
          return false;
        }

        const varName = getVarName(name, isNameFormatted);

        rootContext.styles.ref.style.setProperty(
          varName,
          getVarValue(value),
          priority,
        );
        setStylesRef(rootContext.styles.stylesRef.current, varName, value);

        if (resetAncestors) {
          contextValue.removeStyleVarToRoot(varName, true);
        }

        return true;
      },
      setNearestDefinedStyleVar(
        name: string,
        value: string | number | null,
        priority?: string,
        isNameFormatted?: boolean,
      ) {
        const varName = getVarName(name, isNameFormatted);
        const nearestContext: any = contextValue.getNearestDefinedContext(
          varName,
          true,
        );

        if (!nearestContext.styles.ref) {
          return false;
        }

        nearestContext.styles.ref.style.setProperty(
          varName,
          getVarValue(value),
          priority,
        );
        setStylesRef(nearestContext.styles.stylesRef.current, varName, value);

        return true;
      },

      getNearestDefinedDefaultStyleVar: <T extends string | number | undefined>(
        name: string,
        isNameFormatted?: boolean,
      ): T => {
        const varName = getVarName(name, isNameFormatted);
        const contextToUse = contextValue.getNearestDefinedContext(
          varName,
          true,
        );
        return contextToUse.styles.initial[varName] as T;
      },

      getDefaultRootStyleVar(name: string, isNameFormatted?: boolean) {
        const varName = getVarName(name, isNameFormatted);
        const contextToUse = contextValue.getRootContext();
        return contextToUse.styles.initial[varName];
      },

      getStyleVar(name: string, isNameFormatted?: boolean) {
        const varName = getVarName(name, isNameFormatted);
        const contextToUse = contextValue.getNearestDefinedContext(
          varName,
          true,
        );
        return contextToUse.styles.stylesRef.current[varName];
      },

      getRootStyleVar(name: string, isNameFormatted?: boolean) {
        const varName = getVarName(name, isNameFormatted);
        const contextToUse = contextValue.getRootContext();
        return contextToUse.styles.stylesRef.current[varName];
      },

      getNearestDefinedContext(
        name: string,
        isNameFormatted?: boolean,
      ): CSSVariableContext<any, any> {
        if (contextValue.isRoot || !contextValue.parent) {
          return contextValue;
        }

        const varName = getVarName(name, isNameFormatted);

        if (
          !contextValue.styles.stylesRef.current[varName] &&
          contextValue.parent
        ) {
          return contextValue.parent.getNearestDefinedContext(varName, true);
        }

        return contextValue;
      },
      getRootContext(): CSSVariableContext<any, null> {
        const contextToUse = contextValue.root || contextValue;
        if (!contextToUse.isRoot) {
          throw new Error('Could not find root CSS Variable Provider Context');
        }
        return contextToUse;
      },
      removeStyleVarToRoot(name: string, isNameFormatted?: boolean) {
        const varName = getVarName(name, isNameFormatted);
        for (const contextToReset of walkContexts(contextValue)) {
          if (!contextToReset.isRoot) {
            const refToRemoveFrom = contextToReset.styles.ref;
            if (refToRemoveFrom) {
              refToRemoveFrom.style.removeProperty(varName);
              delete contextToReset.styles.stylesRef.current[varName];
            }
          }
        }
        return true;
      },
      resetAllNearestStyleVarsToInitial(removeNewKeys?: boolean) {
        let initialStyles: { [key: string]: any } = {
          ...contextValue.styles.initial,
        };
        const currentStyles = contextValue.styles.stylesRef.current;
        if (removeNewKeys) {
          const currentKeys = Object.keys(currentStyles);
          const initialKeys = Object.keys(initialStyles);
          initialStyles = currentKeys.reduce((obj, key) => {
            if (!initialKeys.includes(key)) {
              // eslint-disable-next-line no-param-reassign
              obj[key] = null;
            }
            return obj;
          }, initialStyles);
        }

        return mergeStyleVars(contextValue, initialStyles, true, true);
      },
      resetAllRootStyleVarsToInitial(removeNewKeys?: boolean) {
        const rootContext = contextValue.getRootContext();
        rootContext.resetAllNearestStyleVarsToInitial(removeNewKeys);
      },
      resetAllStyleVarsToInitial(removeNewKeys?: boolean) {
        for (const contextToUse of walkContexts(contextValue)) {
          contextToUse.resetAllNearestStyleVarsToInitial(removeNewKeys);
        }
      },
    };
  }, [isRoot, parent, ref, styles, vars, config]);

  React.useEffect(() => {
    if (!isInitialRenderRef.current && !config.isControlled) {
      return;
    }
    if (contextValue.styles.ref) {
      contextValue.mergeStyleVars(styles as { [key: string]: any }, true, true);
      isInitialRenderRef.current = false;
    }
  }, [
    config.isControlled,
    config.setOnRoot,
    contextValue,
    contextValue.styles.ref,
    styles,
  ]);

  return contextValue;
}
