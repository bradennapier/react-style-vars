import { getWindow } from './browser';

export function supportsRegisterProperty() {
  return typeof getWindow()?.CSS?.registerProperty === 'function';
}

export const REGISTER_PROPERTY = Symbol('REGISTER_PROPERTY_OBJECT');

const REGISTERED_PROPERTIES = new Set();

/**
 * A custom {@link https://drafts.css-houdini.org/css-properties-values-api/#idl-index CSSPropertyRule} which
 * does not include a name as that will be computed by the flattening process.
 */
export type RegisterPropertyConfig = {
  /**
   * Do not provide a name for the property as we computer this at runtime.
   */
  name?: void;
  /**
   * A DOMString representing the expected syntax of the defined
   * property.
   *
   * defaults to `*`.
   *
   * @see https://drafts.css-houdini.org/css-properties-values-api/#supported-names
   */
  syntax?: string;
  /**
   * A boolean value defining whether the defined property should be
   * inherited (`true`), or not (`false`).
   *
   * defaults to `false`.
   */
  inherits?: boolean;
  /**
   * The initial value the property should be set to.  If not set we only register the property
   * at the given point and do not set its value.  Be careful with this value, you probably want
   * the `value` instead.  This will set the value that is used if a given value does not match
   * syntax, which can not be changed later.
   *
   * @see {@link https://drafts.css-houdini.org/css-properties-values-api/#dom-csspropertyrule-initialvalue registerProperty.initialValue}
   */
  initialValue?: string;
  /**
   * `initialValue` sets the value upon which the {@link https://developer.mozilla.org/en-US/docs/Web/API/CSS/RegisterProperty CSS.registerProperty} call
   * will use.  If provided, and value is not - it will also set the variable to that value so it is seen in the inspector.
   *
   * If value is provided and initialValue is provided, both will be used.  `initialValue` will be given to `registerProperty` but the
   * value of the variable will be changed to the given value.
   */
  value?: string;
};

export type RegisterPropertyConfigBranded = Readonly<RegisterPropertyConfig> & {
  [REGISTER_PROPERTY]: true;
};

export function registerPropertyIfPossible(
  name: string,
  config: RegisterPropertyConfigBranded,
) {
  // not technically needed since we strip the obj at parse time, but redundancy is nice.
  const wasRegistered = REGISTERED_PROPERTIES.has(name);
  if (!supportsRegisterProperty() || wasRegistered) {
    if (process.env.NODE_ENV !== 'production' && wasRegistered) {
      console.debug(
        `[react-style-vars]: Property ${name} is already registered, skipping registration`,
      );
    }
    return;
  }
  try {
    getWindow()?.CSS.registerProperty({
      name,
      syntax: config.syntax,
      inherits: config.inherits ?? false,
      initialValue: config.initialValue,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      if (error instanceof Error && error.name === 'InvalidModificationError') {
        console.debug(
          `[react-style-vars]: Property ${name} is already registered, skipping registration`,
        );
      } else {
        console.warn(
          `Failed to register property: ${name} due to an error: `,
          error,
        );
      }
    }
  }
}

export function isRegisterPropertyConfig(
  config: any,
): config is RegisterPropertyConfigBranded {
  return !!config?.[REGISTER_PROPERTY];
}

/**
 * Tags the object as a {@link https://developer.mozilla.org/en-US/docs/Web/API/CSS_Properties_and_Values_API/guide#css.registerproperty CSS.registerProperty}
 * config so that we can automatically register a property for the given value and the parser knows not to attempt to flatten
 * the config.
 *
 * - If the browser does not support the register property, its initialValue is used by default without registering.
 * - Properties will not be registered a second time no matter how many times this value is encountered in parsing.
 */
export function RegisterProperty(
  config: RegisterPropertyConfig,
): RegisterPropertyConfigBranded | string | null {
  if (!supportsRegisterProperty()) {
    // eslint-disable-next-line react/destructuring-assignment
    return config.value ?? config.initialValue ?? null;
  }

  return Object.freeze({
    [REGISTER_PROPERTY]: true,
    ...config,
  } as const);
}
