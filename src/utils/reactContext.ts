import React from 'react';
import { CSSVariableContext as CSSVariableContextType } from './types';

export const CSSVariableContext = /* #__PURE__ */ React.createContext(
  (null as any) as CSSVariableContextType<any>,
);

if (process.env.NODE_ENV !== 'production') {
  CSSVariableContext.displayName = 'CSSVariable';
}
