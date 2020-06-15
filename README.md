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

## Features

- Easily handle cascading CSS Variables with rendering and setting at any level in the Component tree.
- Efficiently get, set, or merge multiple variables without requiring react components to re-render.
-

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

> `setOnRoot` may only be defined on the top-level VariableProvider

## More Examples

<details>
<summary>Set variables on prop changes (styleVars prop)</summary>

When we just have a simple use case and want the variables to be set whenever the `styleVars` change we can use the `styleVars` prop instead of `defaultStyleVars` and our component will watch and update.

> Since we set `setOnRoot` our children will not be wrapped in a `div` at all.

```tsx
import React, { useLayoutEffect } from 'react';
import VariableProvider, { useStyleVars } from 'react-style-vars';

const textByViewSize = {
  small: '12px',
  medium: '14px',
  large: '16px',
}

function App() {
  const isViewSize = useIsViewSize();

  const vars = React.useMemo(() => ({
    myComponentTextSize: textByViewSize[isViewSize]
  }), [isViewSize])

  return (
    <VariableProvider styleVars={vars} setOnRoot>
      <div style={{ fontSize: 'var(--myComponentTextSize)' }}>
        Hello
      </div>
    </VariableProvider>
  )
}
```

</details>

<details>
<summary>useStyleVars hook & context</summary>

When using the context to change variable values, we can use the `useStyleVars` hooks to get our context.  Our context operates in a cascading manner by default, which mirrors CSS' default behavior.  This means that if we have 2 Providers as parents to the component using the hook and set a variable that is provided by both, the variable will be changed on the provider closest to us.

> While the hooks provide the most control and most performant method for dynamically setting our variables, it is far less verbose to use the `styleVars` prop.  See the example below.

> You can view the complete definition for `CSSVariableContext` [here](https://github.com/bradennapier/react-style-vars/blob/master/src/utils/types.ts#L50)

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
</details>

<details>
<summary>60fps transitions with requestAnimationFrame</summary>

This ends up transitioning on `grid-template-columns` to provide for an animated sidebar menu which pops in and out when controlled manually or by hover.

> This example currently has a lot of implementation-specific details.  Need to simplify it down to remove that.

```js
import React, { ReactChild } from 'react';
import { Link } from '@reach/router';

import styled from '@emotion/styled';

import config from 'config';
import VariableProvider from 'react-style-vars';
import { useStateModules } from 'shared/hooks/useStateModules';
import { useGlobalStyleVars } from 'shared/hooks/useGlobalStyleVars';
import { Selectors, StateActions } from 'shared/store/types';

const Wrapper = styled.div`
  grid-area: menu;
  overflow: hidden;
  background: var(--backgroundBodyPrimary);
  color: var(--textBodyPrimary);
  border-right: var(--borderLight);
  width: var(--elementSidebarWidth);
  a {
    color: var(--textBodySecondary);
    flex: 1;
    display: flex;
    align-items: center;
    height: 100%;
    text-indent: 10px;
  }
`;

const ResourcesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  transform: var(--resourceWrapperTransform);
  transition: transform 1s ease;
`;

const ResourceWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: var(--resourceWrapperWidth);

  overflow: hidden;
  white-space: nowrap;
  height: 40px;
  min-height: 40px;
  flex: 1;
  align-items: center;
  cursor: pointer;
  border-bottom: var(--borderLight);

  position: relative;
  z-index: 1;

  & > :before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    background-color: rgba(255, 255, 255, 0.3);
    transition: opacity 1s ease;
  }

  & > :hover {
    :before {
      opacity: 1;
    }
  }
`;

const IconWrapper = styled.div`
  > div {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    :first-of-type {
      max-width: 50px;
    }
  }
  display: flex;
  max-width: 150px;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

function setMenuState(
  styleVars: ReturnType<typeof useGlobalStyleVars>,
  defaultWidth: number,
  state: any,
  onComplete: any,
) {
  const val = styleVars.getStyleVar('--elementSidebarWidth');
  if (!val) {
    throw new Error('[ERROR] | Menu | Unknown value for elementSidebarWidth');
  }
  let currentFrame: number;

  let n =
    typeof val === 'string' ? Number(val.substr(0, val.indexOf('p'))) : val;

  const animate = () => {
    if (state.shouldBeOpened) {
      if (n === defaultWidth) {
        cancelAnimationFrame(currentFrame);
        onComplete();
        return;
      }
      n += 10;
      if (n >= defaultWidth) {
        n = defaultWidth;
      }
    } else {
      if (n <= 50) {
        cancelAnimationFrame(currentFrame);
        onComplete();
        return;
      }
      n -= 10;
    }
    styleVars.setNearestDefinedStyleVar('--elementSidebarWidth', `${n}px`);
    currentFrame = requestAnimationFrame(animate);
  };

  if (state.isInitialRender) {
    onComplete();

    if (state.isOpened) {
      styleVars.setNearestDefinedStyleVar(
        '--elementSidebarWidth',
        `${defaultWidth}px`,
      );
    } else {
      styleVars.setNearestDefinedStyleVar('--elementSidebarWidth', `50px`);
    }
  } else {
    currentFrame = requestAnimationFrame(animate);
  }

  return () => {
    cancelAnimationFrame(currentFrame);
  };
}

