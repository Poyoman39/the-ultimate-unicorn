
# the-ultimate-unicorn (multi-progress was already taken)

The ultimate unicorn intend (like [multi-progress](https://www.npmjs.com/package/multi-progress)) to add a layer on top of the [progress](https://www.npmjs.com/package/progress) API to allow multiple progress bars.

API and implementation differs a bit.

## Quick start

```
npm i the-ultimate-unicorn
```
```
const ProgressBar = require('the-ultimate-unicorn');

// ...

const progressBar = new ProgressBar({ title: 'Potatoes', total: 142 });

const intervalId = setInterval(() => {
  progressBar.tick();

  if (progressBar.isComplete) {
    clearInterval(intervalId);
  }
}, 100);
```

## Doc

Api is very similar to the [progress](https://www.npmjs.com/package/progress) one. With subtile differences.

---
### new ProgressBar(options?)
Create a  new progressBar

 - **options.total** *(default: 100)* ***int***: Total tick to consider the progressBar complete
 - **options.title** *(default: '')* ***string***: Title of the progressBar
 - **options.current** *(default 0)* ***int***: Initial progressBar ticks
 - **options.chars** *(default `{ complete: '=', incomplete: '-' }`)* ***object***: Characters use to draw the progressBar
 - **options.format** *(default ':title [:bar] :etas')* ***string***: Template string used to draw the progressBar

---
### progressBar.tick()
Add a tick to a ProgressBar instance

---
### *Static properties*
 - **ProgressBar.renderThrottle** *(default 16)* ***int***: Minimum period beteween 2 progressBar render
*(default: 16)*
- **ProgressBar.stream** *(default  process.stderr)* ***stream***: Output stream

