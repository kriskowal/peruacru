'use strict';

var Document = require('gutentag/document');
var Scope = require('gutentag/scope');
var Animator = require('blick');
var Main = require('./main.html');

window.document.addEventListener('touchmove', function (event) {
    event.preventDefault();
}, {passive: false});

var document = new Document(window.document.body);
var scope = new Scope();
scope.animator = new Animator();
scope.main = new Main(document.documentElement, scope);
