'use strict';

var path = require('path');
var generate = require('markdown-it-testgen');

describe('markdown-it-imsize', function() {
  var md = require('markdown-it')({
    html: true,
    linkify: true,
    typography: true
  }).use(require('../'));
  generate(path.join(__dirname, 'fixtures/markdown-it-imsize/imsize.txt'), md);
});

describe('markdown-it-imsize (autofill)', function() {
  var md = require('markdown-it')({
    html: true,
    linkify: true,
    typography: true
  }).use(require('../'), { autofill: true });
  generate(path.join(__dirname, 'fixtures/markdown-it-imsize/autofill.txt'), md);
});
