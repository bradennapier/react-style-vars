export type FlattenedObject<
  V extends { [key: string]: any },
  O extends {
    [key: string]: any;
  }
> = {
  [K in keyof O]: K extends keyof V
    ? V[K] extends { [key: string]: any }
      ? never
      : V[K]
    : string | number | null;
};

export type ExactPartial<
  V extends { [key: string]: any },
  C extends {
    [key: string]: any;
  }
> = {
  [K in keyof C]: K extends keyof V
    ? V[K] extends { [key: string]: any }
      ? C[K] extends { [key: string]: any }
        ? ExactPartial<V[K], C[K]>
        : Partial<V[K]>
      : V[K]
    : never;
};

export type GetParentCSSVariableContext<P> = P extends null
  ? null
  : CSSVariableContext<P, any>;

export type GetRootCSSVariableContext<V, P> = P extends null
  ? CSSVariableContext<V, null>
  : CSSVariableContext<{ [key: string]: any }, null>;

export type CSSVariableContextConfig = {
  uid: string;
  /**
   * Indicates whether we should be updating variables to be inline with whatever
   * is provided by the styleVars prop.  This occurs when styleVars is used instead
   * of defaultStyleVars during initial render.
   */
  isControlled: boolean;
  isFlattened: boolean;
  isFlattenedAndFormatted: boolean;
  setOnRoot: boolean;
  varSeparator?: string;
  varTitleCase?: boolean;
};

export type CSSVariableContext<
  V extends { [key: string]: any },
  P extends { [key: string]: any } | null = { [key: string]: any }
