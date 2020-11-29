# node-rawtherapee

Simple wrapper for **rawtherapee-cli** with Promises

**Warning**: `rawtherapee-cli` use all available core in your system to process images. Running multiple instances at the same time may bloat your server. It's recomanded to use a task manager and process them one-by-one.

## Dependencies

**Rawtherapee** must be installed in the host system and `rawtherapee-cli` must be directly executable from the command-line.

## Installaton

### With **npm**:

```bash
npm i --save rawtherapee
```

### With **yarn**

```bash
yarn add rawtherapee
```

## Usage

_Promise_ = rawtherapee(_url_ | _array_ `targets` [, _object_ `options`])

 * `targets`: files or directories  
 * `options`: simple options _Object_ 

### Options

#### `replace`

*default: `false`*  

Replace the existing output file.


#### `allFormats`

*default: `false`*

Process all raw and non raw formats, igroring GUI parameters.  


#### `presets`

*default: `['default']`*

An array of pp3 presets files.

Possible opions: 

 * `'default'`: use the default preset selected in GUI.  
 * `'sidecar'`: use the sidecar file of each image if available  
 * `'sidecar-strict'`: like `'sidecar`, but return an error if there is no sidecar.
 * `<uri>`: any pp3 file in your system

`rawtherapee-cli` always use the neutral presets as base, then apply presets in the order you passed it.


#### `ignoreBadPreset`

*default: `false`*  

If set to `false`, any non-existing preset file passed to the `presets` parameter will throw an error.  
If set to `true`, those files will be ignored (not passed to `rawtherapi-cli`) and print message in `sterr` if the `DEBUG` environment variable is set to any value.


#### `output`

*default: `'.'`*

File or directory where the processed files will be stored (directory must exists).


#### `format`

*default: `'jpg'`*

Possibles options:  

`'jpg'`, `'png'` or `'tiff'`


#### `depth`

*default: `8`*

Color depth of the output file. Only for TIFF and PNG formats.

Possibles options:  

`8` or `16`  


#### `compression`

*default: `90`*

Only for JPG output formats (PNG compression is hardcoded at 6 in `rawtherapi-cli`)


#### `subSampling`

 _string_ or _int_
 
*default:`2`*

Possibles options:  

 * `'4:2:2'` or `1`
 * `'4:2:0'` or `2`
 * `'4:4:4'` or `3`  


#### `zip`

_boolean_ 

*default: `false`*

Use TIFF zip compression.


#### `onChange`

_function_ 
*default: `() => {}`*

Callback _function_ fired every time the status is updated (not using `EventListeners`) :

Return a simple object who always contains `status`, and maybe `file` or `code`.

Status can be :

 * `start`: start running `rawtherapee-cli`.  
 * `skipped`: skip ignored `file` in a full directory process.  
 * `processing`: start processing `file`.
 * `complete`: processing `file` completed.
 * `idle`: `rawtherapee-cli` stop with `code` code.


### Examples

```js
const rawtherapee = require('rawtherapee')

rawtherapee('/somewhere/something.NEF')
  .then((files) => {
    console.log(files.length, 'files processed.')
  })
```


```js
const fs = require('fs')
const rawtherapee = require('rawtherapee')

const output = '/tmp/img'

if (!fs.existsSync(output)) fs.mkdirSync(output)

const onChange = (state) => {
  switch (state.status) {
    case 'complete':
      console.log(state.file, 'process done.')
      break
    case 'skipped':
      console.log(state.file, 'have been ignored.')
      break
    default:
      console.log('Event', state.status, 'fired.', state)
  }
}

rawtherapee([
  '/somewhere/something.NEF',
  '/somewhereelse/somethingelse.NEF'
], {
  onChange,
  output,
  format: 'tiff',
  depth: 16,
  zip: true,
  preset: ['sidecar']
})
  .then((files) => console.log(files.length, 'files processed.'))
```
