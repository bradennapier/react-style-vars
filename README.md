<div align="center">
  <h1>
    <br/>
    <br/>
    <p align="center">
      <img src="docs/img/style.png" width="400" title="react-style-vars">
    </p>
    <br />
    react-style-vars
    <br />
    <br />
    <br />
    <br />
  </h1>
  <sup>
    <br />
    <br />
    <a href="https://www.npmjs.com/package/react-style-vars">
       <img src="https://img.shields.io/npm/v/react-style-vars.svg" alt="npm package" />
    </a>
    <!-- TODO
     <a href="https://www.npmjs.com/package/react-style-vars">
      <img src="https://img.shields.io/npm/dm/react-style-vars.svg" alt="npm downloads" />
    </a>
    -->
    <!-- TODO
    <a href="http://bradennapier.github.io/react-style-vars">
      <img src="https://img.shields.io/badge/demos-🚀-yellow.svg" alt="demos" />
    </a>
    -->
    <br />
    Performant & powerful <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties">CSS custom property</a> helpers & <a href="https://reactjs.org/docs/hooks-intro.html">React hooks</a> built with <a href="https://www.typescriptlang.org/index.html">Typescript</a>
  </sup>
  <br />
  <br />
  <br />
  <br />
  <pre>yarn add <a href="https://www.npmjs.com/package/react-style-vars">react-style-vars</a></pre>
  <br />
  <br />
  <br />
  <br />
  <br />
</div>

## Simple Example

Below we render a simple static set of variables into the dom which is set a div wrapper which is set with the `display: contents` style so it should not affect any other styles that may wrap it.  These will not change at any point due to how it is configured.  It is the most performant method of rendering variables at the given component tree.

```tsx
import React from 'react';
import VariableProvider from 'react-style-vars';

const theme = {
  textSmall: '12px',
  textLarge: '16px',
  colorBlue: 'steelblue'
}

function App() {
  return (
    <VariableProvider defaultStyleVars={theme}>
      <div style={{ color: 'var(--colorBlue)', fontSize: 'var(--textSmall)' }}>
        Hello
      </div>
    </VariableProvider>
  )
}
```

> There are multiple ways to handle dynamic style variables depending on your specific needs.

> Using the `setOnRoot` prop, we can instead tell variable provider to render no wrapper at all and instead set all the variables on the `html` element. This may be useful if the vars need to be used on higher level elements like `body` or `html`.

## Props

```typescript
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
  children: React.ReactNode;
};
```

> You must provide either `defaultStyleVars` or `styleVars` as well as `children`

## Hooks

When using the context to change variable values, we can use the `useStyleVars` hooks to get our context.  Our context operates in a cascading manner by default, which mirrors CSS' default behavior.  This means that if we have 2 Providers as parents to the component using the hook and set a variable that is provided by both, the variable will be changed on the provider closest to us.

### Type Signature

```typescript
import { useStyleVars, CSSVariableContext } from 'react-style-vars';

const styles: CSSVariableContext<{ [key: string]: any }> = useStyleVars()

// or if you have a type which gives the variable values directly and want stronger typing

type MyVars = {
  [key: string]: any
}

const styles: CSSVariableContext<MyVars> = useStyleVars<MyVars>()
```

### Example Usage

```tsx
import React, { useLayoutEffect } from 'react';
import VariableProvider, { useStyleVars } from 'react-style-vars';

const textByViewSize = {
  small: '12px',
  medium: '14px',
  large: '16px',
}

function MyComponent() {
  // small or medium or large
  const isViewSize = useIsViewSize();
  const styles = useStyleVars();

  useLayoutEffect(() => {
    styles.setStyleVar('myComponentTextSize', textByViewSize[isViewSize])
  }, [isViewSize])

  return (
    <div style={{ fontSize: 'var(--myComponentTextSize)' }}>
      Hello
    </div>
  )
}

function App() {
  return (
    <VariableProvider defaultStyleVars={{ myComponentTextSize: '14px' }} setOnRoot>
      <MyComponent />
    </VariableProvider>
  )
}
```

## Resources

- [[caniuse] CSS Custom Property browser support table](https://caniuse.com/#search=custom%20properties)
- [[CSS Tricks] Updating a CSS Variable with Javascript](https://css-tricks.com/updating-a-css-variable-with-javascript/)
- [[CSS Tricks] Making Custom Properties (CSS Variables) More Dynamic](https://css-tricks.com/making-custom-properties-css-variables-dynamic/)
- [[CSS Tricks] Breaking CSS Custom Properties out of :root Might Be a Good Idea](https://css-tricks.com/breaking-css-custom-properties-out-of-root-might-be-a-good-idea/)