> = {
  isRoot: boolean;
  /**
   * The config current being utilized by the context provider.
   */
  config: CSSVariableContextConfig;
  /**
   * Holds the in-memory style cache values and refs.
   */
  styles: {
    default: V;
    initial: {
      [key: string]: string | number;
    };
    stylesRef: {
      current: {
        [key: string]: any;
      };
    };
    ref: HTMLElement | null;
  };
  /**
   * The closest parent of the current context provider or null when we are at the root level.
   */
  parent: GetParentCSSVariableContext<P>;
  /**
   * The root context provider
   */
  root: GetRootCSSVariableContext<V, P>;
  mergeStyleVars: <F extends boolean, O>(
    changes: F extends true ? FlattenedObject<V, O> : ExactPartial<V, O>,
    /**
     * When set to true it indicates that the provided changes are already flattened
     * allowing the flattenVariables step to be skipped.
     */
    isFlattened?: F | undefined,
    /**
     * Indicate whether the flattened object is an object of actual var names to set, allowing us to
     * skip checking the var and formatting it on each iteration.  If this is not defined or false it will
     * check and format as needed.
     *
     * @default false
     */
    isFlattenedAndFormatted?: boolean,
  ) => void;
  mergeRootStyleVars: (
    changes: { [key: string]: any },
    /**
     * When set to true it indicates that the provided changes are already flattened
     * allowing the flattenVariables step to be skipped.
     *
     * @default false
     */
    isFlattened?: boolean,
    /**
     * Indicate whether the flattened object is an object of actual var names to set, allowing us to
     * skip checking the var and formatting it on each iteration.  If this is not defined or false it will
     * check and format as needed.
     *
     * @default false
     */
    isFlattenedAndFormatted?: boolean,
  ) => void;
  setStyleVar: (
    /**
     * Set the varName to set, either '--myVarName' or 'myVarName' works.  This should be the flattened
     * var name which will be converted such that `{ foo: { bar: { width: '200px' } } }` --> `--fooBarWidth`
     */
    name: string,
    value: string | null,
    priority?: string | undefined,
    /**
     * Optionally provide whether the names provided have already been
     * formatted as `--varName` so we do not need to check and format if
     * needed.  If this is false or undefined the string will be checked
     * and formatted if necessary.
     */
    isNameFormatted?: boolean,
  ) => boolean;
  /**
   * A convenience function to call the ref.style.setProperty() and format the value as a variable if needed ('--')
   */
  setStyleVarOnElement: (
    /**
     * The HTML Element to set the variable on.
     */
    refToUse: HTMLElement,
    /**
     * Set the varName to set, either '--myVarName' or 'myVarName' works.  This should be the flattened
     * var name which will be converted such that `{ foo: { bar: { width: '200px' } } }` --> `--fooBarWidth`
     */
    name: string,
    value: string | null,
    priority?: string,
    /**
     * Optionally provide whether the names provided have already been
     * formatted as `--varName` so we do not need to check and format if
     * needed.  If this is false or undefined the string will be checked
     * and formatted if necessary.
     */
    isNameFormatted?: boolean,
  ) => boolean;

  /**
   * A convenience function to call the ref.style.getPropertyValue() and format the value as a variable if needed ('--').
   * Returns the value directly rather than using the in-memory cache that is used for other get queries.
   */
  getStyleVarOnElement: (
    /**
     * The HTML Element to set the variable on.
     */
    refToUse: HTMLElement,
    /**
     * Set the varName to set, either '--myVarName' or 'myVarName' works.  This should be the flattened
     * var name which will be converted such that `{ foo: { bar: { width: '200px' } } }` --> `--fooBarWidth`
     */
    name: string,
    /**
     * Optionally provide whether the names provided have already been
     * formatted as `--varName` so we do not need to check and format if
     * needed.  If this is false or undefined the string will be checked
     * and formatted if necessary.
     */
    isNameFormatted?: boolean,
  ) => string | undefined;

  /**
   * Sets the style var that is on the nearest context's ref rather than just automatically setting on the nearest context.  This will
   * iterate up to the root context looking for any context which has the variable set and will set it on that context automatically.
   */
  setNearestDefinedStyleVar: (
    /**
     * Set the varName to set, either '--myVarName' or 'myVarName' works.  This should be the flattened
     * var name which will be converted such that `{ foo: { bar: { width: '200px' } } }` --> `--fooBarWidth`
     */
    name: string,
    value: string | null,
    priority?: string | undefined,
    /**
     * Optionally provide whether the names provided have already been
     * formatted as `--varName` so we do not need to check and format if
     * needed.  If this is false or undefined the string will be checked
     * and formatted if necessary.
     */
    isNameFormatted?: boolean,
  ) => boolean;

  /**
   * Sets the given style var on the root context.
   */
  setRootStyleVar: (
    /**
     * Set the varName to set, either '--myVarName' or 'myVarName' works.  This should be the flattened
     * var name which will be converted such that `{ foo: { bar: { width: '200px' } } }` --> `--fooBarWidth`
     */
    name: string,
    value: string | null,
    priority?: string | undefined,
    /**
     * When true, iterate up to root and unset the variable on any ancestors to ensure we use the new root value on our own component.
     */
    resetAncestors?: boolean,
    /**
     * Optionally provide whether the names provided have already been
     * formatted as `--varName` so we do not need to check and format if
     * needed.  If this is false or undefined the string will be checked
     * and formatted if necessary.
     */
    isNameFormatted?: boolean,
  ) => boolean;

  /**
   * Returns the default / initial value provided for the nearest context which has the value defined.
   *
   * @note
   *  Note that initial means the value set when initially rendering.  Newly created variables
   *  will always return `undefined`.
   */
  getNearestDefinedDefaultStyleVar: <T extends string | number | undefined>(
    /**
     * Set the varName to set, either '--myVarName' or 'myVarName' works.  This should be the flattened
     * var name which will be converted such that `{ foo: { bar: { width: '200px' } } }` --> `--fooBarWidth`
     */
    name: string,
    /**
     * Optionally provide whether the names provided have already been
     * formatted as `--varName` so we do not need to check and format if
     * needed.  If this is false or undefined the string will be checked
     * and formatted if necessary.
     */
    isNameFormatted?: boolean,
  ) => T;

  /**
   * Returns the default / initial value of a given variable within the root context, if any.
   *
   * @note
   *  Note that initial means the value set when initially rendering.  Newly created variables
   *  will always return `undefined`.
   */
  getDefaultRootStyleVar: (
    /**
     * Set the varName to set, either '--myVarName' or 'myVarName' works.  This should be the flattened
     * var name which will be converted such that `{ foo: { bar: { width: '200px' } } }` --> `--fooBarWidth`
     */
    name: string,
    /**
     * Optionally provide whether the names provided have already been
     * formatted as `--varName` so we do not need to check and format if
     * needed.  If this is false or undefined the string will be checked
     * and formatted if necessary.
     */
    isNameFormatted?: boolean,
  ) => string | number | undefined;

  /**
   * Gets the value of a given style variable on the closest ancestor.
   *
   * @note
   *  Setting the value on that ancestor can be done with [setNearestDefinedStyleVar] rather than [setStyleVar] which
   *  would potentially set the value on a different element.
   */
  getStyleVar: (
    /**
     * Set the varName to set, either '--myVarName' or 'myVarName' works.  This should be the flattened
     * var name which will be converted such that `{ foo: { bar: { width: '200px' } } }` --> `--fooBarWidth`
     */
    name: string,
    /**
     * Optionally provide whether the names provided have already been
     * formatted as `--varName` so we do not need to check and format if
     * needed.  If this is false or undefined the string will be checked
     * and formatted if necessary.
     */
    isNameFormatted?: boolean,
  ) => string | number | undefined;

  /**
   * Returns the in-memory cached values for all the CSS Variables currently set by the context.  The response will be
   * the flattened version of your variables properly formatted (such as `{ '--myVarName': 2, '--anotherVar': '10px' }`).
   *
   * @note
   *  This does not make any dom requests
   */
  getAllStyleVars: (
    /**
     * When `true`, the provided object will be all inherited style variables from the root to the nearest context with
     * the values being merged to represent the variable values the current component will be using.
     *
     * @default false
     */
    includeAncestors?: boolean,
  ) => { [key: string]: string | number };

  /**
   * Returns the style variable value from the root context regardless if another value is set on an ancestor.
   */
  getRootStyleVar: (
    /**
     * Set the varName to set, either '--myVarName' or 'myVarName' works.  This should be the flattened
     * var name which will be converted such that `{ foo: { bar: { width: '200px' } } }` --> `--fooBarWidth`
     */
    name: string,
    /**
     * Optionally provide whether the names provided have already been
     * formatted as `--varName` so we do not need to check and format if
     * needed.  If this is false or undefined the string will be checked
     * and formatted if necessary.
     */
    isNameFormatted?: boolean,
  ) => string | number | undefined;

  /**
   * Searches for the closest context that has the variable defined on it and returns the context.  If none are found it returns the root
   * context.
   */
  getNearestDefinedContext(
    /**
     * Set the varName to set, either '--myVarName' or 'myVarName' works.  This should be the flattened
     * var name which will be converted such that `{ foo: { bar: { width: '200px' } } }` --> `--fooBarWidth`
     */
    name: string,
    /**
     * Optionally provide whether the names provided have already been
     * formatted as `--varName` so we do not need to check and format if
     * needed.  If this is false or undefined the string will be checked
     * and formatted if necessary.
     */
    isNameFormatted?: boolean,
  ): CSSVariableContext<any, any>;

  getRootContext(): CSSVariableContext<any, null>;

  /**
   * Remove one or more style vars from the context and return an object representing all the removed values, if any. These
   * values are formatted so that they can be used with `mergeStyleVars` easily to reset the change.
   */
  removeStyleVars<
    N extends string | readonly string[],
    A extends readonly string[] = N extends string ? readonly [N] : N
  >(
    /**
     * The var name or an array of var names to remove from the context.
     */
    names: N,
    /**
     * Optionally provide whether the names provided have already been
     * formatted as `--varName` so we do not need to check and format if
     * needed.  If this is false or undefined the string will be checked
     * and formatted if necessary.
     */
    isNameFormatted?: boolean,
  ): {
    [K in A[any]]?: string;
  };

  /**
   * Iterates contexts from the called location and removes a property from all contexts except the root context.
   *
   * @tip
   *  If you want to remove a variable from all ancestors including root, you can set the variable and set resetAncestors
   *  to true.
   */
  removeStyleVarToRoot: (
    /**
     * Set the varName to set, either '--myVarName' or 'myVarName' works.  This should be the flattened
     * var name which will be converted such that `{ foo: { bar: { width: '200px' } } }` --> `--fooBarWidth`
     */
    name: string,
    /**
     * Optionally provide whether the name provided has already been formatted as `--varName` so we do not
     * need to check and format if needed.  If this is false or undefined the string will be checked and
     * formatted if necessary.
     */
    isNameFormatted?: boolean,
  ) => boolean;

  /**
   * Resets all variables in the nearest context to their initial values.
   * If `removeNewKeys` is set to `true` then any newly added values will also be removed
   */
  resetAllNearestStyleVarsToInitial(
    /**
     * Remove newly added keys while resetting the variable values? Defaults to `false`.
     */
    removeNewKeys?: boolean,
  ): void;

  /**
   * Resets all style vars in the root context to their initial values.
   * If `removeNewKeys` is set to `true` then any newly added values will also be removed
   */
  resetAllRootStyleVarsToInitial(
    /**
     * Remove newly added keys while resetting the variable values? Defaults to `false`.
     */
    removeNewKeys?: boolean,
  ): void;

  /**
   * Resets all style vars from the nearest context up to root to their initial values.
   * This only iterates ancestors of the current context and does not iterate siblings.
   * If `removeNewKeys` is set to `true` then any newly added values will also be removed.
   */
  resetAllStyleVarsToInitial(
    /**
     * Remove newly added keys while resetting the variable values? Defaults to `false`.
     */
    removeNewKeys?: boolean,
  ): void;
};
