// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace CSS {
  function registerProperty(descriptor: {
    name: string;
    /**
     * example <number> <length> <color> <url> <integer>
     * @see https://drafts.css-houdini.org/css-properties-values-api/#supported-names
     */
    syntax?: string;
    initialValue?: any;
    inherits?: boolean;
  }): any;
}
