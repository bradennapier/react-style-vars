import { useMemo, useDebugValue } from 'react';
import { CSSVariableContextConfig } from '../utils/types';
import { createFlattenedStyleVarObject } from '../utils/helpers';

export function useFlattenedObject(
  config: CSSVariableContextConfig,
  vars: { [key: string]: any },
) {
  useDebugValue('[CSSVariableProvider] | useFlattenedObject');

  const flattenedVars = useMemo(
    () =>
      config.isFlattened
        ? vars
        : createFlattenedStyleVarObject(
            vars,
            config.varSeparator,
            config.varTitleCase,
          ),
    [config.isFlattened, vars],
  );

  return flattenedVars;
}
