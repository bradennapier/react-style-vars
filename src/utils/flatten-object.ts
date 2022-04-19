import {
  isRegisterPropertyConfig,
  registerPropertyIfPossible,
} from './registerProperty';

/**
 * Takes an object and reduces it so that it is a flat object of its keys
 * { one: { two: 'three' } } --> { oneTwo: 'three' }
 */
export default function flattenObject(
  value: Record<string, any>,
  separator = '',
  toTitleCase = true,
  prefix = '',
  i = 0,
  accum: Record<string, any> = {},
): Record<string, string | number> {
  return Object.keys(value).reduce((p, c) => {
    let key: string;
    if (toTitleCase && i !== 0) {
      key = `${separator}${c.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1),
      )}`;
    } else {
      key = i !== 0 ? `${separator}${c}` : c;
    }
    if (value[c] !== undefined && value[c] !== null) {
      const parsedValue = value[c];
      const isParsedValueRegisterPropertyConfig = isRegisterPropertyConfig(
        parsedValue,
      );
      if (
        typeof value[c] === 'object' &&
        !isParsedValueRegisterPropertyConfig
      ) {
        flattenObject(
          value[c],
          separator,
          toTitleCase,
          `${prefix}${key}`,
          i + 1,
          p,
        );
      } else {
        key = prefix ? `${prefix}${key}` : key;
        if (Object.prototype.hasOwnProperty.call(p, key)) {
          throw new Error(`flattenVars failed due to key conflict with ${key}`);
        }

        let valueToUse = parsedValue;

        if (isParsedValueRegisterPropertyConfig) {
          // register property if possible, do not continue parsing object.
          valueToUse = parsedValue.initialValue;
          registerPropertyIfPossible(key, parsedValue);
        }

        if (valueToUse) {
          // eslint-disable-next-line no-param-reassign
          p[key] = valueToUse;
        }
      }
    }

    return p;
  }, accum);
}
