import { useContext, useDebugValue } from 'react';
import { CSSVariableContext } from '../utils/reactContext';
import { CSSVariableContext as CSSVariableContextType } from '../utils/types';

export function useStyleVars<
  V extends { [key: string]: any } = { [key: string]: any }
>(ctx = CSSVariableContext): CSSVariableContextType<V> {
  useDebugValue('[CSSVariableProvider] | useStyleVars');
  const context: CSSVariableContextType<V> = useContext(ctx);
  return context;
}
