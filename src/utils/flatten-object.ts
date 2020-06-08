/**
 * Takes an object and reduces it so that it is a flat object of its keys
 * { one: { two: 'three' } } --> { oneTwo: 'three' }
 */
export default function flattenObject(
  value: Record<string, any>,
  toTitleCase = true,
  prefix = '',
  i = 0,
  accum: Record<string, any> = {},
): Record<string, string | number> {
  return Object.keys(value).reduce((p, c) => {
    let key: string;
    if (toTitleCase && i !== 0) {
      key = c.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1),
      );
    } else {
      key = c;
    }
    if (value[c] !== undefined && value[c] !== null) {
      if (typeof value[c] === 'object') {
        flattenObject(value[c], toTitleCase, `${prefix}${key}`, i + 1, p);
      } else {
        key = prefix ? `${prefix}${key}` : key;
        if (Object.prototype.hasOwnProperty.call(p, key)) {
          throw new Error(`flattenVars failed due to key conflict with ${key}`);
        }

        // eslint-disable-next-line no-param-reassign
        p[key] = value[c];
      }
    }

    return p;
  }, accum);
}
