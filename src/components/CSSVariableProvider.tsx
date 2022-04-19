import React from 'react';
import { getDocument } from '../utils/browser';

import { CSSVariableContext } from '../utils/reactContext';
import { useVariableContext } from '../hooks/useVariableContext';
import { CSSVariableContextConfig } from '../utils/types';

type Props<V extends { [key: string]: any }> = {
  /**
   * This is the recommended way to provide the variables you wish to set initially.  After initial render, no
   * changes will occur if this value is changed at any point and it is expected to use the context methods to
   * update style variables after the initial rendering.
   *
   * This will generally be the most performant.
   */
  readonly defaultStyleVars?: V;
  /**
   * While the defaultStyleVars uncontrolled method is recommended, setting this prop will update the variables
   * and potentially re-build any time the value is changed.  Note that this method may cause unintended side
   * effects if any of the context methods are used to set or change the css variables.
   */
  readonly styleVars?: V;
  /**
   * Sets the style variables on the html element rather than the div ref.  Note that this may give undesired
   * results if the root context is unmounted as it will not remove the style variables unless
   */
  setOnRoot?: boolean;
  /**
   * If the provided object is already flattened, setting this to true will allow skipping the var flattening
   * step which can be useful when only a few variables are being set which may also be changed via props rather
   * than using the context methods.
   */
  isFlattened?: boolean;
  /**
   * When the object is both flattened and represents an object with proper variable names as the keys (`{ '--myVarName': '10px' }`)
   * then setting this value will skip any checks or formatting of the variable name during setup.  By default we always
   * check and prefix the variable name with `--` if it hasn't been included.
   */
  isFlattenedAndFormatted?: boolean;
  /**
   * When defined, each segment of the object being flattened will include this value.  For example, { color: { main: 'red' } }
   * would become '--color-main: red;'
   *
   * defaults to `-` unless varTitleCase is true (then it would default to `undefined`)
   */
  varSeparator?: string;
  /**
   * When defined, each segment of the object is transformed to title case.  For example, { color: { main: 'red' } }
   * would become '--colorMain: red;'
   *
   * defaults to `false`, setting this to `true` will cause the varSeparator to be `undefined` by default
   */
  varTitleCase?: boolean;

  children: React.ReactNode;
};

const EMPTY_VARS: { [key: string]: any } = Object.freeze({});

let i = 0;

/**
 * Creates a variable provider which wraps the children in a div (with display: contents set) which can then
 * be used to set css variables on easily using the style variable context.
 *
 * Optionally have the root provider set the variables on the root (html) element (document.documentElement).
 */
export default React.memo(function CSSVariableProvider<
  V extends { [key: string]: any }
>({
  styleVars,
  isFlattened,
  isFlattenedAndFormatted,
  children,
  ...props
}: Props<V>): JSX.Element {
  const parentProvider = React.useContext(CSSVariableContext);

  const uid = React.useMemo(() => {
    if (parentProvider) {
      i += 1;
      return `${parentProvider.config.uid}-${i}`;
    }
    return 'r';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // we do not want allow updating these values after initial render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { setOnRoot, defaultStyleVars } = React.useMemo(() => props, []);

  if (setOnRoot && parentProvider) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[CSSVariableProvider] | Expected setOnRoot to set on the root provider which is currently: ',
        parentProvider.root,
      );
    }
    throw new Error(
      '[ERROR] | CSSVariableProvider | You can only use setOnRoot for the top level CSSVariableProvider',
    );
  }

  const [ref, setRef] = React.useState<HTMLElement | null>(null);

  const setElementRef = React.useCallback(
    (node) => {
      if (!setOnRoot) {
        setRef(node);
      }
    },
    [setOnRoot],
  );

  const vars = React.useMemo(() => {
    if (styleVars) {
      return styleVars;
    }
    return defaultStyleVars;
  }, [defaultStyleVars, styleVars]);

  const config: CSSVariableContextConfig = React.useMemo(
    () => ({
      uid,
      isControlled: !vars ? false : !!styleVars,
      isFlattened: !vars ? true : !!isFlattened,
      isFlattenedAndFormatted: !vars ? true : !!isFlattenedAndFormatted,
      setOnRoot: !!setOnRoot,
      varSeparator:
        props.varTitleCase !== true && props.varSeparator === undefined
          ? '-'
          : props.varSeparator,
      varTitleCase: !!props.varTitleCase,
    }),
    [
      uid,
      vars,
      styleVars,
      isFlattened,
      isFlattenedAndFormatted,
      setOnRoot,
      props.varSeparator,
      props.varTitleCase,
    ],
  );

  const refToUse = React.useMemo(() => {
    if (setOnRoot) {
      return getDocument()?.documentElement ?? ref;
    }
    return ref;
  }, [ref, setOnRoot]);

  const contextValue = useVariableContext(
    vars || EMPTY_VARS,
    refToUse,
    parentProvider,
    config,
  );

  return (
    <CSSVariableContext.Provider value={contextValue}>
      {!setOnRoot ? (
        <div style={{ display: 'contents' }} ref={setElementRef}>
          {children}
        </div>
      ) : (
        children
      )}
    </CSSVariableContext.Provider>
  );
});
