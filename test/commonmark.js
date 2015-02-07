'use strict';


var path = require('path');


var generate = require('markdown-it-testgen');


describe('CommonMark', function () {
  var md = require('markdown-it')('commonmark').use(require('../'));

  generate(path.join(__dirname, 'fixtures/commonmark/good.txt'), md);
});