function Resource({
  children,
  to,
  idx,
}: {
  to: string;
  idx: number;
  children: ReactChild;
}) {
  return (
    <ResourceWrapper>
      <IconWrapper>
        <div>{idx}</div>
        <div />
      </IconWrapper>
      <Link
        to={to}
        getProps={(props) => {
          let isCurrent: boolean = props.isPartiallyCurrent;
          const path = props.location.pathname;
          if (path.startsWith('/tokens')) {
            if (path === '/tokens/quote' && to === '/tokens/quote') {
              isCurrent = true;
            } else if (path === '/tokens/quote') {
              isCurrent = false;
            }
          }
          // the object returned here is passed to the
          // anchor element's props
          return {
            style: isCurrent
              ? {
                  color: 'steelblue',
                  fontWeight: 'bold',
                }
              : undefined,
          };
        }}
      >
        {children}
      </Link>
    </ResourceWrapper>
  );
}

function useTimedSidebarHover(
  isOpened: boolean,
  isToggleLocked: boolean,
  setMenu: StateActions['setMenu'],
) {
  const timerRef = React.useRef<number>();

  const onMouseEnter = React.useCallback(() => {
    clearTimeout(timerRef.current);
    if (!isOpened) {
      timerRef.current = window.setTimeout(() => setMenu(true), 200);
      return () => clearTimeout(timerRef.current);
    }
  }, [timerRef, isOpened, setMenu]);

  const onMouseLeave = React.useCallback(() => {
    clearTimeout(timerRef.current);
    if (isOpened && !isToggleLocked) {
      clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setMenu(false), 1000);
      return () => clearTimeout(timerRef.current);
    }
  }, [isOpened, isToggleLocked, setMenu]);

  return { onMouseEnter, onMouseLeave };
}

export default React.memo(function Menu() {
  const styles = useGlobalStyleVars();

  const sidebarWidth: string = React.useMemo(
    () =>
      styles.getNearestDefinedDefaultStyleVar<string>('elementSidebarWidth'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const defaultWidthN = React.useMemo(
    () => Number(sidebarWidth.substr(0, sidebarWidth.indexOf('p'))),
    [sidebarWidth],
  );

  const getState = React.useCallback(
    (selectors: Selectors) => ({
      isOpened: selectors.menuIsOpened,
      menuState: selectors.menuController,
    }),
    [],
  );

  const getActions = React.useCallback(
    (actions: StateActions) => ({
      setMovingComplete: actions.setMovingComplete,
      setMenu: actions.setMenu,
    }),
    [],
  );

  const {
    state: { menuState },
    actions,
  } = useStateModules(getState, getActions);

  const { onMouseEnter, onMouseLeave } = useTimedSidebarHover(
    menuState.shouldBeOpened,
    menuState.isToggleLocked,
    actions.setMenu,
  );

  React.useEffect(() => {
    if (
      menuState.isInitialRender ||
      menuState.isOpened !== menuState.shouldBeOpened ||
      menuState.isMoving
    ) {
      return setMenuState(
        styles,
        defaultWidthN,
        menuState,
        actions.setMovingComplete,
      );
    }
  }, [styles, menuState, actions.setMovingComplete, defaultWidthN]);

  const localStyleVars = React.useMemo(
    () => ({
      resourceWrapperTransform: menuState.shouldBeOpened
        ? 'translateX(-145px)'
        : 'translateX(0)',
      resourceWrapperWidth: `calc(${sidebarWidth} + 150px)`,
    }),
    [menuState.shouldBeOpened, sidebarWidth],
  );

  return (
    <VariableProvider styleVars={localStyleVars}>
      <Wrapper onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <ResourcesWrapper>
          {config.resources.map(([resource, { home }], idx) => (
            <Resource to={home} key={resource} idx={idx}>
              {resource}
            </Resource>
          ))}
        </ResourcesWrapper>
      </Wrapper>
    </VariableProvider>
  );
});



```
</details>

## Resources

- [[caniuse] CSS Custom Property browser support table](https://caniuse.com/#search=custom%20properties)
- [[CSS Tricks] Updating a CSS Variable with Javascript](https://css-tricks.com/updating-a-css-variable-with-javascript/)
- [[CSS Tricks] Making Custom Properties (CSS Variables) More Dynamic](https://css-tricks.com/making-custom-properties-css-variables-dynamic/)
- [[CSS Tricks] Breaking CSS Custom Properties out of :root Might Be a Good Idea](https://css-tricks.com/breaking-css-custom-properties-out-of-root-might-be-a-good-idea/)
