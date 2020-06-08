import React from 'react';

export const CSSVariableContext = /* #__PURE__ */ React.createContext(
  null as any,
);

if (process.env.NODE_ENV !== 'production') {
  CSSVariableContext.displayName = 'CSSVariable';
}
