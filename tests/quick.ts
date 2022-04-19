// For quick testing and running of typescript snippets
import { createFlattenedStyleVarObject } from '../src/utils/helpers';

async function run() {
  console.log(
    createFlattenedStyleVarObject({
      color: {
        primary: {
          main: 'black',
        },
      },
    }),
  );
}

run();
