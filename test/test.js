'use strict';

var assert = require('assert');
var path = require('path');
var generate = require('markdown-it-testgen');

describe('markdown-it-imsize', function() {
  var md = require('markdown-it')({
    html: true,
    linkify: true,
    typography: true
  }).use(require('../lib'));
  generate(path.join(__dirname, 'fixtures/markdown-it-imsize/imsize.txt'), md);
});

describe('markdown-it-imsize (autofill)', function() {
  var md = require('markdown-it')({
    html: true,
    linkify: true,
    typography: true
  }).use(require('../lib'), { autofill: true });
  generate(path.join(__dirname, 'fixtures/markdown-it-imsize/autofill.txt'), md);
});

describe('image size detector', function() {
  it('image size detector', function(done) {
    var imsize = require('../lib/imsize');
    var types = require('../lib/imsize/types');
    types.forEach(function(type) {
      var dim = imsize('./test/img/lena.' + type);
      assert.equal(dim.width, 128);
      assert.equal(dim.height, 128);
    });
    done();
  });
});
