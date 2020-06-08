import { CSSVariableContext } from './utils/reactContext';

export * from './utils/types';

export { default } from './components/CSSVariableProvider';
export { useStyleVars } from './hooks/useStyleVars';

const { Consumer: CSSVariableConsumer } = CSSVariableContext;

export { CSSVariableConsumer };
