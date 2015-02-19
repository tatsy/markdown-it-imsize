# markdown-it-imsize

[![Build Status](https://travis-ci.org/tatsy/markdown-it-imsize.svg?branch=master)](https://travis-ci.org/tatsy/markdown-it-imsize)
[![NPM version](https://img.shields.io/npm/v/markdown-it-imsize.svg?style=flat)](https://www.npmjs.org/package/markdown-it-imsize)
[![Coverage Status](https://coveralls.io/repos/tatsy/markdown-it-imsize/badge.svg)](https://coveralls.io/r/tatsy/markdown-it-imsize)

> A markdown-it plugin for size-specified image markups. This plugin overloads original image renderer of markdown-it.

## Usage

#### Enable plugin

```js
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typography: true
}).use(require('markdown-it-imsize')); // <-- this use(package_name) is required
```

#### Example

```md
![test](image.png =100x200)
```

is interpreted as

```html
<p><img src="image.png" alt="test" width="100" height="200"></p>
```

## Options

#### Auto fill

```js
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typography: true
}).use(require('markdown-it-imsize'), { autofill: true });
```

will fill the width and height fields automatically if the specified image path is valid. 

Therefore,

```js
![test](image.png)
```

is interpreted as

```html
<p><img src="image.png" alt="test" width="200" height="200"></p>
```

where ```image.png``` is a valid path and its size is 200 x 200.

## Use with RequireJS

```markdown-it-imsize``` is available with bower and RequireJS. First, you can install the package with,

```shell
bower install markdown-it-imsize
```

Script for using ```markdown-it-imsize``` with RequireJS is as follows.

```js
require(['require', 'MarkdownIt', 'MarkdownItImsize'], function(require) {
  var md = require('MarkdownIt')({
    html: true,
    linkify: true,
    typography: true
  }).use(require('MarkdownItImsize'));

  var rendered = md.render("![test](test.jpg =100x)");
  console.log(rendered);
  document.getElementById('image-box').innerHTML = rendered;
});
```
