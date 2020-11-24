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

## Simple Usage

```js
const rawtherapee = require("rawtherapee");

rawtherapee("/somewhere/something.NEF").then((files) => {
  // `files` is an array containing all processed file paths.
  console.log(files.length, "files processed.");
});
```

### Options

| option | format | values | default |
|!===|===|===|===|
| replace | _boolean_ | | |


#### `replace`

*default: `false`*  

Replace the existing output file.


#### `allFormats`

*default: `false`*


#### `presets`

*default: `['default']`*

'sidecar', 'sidecar-strict', '<uri>'  


#### `ignoreBadPreset`

*default: `false`*  

If set to `false`, any non-existing preset file passed to the `presets` parameter will throw an error.  
If set to `true`, those files will be ignored (not passed to `rawtherapi-cli`) and print message in `sterr` if the `DEBUG` environment variable is set to any value.

#### `output`

*default: `'/tmp/img'`*



#### `format`

*default: `'jpg'`*

`'jpg'`, `'png'` or `'tiff'`


#### `depth`

*default: `8`*

`16`, `16f` or `32`  
Only for TIFF and PNG output formats.


#### `compression`

*default: `92`*

Only for JPG output formats (PNG compression is hardcoded at 6 in `rawtherapi-cli`)


#### `subSampling`

 _string_ or _int_
 
*default:`'4:2:2'`*

`1`, `'4:2:0'`, `2`, `'4:4:4'`, `3`  


#### `zip`

_boolean_ 

*default: `false`*

Only for TIFF output format.


#### `onChange`

_function_ 
*default: `() => {}`*

Callback _function_ fired every time the status is updated (not based on `EventListener`) :

Return a simple object who always contains `status` entry, and maybe `file` or `code`.


