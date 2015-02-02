// Process ![test]( x =100x200)
//          ^^^^^^^^ this size specification

'use strict';

var mdit = require('markdown-it')();
var parseImageSize = require('./helpers/parse_image_size');
var normalizeReference = require('./helpers/normalize_reference.js');

function image_with_size(state, silent) {
  var code,
      href,
      label,
      labelEnd,
      labelStart,
      pos,
      ref,
      res,
      title,
      width = '',
      height = '',
      tokens,
      start,
      oldPos = state.pos,
      max = state.posMax;

  if (state.src.charCodeAt(state.pos) !== 0x21/* ! */) { return false; }
  if (state.src.charCodeAt(state.pos + 1) !== 0x5B/* [ */) { return false; }

  labelStart = state.pos + 2;
  labelEnd = mdit.helpers.parseLinkLabel(state, state.pos + 1, false);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) { return false; }

  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {

    //
    // Inline link
    //

    // [link](  <href>  "title"  )
    //    ^^ skipping these spaces
    pos++;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }
    if (pos >= max) { return false; }

    // [link](  <href>  "title"  )
    //      ^^^^^^ parsing link destination
    start = pos;
    res = mdit.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok && state.md.inline.validateLink(res.str)) {
      href = res.str;
      pos = res.pos;
    } else {
      href = '';
    }

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    start = pos;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }

    // [link](  <href>  "title"  )
    //          ^^^^^^^ parsing link title
    res = mdit.helpers.parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //             ^^ skipping these spaces
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (code !== 0x20 && code !== 0x0A) { break; }
      }
    } else {
      title = '';
    }

    // [link](  <href>  "title" =WxH  )
    //              ^^^^ parsing image size
    if (pos - 1 >= 0) {
      code = state.src.charCodeAt(pos - 1);

      // there must be at least one white spaces
      // between previous field and the size
      if (code === 0x20) {
        res = parseImageSize(state.src, pos, state.posMax);
        if (res.ok) {
          width = res.width;
          height = res.height;
          pos = res.pos;

          // [link](  <href>  "title" =WxH  )
          //                ^^ skipping these spaces
          for (; pos < max; pos++) {
            code = state.src.charCodeAt(pos);
            if (code !== 0x20 && code !== 0x0A) { break; }
          }
        }
      }
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
      state.pos = oldPos;
      return false;
    }
    pos++;

  } else {
    //
    // Link reference
    //
    if (typeof state.env.references === 'undefined') { return false; }

    // [foo]  [bar]
    //    ^^ optional whitespace (can include newlines)
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }

    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
      start = pos + 1;
      pos = mdit.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) { label = state.src.slice(labelStart, labelEnd); }

    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;

    var newState = new state.md.inline.State(
      state.src.slice(labelStart, labelEnd),
      state.md,
      state.env,
      tokens = []
    );
    newState.md.inline.tokenize(newState);

    state.push({
      type: 'imsize',
      src: href,
      title: title,
      tokens: tokens,
      level: state.level,
      width: width,
      height: height
    });
  }

  state.pos = pos;
  state.posMax = max;
  return true;
}

function tokenize_imsize(tokens, idx, options, env, self) {
  var src = ' src="' + mdit.utils.escapeHtml(tokens[idx].src) + '"';
  var title = '';
  if (tokens[idx].title) {
    title = ' title="' + mdit.utils.escapeHtml(mdit.utils.replaceEntities(tokens[idx].title)) + '"';
  }
  var alt = ' alt="' + self.renderInlineAsText(tokens[idx].tokens, options, env) + '"';
  var width = tokens[idx].width !== '' ? ' width="' + tokens[idx].width + '"' : '';
  var height = tokens[idx].height !== '' ? ' height="' + tokens[idx].height + '"' : '';
  var size = width + height;
  var suffix = options.xhtmlOut ? ' /' : '';
  return '<img' + src + alt + title + size + suffix + '>';
}

module.exports = function imsize_plugin(md) {
  md.renderer.rules.imsize = tokenize_imsize;
  md.inline.ruler.before('emphasis', 'imsize', image_with_size);
};
