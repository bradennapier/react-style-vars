import { useContext, useDebugValue } from 'react';
import { CSSVariableContext } from '../utils/reactContext';

export function useStyleVars(ctx = CSSVariableContext) {
  useDebugValue('[CSSVariableProvider] | useStyleVars');
  const context = useContext(ctx);
  return context;
}
