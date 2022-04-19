import { getWindow } from './browser';

export function supportsRegisterProperty() {
  return typeof getWindow()?.CSS?.registerProperty === 'function';
}

export const REGISTER_PROPERTY = Symbol('REGISTER_PROPERTY_OBJECT');

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
   * at the given point and do not set its value.
   */
  initialValue?: string;
};

export type RegisterPropertyConfigBranded = RegisterPropertyConfig & {
  [REGISTER_PROPERTY]: true;
};

export function registerPropertyIfPossible(
  name: string,
  config: RegisterPropertyConfigBranded,
) {
  if (!supportsRegisterProperty()) {
    return;
  }
  try {
    CSS.registerProperty({
      inherits: false,
      ...config,
      name,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Failed to register property: ${name} due to an error: `,
        error,
      );
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
 * If the browser does not support the register property, its initialValue is used by default without registering.
 */
export function RegisterProperty(
  config: RegisterPropertyConfig,
): RegisterPropertyConfigBranded | string | null {
  if (!supportsRegisterProperty()) {
    // eslint-disable-next-line react/destructuring-assignment
    return config.initialValue || null;
  }

  return {
    [REGISTER_PROPERTY]: true,
    ...config,
  } as const;
}
