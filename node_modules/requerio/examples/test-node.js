'use strict'; // eslint-disable-line strict

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');
const Redux = global.Redux = require('redux');
const Requerio = require(path.join(__dirname, '..', 'dist', 'requerio.npm.js'));

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const $ = global.$ = cheerio.load(html);

const $organisms = {
  'window': null,
  'html': null,
  'body': null,
  '#main': null,
  '.main__section--0': null,
  '.main__section--1': null
};

function behaviorsGet(requerio) {
  return {
    mainHide: () => {
      requerio.$orgs['.main__section--1'].dispatchAction('css', {display: 'none'});
    },

    mainShow: () => {
      requerio.$orgs['.main__section--1'].dispatchAction('css', {display: 'block'});
    }
  };
}

const requerio = new Requerio($, Redux, $organisms);
requerio.init();
const behaviors = behaviorsGet(requerio);

/* Test */

behaviors.mainHide();
const hiddenDisplayStyle = requerio.$orgs['.main__section--1'].getState().style.display;
assert.equal(hiddenDisplayStyle, 'none');

behaviors.mainShow();
const shownDisplayStyle = requerio.$orgs['.main__section--1'].getState().style.display;
assert.equal(shownDisplayStyle, 'block');

console.log('Tests passed'); // eslint-disable-line no-console
