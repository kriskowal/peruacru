// @generated
/*eslint semi:[0], no-native-reassign:[0]*/
global = this;
(function (modules) {

    // Bundle allows the run-time to extract already-loaded modules from the
    // boot bundle.
    var bundle = {};
    var main;

    // Unpack module tuples into module objects.
    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        module = modules[i] = new Module(
            module[0],
            module[1],
            module[2],
            module[3],
            module[4]
        );
        bundle[module.filename] = module;
    }

    function Module(id, dirname, basename, dependencies, factory) {
        this.id = id;
        this.dirname = dirname;
        this.filename = dirname + "/" + basename;
        // Dependency map and factory are used to instantiate bundled modules.
        this.dependencies = dependencies;
        this.factory = factory;
    }

    Module.prototype._require = function () {
        var module = this;
        if (module.exports === void 0) {
            module.exports = {};
            var require = function (id) {
                var index = module.dependencies[id];
                var dependency = modules[index];
                if (!dependency)
                    throw new Error("Bundle is missing a dependency: " + id);
                return dependency._require();
            };
            require.main = main;
            module.exports = module.factory(
                require,
                module.exports,
                module,
                module.filename,
                module.dirname
            ) || module.exports;
        }
        return module.exports;
    };

    // Communicate the bundle to all bundled modules
    Module.prototype.modules = bundle;

    return function require(filename) {
        main = bundle[filename];
        main._require();
    }
})([["animator.js","blick","animator.js",{"raf":31},function (require, exports, module, __filename, __dirname){

// blick/animator.js
// -----------------

"use strict";

var defaultRequestAnimation = require("raf");

module.exports = Animator;

function Animator(requestAnimation) {
    var self = this;
    self._requestAnimation = requestAnimation || defaultRequestAnimation;
    self.controllers = [];
    // This thunk is doomed to deoptimization for multiple reasons, but passes
    // off as quickly as possible to the unrolled animation loop.
    self._animate = function () {
        try {
            self.animate(Date.now());
        } catch (error) {
            self.requestAnimation();
            throw error;
        }
    };
}

Animator.prototype.requestAnimation = function () {
    if (!this.requested) {
        this._requestAnimation(this._animate);
    }
    this.requested = true;
};

Animator.prototype.animate = function (now) {
    var node, temp;

    this.requested = false;

    // Measure
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.measure) {
            controller.component.measure(now);
            controller.measure = false;
        }
    }

    // Transition
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        // Unlke others, skipped if draw or redraw are scheduled and left on
        // the schedule for the next animation frame.
        if (controller.transition) {
            if (!controller.draw && !controller.redraw) {
                controller.component.transition(now);
                controller.transition = false;
            } else {
                this.requestAnimation();
            }
        }
    }

    // Animate
    // If any components have animation set, continue animation.
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.animate) {
            controller.component.animate(now);
            this.requestAnimation();
            // Unlike others, not reset implicitly.
        }
    }

    // Draw
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.draw) {
            controller.component.draw(now);
            controller.draw = false;
        }
    }

    // Redraw
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.redraw) {
            controller.component.redraw(now);
            controller.redraw = false;
        }
    }
};

Animator.prototype.add = function (component) {
    var controller = new AnimationController(component, this);
    this.controllers.push(controller);
    return controller;
};

function AnimationController(component, controller) {
    this.component = component;
    this.controller = controller;

    this.measure = false;
    this.transition = false;
    this.animate = false;
    this.draw = false;
    this.redraw = false;
}

AnimationController.prototype.destroy = function () {
};

AnimationController.prototype.requestMeasure = function () {
    if (!this.component.measure) {
        throw new Error("Can't requestMeasure because component does not implement measure");
    }
    this.measure = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelMeasure = function () {
    this.measure = false;
};

AnimationController.prototype.requestTransition = function () {
    if (!this.component.transition) {
        throw new Error("Can't requestTransition because component does not implement transition");
    }
    this.transition = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelTransition = function () {
    this.transition = false;
};

AnimationController.prototype.requestAnimation = function () {
    if (!this.component.animate) {
        throw new Error("Can't requestAnimation because component does not implement animate");
    }
    this.animate = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelAnimation = function () {
    this.animate = false;
};

AnimationController.prototype.requestDraw = function () {
    if (!this.component.draw) {
        throw new Error("Can't requestDraw because component does not implement draw");
    }
    this.draw = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelDraw = function () {
    this.draw = false;
};

AnimationController.prototype.requestRedraw = function () {
    if (!this.component.redraw) {
        throw new Error("Can't requestRedraw because component does not implement redraw");
    }
    this.redraw = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelRedraw = function () {
    this.redraw = false;
};

}],["document.js","gutentag","document.js",{"koerper":10},function (require, exports, module, __filename, __dirname){

// gutentag/document.js
// --------------------

"use strict";
module.exports = require("koerper");

}],["repeat.html","gutentag","repeat.html",{"./repeat":3},function (require, exports, module, __filename, __dirname){

// gutentag/repeat.html
// --------------------

"use strict";
module.exports = (require)("./repeat");

}],["repeat.js","gutentag","repeat.js",{"pop-observe":24,"pop-swap":29},function (require, exports, module, __filename, __dirname){

// gutentag/repeat.js
// ------------------


var O = require("pop-observe");
var swap = require("pop-swap");

var empty = [];

module.exports = Repetition;
function Repetition(body, scope) {
    this.body = body;
    this.scope = scope;
    this.iterations = [];
    this.Iteration = scope.argument.component;
    this.id = scope.id;
    this.observer = null;
    this._value = null;
    this.value = [];
}

Object.defineProperty(Repetition.prototype, "value", {
    get: function () {
        return this._value;
    },
    set: function (value) {
        if (!Array.isArray(value)) {
            throw new Error('Value of repetition must be an array');
        }
        if (this.observer) {
            this.observer.cancel();
            this.handleValueRangeChange(empty, this._value, 0);
        }
        this._value = value;
        this.handleValueRangeChange(this._value, empty, 0);
        this.observer = O.observeRangeChange(this._value, this, "value");
    }
});

Repetition.prototype.handleValueRangeChange = function (plus, minus, index) {
    var body = this.body;
    var document = this.body.ownerDocument;

    for (var offset = index; offset < index + minus.length; offset++) {
        var iteration = this.iterations[offset];
        body.removeChild(iteration.body);
        iteration.value = null;
        iteration.index = null;
        iteration.body = null;
        if (iteration.destroy) {
            iteration.destroy();
        }
    }

    var nextIteration = this.iterations[index];
    var nextSibling = nextIteration && nextIteration.body;

    var add = [];
    for (var offset = 0; offset < plus.length; offset++) {
        var value = plus[offset];
        var iterationNode = document.createBody();
        var iterationScope = this.scope.nestComponents();

        var iteration = new this.Iteration(iterationNode, iterationScope);

        iteration.value = value;
        iteration.index = index + offset;
        iteration.body = iterationNode;

        iterationScope.hookup(this.scope.id + ":iteration", iteration);

        body.insertBefore(iterationNode, nextSibling);
        add.push(iteration);
    }

    swap(this.iterations, index, minus.length, add);

    // Update indexes
    for (var offset = index; offset < this.iterations.length; offset++) {
        this.iterations[offset].index = offset;
    }
};

Repetition.prototype.redraw = function (region) {
    for (var index = 0; index < this.iterations.length; index++) {
        var iteration = this.iterations[index];
        iteration.redraw(region);
    }
};

Repetition.prototype.destroy = function () {
    this.observer.cancel();
    this.handleValuesRangeChange([], this._value, 0);
};


}],["scope.js","gutentag","scope.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/scope.js
// -----------------

"use strict";

module.exports = Scope;
function Scope() {
    this.root = this;
    this.components = Object.create(null);
    this.componentsFor = Object.create(null);
}

Scope.prototype.nest = function () {
    var child = Object.create(this);
    child.parent = this;
    child.caller = this.caller && this.caller.nest();
    return child;
};

Scope.prototype.nestComponents = function () {
    var child = this.nest();
    child.components = Object.create(this.components);
    child.componentsFor = Object.create(this.componentsFor);
    return child;
};

// TODO deprecated
Scope.prototype.set = function (id, component) {
    console.log(new Error().stack);
    this.hookup(id, component);
};

Scope.prototype.hookup = function (id, component) {
    var scope = this;
    scope.components[id] = component;

    if (scope.this.hookup) {
        scope.this.hookup(id, component, scope);
    } else if (scope.this.add) {
        // TODO deprecated
        scope.this.add(component, id, scope);
    }

    var exportId = scope.this.exports && scope.this.exports[id];
    if (exportId) {
        var callerId = scope.caller.id;
        scope.caller.hookup(callerId + ":" + exportId, component);
    }
};

}],["describe.js","kni","describe.js",{},function (require, exports, module, __filename, __dirname){

// kni/describe.js
// ---------------

'use strict';

module.exports = describe;

function describe(node) {
    return types[node.type](node);
}

var types = {};

types.text = function text(node) {
    return node.text;
};

types.echo = function echo(node) {
    return S(node.expression);
};

types.opt = function opt(node) {
    return '(Q ' + node.question.join(' ') + ') (A ' + node.answer.join(' ') + ')';
};

types.goto = function goto(node) {
    return '';
};

types.call = function call(node) {
    return node.branch + '(' + node.args.map(S).join(' ') + ')';
};

types.args = function args(node) {
    return '(' + node.locals.join(' ') + ')';
};

types.jump = function jump(node) {
    return node.branch + ' if ' + S(node.condition);
};

types.switch = function _switch(node) {
    var desc = '';
    if (node.variable) {
        desc += '(' + node.variable + '+' +  node.value + ') ' + S(node.expression);
    } else {
        desc += S(node.expression);
    }
    desc += ' (' + node.branches.join(' ') + ') W(' + node.weights.map(S).join(' ') + ')';
    return desc;
};

types.set = function set(node) {
    return node.variable + ' ' + S(node.expression);
};

types.move = function move(node) {
    return S(node.source) + ' -> ' + S(node.target);
};

types.br = function br(node) {
    return '';
};

types.par = function par(node) {
    return '';
};

types.rule = function rule(node) {
    return '';
};

types.startJoin = function startJoin(node) {
    return '';
};

types.stopJoin = function stopJoin(node) {
    return '';
};

types.delimit = function delimit(node) {
    return '';
};

types.ask = function ask(node) {
    return '';
};

function S(args) {
    if (args[0] === 'val' || args[0] === 'get') {
        return args[1];
    } else if (args[0] === 'var') {
        return '(' + args[0] + ' ' + V(args[1], args[2]) + ')';
    } else {
        return '(' + args[0] + ' ' + args.slice(1).map(S).join(' ') + ')';
    }
}

function V(source, target) {
    var r = '';
    for (var i = 0; i < target.length; i++) {
        r += source[i];
        r += '{' + S(target[i]) + '}';
    }
    r += source[i];
    return r;
}

}],["engine.js","kni","engine.js",{"./story":9,"./evaluate":7,"./describe":5},function (require, exports, module, __filename, __dirname){

// kni/engine.js
// -------------

'use strict';

var Story = require('./story');
var evaluate = require('./evaluate');
var describe = require('./describe');

module.exports = Engine;

var debug = typeof process === 'object' && process.env.DEBUG_ENGINE;

function Engine(args) {
    // istanbul ignore next
    var self = this;
    this.story = args.story;
    this.handler = args.handler;
    this.options = [];
    this.keywords = {};
    this.noOption = null;
    this.global = new Global(this.handler);
    this.top = this.global;
    this.stack = [this.top];
    this.label = '';
    // istanbul ignore next
    var start = args.start || 'start';
    this.instruction = new Story.constructors.goto(start);
    this.render = args.render;
    this.dialog = args.dialog;
    this.dialog.engine = this;
    // istanbul ignore next
    this.randomer = args.randomer || Math;
    this.debug = debug;
    this.waypoint = null;
    Object.seal(this);
}

Engine.prototype.reset = function reset() {
    Engine.call(this, this);
    this.resume();
};

Engine.prototype.continue = function _continue() {
    var _continue;
    do {
        // istanbul ignore if
        if (this.debug) {
            console.log(this.label + ' ' +  this.instruction.type + ' ' + describe(this.instruction));
        }
        // istanbul ignore if
        if (!this['$' + this.instruction.type]) {
            console.error('Unexpected instruction type: ' + this.instruction.type, this.instruction);
            this.resume();
        }
        _continue = this['$' + this.instruction.type](this.instruction);
    } while (_continue);
};

Engine.prototype.goto = function _goto(label) {
    while (label == null && this.stack.length > 1) {
        var top = this.stack.pop();
        if (top.stopOption) {
            this.render.stopOption();
        }
        this.top = this.stack[this.stack.length - 1];
        label = top.next;
    }
    if (label == null) {
        return this.end();
    }
    var next = this.story[label];
    // istanbul ignore if
    if (!next) {
        console.error('Story missing label', label);
        return this.resume();
    }
    // istanbul ignore if
    if (!next) {
        console.error('Story missing instruction for label: ' + label);
        return this.resume();
    }
    if (this.handler && this.handler.goto) {
        this.handler.goto(label, next);
    }
    this.label = label;
    this.instruction = next;
    return true;
};

Engine.prototype.gothrough = function gothrough(sequence, next, stopOption) {
    var prev = this.label;
    for (var i = sequence.length -1; i >= 0; i--) {
        // Note that we pass the top frame as both the parent scope and the
        // caller scope so that the entire sequence has the same variable
        // visibility.
        if (next) {
            this.top = new Frame(this.top, this.top, [], next, prev, stopOption);
            this.stack.push(this.top);
        }
        prev = next;
        next = sequence[i];
        stopOption = false;
    }
    return this.goto(next);
};

Engine.prototype.end = function end() {
    if (this.handler && this.handler.end) {
        this.handler.end(this);
    }
    this.display();
    this.dialog.close();
    return false;
};

Engine.prototype.ask = function ask() {
    if (this.options.length) {
        this.display();
        if (this.handler && this.handler.ask) {
            this.handler.ask(this);
        }
        this.dialog.ask();
    } else if (this.noOption != null) {
        var answer = this.noOption.answer;
        this.flush();
        this.gothrough(answer, null, false);
        this.continue();
    } else {
        return this.goto(this.instruction.next);
    }
};

Engine.prototype.answer = function answer(text) {
    if (this.handler && this.handler.answer) {
        this.handler.answer(text, this);
    }
    this.render.flush();
    var choice = text - 1;
    if (choice >= 0 && choice < this.options.length) {
        return this.choice(this.options[choice]);
    } else if (this.keywords[text]) {
        return this.choice(this.keywords[text]);
    } else {
        this.render.pardon();
        this.ask();
    }
};

Engine.prototype.choice = function _choice(choice) {
    if (this.handler && this.handler.choice) {
        this.handler.choice(choice, this);
    }
    this.render.clear();
    this.waypoint = this.capture(choice.answer);
    if (this.handler && this.handler.waypoint) {
        this.handler.waypoint(this.waypoint, this);
    }
    // There is no known case where gothrough would immediately exit for
    // lack of further instructions, so
    // istanbul ignore else
    if (this.gothrough(choice.answer, null, false)) {
        this.flush();
        this.continue();
    }
};

Engine.prototype.display = function display() {
    this.render.display();
};

Engine.prototype.flush = function flush() {
    this.options.length = 0;
    this.noOption = null;
    this.keywords = {};
};

Engine.prototype.write = function write(text) {
    this.render.write(this.instruction.lift, text, this.instruction.drop);
    return this.goto(this.instruction.next);
};

// istanbul ignore next
Engine.prototype.capture = function capture(answer) {
    var stack = [];
    var top = this.top;
    while (top !== this.global) {
        stack.unshift(top.capture());
        top = top.parent;
    }
    return [
        this.label || "",
        answer,
        stack,
        this.global.capture(),
        [
            this.randomer._state0U,
            this.randomer._state0L,
            this.randomer._state1U,
            this.randomer._state1L
        ]
    ];
};

// istanbul ignore next
Engine.prototype.resume = function resume(state) {
    this.render.clear();
    this.flush();
    this.label = '';
    this.global = new Global(this.handler);
    this.top = this.global;
    this.stack = [this.top];
    if (state == null) {
        if (this.handler && this.handler.waypoint) {
            this.handler.waypoint(null, this);
        }
        this.continue();
        return;
    }

    this.label = state[0];
    var answer = state[1];
    var stack = state[2];
    for (var i = 0; i < stack.length; i++) {
        this.top = Frame.resume(this.top, this.global, stack[i]);
        this.stack.push(this.top);
    }
    var global = state[3];
    var keys = global[0];
    var values = global[1];
    for (var i = 0; i < keys.length; i++) {
        this.global.set(keys[i], values[i]);
    }
    var random = state[4];
    this.randomer._state0U = random[0];
    this.randomer._state0L = random[1];
    this.randomer._state1U = random[2];
    this.randomer._state1L = random[3];
    if (answer == null) {
        this.flush();
        this.continue();
    } else if (this.gothrough(answer, null, false)) {
        this.flush();
        this.continue();
    }
};

// istanbul ignore next
Engine.prototype.log = function log() {
    this.top.log();
    console.log('');
};

// Here begin the instructions

Engine.prototype.$text = function $text() {
    return this.write(this.instruction.text);
};

Engine.prototype.$echo = function $echo() {
    return this.write('' + evaluate(this.top, this.randomer, this.instruction.expression));
};

Engine.prototype.$br = function $br() {
    this.render.break();
    return this.goto(this.instruction.next);
};

Engine.prototype.$par = function $par() {
    this.render.paragraph();
    return this.goto(this.instruction.next);
};

Engine.prototype.$rule = function $rule() {
    // TODO
    this.render.paragraph();
    return this.goto(this.instruction.next);
};

Engine.prototype.$goto = function $goto() {
    return this.goto(this.instruction.next);
};

Engine.prototype.$call = function $call() {
    var procedure = this.story[this.instruction.branch];
    // istanbul ignore if
    if (!procedure) {
        console.error('no such procedure ' + this.instruction.branch, this.instruction);
        return this.resume();
    }
    // istanbul ignore if
    if (procedure.type !== 'args') {
        console.error('Can\'t call non-procedure ' + this.instruction.branch, this.instruction);
        return this.resume();
    }
    // istanbul ignore if
    if (procedure.locals.length !== this.instruction.args.length) {
        console.error('Argument length mismatch for ' + this.instruction.branch, this.instruction, procedure);
        return this.resume();
    }
    // TODO replace this.global with closure scope if scoped procedures become
    // viable. This will require that the engine create references to closures
    // when entering a new scope (calling a procedure), in addition to
    // capturing locals. As such the parser will need to retain a reference to
    // the enclosing procedure and note all of the child procedures as they are
    // encountered.
    this.top = new Frame(this.top, this.global, procedure.locals, this.instruction.next, this.label);
    if (this.instruction.next) {
        this.stack.push(this.top);
    }
    for (var i = 0; i < this.instruction.args.length; i++) {
        var arg = this.instruction.args[i];
        var value = evaluate(this.top.parent, this.randomer, arg);
        this.top.set(procedure.locals[i], value);
    }
    return this.goto(this.instruction.branch);
};

Engine.prototype.$args = function $args() {
    // Procedure argument instructions exist as targets for labels as well as
    // for reference to locals in calls.
    return this.goto(this.instruction.next);
};

Engine.prototype.$opt = function $opt() {
    var option = this.instruction;
    for (var i = 0; i < option.keywords.length; i++) {
        var keyword = option.keywords[i];
        // The first option to introduce a keyword wins, not the last.
        if (!this.keywords[keyword]) {
            this.keywords[keyword] = option;
        }
    }
    if (option.question.length) {
        this.options.push(option);
        this.render.startOption();
        return this.gothrough(option.question, this.instruction.next, true);
    } else if (this.noOption == null) {
        this.noOption = option;
    }
    return this.goto(option.next);
};

Engine.prototype.$move = function $move() {
    var value = evaluate(this.top, this.randomer, this.instruction.source);
    var name = evaluate.nominate(this.top, this.randomer, this.instruction.target);
    // istanbul ignore if
    if (this.debug) {
        console.log(this.top.at() + '/' + this.label + ' ' + name + ' = ' + value);
    }
    this.top.set(name, value);
    return this.goto(this.instruction.next);
};

Engine.prototype.$jump = function $jump() {
    var j = this.instruction;
    if (evaluate(this.top, this.randomer, j.condition)) {
        return this.goto(this.instruction.branch);
    } else {
        return this.goto(this.instruction.next);
    }
};

Engine.prototype.$switch = function $switch() {
    var branches = this.instruction.branches.slice();
    var weightExpressions = this.instruction.weights.slice();
    var samples = 1;
    var nexts = [];
    if (this.instruction.mode === 'pick') {
        samples = evaluate(this.top, this.randomer, this.instruction.expression);
    }
    for (var i = 0; i < samples; i++) {
        var value;
        var weights = [];
        var weight = weigh(this.top, this.randomer, weightExpressions, weights);
        if (this.instruction.mode === 'rand' || this.instruction.mode === 'pick') {
            if (weights.length === weight) {
                value = Math.floor(this.randomer.random() * branches.length);
            } else {
                value = pick(weights, weight, this.randomer);
                if (value == null) {
                    break;
                }
            }
        } else {
            value = evaluate(this.top, this.randomer, this.instruction.expression);
            if (this.instruction.variable != null) {
                this.top.set(this.instruction.variable, value + this.instruction.value);
            }
        }
        if (this.instruction.mode === 'loop') {
            // actual modulo, wraps negatives
            value = ((value % branches.length) + branches.length) % branches.length;
        } else if (this.instruction.mode === 'hash') {
            value = evaluate.hash(value) % branches.length;
        }
        value = Math.min(value, branches.length - 1);
        value = Math.max(value, 0);
        var next = branches[value];
        pop(branches, value);
        pop(weightExpressions, value);
        nexts.push(next);
    }
    // istanbul ignore if
    if (this.debug) {
        console.log(this.top.at() + '/' + this.label + ' ' + value + ' -> ' + next);
    }
    return this.gothrough(nexts, this.instruction.next, false);
};

function weigh(scope, randomer, expressions, weights) {
    var weight = 0;
    for (var i = 0; i < expressions.length; i++) {
        weights[i] = evaluate(scope, randomer, expressions[i]);
        weight += weights[i];
    }
    return weight;
}

function pick(weights, weight, randomer) {
    var offset = Math.floor(randomer.random() * weight);
    var passed = 0;
    for (var i = 0; i < weights.length; i++) {
        passed += weights[i];
        if (offset < passed) {
            return i;
        }
    }
    return null;
}

function pop(array, index) {
    array[index] = array[array.length - 1];
    array.length--;
}

Engine.prototype.$ask = function $ask() {
    this.ask();
    return false;
};

function Global(handler) {
    this.scope = Object.create(null);
    this.handler = handler;
    Object.seal(this);
}

Global.prototype.get = function get(name) {
    if (this.handler && this.handler.has && this.handler.has(name)) {
        return this.handler.get(name);
    } else {
        return this.scope[name] || 0;
    }
};

Global.prototype.set = function set(name, value) {
    if (this.handler && this.handler.has && this.handler.has(name)) {
        this.handler.set(name, value);
    } else {
        this.scope[name] = value;
    }
    if (this.handler && this.handler.changed) {
        this.handler.changed(name, value);
    }
};

// istanbul ignore next
Global.prototype.log = function log() {
    var names = Object.keys(this.scope);
    names.sort();
    for (var i = 0; i < names.length; i++) {
        var name = names[i];
        var value = this.scope[name];
        console.log(name + ' = ' + value);
    }
    console.log('');
};

// istanbul ignore next
Global.prototype.at = function at() {
    return '';
};

// istanbul ignore next
Global.prototype.capture = function capture() {
    var names = Object.keys(this.scope);
    var values = [];
    for (var i = 0; i < names.length; i++) {
        values[i] = this.scope[names[i]] || 0;
    }
    return [
        names,
        values
    ];
};

// TODO names of parent and caller are not right, might be swapped.
// parent should be the scope parent for upchain lookups.
function Frame(parent, caller, locals, next, branch, stopOption) {
    this.locals = locals;
    this.scope = Object.create(null);
    for (var i = 0; i < locals.length; i++) {
        this.scope[locals[i]] = 0;
    }
    this.parent = parent;
    this.caller = caller;
    this.next = next;
    this.branch = branch;
    this.stopOption = stopOption || false;
}

Frame.prototype.get = function get(name) {
    if (this.locals.indexOf(name) >= 0) {
        return this.scope[name];
    }
    return this.caller.get(name);
};

Frame.prototype.set = function set(name, value) {
    // istanbul ignore else
    if (this.locals.indexOf(name) >= 0) {
        this.scope[name] = value;
        return;
    }
    this.caller.set(name, value);
};

// istanbul ignore next
Frame.prototype.log = function log() {
    this.parent.log();
    console.log('--- ' + this.branch + ' -> ' + this.next);
    for (var i = 0; i < this.locals.length; i++) {
        var name = this.locals[i];
        var value = this.scope[name];
        console.log(name + ' = ' + value);
    }
};

// istanbul ignore next
Frame.prototype.at = function at() {
    return this.caller.at() + '/' + this.branch;
};

// istanbul ignore next
Frame.prototype.capture = function capture() {
    var values = [];
    // var object = {};
    for (var i = 0; i < this.locals.length; i++) {
        var local = this.locals[i];
        values.push(this.scope[local] || 0);
    }
    return [
        this.locals,
        values,
        this.next || "",
        this.branch || "",
        +(this.caller === this.top),
        +this.stopOption
    ];
};

// istanbul ignore next
Frame.resume = function resume(top, global, state) {
    var keys = state[0];
    var values = state[1];
    var next = state[2];
    var branch = state[3];
    var dynamic = state[4];
    var stopOption = state[5];
    top = new Frame(
        top,
        dynamic ? top : global,
        keys,
        next,
        branch,
        !!stopOption
    );
    for (var i = 0; i < keys.length; i++) {
        top.set(keys[i], values[i]);
    }
    return top;
};

}],["evaluate.js","kni","evaluate.js",{},function (require, exports, module, __filename, __dirname){

// kni/evaluate.js
// ---------------

'use strict';

module.exports = evaluate;

function evaluate(scope, randomer, args) {
    var name = args[0];
    if (unary[name] && args.length === 2) {
        return unary[name](
            evaluate(scope, randomer, args[1]),
            scope,
            randomer
        );
    } else if (binary[name] && args.length === 3) {
        return binary[name](
            evaluate(scope, randomer, args[1]),
            evaluate(scope, randomer, args[2]),
            scope,
            randomer
        );
    } else if (name === 'val') {
        return args[1];
    } else if (name === 'get') {
        return +scope.get(args[1]);
    // istanbul ignore else
    } else if (name === 'var') {
        return +scope.get(nominate(scope, randomer, args));
    } else if (name === 'call') {
        var name = args[1][1];
        var f = functions[name];
        if (!f) {
            // TODO thread line number for containing instruction
            throw new Error('No function named ' + name);
        }
        var values = [];
        for (var i = 2; i < args.length; i++) {
            values.push(evaluate(scope, randomer, args[i]));
        }
        return f.apply(null, values);
    } else {
        throw new Error('Unexpected operator ' + JSON.stringify(args));
    }
}

evaluate.nominate = nominate;
function nominate(scope, randomer, args) {
    if (args[0] === 'get') {
        return args[1];
    }
    var literals = args[1];
    var variables = args[2];
    var name = '';
    for (var i = 0; i < variables.length; i++) {
        name += literals[i] + evaluate(scope, randomer, variables[i]);
    }
    name += literals[i];
    return name;
}

var functions = {
    abs: Math.abs,
    acos: Math.acos,
    asin: Math.asin,
    atan2: Math.atan2,
    atan: Math.atan,
    exp: Math.exp,
    log: Math.log,
    max: Math.max,
    min: Math.min,
    pow: Math.pow,
    sin: Math.sin,
    tan: Math.tan,

    floor: Math.floor,
    ceil: Math.floor,
    round: Math.floor,

    sign: function (x) {
        if (x < 0) {
            return -1;
        }
        if (x > 0) {
            return 1;
        }
        return 0;
    },

    mean: function () {
        var mean = 0;
        for (var i = 0; i < arguments.length; i++) {
            mean += arguments[i];
        }
        return mean / i;
    },

    root: function root(x, y) {
        if (y === 2 || y == null) {
            return Math.sqrt(x);
        }
        return Math.pow(x, 1 / y);
    },

    distance: function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    manhattan: function distance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1, 2) + Math.abs(y2 - y1);
    },

    // TODO parameterize these functions in terms of the expected turns to
    // go from 25% to 75% of capacity, to adjust the rate. This will maybe
    // almost make them understandable.
    //
    // sigmoid: function (steps, cap) {
    //     if (steps === -Infinity) {
    //         return 0;
    //     } else if (steps === Infinity) {
    //         return cap;
    //     } else {
    //         return cap / (1 + Math.pow(Math.E, -steps));
    //     }
    // },

    // diomgis: function (pop, cap) {
    //     if (pop <= 0) {
    //         return -Infinity;
    //     }
    //     var ratio = cap / pop - 1;
    //     if (ratio === 0) {
    //         return Infinity;
    //     }
    //     return -Math.log(ratio, Math.E);
    // },

};

var binary = {
    '+': function (x, y) {
        return x + y;
    },
    '-': function (x, y) {
        return x - y;
    },
    '*': function (x, y) {
        return x * y;
    },
    '/': function (x, y) {
        return (x / y) >> 0;
    },
    '%': function (x, y) {
        return ((x % y) + y) % y;
    },
    '**': function (x, y) {
        return Math.pow(x, y);
    },
    'or': function (x, y) {
        return x || y ? 1 : 0;
    },
    'and': function (x, y) {
        return x && y ? 1 : 0;
    },
    '>=': function (x, y) {
        return x >= y ? 1 : 0;
    },
    '>': function (x, y) {
        return x > y ? 1 : 0;
    },
    '<=': function (x, y) {
        return x <= y ? 1 : 0;
    },
    '<': function (x, y) {
        return x < y ? 1 : 0;
    },
    '==': function (x, y) {
        return x === y ? 1 : 0;
    },
    '<>': function (x, y) {
        return x != y ? 1 : 0;
    },
    '#': function (x, y) {
        return hilbert(x, y);
    },
    '~': function (x, y, scope, randomer) {
        var r = 0;
        for (var i = 0; i < x; i++) {
            r += randomer.random() * y;
        }
        return Math.floor(r);
    }
};

// istanbul ignore next
var unary = {
    'not': function (x) {
        return x ? 0 : 1;
    },
    '-': function (x) {
        return -x;
    },
    '~': function (x, scope, randomer) {
        return Math.floor(randomer.random() * x);
    },
    '#': function (x) {
        return hash(x);
    }
};

// Robert Jenkins's 32 bit hash function
// https://gist.github.com/badboy/6267743
evaluate.hash = hash;
function hash(a) {
    a = (a+0x7ed55d16) + (a<<12);
    a = (a^0xc761c23c) ^ (a>>>19);
    a = (a+0x165667b1) + (a<<5);
    a = (a+0xd3a2646c) ^ (a<<9);
    a = (a+0xfd7046c5) + (a<<3);
    a = (a^0xb55a4f09) ^ (a>>>16);
    return a;
}

// hilbert in range from 0 to 2^32
// x and y in range from 0 to 2^16
// each dimension has origin at 2^15
var dimensionWidth = (-1 >>> 16) + 1;
var halfDimensionWidth = dimensionWidth / 2;
function hilbert(x, y) {
    x += halfDimensionWidth;
    y += halfDimensionWidth;
    var rx = 0;
    var ry = y;
    var scalar = 0;
    for (var scale = dimensionWidth; scale > 0; scale /= 2) {
        rx = x & scale;
        ry = y & scale;
        scalar += scale * ((3 * rx) ^ ry);
        // rotate
        if (!ry) {
            if (rx) {
                x = scale - 1 - x;
                y = scale - 1 - y;
            }
            // transpose
            var t = x;
            x = y;
            y = t;
        }
    }
    return scalar;
}

}],["path.js","kni","path.js",{},function (require, exports, module, __filename, __dirname){

// kni/path.js
// -----------

'use strict';

exports.start = start;

function start() {
    return ['start'];
}

exports.toName = pathToName;

function pathToName(path) {
    var name = path[0];
    var i;
    for (i = 1; i < path.length - 1; i++) {
        name += '.' + path[i];
    }
    var last = path[i];
    if (path.length > 1 && last !== 0) {
        name += '.' + last;
    }
    return name;
}

exports.next = nextPath;

function nextPath(path) {
    path = path.slice();
    path[path.length - 1]++;
    return path;
}

exports.firstChild = firstChildPath;

function firstChildPath(path) {
    path = path.slice();
    path.push(1);
    return path;
}

exports.zerothChild = zerothChildPath;

function zerothChildPath(path) {
    path = path.slice();
    path.push(0);
    return path;
}

}],["story.js","kni","story.js",{"./path":8},function (require, exports, module, __filename, __dirname){

// kni/story.js
// ------------

'use strict';

var Path = require('./path');

var constructors = {};

module.exports = Story;

function Story() {
    this.states = {};
    this.errors = [];
    Object.seal(this);
}

Story.constructors = constructors;

Story.prototype.create = function create(path, type, arg, position) {
    var name = Path.toName(path);
    var Node = constructors[type];
    // istanbul ignore if
    if (!Node) {
        throw new Error('No node constructor for type: ' + type);
    }
    var node = new Node(arg);
    node.position = position;
    this.states[name] = node;
    return node;
};

// istanbul ignore next
Story.prototype.error = function _error(error) {
    this.errors.push(error);
};

constructors.text = Text;
function Text(text) {
    this.type = 'text';
    this.text = text;
    this.lift = ' ';
    this.drop = ' ';
    this.next = null;
    this.position = null;
    Object.seal(this);
}
Text.prototype.tie = tie;

constructors.echo = Echo;
function Echo(expression) {
    this.type = 'echo';
    this.expression = expression;
    this.lift = '';
    this.drop = '';
    this.next = null;
    this.position = null;
    Object.seal(this);
}
Echo.prototype.tie = tie;

constructors.option = Option;
function Option(label) {
    this.type = 'opt';
    this.question = [];
    this.answer = [];
    this.keywords = null;
    this.next = null;
    this.position = null;
    Object.seal(this);
}
Option.prototype.tie = tie;

constructors.goto = Goto;
function Goto(next) {
    this.type = 'goto';
    this.next = next || null;
    this.position = null;
    Object.seal(this);
}
Goto.prototype.tie = tie;

constructors.call = Call;
function Call(branch) {
    this.type = 'call';
    this.branch = branch;
    this.args = null;
    this.next = null;
    this.position = null;
    Object.seal(this);
}
Call.prototype.tie = tie;

constructors.args = Args;
function Args(locals) {
    this.type = 'args';
    this.locals = locals;
    this.next = null;
    this.position = null;
    Object.seal(this);
}
Args.prototype.tie = tie;

constructors.jump = Jump;
function Jump(condition) {
    this.type = 'jump';
    this.condition = condition;
    this.branch = null;
    this.next = null;
    this.position = null;
    Object.seal(this);
}
Jump.prototype.tie = tie;

constructors.switch = Switch;
function Switch(expression) {
    this.type = 'switch';
    this.expression = expression;
    this.variable = null;
    this.value = 0;
    this.mode = null;
    this.branches = [];
    this.weights = [];
    this.next = null;
    this.position = null;
    Object.seal(this);
}
Switch.prototype.tie = tie;

constructors.move = Move;
function Move() {
    this.type = 'move';
    this.source = null;
    this.target = null;
    this.next = null;
    this.position = null;
    Object.seal(this);
}
Move.prototype.tie = tie;

constructors.break = Break;
function Break() {
    this.type = 'br';
    this.next = null;
    this.position = null;
    Object.seal(this);
}
Break.prototype.tie = tie;

constructors.paragraph = Paragraph;
function Paragraph() {
    this.type = 'par';
    this.next = null;
    this.position = null;
    Object.seal(this);
}
Paragraph.prototype.tie = tie;

constructors.rule = Rule;
function Rule() {
    this.type = 'rule';
    this.next = null;
    this.position = null;
    Object.seal(this);
}
Rule.prototype.tie = tie;

constructors.ask = Ask;
function Ask(variable) {
    this.type = 'ask';
    this.position = null;
    Object.seal(this);
}
Ask.prototype.tie = tie;

function tie(end) {
    this.next = end;
}

}],["koerper.js","koerper","koerper.js",{"wizdom":32},function (require, exports, module, __filename, __dirname){

// koerper/koerper.js
// ------------------

"use strict";

var BaseDocument = require("wizdom");
var BaseNode = BaseDocument.prototype.Node;
var BaseElement = BaseDocument.prototype.Element;
var BaseTextNode = BaseDocument.prototype.TextNode;

module.exports = Document;
function Document(actualNode) {
    Node.call(this, this);
    this.actualNode = actualNode;
    this.actualDocument = actualNode.ownerDocument;

    this.documentElement = this.createBody();
    this.documentElement.parentNode = this;
    actualNode.appendChild(this.documentElement.actualNode);

    this.firstChild = this.documentElement;
    this.lastChild = this.documentElement;
}

Document.prototype = Object.create(BaseDocument.prototype);
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Body = Body;
Document.prototype.OpaqueHtml = OpaqueHtml;

Document.prototype.createBody = function (label) {
    return new this.Body(this, label);
};

Document.prototype.getActualParent = function () {
    return this.actualNode;
};

function Node(document) {
    BaseNode.call(this, document);
    this.actualNode = null;
}

Node.prototype = Object.create(BaseNode.prototype);
Node.prototype.constructor = Node;

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (nextSibling && nextSibling.parentNode !== this) {
        throw new Error("Can't insert before node that is not a child of parent");
    }
    BaseNode.prototype.insertBefore.call(this, childNode, nextSibling);
    var actualParentNode = this.getActualParent();
    var actualNextSibling;
    if (nextSibling) {
        actualNextSibling = nextSibling.getActualFirstChild();
    }
    if (!actualNextSibling) {
        actualNextSibling = this.getActualNextSibling();
    }
    if (actualNextSibling && actualNextSibling.parentNode !== actualParentNode) {
        actualNextSibling = null;
    }
    actualParentNode.insertBefore(childNode.actualNode, actualNextSibling || null);
    childNode.inject();
    return childNode;
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove child " + childNode);
    }
    childNode.extract();
    this.getActualParent().removeChild(childNode.actualNode);
    BaseNode.prototype.removeChild.call(this, childNode);
};

Node.prototype.setAttribute = function setAttribute(key, value) {
    this.actualNode.setAttribute(key, value);
};

Node.prototype.getAttribute = function getAttribute(key) {
    this.actualNode.getAttribute(key);
};

Node.prototype.hasAttribute = function hasAttribute(key) {
    this.actualNode.hasAttribute(key);
};

Node.prototype.removeAttribute = function removeAttribute(key) {
    this.actualNode.removeAttribute(key);
};

Node.prototype.addEventListener = function addEventListener(name, handler, capture) {
    this.actualNode.addEventListener(name, handler, capture);
};

Node.prototype.removeEventListener = function removeEventListener(name, handler, capture) {
    this.actualNode.removeEventListener(name, handler, capture);
};

Node.prototype.inject = function injectNode() { };

Node.prototype.extract = function extractNode() { };

Node.prototype.getActualParent = function () {
    return this.actualNode;
};

Node.prototype.getActualFirstChild = function () {
    return this.actualNode;
};

Node.prototype.getActualNextSibling = function () {
    return null;
};

Object.defineProperty(Node.prototype, "innerHTML", {
    get: function () {
        return this.actualNode.innerHTML;
    }//,
    //set: function (html) {
    //    // TODO invalidate any subcontained child nodes
    //    this.actualNode.innerHTML = html;
    //}
});

function Element(document, type, namespace) {
    BaseNode.call(this, document, namespace);
    if (namespace) {
        this.actualNode = document.actualDocument.createElementNS(namespace, type);
    } else {
        this.actualNode = document.actualDocument.createElement(type);
    }
    this.attributes = this.actualNode.attributes;
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

function TextNode(document, text) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode(text);
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

Object.defineProperty(TextNode.prototype, "data", {
    set: function (data) {
        this.actualNode.data = data;
    },
    get: function () {
        return this.actualNode.data;
    }
});

// if parentNode is null, the body is extracted
// if parentNode is non-null, the body is inserted
function Body(document, label) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode("");
    //this.actualNode = document.actualDocument.createComment(label || "");
    this.actualFirstChild = null;
    this.actualBody = document.actualDocument.createElement("BODY");
}

Body.prototype = Object.create(Node.prototype);
Body.prototype.constructor = Body;
Body.prototype.nodeType = 13;

Body.prototype.extract = function extract() {
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = this.getActualFirstChild();
    var next;
    while (at && at !== lastChild) {
        next = at.nextSibling;
        if (body) {
            body.appendChild(at);
        } else {
            parentNode.removeChild(at);
        }
        at = next;
    }
};

Body.prototype.inject = function inject() {
    if (!this.parentNode) {
        throw new Error("Can't inject without a parent node");
    }
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = body.firstChild;
    var next;
    while (at) {
        next = at.nextSibling;
        parentNode.insertBefore(at, lastChild);
        at = next;
    }
};

Body.prototype.getActualParent = function () {
    if (this.parentNode) {
        return this.parentNode.getActualParent();
    } else {
        return this.actualBody;
    }
};

Body.prototype.getActualFirstChild = function () {
    if (this.firstChild) {
        return this.firstChild.getActualFirstChild();
    } else {
        return this.actualNode;
    }
};

Body.prototype.getActualNextSibling = function () {
    return this.actualNode;
};

Object.defineProperty(Body.prototype, "innerHTML", {
    get: function () {
        if (this.parentNode) {
            this.extract();
            var html = this.actualBody.innerHTML;
            this.inject();
            return html;
        } else {
            return this.actualBody.innerHTML;
        }
    },
    set: function (html) {
        if (this.parentNode) {
            this.extract();
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
            this.inject();
        } else {
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
        }
        return html;
    }
});

function OpaqueHtml(ownerDocument, body) {
    Node.call(this, ownerDocument);
    this.actualFirstChild = body.firstChild;
}

OpaqueHtml.prototype = Object.create(Node.prototype);
OpaqueHtml.prototype.constructor = OpaqueHtml;

OpaqueHtml.prototype.getActualFirstChild = function getActualFirstChild() {
    return this.actualFirstChild;
};

}],["point.js","ndim","point.js",{},function (require, exports, module, __filename, __dirname){

// ndim/point.js
// -------------

"use strict";

module.exports = Point;
function Point() {
}

Point.prototype.add = function (that) {
    return this.clone().addThis(that);
};

Point.prototype.sub = function (that) {
    return this.clone().addThis(that);
};

// not dot or cross, just elementwise multiplication
Point.prototype.mul = function (that) {
    return this.clone().mulThis(that);
};

Point.prototype.div = function (that) {
    return this.clone().divThis(that);
};

Point.prototype.scale = function (n) {
    return this.clone().scaleThis(n);
};

Point.prototype.bitwiseAnd = function (n) {
    return this.clone().bitwiseAndThis(n);
};

Point.prototype.bitwiseOr = function (n) {
    return this.clone().bitwiseOrThis(n);
};

Point.prototype.round = function () {
    return this.clone().roundThis();
};

Point.prototype.floor = function () {
    return this.clone().floorThis();
};

Point.prototype.ceil = function () {
    return this.clone().ceilThis();
};

Point.prototype.abs = function () {
    return this.clone().absThis();
};

Point.prototype.min = function () {
    return this.clone().minThis();
};

Point.prototype.max = function () {
    return this.clone().maxThis();
};

}],["point2.js","ndim","point2.js",{"./point":11},function (require, exports, module, __filename, __dirname){

// ndim/point2.js
// --------------

"use strict";

var Point = require("./point");

module.exports = Point2;
function Point2(x, y) {
    this.x = x;
    this.y = y;
}

Point2.prototype = Object.create(Point.prototype);
Point2.prototype.constructor = Point2;

Point2.zero = new Point2(0, 0);
Point2.one = new Point2(1, 1);

Point2.prototype.addThis = function (that) {
    this.x = this.x + that.x;
    this.y = this.y + that.y;
    return this;
};

Point2.prototype.subThis = function (that) {
    this.x = this.x - that.x;
    this.y = this.y - that.y;
    return this;
};

Point2.prototype.mulThis = function (that) {
    this.x = this.x * that.x;
    this.y = this.y * that.y;
    return this;
};

Point2.prototype.divThis = function (that) {
    this.x = this.x / that.x;
    this.y = this.y / that.y;
    return this;
};

Point2.prototype.scaleThis = function (n) {
    this.x = this.x * n;
    this.y = this.y * n;
    return this;
};

Point2.prototype.bitwiseAndThis = function (n) {
    this.x = this.x & n;
    this.y = this.y & n;
    return this;
};

Point2.prototype.bitwiseOrThis = function (n) {
    this.x = this.x | n;
    this.y = this.y | n;
    return this;
};

Point2.prototype.dot = function (that) {
    return this.x * that.x + this.y * that.y;
};

Point2.prototype.roundThis = function () {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
};

Point2.prototype.floorThis = function () {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
};

Point2.prototype.ceilThis = function () {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
};

Point2.prototype.absThis = function () {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
};

Point2.prototype.minThis = function (that) {
    this.x = Math.min(this.x, that.x);
    this.y = Math.min(this.y, that.y);
};

Point2.prototype.maxThis = function (that) {
    this.x = Math.max(this.x, that.x);
    this.y = Math.max(this.y, that.y);
};

Point2.prototype.transpose = function () {
    return this.clone().transposeThis();
};

Point2.prototype.transposeThis = function () {
    var temp = this.x;
    this.x = this.y;
    this.y = temp;
    return this;
};

Point2.prototype.distance = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Point2.prototype.clone = function () {
    return new Point2(this.x, this.y);
};

Point2.prototype.copyFrom = function (that) {
    this.x = that.x;
    this.y = that.y;
    return this;
};

// TODO deprecated for copyFrom
Point2.prototype.become = function (that) {
    this.x = that.x;
    this.y = that.y;
    return this;
};

Point2.prototype.toString = function () {
    return "[x=" + this.x + " y=" + this.y + "]";
};

Point2.prototype.hash = function () {
    return this.x + "," + this.y;
};

Point2.prototype.equals = function (that) {
    return this.x === that.x && this.y === that.y;
};

Point2.prototype.lessThan = function (that) {
    return this.x < that.x && this.y < that.y;
};

}],["region.js","ndim","region.js",{},function (require, exports, module, __filename, __dirname){

// ndim/region.js
// --------------

"use strict";

module.exports = Region;
function Region(position, size) {
    this.position = position;
    this.size = size;
}

Region.prototype.copyFrom = function (that) {
    this.position.copyFrom(that.position);
    this.size.copyFrom(that.size);
    return this;
};

// TODO deprecated for copyFrom
Region.prototype.become = function (that) {
    this.position.become(that.position);
    this.size.become(that.size);
    return this;
};

Region.prototype.scaleThis = function (n) {
    this.position.scaleThis(n);
    this.size.scaleThis(n);
    return this;
};

Region.prototype.scale = function (n) {
    return this.clone().scaleThis(n);
};

Region.prototype.roundThis = function () {
    this.temp1.become(this.position).addThis(this.size).roundThis();
    this.position.roundThis();
    this.size.become(this.temp1).subThis(this.position);
    return this;
};

Region.prototype.round = function (n) {
    return this.clone().roundThis(n);
};

Region.prototype.roundInwardThis = function () {
    this.temp1.become(this.position).addThis(this.size).floorThis();
    this.position.ceilThis().minThis(this.temp1);
    this.size.become(this.temp1).subThis(this.position);
    return this;
};

Region.prototype.roundInward = function (n) {
    return this.clone().roundInwardThis(n);
};

Region.prototype.roundOutwardThis = function () {
    this.temp1.become(this.position).addThis(this.size).ceilThis();
    this.position.floorThis();
    this.size.become(this.temp1).subThis(this.position);
    return this;
};

Region.prototype.roundOutward = function (n) {
    return this.clone().roundOutwardThis(n);
};

Region.prototype.annex = function (that) {
    return this.clone().annexThis(that);
};

Region.prototype.annexThis = function (that) {
    this.temp1.become(this.position).addThis(this.size);
    this.temp2.become(that.position).addThis(that.size);
    this.position.minThis(that.position);
    this.temp1.maxThis(this.temp2);
    this.size.become(this.temp1).subThis(this.position);
    return this;
};

Region.prototype.equals = function (that) {
    return that && this.position.equals(that.position) && this.size.equals(that.size);
};

Region.prototype.toString = function () {
    return "[position:" + this.position.toString() + " size:" + this.size.toString() + "]";
};

}],["region2.js","ndim","region2.js",{"./region":13,"./point2":12},function (require, exports, module, __filename, __dirname){

// ndim/region2.js
// ---------------

"use strict";

var Region = require("./region");
var Point2 = require("./point2");

module.exports = Region2;
function Region2() {
    Region.apply(this, arguments);
}

Region2.prototype = Object.create(Region.prototype);
Region2.prototype.constructor = Region2;
Region2.prototype.temp1 = new Point2();
Region2.prototype.temp2 = new Point2();

Region2.prototype.contains = function (that) {
    return (
        this.position.x <= that.position.x &&
        this.position.x + this.size.x >= that.position.x + that.size.x &&
        this.position.y <= that.position.y &&
        this.position.y + this.size.y >= that.position.y + that.size.y
    );
};

Region2.prototype.clone = function () {
    return new Region2(this.position.clone(), this.size.clone());
};


}],["lib/performance-now.js","performance-now/lib","performance-now.js",{},function (require, exports, module, __filename, __dirname){

// performance-now/lib/performance-now.js
// --------------------------------------

// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

//# sourceMappingURL=performance-now.js.map

}],["animation.js","peruacru","animation.js",{"raf":31},function (require, exports, module, __filename, __dirname){

// peruacru/animation.js
// ---------------------

'use strict';

var raf = require('raf');

var timeout = 1000;

exports.Noop = Noop;
function Noop() {
}

Noop.prototype.act = function act() {
    return idle;
};

exports.noop = new Noop();

exports.Idle = Idle;
function Idle(value) {
    this.value = value;
}

Idle.prototype.then = function then(action) {
    return action.act(this.value) || idle;
};

var idle = exports.idle = new Idle();

exports.Wait = Wait;
function Wait() {
    this.next = null;
    this.action = null;
}

Wait.prototype.resume = function resume(next) {
    if (this.next != null) {
        return;
    }
    this.next = next || idle;
    if (this.action != null) {
        this.next.then(this.action);
    }
};

Wait.prototype.then = function then(action) {
    var wait = new Wait();
    this.action = new Reaction(wait, action);
    if (this.next != null) {
        this.next.then(this.action);
    }
    return wait;
};

function Reaction(wait, action) {
    this.wait = wait;
    this.action = action;
}

Reaction.prototype.act = function act(value) {
    this.wait.resume(this.action.act(value) || idle);
};

exports.delay = delay;
function delay(duration, value) {
    var wait = new Wait();
    setTimeout(function onTimeout() {
        wait.resume(new Idle(value));
    }, duration);
    return wait;
}

exports.Delay = Delay;
function Delay(duration) {
    this.duration = duration;
}

Delay.prototype.act = function act() {
    return delay(this.duration);
};

exports.AwaitTransitionEnd = AwaitTransitionEnd;
function AwaitTransitionEnd(element, debugName) {
    this.element = element;
    this.debugName = debugName;
    this.wait = new Wait();
    this.timeout = null;
}

AwaitTransitionEnd.prototype.act = function act() {
    var self = this;
    if (this.element == null) {
        console.warn('element missing to await transition end');
        return;
    }
    this.element.addEventListener('transitionend', this);
    this.timeout = setTimeout(function onTimeout() {
        self.handleEvent();
    }, timeout);
    return this.wait;
};

AwaitTransitionEnd.prototype.handleEvent = function handleEvent() {
    clearTimeout(this.timeout);
    this.element.removeEventListener('transitionend', this);
    this.wait.resume();
};

exports.AwaitDraw = AwaitDraw;
function AwaitDraw() {
}

AwaitDraw.prototype.act = function act() {
    var wait = new Wait();
    raf(function () {
        wait.resume();
    });
    return wait;
};

exports.Series = Series;
function Series(actions) {
    this.actions = actions;
}

Series.prototype.act = function act() {
    var result = idle;
    for (var i = 0; i < this.actions.length; i++) {
        result = result.then(this.actions[i]);
    }
    return result;
};

exports.Parallel = Parallel;
function Parallel(actions) {
    this.actions = actions;
}

Parallel.prototype.act = function act(value) {
    var results = [];
    for (var i = 0; i < this.actions.length; i++) {
        results.push(this.actions[i].act(value) || idle);
    }
    return all(results);
};

exports.all = all;
function all(results) {
    if (results.length === 0) {
        return idle;
    }
    var wait = new Wait();
    var group = new WaitGroup(wait, results.length);
    for (var i = 0; i < results.length; i++) {
        results[i].then(group);
    }
    return wait;
}

function WaitGroup(wait, count) {
    this.count = count;
    this.wait = wait;
}

WaitGroup.prototype.act = function act() {
    this.count--;
    if (this.count === 0) {
        this.wait.resume();
    }
};

exports.AddClass = AddClass;
function AddClass(element, className, debugName) {
    this.element = element;
    this.className = className;
    this.debugName = debugName;
}

AddClass.prototype.act = function act() {
    if (this.element == null) {
        console.warn('element missing to add class', this.className, 'for', this.debugName);
        return;
    }
    this.element.classList.add(this.className);
};

exports.RemoveClass = RemoveClass;
function RemoveClass(element, className, debugName) {
    this.element = element;
    this.className = className;
    this.debugName = debugName;
}

RemoveClass.prototype.act = function act() {
    if (this.element == null) {
        console.warn('element missing to remove class', this.className, 'for', this.debugName);
        return;
    }
    this.element.classList.remove(this.className);
};

exports.Mark = Mark;
function Mark(/*...args*/) {
    this.message = Array.prototype.join.call(arguments, ' ');
}

Mark.prototype.act = function act() {
    console.log(this.message);
    return idle;
};

}],["document.js","peruacru","document.js",{},function (require, exports, module, __filename, __dirname){

// peruacru/document.js
// --------------------

'use strict';

module.exports = Document;

function Document(parent, nextSibling, createPage) {
    var self = this;
    this.document = parent.ownerDocument;
    this.parent = parent;
    this.nextSibling = nextSibling;
    this.frame = null;
    this.body = null;
    this.afterBody = null;
    this.engine = null;
    this.carry = '';
    this.cursor = null;
    this.cursorParent = null;
    this.afterCursor = null;
    this.next = null;
    this.optionIndex = 0;
    this.options = null;
    this.p = false;
    this.br = false;
    this.onclick = onclick;
    this.createPage = createPage || this.createPage;

    function onclick(event) {
        self.answer(event.target.number);
    }
    Object.seal(this);
}

var linkMatcher = /\s*(\w+:\/\/\S+)$/;

Document.prototype.write = function write(lift, text, drop) {
    var document = this.document;
    lift = this.carry || lift;
    if (this.p) {
        this.cursor = document.createElement('p');
        this.cursorParent.insertBefore(this.cursor, this.afterCursor);
        this.p = false;
        this.br = false;
        lift = '';
    }
    if (this.br) {
        this.cursor.appendChild(document.createElement('br'));
        this.br = false;
        lift = '';
    }
    var match = linkMatcher.exec(text);
    if (match === null) {
        this.cursor.appendChild(document.createTextNode(lift + text));
    } else {
        // Support a hyperlink convention.
        if (lift !== '') {
            this.cursor.appendChild(document.createTextNode(lift));
        }
        var link = document.createElement('a');
        link.href = match[1];
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.appendChild(document.createTextNode(text.slice(0, match.index)));
        this.cursor.appendChild(link);
    }
    this.carry = drop;
};

Document.prototype.break = function _break() {
    this.br = true;
};

Document.prototype.paragraph = function paragraph() {
    this.p = true;
};

Document.prototype.startOption = function startOption() {
    this.optionIndex++;
    var document = this.document;
    var tr = document.createElement('tr');
    this.options.appendChild(tr);
    var th = document.createElement('th');
    tr.appendChild(th);
    th.textContent = this.optionIndex + '.';
    var td = document.createElement('td');
    td.number = this.optionIndex;
    // td.onclick = this.onclick;
    td.onmouseup = this.onclick;
    td.setAttribute('aria-role', 'button');
    tr.appendChild(td);
    this.cursor = td;
    this.p = false;
    this.br = false;
    this.carry = '';
};

Document.prototype.stopOption = function stopOption() {
    this.p = false;
    this.br = false;
};

Document.prototype.flush = function flush() {
    // No-op (for console only)
};

Document.prototype.pardon = function pardon() {
    // No-op (for console only)
};

Document.prototype.display = function display() {
    this.frame.style.opacity = 0;
    this.frame.style.transform = 'translateX(2ex)';
    this.parent.insertBefore(this.frame, this.nextSibling);

    // TODO not this
    var frame = this.frame;
    setTimeout(function () {
        frame.style.opacity = 1;
        frame.style.transform = 'translateX(0)';
    }, 10);
};

Document.prototype.clear = function clear() {
    if (this.frame) {
        this.frame.style.opacity = 0;
        this.frame.style.transform = 'translateX(-2ex)';
        this.frame.addEventListener('transitionend', remover(this.parent, this.frame));
    }
    this.createPage(this.document, this);
    this.cursor = null;
    this.cursorParent = this.body;
    this.afterCursor = this.afterBody;
    this.br = false;
    this.p = true;
    this.carry = '';
    this.optionIndex = 0;
};

function remover(parent, frame) {
    var done = false;
    var handle = setTimeout(remove, 1000);
    function remove(event) {
        if (done) {
            return;
        }
        done = true;
        clearTimeout(handle);
        if (frame.parentNode === parent) {
            parent.removeChild(frame);
        }
    }
    return remove;
}

Document.prototype.createPage = function createPage(document) {
    this.frame = document.createElement('div');
    this.frame.classList.add('kni-frame');
    this.frame.style.opacity = 0;

    var A = document.createElement('div');
    A.classList.add('kni-frame-a');
    this.frame.appendChild(A);

    var B = document.createElement('div');
    B.classList.add('kni-frame-b');
    A.appendChild(B);

    var C = document.createElement('div');
    C.classList.add('kni-frame-c');
    B.appendChild(C);

    this.body = document.createElement('div');
    this.body.classList.add('kni-body');
    C.appendChild(this.body);

    this.options = document.createElement('table');
    this.body.appendChild(this.options);
    this.afterBody = this.options;
};

Document.prototype.ask = function ask() {
};

Document.prototype.answer = function answer(text) {
    this.engine.answer(text);
};

Document.prototype.close = function close() {
};

}],["index.js","peruacru","index.js",{"gutentag/document":1,"gutentag/scope":4,"blick":0,"./main.html":21},function (require, exports, module, __filename, __dirname){

// peruacru/index.js
// -----------------

'use strict';

var Document = require('gutentag/document');
var Scope = require('gutentag/scope');
var Animator = require('blick');
var Main = require('./main.html');

var document = new Document(window.document.body);
var scope = new Scope();
scope.animator = new Animator();
scope.main = new Main(document.documentElement, scope);

}],["inventory.js","peruacru","inventory.js",{"./animation":16,"./stage":23},function (require, exports, module, __filename, __dirname){

// peruacru/inventory.js
// ---------------------

'use strict';

var A = require('./animation');
var stage = require('./stage');

module.exports = Inventory;

function Item(name, main) {
    this.main = main;
    this.name = name;
    this.position = null;
    this.element = null;
    this.iteration = null;
    this.slot = null;

    Object.seal(this);
}

function Inventory(main) {
    this.main = main;

    // Inventory slots
    this.boyLeft = null;
    this.boyRight = null;
    this.boy = null;
    this.girlLeft = null;
    this.girlRight = null;
    this.girl = null;

    // Inventory contents
    this.inventory = {};
    this.props = {};

    Object.seal(this);
}

Inventory.prototype.count = function (name) {
    if (!this.inventory[name]) {
        return 0;
    }
    return this.inventory[name].length;
};

Inventory.prototype.take = function (name, over) {
    console.log('take', name);
    var item = this.createItem(name);
    var retain = this.retain(item);
    this.addToInventory(item);
    item.element.classList.add(over || 'trash');
    return new A.Series([
        retain,
        new A.AwaitDraw(),
        new A.AwaitDraw(),
        new A.AddClass(item.element, 'item-show', name),
        new A.AddClass(item.element, 'item-store', name),
        new A.AddClass(item.slot, item.position, name),
        new A.RemoveClass(item.element, over || 'trash', name),
        new A.AwaitTransitionEnd(item.element, 'take ' + name)
    ]);
};

Inventory.prototype.retake = function (name) {
    console.log('retake', name);
    var item = this.createItem(name);
    this.retain(item);
    this.addToInventory(item);
    item.element.classList.add('item-store', 'item-show');
    item.slot.classList.add(item.position);
};

Inventory.prototype.drop = function (name, over) {
    console.log('drop', name);
    var item = this.popFromInventory(name);
    var release = this.release(item);
    return new A.Series([
        release,
        new A.RemoveClass(item.element, 'item-show', 'drop ' + name),
        new A.RemoveClass(item.element, 'item-store', 'drop ' + name),
        new A.AddClass(item.element, over || 'trash', 'drop ' + name),
        new A.RemoveClass(item.slot, item.position, 'drop ' + name),
        new A.AwaitTransitionEnd(item.element, 'drop ' + name),
        new RemoveFromScene(this.main, item)
    ]);
};

Inventory.prototype.move = function (name, over) {
    console.log('move', name, over);
    var item = this.popFromInventory(name);
    var release = this.release(item);
    return {
        move: new A.Series([
            release,
            new A.RemoveClass(item.element, 'item-store', 'move ' + name),
            new A.AddClass(item.element, over, 'move ' + name),
            new A.RemoveClass(item.slot, item.position, 'move ' + name),
            new A.AwaitTransitionEnd(item.element, 'move ' + name),
        ]),
        drop: new A.Series([
            new A.AwaitDraw(),
            new A.RemoveClass(item.element, 'item-show', 'drop after moving ' + name),
            new A.AwaitTransitionEnd(item.element, 'drop after moving ' + name),
            new RemoveFromScene(this.main, item)
        ])
    };
};

Inventory.prototype.createItem = function (name) {
    var item = new Item(name, this);
    this.main.addToScene(item);
    return item;
};

Inventory.prototype.addToInventory = function (item) {
    var name = item.name;
    if (!this.inventory[name]) {
        this.inventory[name] = [];
    }
    this.inventory[name].push(item);
};

Inventory.prototype.popFromInventory = function (name) {
    return this.inventory[name].pop();
};

Inventory.prototype.retain = function retain(item) {
    var name = item.name;
    if (stage.big[name]) {
        return this.retain2(item);
    } else {
        return this.retain1(item);
    }
};

Inventory.prototype.retain1 = function retain1(item) {
    if (this.boyLeft == null) {
        this.boyLeft = item;
        this.boy = item;
        item.position = 'slot-0';
    } else if (this.boyRight == null) {
        this.boyRight = item;
        this.boy = item;
        item.position = 'slot-1';
    } else if (this.girlRight == null) {
        this.girlRight = item;
        this.girl = item;
        item.position = 'slot-3';
    } else if (this.girlLeft == null) {
        this.girlLeft = item;
        this.girl = item;
        item.position = 'slot-2';
    } else {
        console.error('retain1 failure');
    }
    return A.noop;
};

Inventory.prototype.retain2 = function retain2(item) {
    if (this.boy == null) {
        this.boyLeft = item;
        this.boyRight = item;
        this.boy = item;
        // Todo return Reposition
        item.position = 'slot-0-1';
    } else if (this.girl == null) {
        this.girlLeft = item;
        this.girlRight = item;
        this.girl = item;
        item.position = 'slot-2-3';
    } else if (this.boyRight == null && this.girlLeft == null) {
        this.girl = item;
        this.boy = item;
        this.girlLeft = item;
        this.boyRight = item;
        item.position = 'slot-1-2';
    } else if (this.boyRight != null) {
        var move = this.boyRight;
        return new A.Series([
            new A.RemoveClass(move.slot, move.position, 'shift ' + move.name),
            this.release(move),
            this.retain2(item),
            this.retain(move),
            new A.AddClass(move.slot, move.position, 'shift ' + move.name),
            new A.AwaitTransitionEnd(move.element, 'shift ' + move.name),
        ]);
    } else if (this.girlLeft != null) {
        var move = this.girlLeft;
        return new A.Series([
            new A.RemoveClass(move.slot, move.position, 'shift ' + move.name),
            this.release(move),
            this.retain2(item),
            this.retain(move),
            new A.AddClass(move.slot, move.position, 'shift ' + move.name),
            new A.AwaitTransitionEnd(move.element, 'shift ' + move.name),
        ]);
    } else {
        console.error('retain2 failure');
    }
    return A.noop;
};

Inventory.prototype.release = function release(item) {
    var name = item.name;
    if (stage.big[name]) {
        return this.release2(item);
    } else {
        return this.release1(item);
    }
};

Inventory.prototype.release1 = function release1(item) {
    var position = item.position;
    if (position === 'slot-0') {
        this.boyLeft = null;
        this.boy = this.boyRight;
    } else if (position === 'slot-1') {
        this.boyRight = null;
        this.boy = this.boyLeft;
    } else if (position === 'slot-2') {
        this.girlLeft = null;
        this.girl = this.girlRight;
    } else if (position === 'slot-3') {
        this.girlRight = null;
        this.girl = this.girlLeft;
    }
    return A.noop;
};

Inventory.prototype.release2 = function release2(item) {
    var position = item.position;
    if (position === 'slot-0-1') {
        this.boy = null;
        this.boyLeft = null;
        this.boyRight = null;
    } else if (position === 'slot-1-2') {
        this.girlLeft = null;
        this.girl = this.girlRight;
        this.boyRight = null;
        this.boy = this.boyLeft;
    } else if (position === 'slot-2-3') {
        this.girl = null;
        this.girlLeft = null;
        this.girlRight = null;
    }
    return A.noop;
};

Inventory.prototype.replace = function replace(beforeName, afterName) {
    return this.replaceUtility(beforeName, afterName).animation;
};

Inventory.prototype.replaceUtility = function (beforeName, afterName) {
    var before = this.popFromInventory(beforeName);
    var after = this.createItem(afterName);

    after.position = before.position;
    if (after.position == 'slot-0') {
        this.boyLeft = this.boy = after;
    } else if (after.position === 'slot-1') {
        this.boyRight = this.boy = after;
    } else if (after.position === 'slot-2') {
        this.girlLeft = this.girl = after;
    } else if (after.position === 'slot-3') {
        this.girlRight = this.girl = after;
    } else if (after.position === 'slot-0-1') {
        this.boyLeft = this.boyRight = this.boy = after;
    } else if (after.position === 'slot-1-2') {
        this.boyRight = this.girlLeft = this.boy = this.girl = after;
    } else if (after.position === 'slot-2-3') {
        this.girlLeft = this.girlRight = this.girl = after;
    }

    this.addToInventory(after);
    return {
        before: before,
        after: after,
        animation: new Replace(this.main, before, after, before.position)
    };
};

function Replace(main, before, after, position) {
    this.main = main;
    this.before = before;
    this.after = after;
    this.position = position;
}

Replace.prototype.act = function act() {
    this.after.element.classList.add('item-store', 'item-replace-transition');
    this.after.slot.classList.add(this.position, 'no-transition');
    return new A.Series([
        new A.AddClass(this.after.element, 'item-show', 'replace ' + this.after.name),
        new A.AwaitTransitionEnd(this.after.element, 'replace ' + this.before.name + ' with ' + this.after.name),
        new A.RemoveClass(this.after.element, 'item-replace-transition', 'replace ' + this.after.name),
        new A.RemoveClass(this.after.slot, 'no-transition', 'replace ' + this.after.name),
        new RemoveFromScene(this.main, this.before)
    ]).act();
};

function RemoveFromScene(main, item) {
    this.main = main;
    this.item = item;
}

RemoveFromScene.prototype.act = function act() {
    this.main.removeFromScene(this.item);
};

Inventory.prototype.showProp = function (prop) {
    if (!this.props[prop]) {
        this.props[prop] = true;
        // TODO demeter
        return new ShowProp(this.main.scope.components[prop]);
    }
    return A.noop;
};

function ShowProp(component) {
    this.component = component;
}

ShowProp.prototype.act = function act() {
    if (!this.component.classList.contains('show-prop')) {
        this.component.classList.add('show-prop', 'show');
        return new A.AwaitTransitionEnd(this.component, 'show prop').act();
    }
    return A.idle;
};

Inventory.prototype.hideProp = function (prop) {
    if (this.props[prop]) {
        this.props[prop] = false;
        // TODO demeter
        return new HideProp(this.main.scope.components[prop]);
    }
    return A.noop;
};

function HideProp(component) {
    this.component = component;
}

HideProp.prototype.act = function act() {
    if (this.component.classList.contains('show-prop')) {
        this.component.classList.remove('show-prop', 'show');
        return new A.AwaitTransitionEnd(this.component, 'hide prop').act();
    }
    return A.idle;
};

}],["peruacru.json","peruacru","peruacru.json",{},function (require, exports, module, __filename, __dirname){

// peruacru/peruacru.json
// ----------------------

module.exports = {
    "start": {
        "type": "call",
        "branch": "reset",
        "args": [],
        "next": "introduction",
        "position": "50:1"
    },
    "reset": {
        "type": "args",
        "locals": [],
        "next": "reset.1",
        "position": "2:3"
    },
    "reset.1": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "hills"
        ],
        "next": "reset.2",
        "position": "4:5"
    },
    "reset.2": {
        "type": "move",
        "source": [
            "val",
            1
        ],
        "target": [
            "get",
            "jungle"
        ],
        "next": "reset.3",
        "position": "5:5"
    },
    "reset.3": {
        "type": "move",
        "source": [
            "val",
            2
        ],
        "target": [
            "get",
            "beach"
        ],
        "next": "reset.4",
        "position": "6:5"
    },
    "reset.4": {
        "type": "move",
        "source": [
            "val",
            3
        ],
        "target": [
            "get",
            "mountain"
        ],
        "next": "reset.5",
        "position": "7:5"
    },
    "reset.5": {
        "type": "move",
        "source": [
            "get",
            "hills"
        ],
        "target": [
            "get",
            "at"
        ],
        "next": "reset.6",
        "position": "88:5"
    },
    "reset.6": {
        "type": "move",
        "source": [
            "val",
            4
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": "reset.7",
        "position": "13:5"
    },
    "reset.7": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "bamboo"
        ],
        "next": "reset.8",
        "position": "14:5"
    },
    "reset.8": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "flower"
        ],
        "next": "reset.9",
        "position": "15:5"
    },
    "reset.9": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "freshwater.pumpkin"
        ],
        "next": "reset.10",
        "position": "16:5"
    },
    "reset.10": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "brine.pumpkin"
        ],
        "next": "reset.11",
        "position": "17:5"
    },
    "reset.11": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "mushroom"
        ],
        "next": "reset.12",
        "position": "18:5"
    },
    "reset.12": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": "reset.13",
        "position": "19:5"
    },
    "reset.13": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "reed"
        ],
        "next": "reset.14",
        "position": "20:5"
    },
    "reset.14": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "soaked.reed"
        ],
        "next": "reset.15",
        "position": "21:5"
    },
    "reset.15": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "rock"
        ],
        "next": "reset.16",
        "position": "22:5"
    },
    "reset.16": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "rubber"
        ],
        "next": "reset.17",
        "position": "23:5"
    },
    "reset.17": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "sand.pumpkin"
        ],
        "next": "reset.18",
        "position": "24:5"
    },
    "reset.18": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "sap.pumpkin"
        ],
        "next": "reset.19",
        "position": "25:5"
    },
    "reset.19": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "shrinking.potion"
        ],
        "next": "reset.20",
        "position": "26:5"
    },
    "reset.20": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "growing.potion"
        ],
        "next": "reset.21",
        "position": "27:5"
    },
    "reset.21": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": "reset.22",
        "position": "28:5"
    },
    "reset.22": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "brine.vial"
        ],
        "next": "reset.23",
        "position": "30:5"
    },
    "reset.23": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "freshwater.vial"
        ],
        "next": "reset.24",
        "position": "31:5"
    },
    "reset.24": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "hammer"
        ],
        "next": "reset.25",
        "position": "32:5"
    },
    "reset.25": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "paper"
        ],
        "next": "reset.26",
        "position": "33:5"
    },
    "reset.26": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "airplane"
        ],
        "next": "reset.27",
        "position": "34:5"
    },
    "reset.27": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "giant.airplane"
        ],
        "next": "reset.28",
        "position": "35:5"
    },
    "reset.28": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "ballista"
        ],
        "next": "reset.29",
        "position": "38:5"
    },
    "reset.29": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "break"
        ],
        "next": "reset.30",
        "position": "39:5"
    },
    "reset.30": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "homestead"
        ],
        "next": "reset.31",
        "position": "40:5"
    },
    "reset.31": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "bridge"
        ],
        "next": "reset.32",
        "position": "41:5"
    },
    "reset.32": {
        "type": "move",
        "source": [
            "val",
            1
        ],
        "target": [
            "get",
            "lion"
        ],
        "next": "reset.33",
        "position": "42:5"
    },
    "reset.33": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "cat"
        ],
        "next": "reset.34",
        "position": "43:5"
    },
    "reset.34": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "tap"
        ],
        "next": "reset.35",
        "position": "44:5"
    },
    "reset.35": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "placed.ballista"
        ],
        "next": "reset.36",
        "position": "45:5"
    },
    "reset.36": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "launch.pad"
        ],
        "next": "reset.37",
        "position": "46:5"
    },
    "reset.37": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "stored.hammer"
        ],
        "next": "reset.38",
        "position": "47:5"
    },
    "reset.38": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "stored.airplane"
        ],
        "next": "reset.39",
        "position": "48:5"
    },
    "reset.39": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "curtain"
        ],
        "next": null,
        "position": "50:1"
    },
    "introduction": {
        "type": "switch",
        "expression": [
            "get",
            "introduction"
        ],
        "variable": "introduction",
        "value": 1,
        "mode": "walk",
        "branches": [
            "introduction.0.1"
        ],
        "weights": [
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "54:3"
    },
    "introduction.0.1": {
        "type": "text",
        "text": "Escape from Peruácru Island https://github.com/kriskowal/peruacru",
        "lift": "",
        "drop": "",
        "next": "introduction.1",
        "position": "54:3"
    },
    "introduction.1": {
        "type": "text",
        "text": "by",
        "lift": " ",
        "drop": " ",
        "next": "introduction.2",
        "position": "55:3"
    },
    "introduction.2": {
        "type": "switch",
        "expression": [
            "get",
            "introduction.2"
        ],
        "variable": "introduction.2",
        "value": 1,
        "mode": "walk",
        "branches": [
            "introduction.2.1"
        ],
        "weights": [
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "55:3"
    },
    "introduction.2.1": {
        "type": "text",
        "text": "Kris https://www.patreon.com/kriskowal",
        "lift": "",
        "drop": "",
        "next": "introduction.3",
        "position": "55:3"
    },
    "introduction.3": {
        "type": "text",
        "text": "and",
        "lift": " ",
        "drop": " ",
        "next": "introduction.4",
        "position": "56:3"
    },
    "introduction.4": {
        "type": "switch",
        "expression": [
            "get",
            "introduction.4"
        ],
        "variable": "introduction.4",
        "value": 1,
        "mode": "walk",
        "branches": [
            "introduction.4.1"
        ],
        "weights": [
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "56:3"
    },
    "introduction.4.1": {
        "type": "text",
        "text": "Kathy https://kathleenkowal.com",
        "lift": "",
        "drop": "",
        "next": "introduction.5",
        "position": "56:3"
    },
    "introduction.5": {
        "type": "text",
        "text": ". Free on",
        "lift": "",
        "drop": " ",
        "next": "introduction.6",
        "position": "58:3"
    },
    "introduction.6": {
        "type": "switch",
        "expression": [
            "get",
            "introduction.6"
        ],
        "variable": "introduction.6",
        "value": 1,
        "mode": "walk",
        "branches": [
            "introduction.6.1"
        ],
        "weights": [
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "58:3"
    },
    "introduction.6.1": {
        "type": "text",
        "text": "iOS https://apps.apple.com/us/app/peru%C3%A1cru/id1210564800",
        "lift": "",
        "drop": "",
        "next": "introduction.7",
        "position": "58:3"
    },
    "introduction.7": {
        "type": "text",
        "text": "and",
        "lift": " ",
        "drop": " ",
        "next": "introduction.8",
        "position": "59:3"
    },
    "introduction.8": {
        "type": "switch",
        "expression": [
            "get",
            "introduction.8"
        ],
        "variable": "introduction.8",
        "value": 1,
        "mode": "walk",
        "branches": [
            "introduction.8.1"
        ],
        "weights": [
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "59:3"
    },
    "introduction.8.1": {
        "type": "text",
        "text": "Android https://play.google.com/store/apps/details?id=land.then.peruacru&hl=en",
        "lift": "",
        "drop": "",
        "next": "introduction.9",
        "position": "59:3"
    },
    "introduction.9": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "introduction.10",
        "position": "61:3"
    },
    "introduction.10": {
        "type": "par",
        "next": "introduction.11",
        "position": "61:3"
    },
    "introduction.11": {
        "type": "text",
        "text": "There were once a brother and sister who would shrink themselves with red potions and explore the world from the back of a giant paper airplane. They discovered an uninhabited island amid the sparkling Pacific ocean and named it Peruácru. They alighted upon a green knoll and drank their blue growing potions, only to damage their plane and lose their stock of potions. The clever pair set out to explore the island and hopefully find a way home with their four hands and two cunning heads.",
        "lift": " ",
        "drop": " ",
        "next": "introduction.12",
        "position": "75:5"
    },
    "introduction.12": {
        "type": "opt",
        "question": [
            "introduction.12.1"
        ],
        "answer": [
            "introduction.12.2"
        ],
        "keywords": [
            "",
            "continue"
        ],
        "next": "introduction.13",
        "position": "75:5"
    },
    "introduction.12.1": {
        "type": "text",
        "text": "Continue.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "75:5"
    },
    "introduction.12.2": {
        "type": "goto",
        "next": "hills",
        "position": "76:3"
    },
    "introduction.13": {
        "type": "call",
        "branch": "maybe.break",
        "args": [],
        "next": "introduction.14",
        "position": "76:3"
    },
    "introduction.14": {
        "type": "ask",
        "position": "77:3"
    },
    "hills": {
        "type": "move",
        "source": [
            "get",
            "hills"
        ],
        "target": [
            "get",
            "at"
        ],
        "next": "hills.1",
        "position": "87:3"
    },
    "hills.1": {
        "type": "text",
        "text": "Hills. There is a tall, green knoll and a",
        "lift": "",
        "drop": " ",
        "next": "hills.2",
        "position": "87:3"
    },
    "hills.2": {
        "type": "switch",
        "expression": [
            "get",
            "hills.2"
        ],
        "variable": "hills.2",
        "value": 0,
        "mode": "rand",
        "branches": [
            "hills.2.1",
            "hills.2.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "87:3"
    },
    "hills.2.1": {
        "type": "text",
        "text": "broad",
        "lift": "",
        "drop": "",
        "next": "hills.3",
        "position": "87:3"
    },
    "hills.2.2": {
        "type": "text",
        "text": "wide",
        "lift": "",
        "drop": "",
        "next": "hills.3",
        "position": "87:3"
    },
    "hills.3": {
        "type": "text",
        "text": "valley with a freshwater river. There are",
        "lift": " ",
        "drop": " ",
        "next": "hills.4",
        "position": "88:3"
    },
    "hills.4": {
        "type": "switch",
        "expression": [
            "get",
            "hills.4"
        ],
        "variable": "hills.4",
        "value": 0,
        "mode": "rand",
        "branches": [
            "hills.4.1",
            "hills.4.2",
            "hills.4.3",
            "hills.4.4"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "88:3"
    },
    "hills.4.1": {
        "type": "text",
        "text": "numerous",
        "lift": "",
        "drop": "",
        "next": "hills.5",
        "position": "88:3"
    },
    "hills.4.2": {
        "type": "text",
        "text": "many",
        "lift": "",
        "drop": "",
        "next": "hills.5",
        "position": "88:3"
    },
    "hills.4.3": {
        "type": "text",
        "text": "uncountable",
        "lift": "",
        "drop": "",
        "next": "hills.5",
        "position": "88:3"
    },
    "hills.4.4": {
        "type": "text",
        "text": "plentiful",
        "lift": "",
        "drop": "",
        "next": "hills.5",
        "position": "88:3"
    },
    "hills.5": {
        "type": "text",
        "text": "pumpkins.",
        "lift": " ",
        "drop": " ",
        "next": "hills.6",
        "position": "90:5"
    },
    "hills.6": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "not",
                    [
                        "get",
                        "pumpkin"
                    ]
                ],
                [
                    "<",
                    [
                        "get",
                        "hand"
                    ],
                    [
                        "val",
                        2
                    ]
                ]
            ]
        ],
        "branch": "hills.8",
        "next": "hills.7",
        "position": "90:5"
    },
    "hills.7": {
        "type": "text",
        "text": "You would need to drop something to pick up a pumpkin. One of you would need two free hands.",
        "lift": " ",
        "drop": " ",
        "next": "hills.8",
        "position": "93:5"
    },
    "hills.8": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "get",
                    "ballista"
                ],
                [
                    "not",
                    [
                        "get",
                        "placed.ballista"
                    ]
                ]
            ]
        ],
        "branch": "hills.10",
        "next": "hills.9",
        "position": "93:5"
    },
    "hills.9": {
        "type": "text",
        "text": "This looks like a good spot for a giant slingshot.",
        "lift": " ",
        "drop": " ",
        "next": "hills.10",
        "position": "95:5"
    },
    "hills.10": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "placed.ballista"
            ]
        ],
        "branch": "hills.12",
        "next": "hills.11",
        "position": "95:5"
    },
    "hills.11": {
        "type": "text",
        "text": "Your giant slingshot stands waiting for a launch vehicle large enough to carry two, tiny passengers.",
        "lift": " ",
        "drop": " ",
        "next": "hills.12",
        "position": "98:5"
    },
    "hills.12": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "launch.pad"
            ]
        ],
        "branch": "hills.choice",
        "next": "hills.13",
        "position": "98:5"
    },
    "hills.13": {
        "type": "br",
        "next": "hills.14"
    },
    "hills.14": {
        "type": "switch",
        "expression": [
            "get",
            "shrinking.potion"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "hills.14.1",
            "hills.14.2",
            "hills.14.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "99:5"
    },
    "hills.14.1": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "hills.14.1.0.1",
            "hills.14.1.0.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "101:7"
    },
    "hills.14.1.0.1": {
        "type": "text",
        "text": "You might be too heavy for the plane to carry you both away.",
        "lift": " ",
        "drop": " ",
        "next": "hills.choice",
        "position": "102:7"
    },
    "hills.14.1.0.2": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "hills.14.1.0.2.0.1",
            "hills.14.1.0.2.0.2",
            "hills.14.1.0.2.0.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "102:7"
    },
    "hills.14.1.0.2.0.1": {
        "type": "goto",
        "next": "hills.14.1.0.2.1",
        "position": "102:7"
    },
    "hills.14.1.0.2.0.2": {
        "type": "text",
        "text": "This mushroom",
        "lift": "",
        "drop": "",
        "next": "hills.14.1.0.2.1",
        "position": "102:7"
    },
    "hills.14.1.0.2.0.3": {
        "type": "text",
        "text": "These mushrooms",
        "lift": "",
        "drop": "",
        "next": "hills.14.1.0.2.1",
        "position": "102:7"
    },
    "hills.14.1.0.2.1": {
        "type": "text",
        "text": "might be handy if we were to shrink ourselves and fly away on this plane, and an animal might well eat it straight, but we should prepare potions.",
        "lift": " ",
        "drop": " ",
        "next": "hills.choice",
        "position": "106:7"
    },
    "hills.14.2": {
        "type": "text",
        "text": "You’ve got one shrinking potion, but it’s dangerous to go alone.",
        "lift": " ",
        "drop": " ",
        "next": "hills.choice",
        "position": "108:5"
    },
    "hills.14.3": {
        "type": "text",
        "text": "Your giant airplane stands on the giant slingshot. All systems are go. Awaiting a tiny crew for launch.",
        "lift": " ",
        "drop": " ",
        "next": "hills.choice",
        "position": "110:5"
    },
    "hills.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "launch.pad"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hills.choice.1",
        "next": "hills.choice.0.1",
        "position": "114:5"
    },
    "hills.choice.0.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "shrinking.potion"
                ],
                [
                    "val",
                    2
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hills.choice.1",
        "next": "hills.choice.0.2",
        "position": "114:5"
    },
    "hills.choice.0.2": {
        "type": "opt",
        "question": [
            "hills.choice.0.4",
            "hills.choice.0.5",
            "hills.choice.0.6"
        ],
        "answer": [
            "hills.choice.0.3",
            "hills.choice.0.5",
            "hills.choice.0.7",
            "hills.choice.0.11"
        ],
        "keywords": [
            "launch",
            "launch-pad",
            "quaff",
            "scene"
        ],
        "next": "hills.choice.1",
        "position": "114:5"
    },
    "hills.choice.0.3": {
        "type": "text",
        "text": "You q",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "114:5"
    },
    "hills.choice.0.4": {
        "type": "text",
        "text": "Q",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "114:5"
    },
    "hills.choice.0.5": {
        "type": "text",
        "text": "uaff your shrinking potions",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "114:5"
    },
    "hills.choice.0.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "114:5"
    },
    "hills.choice.0.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "launch.pad"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "launch.pad"
        ],
        "next": "hills.choice.0.8",
        "position": "114:5"
    },
    "hills.choice.0.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "placed.ballista"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "placed.ballista"
        ],
        "next": "hills.choice.0.9",
        "position": "114:5"
    },
    "hills.choice.0.9": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "shrinking.potion"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "shrinking.potion"
        ],
        "next": "hills.choice.0.10",
        "position": "114:5"
    },
    "hills.choice.0.10": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "curtain"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "curtain"
        ],
        "next": null,
        "position": "114:5"
    },
    "hills.choice.0.11": {
        "type": "text",
        "text": "and board your paper airliner. As one, you pull the pin and slingshot into the sky toward home!",
        "lift": " ",
        "drop": " ",
        "next": "hills.choice.0.12",
        "position": "117:7"
    },
    "hills.choice.0.12": {
        "type": "opt",
        "question": [
            "hills.choice.0.12.1"
        ],
        "answer": [
            "hills.choice.0.12.2"
        ],
        "keywords": [
            ""
        ],
        "next": "hills.choice.0.13",
        "position": "117:7"
    },
    "hills.choice.0.12.1": {
        "type": "text",
        "text": "Congratulations!",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "117:7"
    },
    "hills.choice.0.12.2": {
        "type": "goto",
        "next": "credits",
        "position": "118:5"
    },
    "hills.choice.0.13": {
        "type": "ask",
        "position": "118:5"
    },
    "hills.choice.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "and",
                [
                    "and",
                    [
                        "and",
                        [
                            "and",
                            [
                                "not",
                                [
                                    "get",
                                    "pumpkin"
                                ]
                            ],
                            [
                                "not",
                                [
                                    "get",
                                    "sap.pumpkin"
                                ]
                            ]
                        ],
                        [
                            "not",
                            [
                                "get",
                                "sand.pumpkin"
                            ]
                        ]
                    ],
                    [
                        "not",
                        [
                            "get",
                            "brine.pumpkin"
                        ]
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "freshwater.pumpkin"
                    ]
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hills.choice.2",
        "next": "hills.choice.1.1",
        "position": "129:5"
    },
    "hills.choice.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    2
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hills.choice.2",
        "next": "hills.choice.1.2",
        "position": "129:5"
    },
    "hills.choice.1.2": {
        "type": "opt",
        "question": [
            "hills.choice.1.4",
            "hills.choice.1.5",
            "hills.choice.1.6"
        ],
        "answer": [
            "hills.choice.1.3",
            "hills.choice.1.5",
            "hills.choice.1.7",
            "hills.choice.1.9"
        ],
        "keywords": [
            "get pumpkin",
            "pumpkins"
        ],
        "next": "hills.choice.2",
        "position": "129:5"
    },
    "hills.choice.1.3": {
        "type": "text",
        "text": "You g",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "129:5"
    },
    "hills.choice.1.4": {
        "type": "text",
        "text": "G",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "129:5"
    },
    "hills.choice.1.5": {
        "type": "text",
        "text": "et a pumpkin",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "129:5"
    },
    "hills.choice.1.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "129:5"
    },
    "hills.choice.1.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": "hills.choice.1.8",
        "position": "129:5"
    },
    "hills.choice.1.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "129:5"
    },
    "hills.choice.1.9": {
        "type": "text",
        "text": ", grasping it with two hands.",
        "lift": "",
        "drop": " ",
        "next": "hills.choice",
        "position": "130:5"
    },
    "hills.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "flower"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hills.choice.3",
        "next": "hills.choice.2.1",
        "position": "131:5"
    },
    "hills.choice.2.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hills.choice.3",
        "next": "hills.choice.2.2",
        "position": "131:5"
    },
    "hills.choice.2.2": {
        "type": "opt",
        "question": [
            "hills.choice.2.4",
            "hills.choice.2.5"
        ],
        "answer": [
            "hills.choice.2.3",
            "hills.choice.2.5",
            "hills.choice.2.6",
            "hills.choice.2.8"
        ],
        "keywords": [
            "flowers",
            "get flower"
        ],
        "next": "hills.choice.3",
        "position": "131:5"
    },
    "hills.choice.2.3": {
        "type": "text",
        "text": "You p",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "131:5"
    },
    "hills.choice.2.4": {
        "type": "text",
        "text": "P",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "131:5"
    },
    "hills.choice.2.5": {
        "type": "text",
        "text": "luck a blue flower.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "131:5"
    },
    "hills.choice.2.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "flower"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "flower"
        ],
        "next": "hills.choice.2.7",
        "position": "131:5"
    },
    "hills.choice.2.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "131:5"
    },
    "hills.choice.2.8": {
        "type": "call",
        "branch": "grow.airplane.clue",
        "args": [],
        "next": "hills.choice",
        "position": "132:5"
    },
    "hills.choice.3": {
        "type": "call",
        "branch": "hammer.storage",
        "args": [],
        "next": "hills.choice.4",
        "position": "133:3"
    },
    "hills.choice.4": {
        "type": "call",
        "branch": "common",
        "args": [],
        "next": "hills.choice.5",
        "position": "134:3"
    },
    "hills.choice.5": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "homestead"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hills.choice.6",
        "next": "hills.choice.5.1",
        "position": "136:5"
    },
    "hills.choice.5.1": {
        "type": "opt",
        "question": [
            "hills.choice.5.3",
            "hills.choice.5.4"
        ],
        "answer": [
            "hills.choice.5.2",
            "hills.choice.5.4",
            "hills.choice.5.5"
        ],
        "keywords": [
            "go jungle",
            "south",
            "trail"
        ],
        "next": "hills.choice.6",
        "position": "136:5"
    },
    "hills.choice.5.2": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "136:5"
    },
    "hills.choice.5.3": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "136:5"
    },
    "hills.choice.5.4": {
        "type": "text",
        "text": "ollow the path into the jungle.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "136:5"
    },
    "hills.choice.5.5": {
        "type": "par",
        "next": "jungle",
        "position": "137:5"
    },
    "hills.choice.6": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "bridge"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hills.choice.7",
        "next": "hills.choice.6.1",
        "position": "139:5"
    },
    "hills.choice.6.1": {
        "type": "opt",
        "question": [
            "hills.choice.6.3",
            "hills.choice.6.4"
        ],
        "answer": [
            "hills.choice.6.2",
            "hills.choice.6.4",
            "hills.choice.6.5"
        ],
        "keywords": [
            "corner",
            "go beach",
            "south east"
        ],
        "next": "hills.choice.7",
        "position": "139:5"
    },
    "hills.choice.6.2": {
        "type": "text",
        "text": "You c",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "139:5"
    },
    "hills.choice.6.3": {
        "type": "text",
        "text": "C",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "139:5"
    },
    "hills.choice.6.4": {
        "type": "text",
        "text": "ut across the bridge down to the beach.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "139:5"
    },
    "hills.choice.6.5": {
        "type": "par",
        "next": "beach",
        "position": "140:5"
    },
    "hills.choice.7": {
        "type": "call",
        "branch": "maybe.break",
        "args": [],
        "next": "hills.choice.8",
        "position": "141:3"
    },
    "hills.choice.8": {
        "type": "ask",
        "position": "142:3"
    },
    "homestead.formula": {
        "type": "args",
        "locals": [],
        "next": "homestead.formula.1",
        "position": "145:3"
    },
    "homestead.formula.1": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "and",
                    [
                        "and",
                        [
                            "==",
                            [
                                "get",
                                "at"
                            ],
                            [
                                "get",
                                "hills"
                            ]
                        ],
                        [
                            "get",
                            "homestead"
                        ]
                    ],
                    [
                        "get",
                        "flower"
                    ]
                ],
                [
                    "get",
                    "freshwater.pumpkin"
                ]
            ]
        ],
        "branch": null,
        "next": "homestead.formula.2",
        "position": "146:5"
    },
    "homestead.formula.2": {
        "type": "text",
        "text": "“Well, we already have a giant pumpkin house. We don’t have much use for another,” says the",
        "lift": " ",
        "drop": " ",
        "next": "homestead.formula.3",
        "position": "148:5"
    },
    "homestead.formula.3": {
        "type": "switch",
        "expression": [
            "get",
            "homestead.formula.3"
        ],
        "variable": "homestead.formula.3",
        "value": 0,
        "mode": "rand",
        "branches": [
            "homestead.formula.3.1",
            "homestead.formula.3.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "148:5"
    },
    "homestead.formula.3.1": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "homestead.formula.4",
        "position": "148:5"
    },
    "homestead.formula.3.2": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "homestead.formula.4",
        "position": "148:5"
    },
    "homestead.formula.4": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "4162:5"
    },
    "homestead.creation": {
        "type": "args",
        "locals": [],
        "next": "homestead.creation.1",
        "position": "150:3"
    },
    "homestead.creation.1": {
        "type": "text",
        "text": "The pumpkin grows as big as a house. You may need to find a way to make a growing potion without a pumpkin.",
        "lift": " ",
        "drop": " ",
        "next": "homestead.creation.2",
        "position": "153:3"
    },
    "homestead.creation.2": {
        "type": "par",
        "next": "homestead.creation.3",
        "position": "153:3"
    },
    "homestead.creation.3": {
        "type": "text",
        "text": "The two of you establish a base around the house, planting a garden and laying a path that leads to the southerly jungle.",
        "lift": " ",
        "drop": " ",
        "next": "homestead.creation.4",
        "position": "156:5"
    },
    "homestead.creation.4": {
        "type": "opt",
        "question": [
            "homestead.creation.4.1"
        ],
        "answer": [
            "homestead.creation.4.2"
        ],
        "keywords": [
            "",
            "continue",
            "scene",
            "south"
        ],
        "next": "homestead.creation.5",
        "position": "156:5"
    },
    "homestead.creation.4.1": {
        "type": "text",
        "text": "Continue...",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "156:5"
    },
    "homestead.creation.4.2": {
        "type": "goto",
        "next": "jungle",
        "position": "157:3"
    },
    "homestead.creation.5": {
        "type": "ask",
        "position": "157:3"
    },
    "jungle": {
        "type": "move",
        "source": [
            "get",
            "jungle"
        ],
        "target": [
            "get",
            "at"
        ],
        "next": "jungle.1",
        "position": "162:3"
    },
    "jungle.1": {
        "type": "text",
        "text": "Jungle.",
        "lift": "",
        "drop": " ",
        "next": "jungle.2",
        "position": "163:5"
    },
    "jungle.2": {
        "type": "jump",
        "condition": [
            "get",
            "tap"
        ],
        "branch": "jungle.4",
        "next": "jungle.3",
        "position": "163:5"
    },
    "jungle.3": {
        "type": "text",
        "text": "There are rubber trees and stands of bamboo.",
        "lift": " ",
        "drop": " ",
        "next": "jungle.4",
        "position": "164:5"
    },
    "jungle.4": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "tap"
            ]
        ],
        "branch": "jungle.6",
        "next": "jungle.5",
        "position": "164:5"
    },
    "jungle.5": {
        "type": "text",
        "text": "There are stands of bamboo and sap flows from a rubber tree.",
        "lift": " ",
        "drop": " ",
        "next": "jungle.6",
        "position": "165:3"
    },
    "jungle.6": {
        "type": "text",
        "text": "Little red mushrooms litter the forest floor.",
        "lift": "",
        "drop": " ",
        "next": "jungle.7",
        "position": "166:5"
    },
    "jungle.7": {
        "type": "jump",
        "condition": [
            "get",
            "bridge"
        ],
        "branch": "jungle.9",
        "next": "jungle.8",
        "position": "166:5"
    },
    "jungle.8": {
        "type": "text",
        "text": "A river runs to the sea along the eastern margin of the jungle.",
        "lift": " ",
        "drop": " ",
        "next": "jungle.9",
        "position": "168:5"
    },
    "jungle.9": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "bridge"
            ]
        ],
        "branch": "jungle.11",
        "next": "jungle.10",
        "position": "168:5"
    },
    "jungle.10": {
        "type": "text",
        "text": "The path through the jungle runs from the hills to the north and across a bridge to the east.",
        "lift": " ",
        "drop": " ",
        "next": "jungle.11",
        "position": "170:5"
    },
    "jungle.11": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "ballista"
            ]
        ],
        "branch": "jungle.choice",
        "next": "jungle.12",
        "position": "170:5"
    },
    "jungle.12": {
        "type": "text",
        "text": "Your giant slingshot is getting heavy, but neither of you can see a clearing large enough to put it down",
        "lift": " ",
        "drop": " ",
        "next": "jungle.13",
        "position": "171:5"
    },
    "jungle.13": {
        "type": "switch",
        "expression": [
            "get",
            "jungle.13"
        ],
        "variable": "jungle.13",
        "value": 0,
        "mode": "rand",
        "branches": [
            "jungle.13.1",
            "jungle.13.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "171:5"
    },
    "jungle.13.1": {
        "type": "text",
        "text": "nearby",
        "lift": "",
        "drop": "",
        "next": "jungle.14",
        "position": "171:5"
    },
    "jungle.13.2": {
        "type": "text",
        "text": "near here",
        "lift": "",
        "drop": "",
        "next": "jungle.14",
        "position": "171:5"
    },
    "jungle.14": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "jungle.choice",
        "position": "172:3"
    },
    "jungle.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "hand"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "jungle.choice.1",
        "next": "jungle.choice.0.1",
        "position": "174:5"
    },
    "jungle.choice.0.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "bamboo"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "jungle.choice.1",
        "next": "jungle.choice.0.2",
        "position": "174:5"
    },
    "jungle.choice.0.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "bridge"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "jungle.choice.1",
        "next": "jungle.choice.0.3",
        "position": "174:5"
    },
    "jungle.choice.0.3": {
        "type": "opt",
        "question": [
            "jungle.choice.0.5",
            "jungle.choice.0.6"
        ],
        "answer": [
            "jungle.choice.0.4",
            "jungle.choice.0.6",
            "jungle.choice.0.9"
        ],
        "keywords": [
            "bamboos",
            "get all bamboo"
        ],
        "next": "jungle.choice.1",
        "position": "174:5"
    },
    "jungle.choice.0.4": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "174:5"
    },
    "jungle.choice.0.5": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "174:5"
    },
    "jungle.choice.0.6": {
        "type": "text",
        "text": "ill your",
        "lift": "",
        "drop": " ",
        "next": "jungle.choice.0.7",
        "position": "174:5"
    },
    "jungle.choice.0.7": {
        "type": "switch",
        "expression": [
            ">=",
            [
                "get",
                "hand"
            ],
            [
                "val",
                4
            ]
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "jungle.choice.0.7.1",
            "jungle.choice.0.7.2"
        ],
        "weights": [
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "174:5"
    },
    "jungle.choice.0.7.1": {
        "type": "text",
        "text": "remaining",
        "lift": "",
        "drop": "",
        "next": "jungle.choice.0.8",
        "position": "174:5"
    },
    "jungle.choice.0.7.2": {
        "type": "goto",
        "next": "jungle.choice.0.8",
        "position": "174:5"
    },
    "jungle.choice.0.8": {
        "type": "text",
        "text": "arms with bamboo.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "174:5"
    },
    "jungle.choice.0.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "bamboo"
            ],
            [
                "get",
                "hand"
            ]
        ],
        "target": [
            "get",
            "bamboo"
        ],
        "next": "jungle.choice.0.10",
        "position": "175:5"
    },
    "jungle.choice.0.10": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": "jungle.choice",
        "position": "175:5"
    },
    "jungle.choice.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "bamboo"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "jungle.choice.2",
        "next": "jungle.choice.1.1",
        "position": "177:5"
    },
    "jungle.choice.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "bridge"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "jungle.choice.2",
        "next": "jungle.choice.1.2",
        "position": "177:5"
    },
    "jungle.choice.1.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "jungle.choice.2",
        "next": "jungle.choice.1.3",
        "position": "177:5"
    },
    "jungle.choice.1.3": {
        "type": "opt",
        "question": [
            "jungle.choice.1.5",
            "jungle.choice.1.6"
        ],
        "answer": [
            "jungle.choice.1.4",
            "jungle.choice.1.6",
            "jungle.choice.1.7",
            "jungle.choice.1.9"
        ],
        "keywords": [
            "bamboos",
            "get bamboo"
        ],
        "next": "jungle.choice.2",
        "position": "177:5"
    },
    "jungle.choice.1.4": {
        "type": "text",
        "text": "You c",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "177:5"
    },
    "jungle.choice.1.5": {
        "type": "text",
        "text": "C",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "177:5"
    },
    "jungle.choice.1.6": {
        "type": "text",
        "text": "ut some bamboo.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "177:5"
    },
    "jungle.choice.1.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "bamboo"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "bamboo"
        ],
        "next": "jungle.choice.1.8",
        "position": "177:5"
    },
    "jungle.choice.1.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "177:5"
    },
    "jungle.choice.1.9": {
        "type": "goto",
        "next": "jungle.choice",
        "position": "178:5"
    },
    "jungle.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "mushroom"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "jungle.choice.3",
        "next": "jungle.choice.2.1",
        "position": "180:5"
    },
    "jungle.choice.2.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "jungle.choice.3",
        "next": "jungle.choice.2.2",
        "position": "180:5"
    },
    "jungle.choice.2.2": {
        "type": "opt",
        "question": [
            "jungle.choice.2.4",
            "jungle.choice.2.5"
        ],
        "answer": [
            "jungle.choice.2.3",
            "jungle.choice.2.5",
            "jungle.choice.2.6",
            "jungle.choice.2.8"
        ],
        "keywords": [
            "get mushroom",
            "mushrooms"
        ],
        "next": "jungle.choice.3",
        "position": "180:5"
    },
    "jungle.choice.2.3": {
        "type": "text",
        "text": "You p",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "180:5"
    },
    "jungle.choice.2.4": {
        "type": "text",
        "text": "P",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "180:5"
    },
    "jungle.choice.2.5": {
        "type": "text",
        "text": "ick a mushroom.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "180:5"
    },
    "jungle.choice.2.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "mushroom"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "mushroom"
        ],
        "next": "jungle.choice.2.7",
        "position": "180:5"
    },
    "jungle.choice.2.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "180:5"
    },
    "jungle.choice.2.8": {
        "type": "goto",
        "next": "jungle.choice",
        "position": "181:3"
    },
    "jungle.choice.3": {
        "type": "call",
        "branch": "common",
        "args": [],
        "next": "jungle.choice.4",
        "position": "181:3"
    },
    "jungle.choice.4": {
        "type": "opt",
        "question": [
            "jungle.choice.4.2",
            "jungle.choice.4.3"
        ],
        "answer": [
            "jungle.choice.4.1",
            "jungle.choice.4.3",
            "jungle.choice.4.4"
        ],
        "keywords": [
            "go hills",
            "north",
            "trail"
        ],
        "next": "jungle.choice.5",
        "position": "183:5"
    },
    "jungle.choice.4.1": {
        "type": "text",
        "text": "You r",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "183:5"
    },
    "jungle.choice.4.2": {
        "type": "text",
        "text": "R",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "183:5"
    },
    "jungle.choice.4.3": {
        "type": "text",
        "text": "eturn to your homestead in the hills.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "183:5"
    },
    "jungle.choice.4.4": {
        "type": "par",
        "next": "hills",
        "position": "184:5"
    },
    "jungle.choice.5": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "bridge"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "jungle.choice.6",
        "next": "jungle.choice.5.1",
        "position": "187:5"
    },
    "jungle.choice.5.1": {
        "type": "opt",
        "question": [
            "jungle.choice.5.3",
            "jungle.choice.5.4"
        ],
        "answer": [
            "jungle.choice.5.2",
            "jungle.choice.5.4",
            "jungle.choice.5.5"
        ],
        "keywords": [
            "bridgewater",
            "east",
            "go river"
        ],
        "next": "jungle.choice.6",
        "position": "187:5"
    },
    "jungle.choice.5.2": {
        "type": "text",
        "text": "You w",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "187:5"
    },
    "jungle.choice.5.3": {
        "type": "text",
        "text": "W",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "187:5"
    },
    "jungle.choice.5.4": {
        "type": "text",
        "text": "alk through the jungle to a river.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "187:5"
    },
    "jungle.choice.5.5": {
        "type": "goto",
        "next": "river",
        "position": "187:5"
    },
    "jungle.choice.6": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "bridge"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "jungle.choice.7",
        "next": "jungle.choice.6.1",
        "position": "191:5"
    },
    "jungle.choice.6.1": {
        "type": "opt",
        "question": [
            "jungle.choice.6.3",
            "jungle.choice.6.4",
            "jungle.choice.6.5"
        ],
        "answer": [
            "jungle.choice.6.2",
            "jungle.choice.6.4",
            "jungle.choice.6.6"
        ],
        "keywords": [
            "bridgewater",
            "east",
            "go beach"
        ],
        "next": "jungle.choice.7",
        "position": "191:5"
    },
    "jungle.choice.6.2": {
        "type": "text",
        "text": "You c",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "191:5"
    },
    "jungle.choice.6.3": {
        "type": "text",
        "text": "C",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "191:5"
    },
    "jungle.choice.6.4": {
        "type": "text",
        "text": "ross the bridge over the river",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "191:5"
    },
    "jungle.choice.6.5": {
        "type": "text",
        "text": "to the beach.",
        "lift": " ",
        "drop": "",
        "next": null,
        "position": "191:5"
    },
    "jungle.choice.6.6": {
        "type": "text",
        "text": "and head down to the beach.",
        "lift": " ",
        "drop": " ",
        "next": "jungle.choice.6.7",
        "position": "193:5"
    },
    "jungle.choice.6.7": {
        "type": "par",
        "next": "beach",
        "position": "193:5"
    },
    "jungle.choice.7": {
        "type": "call",
        "branch": "maybe.break",
        "args": [],
        "next": "jungle.choice.8",
        "position": "194:3"
    },
    "jungle.choice.8": {
        "type": "ask",
        "position": "195:3"
    },
    "tap.formula": {
        "type": "args",
        "locals": [],
        "next": "tap.formula.1",
        "position": "198:3"
    },
    "tap.formula.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "jungle"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "tap.formula.1.1",
        "position": "201:5"
    },
    "tap.formula.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "or",
                [
                    "get",
                    "rock"
                ],
                [
                    "get",
                    "hammer"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "tap.formula.1.2",
        "position": "201:5"
    },
    "tap.formula.1.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "tap"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "tap.formula.1.3",
        "position": "201:5"
    },
    "tap.formula.1.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "bamboo"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "tap.formula.1.4",
        "position": "201:5"
    },
    "tap.formula.1.4": {
        "type": "opt",
        "question": [
            "tap.formula.1.6",
            "tap.formula.1.7"
        ],
        "answer": [
            "tap.formula.1.5",
            "tap.formula.1.7",
            "tap.formula.1.10",
            "tap.formula.1.13"
        ],
        "keywords": [
            "rubber-tree",
            "tap rubber tree"
        ],
        "next": null,
        "position": "201:5"
    },
    "tap.formula.1.5": {
        "type": "text",
        "text": "You t",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "201:5"
    },
    "tap.formula.1.6": {
        "type": "text",
        "text": "T",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "201:5"
    },
    "tap.formula.1.7": {
        "type": "text",
        "text": "ap a shoot of bamboo into a rubber tree with the",
        "lift": "",
        "drop": " ",
        "next": "tap.formula.1.8",
        "position": "202:5"
    },
    "tap.formula.1.8": {
        "type": "switch",
        "expression": [
            "not",
            [
                "get",
                "hammer"
            ]
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "tap.formula.1.8.1",
            "tap.formula.1.8.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "202:5"
    },
    "tap.formula.1.8.1": {
        "type": "text",
        "text": "hammer",
        "lift": "",
        "drop": "",
        "next": "tap.formula.1.9",
        "position": "202:5"
    },
    "tap.formula.1.8.2": {
        "type": "text",
        "text": "rock",
        "lift": "",
        "drop": "",
        "next": "tap.formula.1.9",
        "position": "202:5"
    },
    "tap.formula.1.9": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "202:5"
    },
    "tap.formula.1.10": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "bamboo"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "bamboo"
        ],
        "next": "tap.formula.1.11",
        "position": "202:5"
    },
    "tap.formula.1.11": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": "tap.formula.1.12",
        "position": "202:5"
    },
    "tap.formula.1.12": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "tap"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "tap"
        ],
        "next": null,
        "position": "202:5"
    },
    "tap.formula.1.13": {
        "type": "text",
        "text": "Sap begins to flow from the tap.",
        "lift": " ",
        "drop": " ",
        "next": "jungle.choice",
        "position": "204:5"
    },
    "bridge.formula": {
        "type": "args",
        "locals": [],
        "next": "bridge.formula.1",
        "position": "206:3"
    },
    "bridge.formula.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "jungle"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "bridge.formula.1.1",
        "position": "209:5"
    },
    "bridge.formula.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "bridge"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "bridge.formula.1.2",
        "position": "209:5"
    },
    "bridge.formula.1.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "bamboo"
                ],
                [
                    "val",
                    3
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "bridge.formula.1.3",
        "position": "209:5"
    },
    "bridge.formula.1.3": {
        "type": "opt",
        "question": [
            "bridge.formula.1.5",
            "bridge.formula.1.6",
            "bridge.formula.1.7"
        ],
        "answer": [
            "bridge.formula.1.4",
            "bridge.formula.1.6",
            "bridge.formula.1.8",
            "bridge.formula.1.11"
        ],
        "keywords": [
            "bridgewater",
            "build bridge"
        ],
        "next": null,
        "position": "209:5"
    },
    "bridge.formula.1.4": {
        "type": "text",
        "text": "You b",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "209:5"
    },
    "bridge.formula.1.5": {
        "type": "text",
        "text": "B",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "209:5"
    },
    "bridge.formula.1.6": {
        "type": "text",
        "text": "uild a bridge with the bamboo",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "209:5"
    },
    "bridge.formula.1.7": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "209:5"
    },
    "bridge.formula.1.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "bamboo"
            ],
            [
                "val",
                3
            ]
        ],
        "target": [
            "get",
            "bamboo"
        ],
        "next": "bridge.formula.1.9",
        "position": "209:5"
    },
    "bridge.formula.1.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "bridge"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "bridge"
        ],
        "next": "bridge.formula.1.10",
        "position": "209:5"
    },
    "bridge.formula.1.10": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                3
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "209:5"
    },
    "bridge.formula.1.11": {
        "type": "text",
        "text": ", crossing over and walking down to the beach.",
        "lift": "",
        "drop": " ",
        "next": "bridge.formula.1.12",
        "position": "211:5"
    },
    "bridge.formula.1.12": {
        "type": "par",
        "next": "beach",
        "position": "211:5"
    },
    "river": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    ">",
                    [
                        "get",
                        "bamboo"
                    ],
                    [
                        "val",
                        0
                    ]
                ],
                [
                    "<",
                    [
                        "get",
                        "bamboo"
                    ],
                    [
                        "val",
                        3
                    ]
                ]
            ]
        ],
        "branch": "river.2",
        "next": "river.1",
        "position": "214:5"
    },
    "river.1": {
        "type": "text",
        "text": "You might make a safe bridge with more bamboo.",
        "lift": " ",
        "drop": " ",
        "next": "river.2",
        "position": "216:3"
    },
    "river.2": {
        "type": "call",
        "branch": "bridge.formula",
        "args": [],
        "next": "river.3",
        "position": "216:3"
    },
    "river.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "river.4",
        "next": "river.3.1",
        "position": "219:5"
    },
    "river.3.1": {
        "type": "opt",
        "question": [
            "river.3.3",
            "river.3.4"
        ],
        "answer": [
            "river.3.2",
            "river.3.4",
            "river.3.5",
            "river.3.7"
        ],
        "keywords": [
            "fill pumpkin with fresh water",
            "stream"
        ],
        "next": "river.4",
        "position": "219:5"
    },
    "river.3.2": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "219:5"
    },
    "river.3.3": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "219:5"
    },
    "river.3.4": {
        "type": "text",
        "text": "ill your pumpkin with fresh water from the river.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "219:5"
    },
    "river.3.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": "river.3.6",
        "position": "219:5"
    },
    "river.3.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "freshwater.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "freshwater.pumpkin"
        ],
        "next": null,
        "position": "219:5"
    },
    "river.3.7": {
        "type": "goto",
        "next": "return",
        "position": "220:5"
    },
    "river.4": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "vial"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "river.5",
        "next": "river.4.1",
        "position": "222:5"
    },
    "river.4.1": {
        "type": "opt",
        "question": [
            "river.4.3",
            "river.4.4"
        ],
        "answer": [
            "river.4.2",
            "river.4.4",
            "river.4.7",
            "river.4.9"
        ],
        "keywords": [
            "fill vial with fresh water",
            "stream"
        ],
        "next": "river.5",
        "position": "222:5"
    },
    "river.4.2": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "222:5"
    },
    "river.4.3": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "222:5"
    },
    "river.4.4": {
        "type": "text",
        "text": "ill",
        "lift": "",
        "drop": " ",
        "next": "river.4.5",
        "position": "222:5"
    },
    "river.4.5": {
        "type": "switch",
        "expression": [
            "get",
            "vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "river.4.5.1",
            "river.4.5.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "222:5"
    },
    "river.4.5.1": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "river.4.6",
        "position": "222:5"
    },
    "river.4.5.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "river.4.6",
        "position": "222:5"
    },
    "river.4.6": {
        "type": "text",
        "text": "vial with fresh water from the river.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "222:5"
    },
    "river.4.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": "river.4.8",
        "position": "222:5"
    },
    "river.4.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "freshwater.vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "freshwater.vial"
        ],
        "next": null,
        "position": "222:5"
    },
    "river.4.9": {
        "type": "goto",
        "next": "return",
        "position": "223:5"
    },
    "river.5": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "bridge"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "river.6",
        "next": "river.5.1",
        "position": "225:5"
    },
    "river.5.1": {
        "type": "opt",
        "question": [
            "river.5.3",
            "river.5.4"
        ],
        "answer": [
            "river.5.2",
            "river.5.4",
            "river.5.5"
        ],
        "keywords": [
            "bridgewater",
            "east",
            "go beach"
        ],
        "next": "river.6",
        "position": "225:5"
    },
    "river.5.2": {
        "type": "text",
        "text": "You c",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "225:5"
    },
    "river.5.3": {
        "type": "text",
        "text": "C",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "225:5"
    },
    "river.5.4": {
        "type": "text",
        "text": "ross the bridge to the beach.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "225:5"
    },
    "river.5.5": {
        "type": "goto",
        "next": "beach",
        "position": "225:5"
    },
    "river.6": {
        "type": "opt",
        "question": [
            "river.6.2",
            "river.6.3"
        ],
        "answer": [
            "river.6.1",
            "river.6.3",
            "river.6.4"
        ],
        "keywords": [
            ""
        ],
        "next": "river.7",
        "position": "227:5"
    },
    "river.6.1": {
        "type": "text",
        "text": "You r",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "227:5"
    },
    "river.6.2": {
        "type": "text",
        "text": "R",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "227:5"
    },
    "river.6.3": {
        "type": "text",
        "text": "eturn to the jungle.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "227:5"
    },
    "river.6.4": {
        "type": "goto",
        "next": "jungle",
        "position": "227:5"
    },
    "river.7": {
        "type": "call",
        "branch": "maybe.break",
        "args": [],
        "next": "river.8",
        "position": "229:3"
    },
    "river.8": {
        "type": "ask",
        "position": "230:3"
    },
    "beach": {
        "type": "move",
        "source": [
            "get",
            "beach"
        ],
        "target": [
            "get",
            "at"
        ],
        "next": "beach.1",
        "position": "235:3"
    },
    "beach.1": {
        "type": "text",
        "text": "Beach. There is a marsh of reeds and a sandy beach.",
        "lift": "",
        "drop": " ",
        "next": "beach.2",
        "position": "236:5"
    },
    "beach.2": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "ballista"
            ]
        ],
        "branch": "beach.choice",
        "next": "beach.3",
        "position": "236:5"
    },
    "beach.3": {
        "type": "text",
        "text": "Your giant slingshot is getting heavy, but this doesn’t look like a good place to keep it. It’ll get stuck in the sand, and it would be a burden to carry up the mountain.",
        "lift": " ",
        "drop": " ",
        "next": "beach.choice",
        "position": "239:3"
    },
    "beach.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "reed"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "beach.choice.1",
        "next": "beach.choice.0.1",
        "position": "241:5"
    },
    "beach.choice.0.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "beach.choice.1",
        "next": "beach.choice.0.2",
        "position": "241:5"
    },
    "beach.choice.0.2": {
        "type": "opt",
        "question": [
            "beach.choice.0.4",
            "beach.choice.0.5"
        ],
        "answer": [
            "beach.choice.0.3",
            "beach.choice.0.5",
            "beach.choice.0.6",
            "beach.choice.0.8"
        ],
        "keywords": [
            "get reed",
            "reeds"
        ],
        "next": "beach.choice.1",
        "position": "241:5"
    },
    "beach.choice.0.3": {
        "type": "text",
        "text": "You c",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "241:5"
    },
    "beach.choice.0.4": {
        "type": "text",
        "text": "C",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "241:5"
    },
    "beach.choice.0.5": {
        "type": "text",
        "text": "ut a reed from the marsh grasses.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "241:5"
    },
    "beach.choice.0.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "reed"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "reed"
        ],
        "next": "beach.choice.0.7",
        "position": "241:5"
    },
    "beach.choice.0.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "241:5"
    },
    "beach.choice.0.8": {
        "type": "goto",
        "next": "beach.choice",
        "position": "242:3"
    },
    "beach.choice.1": {
        "type": "call",
        "branch": "common",
        "args": [],
        "next": "beach.choice.2",
        "position": "242:3"
    },
    "beach.choice.2": {
        "type": "opt",
        "question": [
            "beach.choice.2.2",
            "beach.choice.2.3"
        ],
        "answer": [
            "beach.choice.2.1",
            "beach.choice.2.3",
            "beach.choice.2.4"
        ],
        "keywords": [
            "bridgewater",
            "go jungle",
            "west"
        ],
        "next": "beach.choice.3",
        "position": "244:5"
    },
    "beach.choice.2.1": {
        "type": "text",
        "text": "You c",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "244:5"
    },
    "beach.choice.2.2": {
        "type": "text",
        "text": "C",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "244:5"
    },
    "beach.choice.2.3": {
        "type": "text",
        "text": "ross the bridge and return to the jungle.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "244:5"
    },
    "beach.choice.2.4": {
        "type": "par",
        "next": "jungle",
        "position": "245:5"
    },
    "beach.choice.3": {
        "type": "opt",
        "question": [
            "beach.choice.3.2",
            "beach.choice.3.3"
        ],
        "answer": [
            "beach.choice.3.1",
            "beach.choice.3.3",
            "beach.choice.3.4"
        ],
        "keywords": [
            "corner",
            "go hills",
            "north west"
        ],
        "next": "beach.choice.4",
        "position": "247:5"
    },
    "beach.choice.3.1": {
        "type": "text",
        "text": "You c",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "247:5"
    },
    "beach.choice.3.2": {
        "type": "text",
        "text": "C",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "247:5"
    },
    "beach.choice.3.3": {
        "type": "text",
        "text": "ross the bridge and cut back to your homestead in the hills.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "247:5"
    },
    "beach.choice.3.4": {
        "type": "par",
        "next": "hills",
        "position": "248:5"
    },
    "beach.choice.4": {
        "type": "jump",
        "condition": [
            "==",
            [
                "and",
                [
                    "get",
                    "lion"
                ],
                [
                    "not",
                    [
                        "get",
                        "ballista"
                    ]
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "beach.choice.5",
        "next": "beach.choice.4.1",
        "position": "251:5"
    },
    "beach.choice.4.1": {
        "type": "opt",
        "question": [
            "beach.choice.4.3",
            "beach.choice.4.4"
        ],
        "answer": [
            "beach.choice.4.2",
            "beach.choice.4.4",
            "beach.choice.4.5"
        ],
        "keywords": [
            "go mountain",
            "lava-flow",
            "north"
        ],
        "next": "beach.choice.5",
        "position": "251:5"
    },
    "beach.choice.4.2": {
        "type": "text",
        "text": "You w",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "251:5"
    },
    "beach.choice.4.3": {
        "type": "text",
        "text": "W",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "251:5"
    },
    "beach.choice.4.4": {
        "type": "text",
        "text": "alk north across an isthmus to the foot of a volcano.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "251:5"
    },
    "beach.choice.4.5": {
        "type": "par",
        "next": "mountain.gate",
        "position": "252:5"
    },
    "beach.choice.5": {
        "type": "jump",
        "condition": [
            "==",
            [
                "and",
                [
                    "not",
                    [
                        "get",
                        "lion"
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "ballista"
                    ]
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "beach.choice.6",
        "next": "beach.choice.5.1",
        "position": "255:5"
    },
    "beach.choice.5.1": {
        "type": "opt",
        "question": [
            "beach.choice.5.3",
            "beach.choice.5.4"
        ],
        "answer": [
            "beach.choice.5.2",
            "beach.choice.5.4",
            "beach.choice.5.7"
        ],
        "keywords": [
            "go mountain",
            "lava-flow",
            "north"
        ],
        "next": "beach.choice.6",
        "position": "255:5"
    },
    "beach.choice.5.2": {
        "type": "text",
        "text": "You m",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "255:5"
    },
    "beach.choice.5.3": {
        "type": "text",
        "text": "M",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "255:5"
    },
    "beach.choice.5.4": {
        "type": "text",
        "text": "ake your way over the isthmus to the volcano’s",
        "lift": "",
        "drop": " ",
        "next": "beach.choice.5.5",
        "position": "256:5"
    },
    "beach.choice.5.5": {
        "type": "switch",
        "expression": [
            "get",
            "beach.choice.5.5"
        ],
        "variable": "beach.choice.5.5",
        "value": 0,
        "mode": "rand",
        "branches": [
            "beach.choice.5.5.1",
            "beach.choice.5.5.2",
            "beach.choice.5.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "256:5"
    },
    "beach.choice.5.5.1": {
        "type": "text",
        "text": "summit",
        "lift": "",
        "drop": "",
        "next": "beach.choice.5.6",
        "position": "256:5"
    },
    "beach.choice.5.5.2": {
        "type": "text",
        "text": "peak",
        "lift": "",
        "drop": "",
        "next": "beach.choice.5.6",
        "position": "256:5"
    },
    "beach.choice.5.5.3": {
        "type": "text",
        "text": "caldera",
        "lift": "",
        "drop": "",
        "next": "beach.choice.5.6",
        "position": "256:5"
    },
    "beach.choice.5.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "256:5"
    },
    "beach.choice.5.7": {
        "type": "par",
        "next": "mountain",
        "position": "257:5"
    },
    "beach.choice.6": {
        "type": "call",
        "branch": "maybe.break",
        "args": [],
        "next": "beach.choice.7",
        "position": "258:3"
    },
    "beach.choice.7": {
        "type": "ask",
        "position": "259:3"
    },
    "mountain.gate": {
        "type": "move",
        "source": [
            "get",
            "mountain"
        ],
        "target": [
            "get",
            "at"
        ],
        "next": "mountain.gate.1",
        "position": "264:3"
    },
    "mountain.gate.1": {
        "type": "text",
        "text": "Foot of the mountain. You stand on a path that leads up the slopes of an active volcano. A lion guards the way.",
        "lift": "",
        "drop": " ",
        "next": "mountain.gate.2",
        "position": "267:5"
    },
    "mountain.gate.2": {
        "type": "jump",
        "condition": [
            "get",
            "mushroom"
        ],
        "branch": "mountain.gate.4",
        "next": "mountain.gate.3",
        "position": "267:5"
    },
    "mountain.gate.3": {
        "type": "text",
        "text": "It looks hungry.",
        "lift": " ",
        "drop": " ",
        "next": "mountain.gate.4",
        "position": "269:5"
    },
    "mountain.gate.4": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "mushroom"
            ]
        ],
        "branch": "mountain.gate.choice",
        "next": "mountain.gate.5",
        "position": "269:5"
    },
    "mountain.gate.5": {
        "type": "text",
        "text": "The lion roars. You must be carrying something delicious.",
        "lift": " ",
        "drop": " ",
        "next": "mountain.gate.choice",
        "position": "271:3"
    },
    "mountain.gate.choice": {
        "type": "opt",
        "question": [],
        "answer": [
            "mountain.gate.choice.0.1"
        ],
        "keywords": [
            "give lion mushroom"
        ],
        "next": "mountain.gate.choice.1",
        "position": "272:5"
    },
    "mountain.gate.choice.0.1": {
        "type": "text",
        "text": "You offer the mushroom to the lion.",
        "lift": " ",
        "drop": " ",
        "next": "give.lion.mushroom",
        "position": "274:5"
    },
    "mountain.gate.choice.1": {
        "type": "call",
        "branch": "common",
        "args": [],
        "next": "mountain.gate.choice.2",
        "position": "275:3"
    },
    "mountain.gate.choice.2": {
        "type": "opt",
        "question": [
            "mountain.gate.choice.2.2",
            "mountain.gate.choice.2.3"
        ],
        "answer": [
            "mountain.gate.choice.2.1",
            "mountain.gate.choice.2.3",
            "mountain.gate.choice.2.4"
        ],
        "keywords": [
            "corner",
            "down",
            "go beach",
            "lava-flow",
            "south"
        ],
        "next": "mountain.gate.choice.3",
        "position": "277:5"
    },
    "mountain.gate.choice.2.1": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "277:5"
    },
    "mountain.gate.choice.2.2": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "277:5"
    },
    "mountain.gate.choice.2.3": {
        "type": "text",
        "text": "lee back to the beach.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "277:5"
    },
    "mountain.gate.choice.2.4": {
        "type": "par",
        "next": "beach",
        "position": "278:5"
    },
    "mountain.gate.choice.3": {
        "type": "ask",
        "position": "279:3"
    },
    "mountain": {
        "type": "move",
        "source": [
            "get",
            "mountain"
        ],
        "target": [
            "get",
            "at"
        ],
        "next": "mountain.1",
        "position": "283:5"
    },
    "mountain.1": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "lion"
            ]
        ],
        "branch": "mountain.3",
        "next": "mountain.gate",
        "position": "283:5"
    },
    "mountain.3": {
        "type": "text",
        "text": "Mountain. You stand at the peak of an active volcano. Liquid hot lava bubbles in the cinder cone, flowing from the far end down to the sea. The stench of burning sulfur envelopes you.",
        "lift": "",
        "drop": " ",
        "next": "mountain.4",
        "position": "289:5"
    },
    "mountain.4": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "get",
                    "sand.pumpkin"
                ],
                [
                    "not",
                    [
                        "get",
                        "reed"
                    ]
                ]
            ]
        ],
        "branch": "mountain.choice",
        "next": "mountain.5",
        "position": "289:5"
    },
    "mountain.5": {
        "type": "text",
        "text": "Perhaps you could blow glass from molten sand if you found something to blow through.",
        "lift": " ",
        "drop": " ",
        "next": "mountain.choice",
        "position": "291:3"
    },
    "mountain.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "rock"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "mountain.choice.1",
        "next": "mountain.choice.0.1",
        "position": "294:5"
    },
    "mountain.choice.0.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "mountain.choice.1",
        "next": "mountain.choice.0.2",
        "position": "294:5"
    },
    "mountain.choice.0.2": {
        "type": "opt",
        "question": [
            "mountain.choice.0.4",
            "mountain.choice.0.5",
            "mountain.choice.0.6"
        ],
        "answer": [
            "mountain.choice.0.3",
            "mountain.choice.0.5",
            "mountain.choice.0.7",
            "mountain.choice.0.9"
        ],
        "keywords": [
            "get rock",
            "scene"
        ],
        "next": "mountain.choice.1",
        "position": "294:5"
    },
    "mountain.choice.0.3": {
        "type": "text",
        "text": "You p",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "294:5"
    },
    "mountain.choice.0.4": {
        "type": "text",
        "text": "P",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "294:5"
    },
    "mountain.choice.0.5": {
        "type": "text",
        "text": "ick up a volcanic rock",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "294:5"
    },
    "mountain.choice.0.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "294:5"
    },
    "mountain.choice.0.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "rock"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "rock"
        ],
        "next": "mountain.choice.0.8",
        "position": "294:5"
    },
    "mountain.choice.0.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "294:5"
    },
    "mountain.choice.0.9": {
        "type": "text",
        "text": ", holding it with one hand.",
        "lift": "",
        "drop": " ",
        "next": "mountain.choice",
        "position": "296:3"
    },
    "mountain.choice.1": {
        "type": "call",
        "branch": "common",
        "args": [],
        "next": "mountain.choice.2",
        "position": "296:3"
    },
    "mountain.choice.2": {
        "type": "opt",
        "question": [
            "mountain.choice.2.2",
            "mountain.choice.2.3"
        ],
        "answer": [
            "mountain.choice.2.1",
            "mountain.choice.2.3",
            "mountain.choice.2.4"
        ],
        "keywords": [
            "corner",
            "down",
            "go beach",
            "lava-flow",
            "south"
        ],
        "next": "mountain.choice.3",
        "position": "298:5"
    },
    "mountain.choice.2.1": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "298:5"
    },
    "mountain.choice.2.2": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "298:5"
    },
    "mountain.choice.2.3": {
        "type": "text",
        "text": "escend to the beach.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "298:5"
    },
    "mountain.choice.2.4": {
        "type": "par",
        "next": "beach",
        "position": "299:5"
    },
    "mountain.choice.3": {
        "type": "call",
        "branch": "maybe.break",
        "args": [],
        "next": "mountain.choice.4",
        "position": "300:3"
    },
    "mountain.choice.4": {
        "type": "ask",
        "position": "301:3"
    },
    "common": {
        "type": "args",
        "locals": [],
        "next": "common.1",
        "position": "304:3"
    },
    "common.1": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "and",
                    [
                        "get",
                        "rock"
                    ],
                    [
                        "get",
                        "paper"
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "rochambeau"
                    ]
                ]
            ]
        ],
        "branch": "common.6",
        "next": "common.2",
        "position": "305:5"
    },
    "common.2": {
        "type": "text",
        "text": "“Well, we’ve got rock and paper: all we need are scissors!” jokes the",
        "lift": " ",
        "drop": " ",
        "next": "common.3",
        "position": "307:5"
    },
    "common.3": {
        "type": "switch",
        "expression": [
            "get",
            "common.3"
        ],
        "variable": "common.3",
        "value": 0,
        "mode": "rand",
        "branches": [
            "common.3.1",
            "common.3.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "307:5"
    },
    "common.3.1": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "common.4",
        "position": "307:5"
    },
    "common.3.2": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "common.4",
        "position": "307:5"
    },
    "common.4": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "common.5",
        "position": "307:5"
    },
    "common.5": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "rochambeau"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "rochambeau"
        ],
        "next": "common.6",
        "position": "307:5"
    },
    "common.6": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "not",
                    [
                        "get",
                        "hand"
                    ]
                ],
                [
                    "get",
                    "growing.potion"
                ]
            ]
        ],
        "branch": "common.8",
        "next": "common.7",
        "position": "308:5"
    },
    "common.7": {
        "type": "text",
        "text": "You might need a free hand if you wish to grow something with growing potion.",
        "lift": " ",
        "drop": " ",
        "next": "common.8",
        "position": "311:3"
    },
    "common.8": {
        "type": "call",
        "branch": "grow.airplane.clue",
        "args": [],
        "next": "common.9",
        "position": "311:3"
    },
    "common.9": {
        "type": "call",
        "branch": "inventory",
        "args": [],
        "next": "common.10",
        "position": "312:3"
    },
    "common.10": {
        "type": "call",
        "branch": "maybe.drop",
        "args": [],
        "next": null,
        "position": "313:3"
    },
    "inventory": {
        "type": "args",
        "locals": [],
        "next": "inventory.1",
        "position": "315:3"
    },
    "inventory.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.2",
        "next": "inventory.1.1",
        "position": "318:5"
    },
    "inventory.1.1": {
        "type": "opt",
        "question": [
            "inventory.1.2"
        ],
        "answer": [
            "inventory.1.3"
        ],
        "keywords": [
            "pumpkin",
            "pumpkins"
        ],
        "next": "inventory.2",
        "position": "318:5"
    },
    "inventory.1.2": {
        "type": "text",
        "text": "You have a pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "318:5"
    },
    "inventory.1.3": {
        "type": "goto",
        "next": "pumpkin",
        "position": "318:5"
    },
    "inventory.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "freshwater.pumpkin"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.3",
        "next": "inventory.2.1",
        "position": "322:5"
    },
    "inventory.2.1": {
        "type": "opt",
        "question": [
            "inventory.2.2"
        ],
        "answer": [
            "inventory.2.3"
        ],
        "keywords": [
            "freshwater pumpkin",
            "freshwater-pumpkin"
        ],
        "next": "inventory.3",
        "position": "322:5"
    },
    "inventory.2.2": {
        "type": "text",
        "text": "You have a pumpkin full of fresh water.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "322:5"
    },
    "inventory.2.3": {
        "type": "goto",
        "next": "freshwater.pumpkin",
        "position": "322:5"
    },
    "inventory.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "brine.pumpkin"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.4",
        "next": "inventory.3.1",
        "position": "326:5"
    },
    "inventory.3.1": {
        "type": "opt",
        "question": [
            "inventory.3.2"
        ],
        "answer": [
            "inventory.3.3"
        ],
        "keywords": [
            "brine pumpkin",
            "brine-pumpkin"
        ],
        "next": "inventory.4",
        "position": "326:5"
    },
    "inventory.3.2": {
        "type": "text",
        "text": "You have a pumpkin full of briny sea water.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "326:5"
    },
    "inventory.3.3": {
        "type": "goto",
        "next": "brine.pumpkin",
        "position": "326:5"
    },
    "inventory.4": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "sap.pumpkin"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.5",
        "next": "inventory.4.1",
        "position": "330:5"
    },
    "inventory.4.1": {
        "type": "opt",
        "question": [
            "inventory.4.2"
        ],
        "answer": [
            "inventory.4.3"
        ],
        "keywords": [
            "sap pumpkin",
            "sap-pumpkin"
        ],
        "next": "inventory.5",
        "position": "330:5"
    },
    "inventory.4.2": {
        "type": "text",
        "text": "You have a pumpkin full of rubber sap.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "330:5"
    },
    "inventory.4.3": {
        "type": "goto",
        "next": "sap.pumpkin",
        "position": "330:5"
    },
    "inventory.5": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "sand.pumpkin"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.6",
        "next": "inventory.5.1",
        "position": "334:5"
    },
    "inventory.5.1": {
        "type": "opt",
        "question": [
            "inventory.5.2"
        ],
        "answer": [
            "inventory.5.3"
        ],
        "keywords": [
            "sand pumpkin",
            "sand-pumpkin"
        ],
        "next": "inventory.6",
        "position": "334:5"
    },
    "inventory.5.2": {
        "type": "text",
        "text": "You have a pumpkin full of sand.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "334:5"
    },
    "inventory.5.3": {
        "type": "goto",
        "next": "sand.pumpkin",
        "position": "334:5"
    },
    "inventory.6": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "flower"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.7",
        "next": "inventory.6.1",
        "position": "338:5"
    },
    "inventory.6.1": {
        "type": "opt",
        "question": [
            "inventory.6.2"
        ],
        "answer": [
            "inventory.6.7"
        ],
        "keywords": [
            "flower",
            "flowers"
        ],
        "next": "inventory.7",
        "position": "338:5"
    },
    "inventory.6.2": {
        "type": "text",
        "text": "You have",
        "lift": "",
        "drop": " ",
        "next": "inventory.6.3",
        "position": "338:5"
    },
    "inventory.6.3": {
        "type": "switch",
        "expression": [
            "get",
            "flower"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.6.3.1",
            "inventory.6.3.2",
            "inventory.6.3.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "338:5"
    },
    "inventory.6.3.1": {
        "type": "goto",
        "next": "inventory.6.4",
        "position": "338:5"
    },
    "inventory.6.3.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "inventory.6.4",
        "position": "338:5"
    },
    "inventory.6.3.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "flower"
            ]
        ],
        "next": "inventory.6.4",
        "position": "338:5"
    },
    "inventory.6.4": {
        "type": "text",
        "text": "blue flower",
        "lift": " ",
        "drop": "",
        "next": "inventory.6.5",
        "position": "338:5"
    },
    "inventory.6.5": {
        "type": "switch",
        "expression": [
            "get",
            "flower"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.6.5.1",
            "inventory.6.5.2",
            "inventory.6.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "338:5"
    },
    "inventory.6.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.6.6",
        "position": "338:5"
    },
    "inventory.6.5.2": {
        "type": "goto",
        "next": "inventory.6.6",
        "position": "338:5"
    },
    "inventory.6.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.6.6",
        "position": "338:5"
    },
    "inventory.6.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "338:5"
    },
    "inventory.6.7": {
        "type": "goto",
        "next": "flower",
        "position": "338:5"
    },
    "inventory.7": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "bamboo"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.8",
        "next": "inventory.7.1",
        "position": "342:5"
    },
    "inventory.7.1": {
        "type": "opt",
        "question": [
            "inventory.7.2"
        ],
        "answer": [
            "inventory.7.3"
        ],
        "keywords": [
            "bamboo"
        ],
        "next": "inventory.8",
        "position": "342:5"
    },
    "inventory.7.2": {
        "type": "text",
        "text": "You have bamboo.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "342:5"
    },
    "inventory.7.3": {
        "type": "goto",
        "next": "bamboo",
        "position": "342:5"
    },
    "inventory.8": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "mushroom"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.9",
        "next": "inventory.8.1",
        "position": "346:5"
    },
    "inventory.8.1": {
        "type": "opt",
        "question": [
            "inventory.8.2"
        ],
        "answer": [
            "inventory.8.7"
        ],
        "keywords": [
            "mushroom"
        ],
        "next": "inventory.9",
        "position": "346:5"
    },
    "inventory.8.2": {
        "type": "text",
        "text": "You have",
        "lift": "",
        "drop": " ",
        "next": "inventory.8.3",
        "position": "346:5"
    },
    "inventory.8.3": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.8.3.1",
            "inventory.8.3.2",
            "inventory.8.3.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "346:5"
    },
    "inventory.8.3.1": {
        "type": "goto",
        "next": "inventory.8.4",
        "position": "346:5"
    },
    "inventory.8.3.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "inventory.8.4",
        "position": "346:5"
    },
    "inventory.8.3.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "mushroom"
            ]
        ],
        "next": "inventory.8.4",
        "position": "346:5"
    },
    "inventory.8.4": {
        "type": "text",
        "text": "mushroom",
        "lift": " ",
        "drop": "",
        "next": "inventory.8.5",
        "position": "347:5"
    },
    "inventory.8.5": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.8.5.1",
            "inventory.8.5.2",
            "inventory.8.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "347:5"
    },
    "inventory.8.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.8.6",
        "position": "347:5"
    },
    "inventory.8.5.2": {
        "type": "goto",
        "next": "inventory.8.6",
        "position": "347:5"
    },
    "inventory.8.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.8.6",
        "position": "347:5"
    },
    "inventory.8.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "347:5"
    },
    "inventory.8.7": {
        "type": "goto",
        "next": "mushroom",
        "position": "347:5"
    },
    "inventory.9": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "reed"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.10",
        "next": "inventory.9.1",
        "position": "351:5"
    },
    "inventory.9.1": {
        "type": "opt",
        "question": [
            "inventory.9.2"
        ],
        "answer": [
            "inventory.9.3"
        ],
        "keywords": [
            "reed"
        ],
        "next": "inventory.10",
        "position": "351:5"
    },
    "inventory.9.2": {
        "type": "text",
        "text": "You have some reeds.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "351:5"
    },
    "inventory.9.3": {
        "type": "goto",
        "next": "reed",
        "position": "351:5"
    },
    "inventory.10": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "soaked.reed"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.11",
        "next": "inventory.10.1",
        "position": "355:5"
    },
    "inventory.10.1": {
        "type": "opt",
        "question": [
            "inventory.10.2"
        ],
        "answer": [
            "inventory.10.3"
        ],
        "keywords": [
            "soaked-reed"
        ],
        "next": "inventory.11",
        "position": "355:5"
    },
    "inventory.10.2": {
        "type": "text",
        "text": "You have some soaked reeds.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "355:5"
    },
    "inventory.10.3": {
        "type": "goto",
        "next": "soaked.reed",
        "position": "355:5"
    },
    "inventory.11": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "rock"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.12",
        "next": "inventory.11.1",
        "position": "359:5"
    },
    "inventory.11.1": {
        "type": "opt",
        "question": [
            "inventory.11.2"
        ],
        "answer": [
            "inventory.11.7"
        ],
        "keywords": [
            "rock"
        ],
        "next": "inventory.12",
        "position": "359:5"
    },
    "inventory.11.2": {
        "type": "text",
        "text": "You have",
        "lift": "",
        "drop": " ",
        "next": "inventory.11.3",
        "position": "359:5"
    },
    "inventory.11.3": {
        "type": "switch",
        "expression": [
            "get",
            "rock"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.11.3.1",
            "inventory.11.3.2",
            "inventory.11.3.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "359:5"
    },
    "inventory.11.3.1": {
        "type": "goto",
        "next": "inventory.11.4",
        "position": "359:5"
    },
    "inventory.11.3.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "inventory.11.4",
        "position": "359:5"
    },
    "inventory.11.3.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "rock"
            ]
        ],
        "next": "inventory.11.4",
        "position": "359:5"
    },
    "inventory.11.4": {
        "type": "text",
        "text": "rock",
        "lift": " ",
        "drop": "",
        "next": "inventory.11.5",
        "position": "359:5"
    },
    "inventory.11.5": {
        "type": "switch",
        "expression": [
            "get",
            "rock"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.11.5.1",
            "inventory.11.5.2",
            "inventory.11.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "359:5"
    },
    "inventory.11.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.11.6",
        "position": "359:5"
    },
    "inventory.11.5.2": {
        "type": "goto",
        "next": "inventory.11.6",
        "position": "359:5"
    },
    "inventory.11.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.11.6",
        "position": "359:5"
    },
    "inventory.11.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "359:5"
    },
    "inventory.11.7": {
        "type": "goto",
        "next": "rock",
        "position": "359:5"
    },
    "inventory.12": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "rubber"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.13",
        "next": "inventory.12.1",
        "position": "363:5"
    },
    "inventory.12.1": {
        "type": "opt",
        "question": [
            "inventory.12.2"
        ],
        "answer": [
            "inventory.12.3"
        ],
        "keywords": [
            "rubber"
        ],
        "next": "inventory.13",
        "position": "363:5"
    },
    "inventory.12.2": {
        "type": "text",
        "text": "You have a mass of rubber.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "363:5"
    },
    "inventory.12.3": {
        "type": "goto",
        "next": "rubber",
        "position": "363:5"
    },
    "inventory.13": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "brine.vial"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.14",
        "next": "inventory.13.1",
        "position": "367:5"
    },
    "inventory.13.1": {
        "type": "opt",
        "question": [
            "inventory.13.2"
        ],
        "answer": [
            "inventory.13.7"
        ],
        "keywords": [
            "brine vial",
            "brine-vial"
        ],
        "next": "inventory.14",
        "position": "367:5"
    },
    "inventory.13.2": {
        "type": "text",
        "text": "You have",
        "lift": "",
        "drop": " ",
        "next": "inventory.13.3",
        "position": "367:5"
    },
    "inventory.13.3": {
        "type": "switch",
        "expression": [
            "get",
            "brine.vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.13.3.1",
            "inventory.13.3.2",
            "inventory.13.3.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "367:5"
    },
    "inventory.13.3.1": {
        "type": "goto",
        "next": "inventory.13.4",
        "position": "367:5"
    },
    "inventory.13.3.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "inventory.13.4",
        "position": "367:5"
    },
    "inventory.13.3.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "brine.vial"
            ]
        ],
        "next": "inventory.13.4",
        "position": "367:5"
    },
    "inventory.13.4": {
        "type": "text",
        "text": "vial",
        "lift": " ",
        "drop": "",
        "next": "inventory.13.5",
        "position": "367:5"
    },
    "inventory.13.5": {
        "type": "switch",
        "expression": [
            "get",
            "brine.vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.13.5.1",
            "inventory.13.5.2",
            "inventory.13.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "367:5"
    },
    "inventory.13.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.13.6",
        "position": "367:5"
    },
    "inventory.13.5.2": {
        "type": "goto",
        "next": "inventory.13.6",
        "position": "367:5"
    },
    "inventory.13.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.13.6",
        "position": "367:5"
    },
    "inventory.13.6": {
        "type": "text",
        "text": "of brine.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "368:5"
    },
    "inventory.13.7": {
        "type": "goto",
        "next": "brine.vial",
        "position": "368:5"
    },
    "inventory.14": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "freshwater.vial"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.15",
        "next": "inventory.14.1",
        "position": "372:5"
    },
    "inventory.14.1": {
        "type": "opt",
        "question": [
            "inventory.14.2"
        ],
        "answer": [
            "inventory.14.7"
        ],
        "keywords": [
            "freshwater vial",
            "freshwater.vial"
        ],
        "next": "inventory.15",
        "position": "372:5"
    },
    "inventory.14.2": {
        "type": "text",
        "text": "You have",
        "lift": "",
        "drop": " ",
        "next": "inventory.14.3",
        "position": "372:5"
    },
    "inventory.14.3": {
        "type": "switch",
        "expression": [
            "get",
            "freshwater.vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.14.3.1",
            "inventory.14.3.2",
            "inventory.14.3.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "372:5"
    },
    "inventory.14.3.1": {
        "type": "goto",
        "next": "inventory.14.4",
        "position": "372:5"
    },
    "inventory.14.3.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "inventory.14.4",
        "position": "372:5"
    },
    "inventory.14.3.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "freshwater.vial"
            ]
        ],
        "next": "inventory.14.4",
        "position": "372:5"
    },
    "inventory.14.4": {
        "type": "text",
        "text": "vial",
        "lift": " ",
        "drop": "",
        "next": "inventory.14.5",
        "position": "373:5"
    },
    "inventory.14.5": {
        "type": "switch",
        "expression": [
            "get",
            "freshwater.vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.14.5.1",
            "inventory.14.5.2",
            "inventory.14.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "373:5"
    },
    "inventory.14.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.14.6",
        "position": "373:5"
    },
    "inventory.14.5.2": {
        "type": "goto",
        "next": "inventory.14.6",
        "position": "373:5"
    },
    "inventory.14.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.14.6",
        "position": "373:5"
    },
    "inventory.14.6": {
        "type": "text",
        "text": "of fresh water.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "373:5"
    },
    "inventory.14.7": {
        "type": "goto",
        "next": "freshwater.vial",
        "position": "373:5"
    },
    "inventory.15": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "vial"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.16",
        "next": "inventory.15.1",
        "position": "376:5"
    },
    "inventory.15.1": {
        "type": "opt",
        "question": [
            "inventory.15.2"
        ],
        "answer": [
            "inventory.15.7"
        ],
        "keywords": [
            "vial"
        ],
        "next": "inventory.16",
        "position": "376:5"
    },
    "inventory.15.2": {
        "type": "text",
        "text": "You have",
        "lift": "",
        "drop": " ",
        "next": "inventory.15.3",
        "position": "377:7"
    },
    "inventory.15.3": {
        "type": "switch",
        "expression": [
            "not",
            [
                "or",
                [
                    "get",
                    "brine.vial"
                ],
                [
                    "get",
                    "freshwater.vial"
                ]
            ]
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.15.3.1",
            "inventory.15.3.2",
            "inventory.15.3.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "377:7"
    },
    "inventory.15.3.1": {
        "type": "goto",
        "next": "inventory.15.4",
        "position": "378:7"
    },
    "inventory.15.3.2": {
        "type": "switch",
        "expression": [
            "get",
            "vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.15.3.2.0.1",
            "inventory.15.3.2.0.2",
            "inventory.15.3.2.0.3",
            "inventory.15.3.2.0.4"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "378:7"
    },
    "inventory.15.3.2.0.1": {
        "type": "goto",
        "next": "inventory.15.4",
        "position": "378:7"
    },
    "inventory.15.3.2.0.2": {
        "type": "text",
        "text": "an empty",
        "lift": "",
        "drop": "",
        "next": "inventory.15.4",
        "position": "378:7"
    },
    "inventory.15.3.2.0.3": {
        "type": "text",
        "text": "a pair of empty",
        "lift": "",
        "drop": "",
        "next": "inventory.15.4",
        "position": "378:7"
    },
    "inventory.15.3.2.0.4": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "vial"
            ]
        ],
        "next": "inventory.15.3.2.0.4.1",
        "position": "378:7"
    },
    "inventory.15.3.2.0.4.1": {
        "type": "text",
        "text": "empty",
        "lift": " ",
        "drop": "",
        "next": "inventory.15.4",
        "position": "378:7"
    },
    "inventory.15.3.3": {
        "type": "switch",
        "expression": [
            "get",
            "vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.15.3.3.0.1",
            "inventory.15.3.3.0.2",
            "inventory.15.3.3.0.3",
            "inventory.15.3.3.0.4"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "379:7"
    },
    "inventory.15.3.3.0.1": {
        "type": "goto",
        "next": "inventory.15.4",
        "position": "379:7"
    },
    "inventory.15.3.3.0.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "inventory.15.4",
        "position": "379:7"
    },
    "inventory.15.3.3.0.3": {
        "type": "text",
        "text": "a pair of",
        "lift": "",
        "drop": "",
        "next": "inventory.15.4",
        "position": "379:7"
    },
    "inventory.15.3.3.0.4": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "vial"
            ]
        ],
        "next": "inventory.15.4",
        "position": "379:7"
    },
    "inventory.15.4": {
        "type": "text",
        "text": "glass vial",
        "lift": " ",
        "drop": "",
        "next": "inventory.15.5",
        "position": "381:7"
    },
    "inventory.15.5": {
        "type": "switch",
        "expression": [
            "get",
            "vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.15.5.1",
            "inventory.15.5.2",
            "inventory.15.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "381:7"
    },
    "inventory.15.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.15.6",
        "position": "381:7"
    },
    "inventory.15.5.2": {
        "type": "goto",
        "next": "inventory.15.6",
        "position": "381:7"
    },
    "inventory.15.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.15.6",
        "position": "381:7"
    },
    "inventory.15.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "382:5"
    },
    "inventory.15.7": {
        "type": "goto",
        "next": "vial",
        "position": "382:5"
    },
    "inventory.16": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "shrinking.potion"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.17",
        "next": "inventory.16.1",
        "position": "386:5"
    },
    "inventory.16.1": {
        "type": "opt",
        "question": [
            "inventory.16.2"
        ],
        "answer": [
            "inventory.16.7"
        ],
        "keywords": [
            "shrinking potion",
            "shrinking-potion"
        ],
        "next": "inventory.17",
        "position": "386:5"
    },
    "inventory.16.2": {
        "type": "text",
        "text": "You have",
        "lift": "",
        "drop": " ",
        "next": "inventory.16.3",
        "position": "386:5"
    },
    "inventory.16.3": {
        "type": "switch",
        "expression": [
            "get",
            "shrinking.potion"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.16.3.1",
            "inventory.16.3.2",
            "inventory.16.3.3",
            "inventory.16.3.4"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "386:5"
    },
    "inventory.16.3.1": {
        "type": "goto",
        "next": "inventory.16.4",
        "position": "386:5"
    },
    "inventory.16.3.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "inventory.16.4",
        "position": "386:5"
    },
    "inventory.16.3.3": {
        "type": "text",
        "text": "a pair of",
        "lift": "",
        "drop": "",
        "next": "inventory.16.4",
        "position": "386:5"
    },
    "inventory.16.3.4": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "vial"
            ]
        ],
        "next": "inventory.16.4",
        "position": "386:5"
    },
    "inventory.16.4": {
        "type": "text",
        "text": "vial",
        "lift": " ",
        "drop": "",
        "next": "inventory.16.5",
        "position": "387:5"
    },
    "inventory.16.5": {
        "type": "switch",
        "expression": [
            "get",
            "shrinking.potion"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.16.5.1",
            "inventory.16.5.2",
            "inventory.16.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "387:5"
    },
    "inventory.16.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.16.6",
        "position": "387:5"
    },
    "inventory.16.5.2": {
        "type": "goto",
        "next": "inventory.16.6",
        "position": "387:5"
    },
    "inventory.16.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.16.6",
        "position": "387:5"
    },
    "inventory.16.6": {
        "type": "text",
        "text": "of shrinking potion.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "387:5"
    },
    "inventory.16.7": {
        "type": "goto",
        "next": "shrinking.potion",
        "position": "387:5"
    },
    "inventory.17": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "growing.potion"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.18",
        "next": "inventory.17.1",
        "position": "391:5"
    },
    "inventory.17.1": {
        "type": "opt",
        "question": [
            "inventory.17.2"
        ],
        "answer": [
            "inventory.17.7"
        ],
        "keywords": [
            "growing potion",
            "growing-potion"
        ],
        "next": "inventory.18",
        "position": "391:5"
    },
    "inventory.17.2": {
        "type": "text",
        "text": "You have",
        "lift": "",
        "drop": " ",
        "next": "inventory.17.3",
        "position": "391:5"
    },
    "inventory.17.3": {
        "type": "switch",
        "expression": [
            "get",
            "growing.potion"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.17.3.1",
            "inventory.17.3.2",
            "inventory.17.3.3",
            "inventory.17.3.4"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "391:5"
    },
    "inventory.17.3.1": {
        "type": "goto",
        "next": "inventory.17.4",
        "position": "391:5"
    },
    "inventory.17.3.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "inventory.17.4",
        "position": "391:5"
    },
    "inventory.17.3.3": {
        "type": "text",
        "text": "a pair of",
        "lift": "",
        "drop": "",
        "next": "inventory.17.4",
        "position": "391:5"
    },
    "inventory.17.3.4": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "vial"
            ]
        ],
        "next": "inventory.17.4",
        "position": "391:5"
    },
    "inventory.17.4": {
        "type": "text",
        "text": "vial",
        "lift": " ",
        "drop": "",
        "next": "inventory.17.5",
        "position": "392:5"
    },
    "inventory.17.5": {
        "type": "switch",
        "expression": [
            "get",
            "growing.potion"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "inventory.17.5.1",
            "inventory.17.5.2",
            "inventory.17.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "392:5"
    },
    "inventory.17.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.17.6",
        "position": "392:5"
    },
    "inventory.17.5.2": {
        "type": "goto",
        "next": "inventory.17.6",
        "position": "392:5"
    },
    "inventory.17.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "inventory.17.6",
        "position": "392:5"
    },
    "inventory.17.6": {
        "type": "text",
        "text": "of growing potion.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "392:5"
    },
    "inventory.17.7": {
        "type": "goto",
        "next": "growing.potion",
        "position": "392:5"
    },
    "inventory.18": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "ballista"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.19",
        "next": "inventory.18.1",
        "position": "395:5"
    },
    "inventory.18.1": {
        "type": "opt",
        "question": [
            "inventory.18.2"
        ],
        "answer": [
            "inventory.18.3"
        ],
        "keywords": [
            "ballista"
        ],
        "next": "inventory.19",
        "position": "395:5"
    },
    "inventory.18.2": {
        "type": "text",
        "text": "You have a giant slingshot.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "395:5"
    },
    "inventory.18.3": {
        "type": "goto",
        "next": "ballista",
        "position": "395:5"
    },
    "inventory.19": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "hammer"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.20",
        "next": "inventory.19.1",
        "position": "397:5"
    },
    "inventory.19.1": {
        "type": "opt",
        "question": [
            "inventory.19.2"
        ],
        "answer": [
            "inventory.19.3"
        ],
        "keywords": [
            "hammer"
        ],
        "next": "inventory.20",
        "position": "397:5"
    },
    "inventory.19.2": {
        "type": "text",
        "text": "You have a hammer.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "397:5"
    },
    "inventory.19.3": {
        "type": "goto",
        "next": "hammer",
        "position": "397:5"
    },
    "inventory.20": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "paper"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.21",
        "next": "inventory.20.1",
        "position": "399:5"
    },
    "inventory.20.1": {
        "type": "opt",
        "question": [
            "inventory.20.2"
        ],
        "answer": [
            "inventory.20.3"
        ],
        "keywords": [
            "paper"
        ],
        "next": "inventory.21",
        "position": "399:5"
    },
    "inventory.20.2": {
        "type": "text",
        "text": "You have some paper.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "399:5"
    },
    "inventory.20.3": {
        "type": "goto",
        "next": "paper",
        "position": "399:5"
    },
    "inventory.21": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "airplane"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "inventory.22",
        "next": "inventory.21.1",
        "position": "401:5"
    },
    "inventory.21.1": {
        "type": "opt",
        "question": [
            "inventory.21.2"
        ],
        "answer": [
            "inventory.21.3"
        ],
        "keywords": [
            "airplane"
        ],
        "next": "inventory.22",
        "position": "401:5"
    },
    "inventory.21.2": {
        "type": "text",
        "text": "You have a paper airplane.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "401:5"
    },
    "inventory.21.3": {
        "type": "goto",
        "next": "airplane",
        "position": "401:5"
    },
    "inventory.22": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "giant.airplane"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "inventory.22.1",
        "position": "405:5"
    },
    "inventory.22.1": {
        "type": "opt",
        "question": [
            "inventory.22.2"
        ],
        "answer": [
            "inventory.22.3"
        ],
        "keywords": [
            "giant airplane",
            "giant-airplane"
        ],
        "next": null,
        "position": "405:5"
    },
    "inventory.22.2": {
        "type": "text",
        "text": "You have a giant paper airplane.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "405:5"
    },
    "inventory.22.3": {
        "type": "goto",
        "next": "giant.airplane",
        "position": "405:5"
    },
    "maybe.drop": {
        "type": "args",
        "locals": [],
        "next": "maybe.drop.1",
        "position": "408:3"
    },
    "maybe.drop.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "hand"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "maybe.drop.1.1",
        "position": "410:5"
    },
    "maybe.drop.1.1": {
        "type": "opt",
        "question": [
            "maybe.drop.1.2"
        ],
        "answer": [
            "maybe.drop.1.3"
        ],
        "keywords": [],
        "next": null,
        "position": "410:5"
    },
    "maybe.drop.1.2": {
        "type": "text",
        "text": "All of your hands are full between you.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "410:5"
    },
    "maybe.drop.1.3": {
        "type": "goto",
        "next": "drops",
        "position": "410:5"
    },
    "drops": {
        "type": "text",
        "text": "Perhaps you can drop something to free up some hands.",
        "lift": " ",
        "drop": " ",
        "next": "drops.1",
        "position": "415:3"
    },
    "drops.1": {
        "type": "call",
        "branch": "inventory",
        "args": [],
        "next": "drops.2",
        "position": "415:3"
    },
    "drops.2": {
        "type": "opt",
        "question": [
            "drops.2.2",
            "drops.2.3"
        ],
        "answer": [
            "drops.2.1",
            "drops.2.3",
            "drops.2.4"
        ],
        "keywords": [
            ""
        ],
        "next": "drops.3",
        "position": "416:5"
    },
    "drops.2.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "416:5"
    },
    "drops.2.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "416:5"
    },
    "drops.2.3": {
        "type": "text",
        "text": "eep everything.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "416:5"
    },
    "drops.2.4": {
        "type": "goto",
        "next": "return",
        "position": "417:3"
    },
    "drops.3": {
        "type": "ask",
        "position": "417:3"
    },
    "pumpkin": {
        "type": "text",
        "text": "You hold the pumpkin with two hands.",
        "lift": " ",
        "drop": " ",
        "next": "pumpkin.choice",
        "position": "422:3"
    },
    "pumpkin.choice": {
        "type": "call",
        "branch": "brine.vial.pumpkin.formula",
        "args": [],
        "next": "pumpkin.choice.1",
        "position": "425:3"
    },
    "pumpkin.choice.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "hills"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "pumpkin.choice.2",
        "next": "pumpkin.choice.1.1",
        "position": "428:5"
    },
    "pumpkin.choice.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "pumpkin.choice.2",
        "next": "pumpkin.choice.1.2",
        "position": "428:5"
    },
    "pumpkin.choice.1.2": {
        "type": "opt",
        "question": [
            "pumpkin.choice.1.4",
            "pumpkin.choice.1.5"
        ],
        "answer": [
            "pumpkin.choice.1.3",
            "pumpkin.choice.1.5",
            "pumpkin.choice.1.6",
            "pumpkin.choice.1.8"
        ],
        "keywords": [
            "fill pumpkin with fresh water",
            "stream"
        ],
        "next": "pumpkin.choice.2",
        "position": "428:5"
    },
    "pumpkin.choice.1.3": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "428:5"
    },
    "pumpkin.choice.1.4": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "428:5"
    },
    "pumpkin.choice.1.5": {
        "type": "text",
        "text": "ill the pumpkin with water from the river.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "428:5"
    },
    "pumpkin.choice.1.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": "pumpkin.choice.1.7",
        "position": "428:5"
    },
    "pumpkin.choice.1.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "freshwater.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "freshwater.pumpkin"
        ],
        "next": null,
        "position": "428:5"
    },
    "pumpkin.choice.1.8": {
        "type": "goto",
        "next": "return",
        "position": "429:5"
    },
    "pumpkin.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "jungle"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "pumpkin.choice.3",
        "next": "pumpkin.choice.2.1",
        "position": "431:5"
    },
    "pumpkin.choice.2.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "tap"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "pumpkin.choice.3",
        "next": "pumpkin.choice.2.2",
        "position": "431:5"
    },
    "pumpkin.choice.2.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "pumpkin.choice.3",
        "next": "pumpkin.choice.2.3",
        "position": "431:5"
    },
    "pumpkin.choice.2.3": {
        "type": "opt",
        "question": [
            "pumpkin.choice.2.5",
            "pumpkin.choice.2.6"
        ],
        "answer": [
            "pumpkin.choice.2.4",
            "pumpkin.choice.2.6",
            "pumpkin.choice.2.7",
            "pumpkin.choice.2.9"
        ],
        "keywords": [
            "fill pumpkin with sap",
            "rubber-tree"
        ],
        "next": "pumpkin.choice.3",
        "position": "431:5"
    },
    "pumpkin.choice.2.4": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "431:5"
    },
    "pumpkin.choice.2.5": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "431:5"
    },
    "pumpkin.choice.2.6": {
        "type": "text",
        "text": "ill the pumpkin with sap from the tapped rubber tree.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "431:5"
    },
    "pumpkin.choice.2.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": "pumpkin.choice.2.8",
        "position": "431:5"
    },
    "pumpkin.choice.2.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "sap.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "sap.pumpkin"
        ],
        "next": null,
        "position": "431:5"
    },
    "pumpkin.choice.2.9": {
        "type": "goto",
        "next": "return",
        "position": "432:5"
    },
    "pumpkin.choice.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "beach"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "pumpkin.choice.4",
        "next": "pumpkin.choice.3.1",
        "position": "434:5"
    },
    "pumpkin.choice.3.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "pumpkin.choice.4",
        "next": "pumpkin.choice.3.2",
        "position": "434:5"
    },
    "pumpkin.choice.3.2": {
        "type": "opt",
        "question": [
            "pumpkin.choice.3.4",
            "pumpkin.choice.3.5"
        ],
        "answer": [
            "pumpkin.choice.3.3",
            "pumpkin.choice.3.5",
            "pumpkin.choice.3.6",
            "pumpkin.choice.3.8"
        ],
        "keywords": [
            "fill pumpkin with sand",
            "scene"
        ],
        "next": "pumpkin.choice.4",
        "position": "434:5"
    },
    "pumpkin.choice.3.3": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "434:5"
    },
    "pumpkin.choice.3.4": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "434:5"
    },
    "pumpkin.choice.3.5": {
        "type": "text",
        "text": "ill the pumpkin with white beach sand.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "434:5"
    },
    "pumpkin.choice.3.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": "pumpkin.choice.3.7",
        "position": "434:5"
    },
    "pumpkin.choice.3.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "sand.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "sand.pumpkin"
        ],
        "next": null,
        "position": "434:5"
    },
    "pumpkin.choice.3.8": {
        "type": "goto",
        "next": "return",
        "position": "435:5"
    },
    "pumpkin.choice.4": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "beach"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "pumpkin.choice.5",
        "next": "pumpkin.choice.4.1",
        "position": "437:5"
    },
    "pumpkin.choice.4.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "pumpkin.choice.5",
        "next": "pumpkin.choice.4.2",
        "position": "437:5"
    },
    "pumpkin.choice.4.2": {
        "type": "opt",
        "question": [
            "pumpkin.choice.4.4",
            "pumpkin.choice.4.5"
        ],
        "answer": [
            "pumpkin.choice.4.3",
            "pumpkin.choice.4.5",
            "pumpkin.choice.4.6",
            "pumpkin.choice.4.8"
        ],
        "keywords": [
            "fill pumpkin with brine",
            "sea"
        ],
        "next": "pumpkin.choice.5",
        "position": "437:5"
    },
    "pumpkin.choice.4.3": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "437:5"
    },
    "pumpkin.choice.4.4": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "437:5"
    },
    "pumpkin.choice.4.5": {
        "type": "text",
        "text": "ill the pumpkin with briny water from the sea.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "437:5"
    },
    "pumpkin.choice.4.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": "pumpkin.choice.4.7",
        "position": "437:5"
    },
    "pumpkin.choice.4.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "brine.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "brine.pumpkin"
        ],
        "next": null,
        "position": "437:5"
    },
    "pumpkin.choice.4.8": {
        "type": "goto",
        "next": "return",
        "position": "438:5"
    },
    "pumpkin.choice.5": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "pumpkin.choice.6",
        "next": "pumpkin.choice.5.1",
        "position": "439:5"
    },
    "pumpkin.choice.5.1": {
        "type": "opt",
        "question": [
            "pumpkin.choice.5.3",
            "pumpkin.choice.5.4",
            "pumpkin.choice.5.5"
        ],
        "answer": [
            "pumpkin.choice.5.2",
            "pumpkin.choice.5.4",
            "pumpkin.choice.5.6",
            "pumpkin.choice.5.8"
        ],
        "keywords": [
            "drop pumpkin",
            "scene"
        ],
        "next": "pumpkin.choice.6",
        "position": "439:5"
    },
    "pumpkin.choice.5.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "439:5"
    },
    "pumpkin.choice.5.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "439:5"
    },
    "pumpkin.choice.5.4": {
        "type": "text",
        "text": "rop the pumpkin",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "439:5"
    },
    "pumpkin.choice.5.5": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "439:5"
    },
    "pumpkin.choice.5.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": "pumpkin.choice.5.7",
        "position": "439:5"
    },
    "pumpkin.choice.5.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "439:5"
    },
    "pumpkin.choice.5.8": {
        "type": "text",
        "text": ", smashing it to pulpy bits.",
        "lift": "",
        "drop": " ",
        "next": "return",
        "position": "440:5"
    },
    "pumpkin.choice.6": {
        "type": "opt",
        "question": [
            "pumpkin.choice.6.2",
            "pumpkin.choice.6.3"
        ],
        "answer": [
            "pumpkin.choice.6.1",
            "pumpkin.choice.6.3",
            "pumpkin.choice.6.4"
        ],
        "keywords": [
            "",
            "keep",
            "pumpkin"
        ],
        "next": "pumpkin.choice.7",
        "position": "441:5"
    },
    "pumpkin.choice.6.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "441:5"
    },
    "pumpkin.choice.6.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "441:5"
    },
    "pumpkin.choice.6.3": {
        "type": "text",
        "text": "eep the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "441:5"
    },
    "pumpkin.choice.6.4": {
        "type": "goto",
        "next": "return",
        "position": "442:3"
    },
    "pumpkin.choice.7": {
        "type": "ask",
        "position": "442:3"
    },
    "freshwater.pumpkin": {
        "type": "text",
        "text": "You hold a pumpkin full of fresh water with two hands.",
        "lift": " ",
        "drop": " ",
        "next": "freshwater.pumpkin.choice",
        "position": "447:3"
    },
    "freshwater.pumpkin.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                "and",
                [
                    "==",
                    [
                        "get",
                        "at"
                    ],
                    [
                        "get",
                        "hills"
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "homestead"
                    ]
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "freshwater.pumpkin.choice.1",
        "next": "freshwater.pumpkin.choice.0.1",
        "position": "451:5"
    },
    "freshwater.pumpkin.choice.0.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "flower"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "freshwater.pumpkin.choice.1",
        "next": "freshwater.pumpkin.choice.0.2",
        "position": "451:5"
    },
    "freshwater.pumpkin.choice.0.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "freshwater.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "freshwater.pumpkin.choice.1",
        "next": "freshwater.pumpkin.choice.0.3",
        "position": "451:5"
    },
    "freshwater.pumpkin.choice.0.3": {
        "type": "opt",
        "question": [
            "freshwater.pumpkin.choice.0.5",
            "freshwater.pumpkin.choice.0.6"
        ],
        "answer": [
            "freshwater.pumpkin.choice.0.4",
            "freshwater.pumpkin.choice.0.6",
            "freshwater.pumpkin.choice.0.7",
            "freshwater.pumpkin.choice.0.11"
        ],
        "keywords": [
            "flower",
            "grow homestead"
        ],
        "next": "freshwater.pumpkin.choice.1",
        "position": "451:5"
    },
    "freshwater.pumpkin.choice.0.4": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "451:5"
    },
    "freshwater.pumpkin.choice.0.5": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "451:5"
    },
    "freshwater.pumpkin.choice.0.6": {
        "type": "text",
        "text": "erment the blue flower in the pumpkin water.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "451:5"
    },
    "freshwater.pumpkin.choice.0.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "flower"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "flower"
        ],
        "next": "freshwater.pumpkin.choice.0.8",
        "position": "451:5"
    },
    "freshwater.pumpkin.choice.0.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "freshwater.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "freshwater.pumpkin"
        ],
        "next": "freshwater.pumpkin.choice.0.9",
        "position": "451:5"
    },
    "freshwater.pumpkin.choice.0.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                3
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": "freshwater.pumpkin.choice.0.10",
        "position": "451:5"
    },
    "freshwater.pumpkin.choice.0.10": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "homestead"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "homestead"
        ],
        "next": null,
        "position": "451:5"
    },
    "freshwater.pumpkin.choice.0.11": {
        "type": "call",
        "branch": "homestead.creation",
        "args": [],
        "next": "return",
        "position": "452:5"
    },
    "freshwater.pumpkin.choice.1": {
        "type": "call",
        "branch": "soaked.reed.formula",
        "args": [],
        "next": "freshwater.pumpkin.choice.2",
        "position": "453:3"
    },
    "freshwater.pumpkin.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "freshwater.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "freshwater.pumpkin.choice.3",
        "next": "freshwater.pumpkin.choice.2.1",
        "position": "455:5"
    },
    "freshwater.pumpkin.choice.2.1": {
        "type": "opt",
        "question": [
            "freshwater.pumpkin.choice.2.3",
            "freshwater.pumpkin.choice.2.4"
        ],
        "answer": [
            "freshwater.pumpkin.choice.2.2",
            "freshwater.pumpkin.choice.2.4",
            "freshwater.pumpkin.choice.2.5",
            "freshwater.pumpkin.choice.2.7"
        ],
        "keywords": [
            "drop freshwater pumpkin"
        ],
        "next": "freshwater.pumpkin.choice.3",
        "position": "455:5"
    },
    "freshwater.pumpkin.choice.2.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "455:5"
    },
    "freshwater.pumpkin.choice.2.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "455:5"
    },
    "freshwater.pumpkin.choice.2.4": {
        "type": "text",
        "text": "rop the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "455:5"
    },
    "freshwater.pumpkin.choice.2.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "freshwater.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "freshwater.pumpkin"
        ],
        "next": "freshwater.pumpkin.choice.2.6",
        "position": "455:5"
    },
    "freshwater.pumpkin.choice.2.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "455:5"
    },
    "freshwater.pumpkin.choice.2.7": {
        "type": "text",
        "text": "The pumpkin goes to pieces and the water flows away.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "457:5"
    },
    "freshwater.pumpkin.choice.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "freshwater.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "freshwater.pumpkin.choice.4",
        "next": "freshwater.pumpkin.choice.3.1",
        "position": "458:5"
    },
    "freshwater.pumpkin.choice.3.1": {
        "type": "opt",
        "question": [
            "freshwater.pumpkin.choice.3.3",
            "freshwater.pumpkin.choice.3.4"
        ],
        "answer": [
            "freshwater.pumpkin.choice.3.2",
            "freshwater.pumpkin.choice.3.4",
            "freshwater.pumpkin.choice.3.5",
            "freshwater.pumpkin.choice.3.7"
        ],
        "keywords": [
            "scene",
            "spill freshwater pumpkin"
        ],
        "next": "freshwater.pumpkin.choice.4",
        "position": "458:5"
    },
    "freshwater.pumpkin.choice.3.2": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "458:5"
    },
    "freshwater.pumpkin.choice.3.3": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "458:5"
    },
    "freshwater.pumpkin.choice.3.4": {
        "type": "text",
        "text": "pill the water from the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "459:5"
    },
    "freshwater.pumpkin.choice.3.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "freshwater.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "freshwater.pumpkin"
        ],
        "next": "freshwater.pumpkin.choice.3.6",
        "position": "459:5"
    },
    "freshwater.pumpkin.choice.3.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": null,
        "position": "459:5"
    },
    "freshwater.pumpkin.choice.3.7": {
        "type": "goto",
        "next": "return",
        "position": "460:5"
    },
    "freshwater.pumpkin.choice.4": {
        "type": "opt",
        "question": [
            "freshwater.pumpkin.choice.4.2",
            "freshwater.pumpkin.choice.4.3"
        ],
        "answer": [
            "freshwater.pumpkin.choice.4.1",
            "freshwater.pumpkin.choice.4.3",
            "freshwater.pumpkin.choice.4.4"
        ],
        "keywords": [
            "",
            "freshwater-pumpkin",
            "keep"
        ],
        "next": "freshwater.pumpkin.choice.5",
        "position": "461:5"
    },
    "freshwater.pumpkin.choice.4.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "461:5"
    },
    "freshwater.pumpkin.choice.4.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "461:5"
    },
    "freshwater.pumpkin.choice.4.3": {
        "type": "text",
        "text": "eep the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "461:5"
    },
    "freshwater.pumpkin.choice.4.4": {
        "type": "goto",
        "next": "return",
        "position": "462:3"
    },
    "freshwater.pumpkin.choice.5": {
        "type": "ask",
        "position": "462:3"
    },
    "brine.pumpkin": {
        "type": "text",
        "text": "You hold a pumpkin full of fresh water with two hands.",
        "lift": " ",
        "drop": " ",
        "next": "brine.pumpkin.choice",
        "position": "467:3"
    },
    "brine.pumpkin.choice": {
        "type": "call",
        "branch": "brine.vial.pumpkin.formula",
        "args": [],
        "next": "brine.pumpkin.choice.1",
        "position": "469:3"
    },
    "brine.pumpkin.choice.1": {
        "type": "call",
        "branch": "soaked.reed.formula",
        "args": [],
        "next": "brine.pumpkin.choice.2",
        "position": "470:3"
    },
    "brine.pumpkin.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "brine.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "brine.pumpkin.choice.3",
        "next": "brine.pumpkin.choice.2.1",
        "position": "472:5"
    },
    "brine.pumpkin.choice.2.1": {
        "type": "opt",
        "question": [
            "brine.pumpkin.choice.2.3",
            "brine.pumpkin.choice.2.4"
        ],
        "answer": [
            "brine.pumpkin.choice.2.2",
            "brine.pumpkin.choice.2.4",
            "brine.pumpkin.choice.2.5",
            "brine.pumpkin.choice.2.7"
        ],
        "keywords": [
            "drop brine pumpkin"
        ],
        "next": "brine.pumpkin.choice.3",
        "position": "472:5"
    },
    "brine.pumpkin.choice.2.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "472:5"
    },
    "brine.pumpkin.choice.2.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "472:5"
    },
    "brine.pumpkin.choice.2.4": {
        "type": "text",
        "text": "rop the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "472:5"
    },
    "brine.pumpkin.choice.2.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "brine.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "brine.pumpkin"
        ],
        "next": "brine.pumpkin.choice.2.6",
        "position": "472:5"
    },
    "brine.pumpkin.choice.2.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "472:5"
    },
    "brine.pumpkin.choice.2.7": {
        "type": "text",
        "text": "The pumpkin goes to pieces and the water flows away.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "474:5"
    },
    "brine.pumpkin.choice.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "brine.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "brine.pumpkin.choice.4",
        "next": "brine.pumpkin.choice.3.1",
        "position": "475:5"
    },
    "brine.pumpkin.choice.3.1": {
        "type": "opt",
        "question": [
            "brine.pumpkin.choice.3.3",
            "brine.pumpkin.choice.3.4"
        ],
        "answer": [
            "brine.pumpkin.choice.3.2",
            "brine.pumpkin.choice.3.4",
            "brine.pumpkin.choice.3.5",
            "brine.pumpkin.choice.3.7"
        ],
        "keywords": [
            "scene",
            "spill brine pumpkin"
        ],
        "next": "brine.pumpkin.choice.4",
        "position": "475:5"
    },
    "brine.pumpkin.choice.3.2": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "475:5"
    },
    "brine.pumpkin.choice.3.3": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "475:5"
    },
    "brine.pumpkin.choice.3.4": {
        "type": "text",
        "text": "pill the water from the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "476:5"
    },
    "brine.pumpkin.choice.3.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "brine.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "brine.pumpkin"
        ],
        "next": "brine.pumpkin.choice.3.6",
        "position": "476:5"
    },
    "brine.pumpkin.choice.3.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": null,
        "position": "476:5"
    },
    "brine.pumpkin.choice.3.7": {
        "type": "goto",
        "next": "return",
        "position": "477:5"
    },
    "brine.pumpkin.choice.4": {
        "type": "opt",
        "question": [
            "brine.pumpkin.choice.4.2",
            "brine.pumpkin.choice.4.3"
        ],
        "answer": [
            "brine.pumpkin.choice.4.1",
            "brine.pumpkin.choice.4.3",
            "brine.pumpkin.choice.4.4"
        ],
        "keywords": [
            "",
            "brine-pumpkin",
            "keep"
        ],
        "next": "brine.pumpkin.choice.5",
        "position": "477:5"
    },
    "brine.pumpkin.choice.4.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "477:5"
    },
    "brine.pumpkin.choice.4.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "477:5"
    },
    "brine.pumpkin.choice.4.3": {
        "type": "text",
        "text": "eep the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "477:5"
    },
    "brine.pumpkin.choice.4.4": {
        "type": "goto",
        "next": "return",
        "position": "478:3"
    },
    "brine.pumpkin.choice.5": {
        "type": "ask",
        "position": "478:3"
    },
    "sap.pumpkin": {
        "type": "text",
        "text": "You hold a pumpkin full of rubber sap with two hands.",
        "lift": " ",
        "drop": " ",
        "next": "sap.pumpkin.choice",
        "position": "483:3"
    },
    "sap.pumpkin.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "mountain"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "sap.pumpkin.choice.1",
        "next": "sap.pumpkin.choice.0.1",
        "position": "486:5"
    },
    "sap.pumpkin.choice.0.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "sap.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "sap.pumpkin.choice.1",
        "next": "sap.pumpkin.choice.0.2",
        "position": "486:5"
    },
    "sap.pumpkin.choice.0.2": {
        "type": "opt",
        "question": [
            "sap.pumpkin.choice.0.4",
            "sap.pumpkin.choice.0.5"
        ],
        "answer": [
            "sap.pumpkin.choice.0.3",
            "sap.pumpkin.choice.0.5",
            "sap.pumpkin.choice.0.6",
            "sap.pumpkin.choice.0.9"
        ],
        "keywords": [
            "cook rubber sap",
            "scene"
        ],
        "next": "sap.pumpkin.choice.1",
        "position": "486:5"
    },
    "sap.pumpkin.choice.0.3": {
        "type": "text",
        "text": "You c",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "486:5"
    },
    "sap.pumpkin.choice.0.4": {
        "type": "text",
        "text": "C",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "486:5"
    },
    "sap.pumpkin.choice.0.5": {
        "type": "text",
        "text": "ook the rubber sap on the brimstone.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "486:5"
    },
    "sap.pumpkin.choice.0.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "sap.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "sap.pumpkin"
        ],
        "next": "sap.pumpkin.choice.0.7",
        "position": "486:5"
    },
    "sap.pumpkin.choice.0.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "rubber"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "rubber"
        ],
        "next": "sap.pumpkin.choice.0.8",
        "position": "486:5"
    },
    "sap.pumpkin.choice.0.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "486:5"
    },
    "sap.pumpkin.choice.0.9": {
        "type": "text",
        "text": "In time, the pumpkin burns away revealing a mass of vulcanized rubber.",
        "lift": " ",
        "drop": " ",
        "next": "mountain.choice",
        "position": "488:5"
    },
    "sap.pumpkin.choice.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "sap.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "sap.pumpkin.choice.2",
        "next": "sap.pumpkin.choice.1.1",
        "position": "491:5"
    },
    "sap.pumpkin.choice.1.1": {
        "type": "opt",
        "question": [
            "sap.pumpkin.choice.1.3",
            "sap.pumpkin.choice.1.4",
            "sap.pumpkin.choice.1.5"
        ],
        "answer": [
            "sap.pumpkin.choice.1.2",
            "sap.pumpkin.choice.1.4",
            "sap.pumpkin.choice.1.6",
            "sap.pumpkin.choice.1.8"
        ],
        "keywords": [
            "drop pumpkin full of sap"
        ],
        "next": "sap.pumpkin.choice.2",
        "position": "491:5"
    },
    "sap.pumpkin.choice.1.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "491:5"
    },
    "sap.pumpkin.choice.1.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "491:5"
    },
    "sap.pumpkin.choice.1.4": {
        "type": "text",
        "text": "rop the pumpkin",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "491:5"
    },
    "sap.pumpkin.choice.1.5": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "491:5"
    },
    "sap.pumpkin.choice.1.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "sap.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "sap.pumpkin"
        ],
        "next": "sap.pumpkin.choice.1.7",
        "position": "491:5"
    },
    "sap.pumpkin.choice.1.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "491:5"
    },
    "sap.pumpkin.choice.1.8": {
        "type": "text",
        "text": ", losing the rubber.",
        "lift": "",
        "drop": " ",
        "next": "return",
        "position": "493:5"
    },
    "sap.pumpkin.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "sap.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "sap.pumpkin.choice.3",
        "next": "sap.pumpkin.choice.2.1",
        "position": "494:5"
    },
    "sap.pumpkin.choice.2.1": {
        "type": "opt",
        "question": [
            "sap.pumpkin.choice.2.3",
            "sap.pumpkin.choice.2.4"
        ],
        "answer": [
            "sap.pumpkin.choice.2.2",
            "sap.pumpkin.choice.2.4",
            "sap.pumpkin.choice.2.5",
            "sap.pumpkin.choice.2.7"
        ],
        "keywords": [
            "scene",
            "spill sap from pumpkin"
        ],
        "next": "sap.pumpkin.choice.3",
        "position": "494:5"
    },
    "sap.pumpkin.choice.2.2": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "494:5"
    },
    "sap.pumpkin.choice.2.3": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "494:5"
    },
    "sap.pumpkin.choice.2.4": {
        "type": "text",
        "text": "pill the rubber sap.",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "494:5"
    },
    "sap.pumpkin.choice.2.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "sap.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "sap.pumpkin"
        ],
        "next": "sap.pumpkin.choice.2.6",
        "position": "494:5"
    },
    "sap.pumpkin.choice.2.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": null,
        "position": "494:5"
    },
    "sap.pumpkin.choice.2.7": {
        "type": "goto",
        "next": "return",
        "position": "495:5"
    },
    "sap.pumpkin.choice.3": {
        "type": "opt",
        "question": [
            "sap.pumpkin.choice.3.2",
            "sap.pumpkin.choice.3.3"
        ],
        "answer": [
            "sap.pumpkin.choice.3.1",
            "sap.pumpkin.choice.3.3",
            "sap.pumpkin.choice.3.4"
        ],
        "keywords": [
            "",
            "keep",
            "sap-pumpkin"
        ],
        "next": "sap.pumpkin.choice.4",
        "position": "495:5"
    },
    "sap.pumpkin.choice.3.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "495:5"
    },
    "sap.pumpkin.choice.3.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "495:5"
    },
    "sap.pumpkin.choice.3.3": {
        "type": "text",
        "text": "eep the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "495:5"
    },
    "sap.pumpkin.choice.3.4": {
        "type": "goto",
        "next": "return",
        "position": "496:3"
    },
    "sap.pumpkin.choice.4": {
        "type": "ask",
        "position": "496:3"
    },
    "sand.pumpkin": {
        "type": "text",
        "text": "You hold a pumpkin full of beach sand with two hands.",
        "lift": " ",
        "drop": " ",
        "next": "sand.pumpkin.1",
        "position": "501:5"
    },
    "sand.pumpkin.1": {
        "type": "jump",
        "condition": [
            "<>",
            [
                "get",
                "at"
            ],
            [
                "get",
                "mountain"
            ]
        ],
        "branch": "sand.pumpkin.choice",
        "next": "sand.pumpkin.2",
        "position": "501:5"
    },
    "sand.pumpkin.2": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "sand.pumpkin"
            ]
        ],
        "branch": "sand.pumpkin.choice",
        "next": "sand.pumpkin.3",
        "position": "501:5"
    },
    "sand.pumpkin.3": {
        "type": "jump",
        "condition": [
            "get",
            "reed"
        ],
        "branch": "sand.pumpkin.5",
        "next": "sand.pumpkin.4",
        "position": "502:7"
    },
    "sand.pumpkin.4": {
        "type": "text",
        "text": "You might be able to blow glass from beach sand if you found a tube to blow through.",
        "lift": " ",
        "drop": " ",
        "next": "sand.pumpkin.5",
        "position": "505:7"
    },
    "sand.pumpkin.5": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "reed"
            ]
        ],
        "branch": "sand.pumpkin.choice",
        "next": "sand.pumpkin.6",
        "position": "505:7"
    },
    "sand.pumpkin.6": {
        "type": "text",
        "text": "You could blow glass with your reed and bucket of beach sand.",
        "lift": " ",
        "drop": " ",
        "next": "sand.pumpkin.choice",
        "position": "507:3"
    },
    "sand.pumpkin.choice": {
        "type": "call",
        "branch": "vial.formula",
        "args": [],
        "next": "sand.pumpkin.choice.1",
        "position": "508:3"
    },
    "sand.pumpkin.choice.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "sand.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "sand.pumpkin.choice.2",
        "next": "sand.pumpkin.choice.1.1",
        "position": "510:5"
    },
    "sand.pumpkin.choice.1.1": {
        "type": "opt",
        "question": [
            "sand.pumpkin.choice.1.3",
            "sand.pumpkin.choice.1.4"
        ],
        "answer": [
            "sand.pumpkin.choice.1.2",
            "sand.pumpkin.choice.1.4",
            "sand.pumpkin.choice.1.5",
            "sand.pumpkin.choice.1.7"
        ],
        "keywords": [
            "drop sand pumpkin"
        ],
        "next": "sand.pumpkin.choice.2",
        "position": "510:5"
    },
    "sand.pumpkin.choice.1.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "510:5"
    },
    "sand.pumpkin.choice.1.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "510:5"
    },
    "sand.pumpkin.choice.1.4": {
        "type": "text",
        "text": "rop the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "510:5"
    },
    "sand.pumpkin.choice.1.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "sand.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "sand.pumpkin"
        ],
        "next": "sand.pumpkin.choice.1.6",
        "position": "510:5"
    },
    "sand.pumpkin.choice.1.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "510:5"
    },
    "sand.pumpkin.choice.1.7": {
        "type": "text",
        "text": "It goes to pieces and the sand spills.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "512:5"
    },
    "sand.pumpkin.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                "<>",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "mountain"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "sand.pumpkin.choice.3",
        "next": "sand.pumpkin.choice.2.1",
        "position": "514:5"
    },
    "sand.pumpkin.choice.2.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "sand.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "sand.pumpkin.choice.3",
        "next": "sand.pumpkin.choice.2.2",
        "position": "514:5"
    },
    "sand.pumpkin.choice.2.2": {
        "type": "opt",
        "question": [
            "sand.pumpkin.choice.2.4",
            "sand.pumpkin.choice.2.5"
        ],
        "answer": [
            "sand.pumpkin.choice.2.3",
            "sand.pumpkin.choice.2.5",
            "sand.pumpkin.choice.2.6",
            "sand.pumpkin.choice.2.8"
        ],
        "keywords": [
            "scene",
            "spill sand pumpkin"
        ],
        "next": "sand.pumpkin.choice.3",
        "position": "514:5"
    },
    "sand.pumpkin.choice.2.3": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "514:5"
    },
    "sand.pumpkin.choice.2.4": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "514:5"
    },
    "sand.pumpkin.choice.2.5": {
        "type": "text",
        "text": "pill the sand from the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "514:5"
    },
    "sand.pumpkin.choice.2.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "sand.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "sand.pumpkin"
        ],
        "next": "sand.pumpkin.choice.2.7",
        "position": "514:5"
    },
    "sand.pumpkin.choice.2.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "pumpkin"
        ],
        "next": null,
        "position": "514:5"
    },
    "sand.pumpkin.choice.2.8": {
        "type": "goto",
        "next": "return",
        "position": "515:5"
    },
    "sand.pumpkin.choice.3": {
        "type": "opt",
        "question": [
            "sand.pumpkin.choice.3.2",
            "sand.pumpkin.choice.3.3"
        ],
        "answer": [
            "sand.pumpkin.choice.3.1",
            "sand.pumpkin.choice.3.3",
            "sand.pumpkin.choice.3.4"
        ],
        "keywords": [
            "",
            "keep",
            "sand-pumpkin"
        ],
        "next": "sand.pumpkin.choice.4",
        "position": "515:5"
    },
    "sand.pumpkin.choice.3.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "515:5"
    },
    "sand.pumpkin.choice.3.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "515:5"
    },
    "sand.pumpkin.choice.3.3": {
        "type": "text",
        "text": "eep the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "515:5"
    },
    "sand.pumpkin.choice.3.4": {
        "type": "goto",
        "next": "return",
        "position": "516:3"
    },
    "sand.pumpkin.choice.4": {
        "type": "ask",
        "position": "516:3"
    },
    "flower": {
        "type": "text",
        "text": "You hold the blue flower",
        "lift": " ",
        "drop": "",
        "next": "flower.1",
        "position": "520:3"
    },
    "flower.1": {
        "type": "switch",
        "expression": [
            "get",
            "flower"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "flower.1.1",
            "flower.1.2",
            "flower.1.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "520:3"
    },
    "flower.1.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "flower.2",
        "position": "520:3"
    },
    "flower.1.2": {
        "type": "goto",
        "next": "flower.2",
        "position": "520:3"
    },
    "flower.1.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "flower.2",
        "position": "520:3"
    },
    "flower.2": {
        "type": "text",
        "text": "gently with",
        "lift": " ",
        "drop": " ",
        "next": "flower.3",
        "position": "520:3"
    },
    "flower.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "flower"
            ]
        ],
        "next": "flower.4",
        "position": "520:3"
    },
    "flower.4": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "flower.5",
        "position": "521:3"
    },
    "flower.5": {
        "type": "switch",
        "expression": [
            "get",
            "flower"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "flower.5.1",
            "flower.5.2",
            "flower.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "521:3"
    },
    "flower.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "flower.6",
        "position": "521:3"
    },
    "flower.5.2": {
        "type": "goto",
        "next": "flower.6",
        "position": "521:3"
    },
    "flower.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "flower.6",
        "position": "521:3"
    },
    "flower.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "flower.choice",
        "position": "522:3"
    },
    "flower.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                "and",
                [
                    "==",
                    [
                        "get",
                        "at"
                    ],
                    [
                        "get",
                        "hills"
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "homestead"
                    ]
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "flower.choice.1",
        "next": "flower.choice.0.1",
        "position": "528:5"
    },
    "flower.choice.0.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "flower"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "flower.choice.1",
        "next": "flower.choice.0.2",
        "position": "528:5"
    },
    "flower.choice.0.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "freshwater.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "flower.choice.1",
        "next": "flower.choice.0.3",
        "position": "528:5"
    },
    "flower.choice.0.3": {
        "type": "opt",
        "question": [
            "flower.choice.0.5",
            "flower.choice.0.6"
        ],
        "answer": [
            "flower.choice.0.4",
            "flower.choice.0.6",
            "flower.choice.0.7",
            "flower.choice.0.11"
        ],
        "keywords": [
            "freshwater-pumpkin",
            "grow homestead"
        ],
        "next": "flower.choice.1",
        "position": "528:5"
    },
    "flower.choice.0.4": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "528:5"
    },
    "flower.choice.0.5": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "528:5"
    },
    "flower.choice.0.6": {
        "type": "text",
        "text": "erment the blue flower in the pumpkin water.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "528:5"
    },
    "flower.choice.0.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "flower"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "flower"
        ],
        "next": "flower.choice.0.8",
        "position": "528:5"
    },
    "flower.choice.0.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "freshwater.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "freshwater.pumpkin"
        ],
        "next": "flower.choice.0.9",
        "position": "528:5"
    },
    "flower.choice.0.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                3
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": "flower.choice.0.10",
        "position": "528:5"
    },
    "flower.choice.0.10": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "homestead"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "homestead"
        ],
        "next": null,
        "position": "528:5"
    },
    "flower.choice.0.11": {
        "type": "call",
        "branch": "homestead.creation",
        "args": [],
        "next": "return",
        "position": "529:5"
    },
    "flower.choice.1": {
        "type": "call",
        "branch": "growing.potion.formula",
        "args": [],
        "next": "flower.choice.2",
        "position": "530:3"
    },
    "flower.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "flower"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "flower.choice.3",
        "next": "flower.choice.2.1",
        "position": "533:5"
    },
    "flower.choice.2.1": {
        "type": "opt",
        "question": [
            "flower.choice.2.3",
            "flower.choice.2.4"
        ],
        "answer": [
            "flower.choice.2.2",
            "flower.choice.2.4",
            "flower.choice.2.9",
            "flower.choice.2.11"
        ],
        "keywords": [
            "drop flower",
            "scene"
        ],
        "next": "flower.choice.3",
        "position": "533:5"
    },
    "flower.choice.2.2": {
        "type": "text",
        "text": "You t",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "533:5"
    },
    "flower.choice.2.3": {
        "type": "text",
        "text": "T",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "533:5"
    },
    "flower.choice.2.4": {
        "type": "text",
        "text": "oss",
        "lift": "",
        "drop": " ",
        "next": "flower.choice.2.5",
        "position": "533:5"
    },
    "flower.choice.2.5": {
        "type": "switch",
        "expression": [
            "get",
            "flower"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "flower.choice.2.5.1",
            "flower.choice.2.5.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "533:5"
    },
    "flower.choice.2.5.1": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "flower.choice.2.6",
        "position": "533:5"
    },
    "flower.choice.2.5.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "flower.choice.2.6",
        "position": "533:5"
    },
    "flower.choice.2.6": {
        "type": "text",
        "text": "blue flower",
        "lift": " ",
        "drop": " ",
        "next": "flower.choice.2.7",
        "position": "533:5"
    },
    "flower.choice.2.7": {
        "type": "switch",
        "expression": [
            "get",
            "flower.choice.2.7"
        ],
        "variable": "flower.choice.2.7",
        "value": 0,
        "mode": "rand",
        "branches": [
            "flower.choice.2.7.1",
            "flower.choice.2.7.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "533:5"
    },
    "flower.choice.2.7.1": {
        "type": "text",
        "text": "away",
        "lift": "",
        "drop": "",
        "next": "flower.choice.2.8",
        "position": "533:5"
    },
    "flower.choice.2.7.2": {
        "type": "text",
        "text": "aside",
        "lift": "",
        "drop": "",
        "next": "flower.choice.2.8",
        "position": "533:5"
    },
    "flower.choice.2.8": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "533:5"
    },
    "flower.choice.2.9": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "flower"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "flower"
        ],
        "next": "flower.choice.2.10",
        "position": "533:5"
    },
    "flower.choice.2.10": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "533:5"
    },
    "flower.choice.2.11": {
        "type": "jump",
        "condition": [
            "<>",
            [
                "get",
                "at"
            ],
            [
                "get",
                "mountain"
            ]
        ],
        "branch": "return",
        "next": "flower.choice.2.12",
        "position": "534:7"
    },
    "flower.choice.2.12": {
        "type": "text",
        "text": "The flower withers to dust in the fiery chasm.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "536:5"
    },
    "flower.choice.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "hills"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "flower.choice.4",
        "next": "flower.choice.3.1",
        "position": "538:5"
    },
    "flower.choice.3.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "flower.choice.4",
        "next": "flower.choice.3.2",
        "position": "538:5"
    },
    "flower.choice.3.2": {
        "type": "opt",
        "question": [
            "flower.choice.3.4",
            "flower.choice.3.5"
        ],
        "answer": [
            "flower.choice.3.3",
            "flower.choice.3.5",
            "flower.choice.3.6",
            "flower.choice.3.8"
        ],
        "keywords": [
            "flowers",
            "get flower"
        ],
        "next": "flower.choice.4",
        "position": "538:5"
    },
    "flower.choice.3.3": {
        "type": "text",
        "text": "You p",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "538:5"
    },
    "flower.choice.3.4": {
        "type": "text",
        "text": "P",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "538:5"
    },
    "flower.choice.3.5": {
        "type": "text",
        "text": "luck another blue flower.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "538:5"
    },
    "flower.choice.3.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "flower"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "flower"
        ],
        "next": "flower.choice.3.7",
        "position": "538:5"
    },
    "flower.choice.3.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "538:5"
    },
    "flower.choice.3.8": {
        "type": "goto",
        "next": "return",
        "position": "539:5"
    },
    "flower.choice.4": {
        "type": "opt",
        "question": [
            "flower.choice.4.2",
            "flower.choice.4.3"
        ],
        "answer": [
            "flower.choice.4.1",
            "flower.choice.4.3",
            "flower.choice.4.6"
        ],
        "keywords": [
            "",
            "flower",
            "keep"
        ],
        "next": "flower.choice.5",
        "position": "539:5"
    },
    "flower.choice.4.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "539:5"
    },
    "flower.choice.4.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "539:5"
    },
    "flower.choice.4.3": {
        "type": "text",
        "text": "eep the blue flower",
        "lift": "",
        "drop": "",
        "next": "flower.choice.4.4",
        "position": "539:5"
    },
    "flower.choice.4.4": {
        "type": "switch",
        "expression": [
            "get",
            "flower"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "flower.choice.4.4.1",
            "flower.choice.4.4.2",
            "flower.choice.4.4.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "539:5"
    },
    "flower.choice.4.4.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "flower.choice.4.5",
        "position": "539:5"
    },
    "flower.choice.4.4.2": {
        "type": "goto",
        "next": "flower.choice.4.5",
        "position": "539:5"
    },
    "flower.choice.4.4.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "flower.choice.4.5",
        "position": "539:5"
    },
    "flower.choice.4.5": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "539:5"
    },
    "flower.choice.4.6": {
        "type": "goto",
        "next": "return",
        "position": "540:3"
    },
    "flower.choice.5": {
        "type": "ask",
        "position": "540:3"
    },
    "bamboo": {
        "type": "text",
        "text": "You hold",
        "lift": " ",
        "drop": " ",
        "next": "bamboo.1",
        "position": "544:3"
    },
    "bamboo.1": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "bamboo"
            ]
        ],
        "next": "bamboo.2",
        "position": "544:3"
    },
    "bamboo.2": {
        "type": "text",
        "text": "bamboo shoot",
        "lift": " ",
        "drop": "",
        "next": "bamboo.3",
        "position": "544:3"
    },
    "bamboo.3": {
        "type": "switch",
        "expression": [
            "get",
            "bamboo"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "bamboo.3.1",
            "bamboo.3.2",
            "bamboo.3.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "544:3"
    },
    "bamboo.3.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "bamboo.4",
        "position": "544:3"
    },
    "bamboo.3.2": {
        "type": "goto",
        "next": "bamboo.4",
        "position": "544:3"
    },
    "bamboo.3.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "bamboo.4",
        "position": "544:3"
    },
    "bamboo.4": {
        "type": "text",
        "text": "with",
        "lift": " ",
        "drop": " ",
        "next": "bamboo.5",
        "position": "544:3"
    },
    "bamboo.5": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "bamboo"
            ]
        ],
        "next": "bamboo.6",
        "position": "544:3"
    },
    "bamboo.6": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "bamboo.7",
        "position": "545:3"
    },
    "bamboo.7": {
        "type": "switch",
        "expression": [
            "get",
            "bamboo"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "bamboo.7.1",
            "bamboo.7.2",
            "bamboo.7.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "545:3"
    },
    "bamboo.7.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "bamboo.8",
        "position": "545:3"
    },
    "bamboo.7.2": {
        "type": "goto",
        "next": "bamboo.8",
        "position": "545:3"
    },
    "bamboo.7.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "bamboo.8",
        "position": "545:3"
    },
    "bamboo.8": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "bamboo.choice",
        "position": "546:3"
    },
    "bamboo.choice": {
        "type": "call",
        "branch": "bridge.formula",
        "args": [],
        "next": "bamboo.choice.1",
        "position": "549:3"
    },
    "bamboo.choice.1": {
        "type": "call",
        "branch": "ballista.formula",
        "args": [],
        "next": "bamboo.choice.2",
        "position": "550:3"
    },
    "bamboo.choice.2": {
        "type": "call",
        "branch": "tap.formula",
        "args": [],
        "next": "bamboo.choice.3",
        "position": "551:3"
    },
    "bamboo.choice.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "hammer"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "bamboo.choice.4",
        "next": "bamboo.choice.3.1",
        "position": "554:5"
    },
    "bamboo.choice.3.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "rock"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "bamboo.choice.4",
        "next": "bamboo.choice.3.2",
        "position": "554:5"
    },
    "bamboo.choice.3.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "soaked.reed"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "bamboo.choice.4",
        "next": "bamboo.choice.3.3",
        "position": "554:5"
    },
    "bamboo.choice.3.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "bamboo"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "bamboo.choice.4",
        "next": "bamboo.choice.3.4",
        "position": "554:5"
    },
    "bamboo.choice.3.4": {
        "type": "opt",
        "question": [
            "bamboo.choice.3.6",
            "bamboo.choice.3.7",
            "bamboo.choice.3.8"
        ],
        "answer": [
            "bamboo.choice.3.5",
            "bamboo.choice.3.7",
            "bamboo.choice.3.9",
            "bamboo.choice.3.14"
        ],
        "keywords": [
            "make hammer",
            "rock",
            "soaked-reed"
        ],
        "next": "bamboo.choice.4",
        "position": "554:5"
    },
    "bamboo.choice.3.5": {
        "type": "text",
        "text": "You b",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "554:5"
    },
    "bamboo.choice.3.6": {
        "type": "text",
        "text": "B",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "554:5"
    },
    "bamboo.choice.3.7": {
        "type": "text",
        "text": "ind the rock to the bamboo with the reed",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "554:5"
    },
    "bamboo.choice.3.8": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "554:5"
    },
    "bamboo.choice.3.9": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "rock"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "rock"
        ],
        "next": "bamboo.choice.3.10",
        "position": "554:5"
    },
    "bamboo.choice.3.10": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "soaked.reed"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "soaked.reed"
        ],
        "next": "bamboo.choice.3.11",
        "position": "554:5"
    },
    "bamboo.choice.3.11": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "bamboo"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "bamboo"
        ],
        "next": "bamboo.choice.3.12",
        "position": "554:5"
    },
    "bamboo.choice.3.12": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hammer"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hammer"
        ],
        "next": "bamboo.choice.3.13",
        "position": "554:5"
    },
    "bamboo.choice.3.13": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "554:5"
    },
    "bamboo.choice.3.14": {
        "type": "text",
        "text": ", constructing a sturdy hammer. Perhaps you can use this to mash things to pulp.",
        "lift": "",
        "drop": " ",
        "next": "return",
        "position": "557:5"
    },
    "bamboo.choice.4": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "bamboo"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "bamboo.choice.5",
        "next": "bamboo.choice.4.1",
        "position": "559:5"
    },
    "bamboo.choice.4.1": {
        "type": "opt",
        "question": [
            "bamboo.choice.4.3",
            "bamboo.choice.4.4"
        ],
        "answer": [
            "bamboo.choice.4.2",
            "bamboo.choice.4.4",
            "bamboo.choice.4.7",
            "bamboo.choice.4.9"
        ],
        "keywords": [
            "bridgewater",
            "drop bamboo",
            "mushrooms",
            "rubber-tree",
            "scene",
            "trail"
        ],
        "next": "bamboo.choice.5",
        "position": "559:5"
    },
    "bamboo.choice.4.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "559:5"
    },
    "bamboo.choice.4.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "559:5"
    },
    "bamboo.choice.4.4": {
        "type": "text",
        "text": "rop",
        "lift": "",
        "drop": " ",
        "next": "bamboo.choice.4.5",
        "position": "559:5"
    },
    "bamboo.choice.4.5": {
        "type": "switch",
        "expression": [
            "get",
            "bamboo"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "bamboo.choice.4.5.1",
            "bamboo.choice.4.5.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "559:5"
    },
    "bamboo.choice.4.5.1": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "bamboo.choice.4.6",
        "position": "559:5"
    },
    "bamboo.choice.4.5.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "bamboo.choice.4.6",
        "position": "559:5"
    },
    "bamboo.choice.4.6": {
        "type": "text",
        "text": "bamboo shoot.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "559:5"
    },
    "bamboo.choice.4.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "bamboo"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "bamboo"
        ],
        "next": "bamboo.choice.4.8",
        "position": "559:5"
    },
    "bamboo.choice.4.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "559:5"
    },
    "bamboo.choice.4.9": {
        "type": "goto",
        "next": "return",
        "position": "560:5"
    },
    "bamboo.choice.5": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "jungle"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "bamboo.choice.6",
        "next": "bamboo.choice.5.1",
        "position": "562:5"
    },
    "bamboo.choice.5.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "bamboo.choice.6",
        "next": "bamboo.choice.5.2",
        "position": "562:5"
    },
    "bamboo.choice.5.2": {
        "type": "opt",
        "question": [
            "bamboo.choice.5.4",
            "bamboo.choice.5.5"
        ],
        "answer": [
            "bamboo.choice.5.3",
            "bamboo.choice.5.5",
            "bamboo.choice.5.6",
            "bamboo.choice.5.8"
        ],
        "keywords": [
            "bamboos",
            "get bamboo"
        ],
        "next": "bamboo.choice.6",
        "position": "562:5"
    },
    "bamboo.choice.5.3": {
        "type": "text",
        "text": "You c",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "562:5"
    },
    "bamboo.choice.5.4": {
        "type": "text",
        "text": "C",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "562:5"
    },
    "bamboo.choice.5.5": {
        "type": "text",
        "text": "ut another stalk of bamboo.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "562:5"
    },
    "bamboo.choice.5.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "bamboo"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "bamboo"
        ],
        "next": "bamboo.choice.5.7",
        "position": "562:5"
    },
    "bamboo.choice.5.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "562:5"
    },
    "bamboo.choice.5.8": {
        "type": "goto",
        "next": "return",
        "position": "563:5"
    },
    "bamboo.choice.6": {
        "type": "opt",
        "question": [
            "bamboo.choice.6.2",
            "bamboo.choice.6.3"
        ],
        "answer": [
            "bamboo.choice.6.1",
            "bamboo.choice.6.3",
            "bamboo.choice.6.4"
        ],
        "keywords": [
            "",
            "bamboo",
            "keep"
        ],
        "next": "bamboo.choice.7",
        "position": "564:5"
    },
    "bamboo.choice.6.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "564:5"
    },
    "bamboo.choice.6.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "564:5"
    },
    "bamboo.choice.6.3": {
        "type": "text",
        "text": "eep the bamboo.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "564:5"
    },
    "bamboo.choice.6.4": {
        "type": "goto",
        "next": "return",
        "position": "565:3"
    },
    "bamboo.choice.7": {
        "type": "ask",
        "position": "565:3"
    },
    "mushroom": {
        "type": "text",
        "text": "You hold the little red mushroom",
        "lift": " ",
        "drop": "",
        "next": "mushroom.1",
        "position": "569:3"
    },
    "mushroom.1": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "mushroom.1.1",
            "mushroom.1.2",
            "mushroom.1.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "569:3"
    },
    "mushroom.1.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "mushroom.2",
        "position": "569:3"
    },
    "mushroom.1.2": {
        "type": "goto",
        "next": "mushroom.2",
        "position": "569:3"
    },
    "mushroom.1.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "mushroom.2",
        "position": "569:3"
    },
    "mushroom.2": {
        "type": "text",
        "text": "with",
        "lift": " ",
        "drop": " ",
        "next": "mushroom.3",
        "position": "570:3"
    },
    "mushroom.3": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "mushroom.3.1",
            "mushroom.3.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "570:3"
    },
    "mushroom.3.1": {
        "type": "goto",
        "next": "mushroom.4",
        "position": "570:3"
    },
    "mushroom.3.2": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "mushroom"
            ]
        ],
        "next": "mushroom.4",
        "position": "570:3"
    },
    "mushroom.4": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "mushroom.5",
        "position": "570:3"
    },
    "mushroom.5": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "mushroom.5.1",
            "mushroom.5.2",
            "mushroom.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "570:3"
    },
    "mushroom.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "mushroom.6",
        "position": "570:3"
    },
    "mushroom.5.2": {
        "type": "goto",
        "next": "mushroom.6",
        "position": "570:3"
    },
    "mushroom.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "mushroom.6",
        "position": "570:3"
    },
    "mushroom.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "mushroom.choice",
        "position": "571:3"
    },
    "mushroom.choice": {
        "type": "call",
        "branch": "shrinking.potion.formula",
        "args": [],
        "next": "mushroom.choice.1",
        "position": "574:3"
    },
    "mushroom.choice.1": {
        "type": "call",
        "branch": "growing.potion.formula",
        "args": [],
        "next": "mushroom.choice.2",
        "position": "575:3"
    },
    "mushroom.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "mountain"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "mushroom.choice.3",
        "next": "mushroom.choice.2.1",
        "position": "578:5"
    },
    "mushroom.choice.2.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "lion"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "mushroom.choice.3",
        "next": "mushroom.choice.2.2",
        "position": "578:5"
    },
    "mushroom.choice.2.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "mushroom"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "mushroom.choice.3",
        "next": "mushroom.choice.2.3",
        "position": "578:5"
    },
    "mushroom.choice.2.3": {
        "type": "opt",
        "question": [
            "mushroom.choice.2.5",
            "mushroom.choice.2.6"
        ],
        "answer": [
            "mushroom.choice.2.4",
            "mushroom.choice.2.6",
            "mushroom.choice.2.7",
            "mushroom.choice.2.11"
        ],
        "keywords": [
            "give lion mushroom",
            "lion",
            "scene"
        ],
        "next": "mushroom.choice.3",
        "position": "578:5"
    },
    "mushroom.choice.2.4": {
        "type": "text",
        "text": "You o",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "578:5"
    },
    "mushroom.choice.2.5": {
        "type": "text",
        "text": "O",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "578:5"
    },
    "mushroom.choice.2.6": {
        "type": "text",
        "text": "ffer the lion a mushroom.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "578:5"
    },
    "mushroom.choice.2.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "lion"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "lion"
        ],
        "next": "mushroom.choice.2.8",
        "position": "578:5"
    },
    "mushroom.choice.2.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "cat"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "cat"
        ],
        "next": "mushroom.choice.2.9",
        "position": "578:5"
    },
    "mushroom.choice.2.9": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "mushroom"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "mushroom"
        ],
        "next": "mushroom.choice.2.10",
        "position": "578:5"
    },
    "mushroom.choice.2.10": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "578:5"
    },
    "mushroom.choice.2.11": {
        "type": "goto",
        "next": "give.lion.mushroom",
        "position": "578:5"
    },
    "give.lion.mushroom": {
        "type": "text",
        "text": "The lion greedily accepts and shrinks to a diminutive size, becoming a gentle cat, opening the way to the volcano.",
        "lift": " ",
        "drop": " ",
        "next": "give.lion.mushroom.1",
        "position": "582:7"
    },
    "give.lion.mushroom.1": {
        "type": "opt",
        "question": [
            "give.lion.mushroom.1.2",
            "give.lion.mushroom.1.3"
        ],
        "answer": [
            "give.lion.mushroom.1.1",
            "give.lion.mushroom.1.3",
            "give.lion.mushroom.1.4"
        ],
        "keywords": [
            "go mountain",
            "north",
            "scene"
        ],
        "next": "give.lion.mushroom.2",
        "position": "583:7"
    },
    "give.lion.mushroom.1.1": {
        "type": "text",
        "text": "You t",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "583:7"
    },
    "give.lion.mushroom.1.2": {
        "type": "text",
        "text": "T",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "583:7"
    },
    "give.lion.mushroom.1.3": {
        "type": "text",
        "text": "ravel across the isthmus up the vulcan terraces.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "583:7"
    },
    "give.lion.mushroom.1.4": {
        "type": "par",
        "next": "mountain",
        "position": "584:7"
    },
    "give.lion.mushroom.2": {
        "type": "opt",
        "question": [
            "give.lion.mushroom.2.2",
            "give.lion.mushroom.2.3"
        ],
        "answer": [
            "give.lion.mushroom.2.1",
            "give.lion.mushroom.2.3",
            "give.lion.mushroom.2.4"
        ],
        "keywords": [
            "corner",
            "go beach",
            "lava-flow",
            "south"
        ],
        "next": "give.lion.mushroom.3",
        "position": "586:7"
    },
    "give.lion.mushroom.2.1": {
        "type": "text",
        "text": "You r",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "586:7"
    },
    "give.lion.mushroom.2.2": {
        "type": "text",
        "text": "R",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "586:7"
    },
    "give.lion.mushroom.2.3": {
        "type": "text",
        "text": "eturn to the beach.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "586:7"
    },
    "give.lion.mushroom.2.4": {
        "type": "par",
        "next": "beach",
        "position": "587:7"
    },
    "give.lion.mushroom.3": {
        "type": "ask",
        "position": "588:5"
    },
    "mushroom.choice.3": {
        "type": "opt",
        "question": [
            "mushroom.choice.3.1"
        ],
        "answer": [
            "mushroom.choice.3.4"
        ],
        "keywords": [
            "taste mushroom"
        ],
        "next": "mushroom.choice.4",
        "position": "590:5"
    },
    "mushroom.choice.3.1": {
        "type": "text",
        "text": "Taste",
        "lift": "",
        "drop": " ",
        "next": "mushroom.choice.3.2",
        "position": "590:5"
    },
    "mushroom.choice.3.2": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "mushroom.choice.3.2.1",
            "mushroom.choice.3.2.2",
            "mushroom.choice.3.2.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "590:5"
    },
    "mushroom.choice.3.2.1": {
        "type": "goto",
        "next": "mushroom.choice.3.3",
        "position": "590:5"
    },
    "mushroom.choice.3.2.2": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "mushroom.choice.3.3",
        "position": "590:5"
    },
    "mushroom.choice.3.2.3": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "mushroom.choice.3.3",
        "position": "590:5"
    },
    "mushroom.choice.3.3": {
        "type": "text",
        "text": "mushroom.",
        "lift": " ",
        "drop": "",
        "next": null,
        "position": "590:5"
    },
    "mushroom.choice.3.4": {
        "type": "text",
        "text": "The",
        "lift": " ",
        "drop": " ",
        "next": "mushroom.choice.3.5",
        "position": "591:5"
    },
    "mushroom.choice.3.5": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom.choice.3.5"
        ],
        "variable": "mushroom.choice.3.5",
        "value": 0,
        "mode": "rand",
        "branches": [
            "mushroom.choice.3.5.1",
            "mushroom.choice.3.5.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "591:5"
    },
    "mushroom.choice.3.5.1": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "mushroom.choice.3.6",
        "position": "591:5"
    },
    "mushroom.choice.3.5.2": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "mushroom.choice.3.6",
        "position": "591:5"
    },
    "mushroom.choice.3.6": {
        "type": "text",
        "text": "tastes the mushroom and exclaims, “Oh, this is surely edible, but far too bitter to eat raw,” and sets the mushroom aside uneaten.",
        "lift": " ",
        "drop": " ",
        "next": "mushroom.choice.3.7",
        "position": "594:7"
    },
    "mushroom.choice.3.7": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "lion"
            ]
        ],
        "branch": "mushroom.choice.3.9",
        "next": "mushroom.choice.3.8",
        "position": "594:7"
    },
    "mushroom.choice.3.8": {
        "type": "text",
        "text": "Maybe this island has animals that would find it palatable.",
        "lift": " ",
        "drop": " ",
        "next": "mushroom.choice.3.9",
        "position": "595:7"
    },
    "mushroom.choice.3.9": {
        "type": "opt",
        "question": [
            "mushroom.choice.3.9.1"
        ],
        "answer": [
            "mushroom.choice.3.9.2"
        ],
        "keywords": [
            "",
            "continue"
        ],
        "next": "mushroom.choice.3.10",
        "position": "595:7"
    },
    "mushroom.choice.3.9.1": {
        "type": "text",
        "text": "Continue.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "595:7"
    },
    "mushroom.choice.3.9.2": {
        "type": "goto",
        "next": "return",
        "position": "596:5"
    },
    "mushroom.choice.3.10": {
        "type": "ask",
        "position": "596:5"
    },
    "mushroom.choice.4": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "jungle"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "mushroom.choice.5",
        "next": "mushroom.choice.4.1",
        "position": "599:5"
    },
    "mushroom.choice.4.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "mushroom.choice.5",
        "next": "mushroom.choice.4.2",
        "position": "599:5"
    },
    "mushroom.choice.4.2": {
        "type": "opt",
        "question": [
            "mushroom.choice.4.4",
            "mushroom.choice.4.5"
        ],
        "answer": [
            "mushroom.choice.4.3",
            "mushroom.choice.4.5",
            "mushroom.choice.4.6",
            "mushroom.choice.4.8"
        ],
        "keywords": [
            "get mushroom",
            "mushrooms"
        ],
        "next": "mushroom.choice.5",
        "position": "599:5"
    },
    "mushroom.choice.4.3": {
        "type": "text",
        "text": "You p",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "599:5"
    },
    "mushroom.choice.4.4": {
        "type": "text",
        "text": "P",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "599:5"
    },
    "mushroom.choice.4.5": {
        "type": "text",
        "text": "ick another mushroom.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "599:5"
    },
    "mushroom.choice.4.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "mushroom"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "mushroom"
        ],
        "next": "mushroom.choice.4.7",
        "position": "599:5"
    },
    "mushroom.choice.4.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "599:5"
    },
    "mushroom.choice.4.8": {
        "type": "goto",
        "next": "return",
        "position": "600:5"
    },
    "mushroom.choice.5": {
        "type": "jump",
        "condition": [
            "==",
            [
                "or",
                [
                    "<>",
                    [
                        "get",
                        "at"
                    ],
                    [
                        "get",
                        "mountain"
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "lion"
                    ]
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "mushroom.choice.6",
        "next": "mushroom.choice.5.1",
        "position": "602:5"
    },
    "mushroom.choice.5.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "mushroom"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "mushroom.choice.6",
        "next": "mushroom.choice.5.2",
        "position": "602:5"
    },
    "mushroom.choice.5.2": {
        "type": "opt",
        "question": [
            "mushroom.choice.5.4",
            "mushroom.choice.5.5"
        ],
        "answer": [
            "mushroom.choice.5.3",
            "mushroom.choice.5.5",
            "mushroom.choice.5.10",
            "mushroom.choice.5.12"
        ],
        "keywords": [
            "bamboo",
            "drop mushroom",
            "mushrooms",
            "scene"
        ],
        "next": "mushroom.choice.6",
        "position": "602:5"
    },
    "mushroom.choice.5.3": {
        "type": "text",
        "text": "You t",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "602:5"
    },
    "mushroom.choice.5.4": {
        "type": "text",
        "text": "T",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "602:5"
    },
    "mushroom.choice.5.5": {
        "type": "text",
        "text": "oss",
        "lift": "",
        "drop": " ",
        "next": "mushroom.choice.5.6",
        "position": "602:5"
    },
    "mushroom.choice.5.6": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "mushroom.choice.5.6.1",
            "mushroom.choice.5.6.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "602:5"
    },
    "mushroom.choice.5.6.1": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "mushroom.choice.5.7",
        "position": "602:5"
    },
    "mushroom.choice.5.6.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "mushroom.choice.5.7",
        "position": "602:5"
    },
    "mushroom.choice.5.7": {
        "type": "text",
        "text": "red mushroom",
        "lift": " ",
        "drop": " ",
        "next": "mushroom.choice.5.8",
        "position": "602:5"
    },
    "mushroom.choice.5.8": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom.choice.5.8"
        ],
        "variable": "mushroom.choice.5.8",
        "value": 0,
        "mode": "rand",
        "branches": [
            "mushroom.choice.5.8.1",
            "mushroom.choice.5.8.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "602:5"
    },
    "mushroom.choice.5.8.1": {
        "type": "text",
        "text": "away",
        "lift": "",
        "drop": "",
        "next": "mushroom.choice.5.9",
        "position": "602:5"
    },
    "mushroom.choice.5.8.2": {
        "type": "text",
        "text": "aside",
        "lift": "",
        "drop": "",
        "next": "mushroom.choice.5.9",
        "position": "602:5"
    },
    "mushroom.choice.5.9": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "602:5"
    },
    "mushroom.choice.5.10": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "mushroom"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "mushroom"
        ],
        "next": "mushroom.choice.5.11",
        "position": "602:5"
    },
    "mushroom.choice.5.11": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "602:5"
    },
    "mushroom.choice.5.12": {
        "type": "goto",
        "next": "return",
        "position": "603:5"
    },
    "mushroom.choice.6": {
        "type": "opt",
        "question": [
            "mushroom.choice.6.2",
            "mushroom.choice.6.3"
        ],
        "answer": [
            "mushroom.choice.6.1",
            "mushroom.choice.6.3",
            "mushroom.choice.6.6"
        ],
        "keywords": [
            "",
            "keep",
            "mushroom"
        ],
        "next": "mushroom.choice.7",
        "position": "604:5"
    },
    "mushroom.choice.6.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "604:5"
    },
    "mushroom.choice.6.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "604:5"
    },
    "mushroom.choice.6.3": {
        "type": "text",
        "text": "eep the mushroom",
        "lift": "",
        "drop": "",
        "next": "mushroom.choice.6.4",
        "position": "604:5"
    },
    "mushroom.choice.6.4": {
        "type": "switch",
        "expression": [
            "get",
            "mushroom"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "mushroom.choice.6.4.1",
            "mushroom.choice.6.4.2",
            "mushroom.choice.6.4.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "604:5"
    },
    "mushroom.choice.6.4.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "mushroom.choice.6.5",
        "position": "604:5"
    },
    "mushroom.choice.6.4.2": {
        "type": "goto",
        "next": "mushroom.choice.6.5",
        "position": "604:5"
    },
    "mushroom.choice.6.4.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "mushroom.choice.6.5",
        "position": "604:5"
    },
    "mushroom.choice.6.5": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "604:5"
    },
    "mushroom.choice.6.6": {
        "type": "goto",
        "next": "return",
        "position": "605:3"
    },
    "mushroom.choice.7": {
        "type": "ask",
        "position": "605:3"
    },
    "reed": {
        "type": "text",
        "text": "You have",
        "lift": " ",
        "drop": " ",
        "next": "reed.1",
        "position": "609:3"
    },
    "reed.1": {
        "type": "switch",
        "expression": [
            "get",
            "reed"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "reed.1.1",
            "reed.1.2",
            "reed.1.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "609:3"
    },
    "reed.1.1": {
        "type": "goto",
        "next": "reed.2",
        "position": "609:3"
    },
    "reed.1.2": {
        "type": "text",
        "text": "a few reeds",
        "lift": "",
        "drop": "",
        "next": "reed.2",
        "position": "609:3"
    },
    "reed.1.3": {
        "type": "text",
        "text": "bundles of reeds",
        "lift": "",
        "drop": "",
        "next": "reed.2",
        "position": "609:3"
    },
    "reed.2": {
        "type": "text",
        "text": "held in",
        "lift": " ",
        "drop": " ",
        "next": "reed.3",
        "position": "609:3"
    },
    "reed.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "reed"
            ]
        ],
        "next": "reed.4",
        "position": "609:3"
    },
    "reed.4": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "reed.5",
        "position": "610:3"
    },
    "reed.5": {
        "type": "switch",
        "expression": [
            "get",
            "reed"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "reed.5.1",
            "reed.5.2",
            "reed.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "610:3"
    },
    "reed.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "reed.6",
        "position": "610:3"
    },
    "reed.5.2": {
        "type": "goto",
        "next": "reed.6",
        "position": "610:3"
    },
    "reed.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "reed.6",
        "position": "610:3"
    },
    "reed.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "reed.7",
        "position": "611:5"
    },
    "reed.7": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "and",
                    [
                        "and",
                        [
                            "not",
                            [
                                "get",
                                "launch.pad"
                            ]
                        ],
                        [
                            "not",
                            [
                                "get",
                                "airplane"
                            ]
                        ]
                    ],
                    [
                        "not",
                        [
                            "get",
                            "paper"
                        ]
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "soaked.reed"
                    ]
                ]
            ]
        ],
        "branch": "reed.choice",
        "next": "reed.8",
        "position": "611:5"
    },
    "reed.8": {
        "type": "text",
        "text": "These reeds might be useful for making paper. They would need to be made pliable somehow.",
        "lift": " ",
        "drop": " ",
        "next": "reed.choice",
        "position": "614:3"
    },
    "reed.choice": {
        "type": "call",
        "branch": "vial.formula",
        "args": [],
        "next": "reed.choice.1",
        "position": "615:3"
    },
    "reed.choice.1": {
        "type": "call",
        "branch": "soaked.reed.formula",
        "args": [],
        "next": "reed.choice.2",
        "position": "616:3"
    },
    "reed.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "reed"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "reed.choice.3",
        "next": "reed.choice.2.1",
        "position": "621:5"
    },
    "reed.choice.2.1": {
        "type": "opt",
        "question": [
            "reed.choice.2.3",
            "reed.choice.2.4"
        ],
        "answer": [
            "reed.choice.2.2",
            "reed.choice.2.4",
            "reed.choice.2.7",
            "reed.choice.2.9"
        ],
        "keywords": [
            "drop reed",
            "scene"
        ],
        "next": "reed.choice.3",
        "position": "621:5"
    },
    "reed.choice.2.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "621:5"
    },
    "reed.choice.2.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "621:5"
    },
    "reed.choice.2.4": {
        "type": "text",
        "text": "rop",
        "lift": "",
        "drop": " ",
        "next": "reed.choice.2.5",
        "position": "621:5"
    },
    "reed.choice.2.5": {
        "type": "switch",
        "expression": [
            "get",
            "reed"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "reed.choice.2.5.1",
            "reed.choice.2.5.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "621:5"
    },
    "reed.choice.2.5.1": {
        "type": "text",
        "text": "the remaining",
        "lift": "",
        "drop": "",
        "next": "reed.choice.2.6",
        "position": "621:5"
    },
    "reed.choice.2.5.2": {
        "type": "text",
        "text": "some",
        "lift": "",
        "drop": "",
        "next": "reed.choice.2.6",
        "position": "621:5"
    },
    "reed.choice.2.6": {
        "type": "text",
        "text": "reeds.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "621:5"
    },
    "reed.choice.2.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "reed"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "reed"
        ],
        "next": "reed.choice.2.8",
        "position": "621:5"
    },
    "reed.choice.2.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "621:5"
    },
    "reed.choice.2.9": {
        "type": "goto",
        "next": "return",
        "position": "622:5"
    },
    "reed.choice.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "beach"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "reed.choice.4",
        "next": "reed.choice.3.1",
        "position": "624:5"
    },
    "reed.choice.3.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "reed.choice.4",
        "next": "reed.choice.3.2",
        "position": "624:5"
    },
    "reed.choice.3.2": {
        "type": "opt",
        "question": [
            "reed.choice.3.4",
            "reed.choice.3.5"
        ],
        "answer": [
            "reed.choice.3.3",
            "reed.choice.3.5",
            "reed.choice.3.6",
            "reed.choice.3.8"
        ],
        "keywords": [
            "get reed",
            "reeds"
        ],
        "next": "reed.choice.4",
        "position": "624:5"
    },
    "reed.choice.3.3": {
        "type": "text",
        "text": "You c",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "624:5"
    },
    "reed.choice.3.4": {
        "type": "text",
        "text": "C",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "624:5"
    },
    "reed.choice.3.5": {
        "type": "text",
        "text": "ut more reeds from the marsh.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "624:5"
    },
    "reed.choice.3.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "reed"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "reed"
        ],
        "next": "reed.choice.3.7",
        "position": "624:5"
    },
    "reed.choice.3.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "624:5"
    },
    "reed.choice.3.8": {
        "type": "goto",
        "next": "return",
        "position": "625:5"
    },
    "reed.choice.4": {
        "type": "opt",
        "question": [
            "reed.choice.4.2",
            "reed.choice.4.3"
        ],
        "answer": [
            "reed.choice.4.1",
            "reed.choice.4.3",
            "reed.choice.4.4"
        ],
        "keywords": [
            "",
            "keep",
            "reed"
        ],
        "next": "reed.choice.5",
        "position": "625:5"
    },
    "reed.choice.4.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "625:5"
    },
    "reed.choice.4.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "625:5"
    },
    "reed.choice.4.3": {
        "type": "text",
        "text": "eep the reeds.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "625:5"
    },
    "reed.choice.4.4": {
        "type": "goto",
        "next": "return",
        "position": "626:3"
    },
    "reed.choice.5": {
        "type": "ask",
        "position": "626:3"
    },
    "soaked.reed.formula": {
        "type": "args",
        "locals": [],
        "next": "soaked.reed.formula.1",
        "position": "629:3"
    },
    "soaked.reed.formula.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "or",
                [
                    "get",
                    "brine.pumpkin"
                ],
                [
                    "get",
                    "freshwater.pumpkin"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "soaked.reed.formula.1.1",
        "position": "632:5"
    },
    "soaked.reed.formula.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "reed"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "soaked.reed.formula.1.2",
        "position": "632:5"
    },
    "soaked.reed.formula.1.2": {
        "type": "opt",
        "question": [
            "soaked.reed.formula.1.4",
            "soaked.reed.formula.1.5"
        ],
        "answer": [
            "soaked.reed.formula.1.3",
            "soaked.reed.formula.1.5",
            "soaked.reed.formula.1.6",
            "soaked.reed.formula.1.8"
        ],
        "keywords": [
            "brine-pumpkin",
            "freshwater-pumpkin",
            "reed",
            "soak reeds in pumpkin"
        ],
        "next": null,
        "position": "632:5"
    },
    "soaked.reed.formula.1.3": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "632:5"
    },
    "soaked.reed.formula.1.4": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "632:5"
    },
    "soaked.reed.formula.1.5": {
        "type": "text",
        "text": "oak reeds in the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "632:5"
    },
    "soaked.reed.formula.1.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "reed"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "reed"
        ],
        "next": "soaked.reed.formula.1.7",
        "position": "632:5"
    },
    "soaked.reed.formula.1.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "soaked.reed"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "soaked.reed"
        ],
        "next": null,
        "position": "632:5"
    },
    "soaked.reed.formula.1.8": {
        "type": "text",
        "text": "Some time later, you notice that they have become rather pliable. Maybe you can wrap, weave, tie, or mash these reeds.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "635:5"
    },
    "soaked.reed": {
        "type": "text",
        "text": "You have",
        "lift": " ",
        "drop": " ",
        "next": "soaked.reed.1",
        "position": "638:3"
    },
    "soaked.reed.1": {
        "type": "switch",
        "expression": [
            "get",
            "soaked.reed"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "soaked.reed.1.1",
            "soaked.reed.1.2",
            "soaked.reed.1.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "638:3"
    },
    "soaked.reed.1.1": {
        "type": "goto",
        "next": "soaked.reed.2",
        "position": "638:3"
    },
    "soaked.reed.1.2": {
        "type": "text",
        "text": "a few soaked reeds",
        "lift": "",
        "drop": "",
        "next": "soaked.reed.2",
        "position": "638:3"
    },
    "soaked.reed.1.3": {
        "type": "text",
        "text": "a bundle of soaked reeds",
        "lift": "",
        "drop": "",
        "next": "soaked.reed.2",
        "position": "638:3"
    },
    "soaked.reed.2": {
        "type": "text",
        "text": "held in",
        "lift": " ",
        "drop": " ",
        "next": "soaked.reed.3",
        "position": "639:3"
    },
    "soaked.reed.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "soaked.reed"
            ]
        ],
        "next": "soaked.reed.4",
        "position": "639:3"
    },
    "soaked.reed.4": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "soaked.reed.5",
        "position": "639:3"
    },
    "soaked.reed.5": {
        "type": "switch",
        "expression": [
            "get",
            "soaked.reed"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "soaked.reed.5.1",
            "soaked.reed.5.2",
            "soaked.reed.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "639:3"
    },
    "soaked.reed.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "soaked.reed.6",
        "position": "639:3"
    },
    "soaked.reed.5.2": {
        "type": "goto",
        "next": "soaked.reed.6",
        "position": "639:3"
    },
    "soaked.reed.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "soaked.reed.6",
        "position": "639:3"
    },
    "soaked.reed.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "soaked.reed.7",
        "position": "640:5"
    },
    "soaked.reed.7": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "and",
                    [
                        "not",
                        [
                            "get",
                            "launch.pad"
                        ]
                    ],
                    [
                        "not",
                        [
                            "get",
                            "airplane"
                        ]
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "paper"
                    ]
                ]
            ]
        ],
        "branch": "soaked.reed.choice",
        "next": "soaked.reed.8",
        "position": "640:5"
    },
    "soaked.reed.8": {
        "type": "text",
        "text": "You might be able to mash these reeds into pulp.",
        "lift": " ",
        "drop": " ",
        "next": "soaked.reed.9",
        "position": "642:7"
    },
    "soaked.reed.9": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "get",
                    "rock"
                ],
                [
                    "not",
                    [
                        "get",
                        "hammer"
                    ]
                ]
            ]
        ],
        "branch": "soaked.reed.choice",
        "next": "soaked.reed.10",
        "position": "642:7"
    },
    "soaked.reed.10": {
        "type": "text",
        "text": "Sadly, this rock alone would make hard work of paper making. Perhaps you can use it to make a hammer.",
        "lift": " ",
        "drop": " ",
        "next": "soaked.reed.choice",
        "position": "645:3"
    },
    "soaked.reed.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "hammer"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "soaked.reed.choice.1",
        "next": "soaked.reed.choice.0.1",
        "position": "648:5"
    },
    "soaked.reed.choice.0.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "rock"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "soaked.reed.choice.1",
        "next": "soaked.reed.choice.0.2",
        "position": "648:5"
    },
    "soaked.reed.choice.0.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "soaked.reed"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "soaked.reed.choice.1",
        "next": "soaked.reed.choice.0.3",
        "position": "648:5"
    },
    "soaked.reed.choice.0.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "bamboo"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "soaked.reed.choice.1",
        "next": "soaked.reed.choice.0.4",
        "position": "648:5"
    },
    "soaked.reed.choice.0.4": {
        "type": "opt",
        "question": [
            "soaked.reed.choice.0.6",
            "soaked.reed.choice.0.7",
            "soaked.reed.choice.0.8"
        ],
        "answer": [
            "soaked.reed.choice.0.5",
            "soaked.reed.choice.0.7",
            "soaked.reed.choice.0.9",
            "soaked.reed.choice.0.14"
        ],
        "keywords": [
            "bamboo",
            "make hammer",
            "rock"
        ],
        "next": "soaked.reed.choice.1",
        "position": "648:5"
    },
    "soaked.reed.choice.0.5": {
        "type": "text",
        "text": "You b",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "648:5"
    },
    "soaked.reed.choice.0.6": {
        "type": "text",
        "text": "B",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "648:5"
    },
    "soaked.reed.choice.0.7": {
        "type": "text",
        "text": "ind the rock to the bamboo with the reed",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "648:5"
    },
    "soaked.reed.choice.0.8": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "648:5"
    },
    "soaked.reed.choice.0.9": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "rock"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "rock"
        ],
        "next": "soaked.reed.choice.0.10",
        "position": "648:5"
    },
    "soaked.reed.choice.0.10": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "soaked.reed"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "soaked.reed"
        ],
        "next": "soaked.reed.choice.0.11",
        "position": "648:5"
    },
    "soaked.reed.choice.0.11": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "bamboo"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "bamboo"
        ],
        "next": "soaked.reed.choice.0.12",
        "position": "648:5"
    },
    "soaked.reed.choice.0.12": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hammer"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hammer"
        ],
        "next": "soaked.reed.choice.0.13",
        "position": "648:5"
    },
    "soaked.reed.choice.0.13": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "648:5"
    },
    "soaked.reed.choice.0.14": {
        "type": "text",
        "text": ", constructing a sturdy hammer. Perhaps you can use this to mash things to pulp.",
        "lift": "",
        "drop": " ",
        "next": "return",
        "position": "651:5"
    },
    "soaked.reed.choice.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "hammer"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "soaked.reed.choice.2",
        "next": "soaked.reed.choice.1.1",
        "position": "653:5"
    },
    "soaked.reed.choice.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "soaked.reed"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "soaked.reed.choice.2",
        "next": "soaked.reed.choice.1.2",
        "position": "653:5"
    },
    "soaked.reed.choice.1.2": {
        "type": "opt",
        "question": [
            "soaked.reed.choice.1.4",
            "soaked.reed.choice.1.5",
            "soaked.reed.choice.1.6"
        ],
        "answer": [
            "soaked.reed.choice.1.3",
            "soaked.reed.choice.1.5",
            "soaked.reed.choice.1.7",
            "soaked.reed.choice.1.9"
        ],
        "keywords": [
            "hammer",
            "mash reed"
        ],
        "next": "soaked.reed.choice.2",
        "position": "653:5"
    },
    "soaked.reed.choice.1.3": {
        "type": "text",
        "text": "You m",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "653:5"
    },
    "soaked.reed.choice.1.4": {
        "type": "text",
        "text": "M",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "653:5"
    },
    "soaked.reed.choice.1.5": {
        "type": "text",
        "text": "ash reeds with hammer",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "653:5"
    },
    "soaked.reed.choice.1.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "653:5"
    },
    "soaked.reed.choice.1.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "soaked.reed"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "soaked.reed"
        ],
        "next": "soaked.reed.choice.1.8",
        "position": "653:5"
    },
    "soaked.reed.choice.1.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "paper"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "paper"
        ],
        "next": null,
        "position": "653:5"
    },
    "soaked.reed.choice.1.9": {
        "type": "text",
        "text": ", creating a mushy pulp from the reeds’ pith. You leave these to dry and they become coarse paper.",
        "lift": "",
        "drop": " ",
        "next": "return",
        "position": "656:5"
    },
    "soaked.reed.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "soaked.reed"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "soaked.reed.choice.3",
        "next": "soaked.reed.choice.2.1",
        "position": "658:5"
    },
    "soaked.reed.choice.2.1": {
        "type": "opt",
        "question": [
            "soaked.reed.choice.2.3",
            "soaked.reed.choice.2.4"
        ],
        "answer": [
            "soaked.reed.choice.2.2",
            "soaked.reed.choice.2.4",
            "soaked.reed.choice.2.7",
            "soaked.reed.choice.2.9"
        ],
        "keywords": [
            "drop soaked reed",
            "scene"
        ],
        "next": "soaked.reed.choice.3",
        "position": "658:5"
    },
    "soaked.reed.choice.2.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "658:5"
    },
    "soaked.reed.choice.2.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "658:5"
    },
    "soaked.reed.choice.2.4": {
        "type": "text",
        "text": "iscard",
        "lift": "",
        "drop": " ",
        "next": "soaked.reed.choice.2.5",
        "position": "658:5"
    },
    "soaked.reed.choice.2.5": {
        "type": "switch",
        "expression": [
            "get",
            "reed"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "soaked.reed.choice.2.5.1",
            "soaked.reed.choice.2.5.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "658:5"
    },
    "soaked.reed.choice.2.5.1": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "soaked.reed.choice.2.6",
        "position": "658:5"
    },
    "soaked.reed.choice.2.5.2": {
        "type": "text",
        "text": "some",
        "lift": "",
        "drop": "",
        "next": "soaked.reed.choice.2.6",
        "position": "658:5"
    },
    "soaked.reed.choice.2.6": {
        "type": "text",
        "text": "reeds.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "658:5"
    },
    "soaked.reed.choice.2.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "soaked.reed"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "soaked.reed"
        ],
        "next": "soaked.reed.choice.2.8",
        "position": "658:5"
    },
    "soaked.reed.choice.2.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "658:5"
    },
    "soaked.reed.choice.2.9": {
        "type": "goto",
        "next": "return",
        "position": "659:5"
    },
    "soaked.reed.choice.3": {
        "type": "opt",
        "question": [
            "soaked.reed.choice.3.2",
            "soaked.reed.choice.3.3"
        ],
        "answer": [
            "soaked.reed.choice.3.1",
            "soaked.reed.choice.3.3",
            "soaked.reed.choice.3.4"
        ],
        "keywords": [
            "",
            "keep",
            "soaked-reed"
        ],
        "next": "soaked.reed.choice.4",
        "position": "659:5"
    },
    "soaked.reed.choice.3.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "659:5"
    },
    "soaked.reed.choice.3.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "659:5"
    },
    "soaked.reed.choice.3.3": {
        "type": "text",
        "text": "eep the reeds.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "659:5"
    },
    "soaked.reed.choice.3.4": {
        "type": "goto",
        "next": "return",
        "position": "660:3"
    },
    "soaked.reed.choice.4": {
        "type": "ask",
        "position": "660:3"
    },
    "paper": {
        "type": "text",
        "text": "You have",
        "lift": " ",
        "drop": " ",
        "next": "paper.1",
        "position": "664:3"
    },
    "paper.1": {
        "type": "switch",
        "expression": [
            "get",
            "paper"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "paper.1.1",
            "paper.1.2",
            "paper.1.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "664:3"
    },
    "paper.1.1": {
        "type": "goto",
        "next": "paper.2",
        "position": "664:3"
    },
    "paper.1.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "paper.2",
        "position": "664:3"
    },
    "paper.1.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "paper"
            ]
        ],
        "next": "paper.2",
        "position": "664:3"
    },
    "paper.2": {
        "type": "text",
        "text": "crisp sheets of paper, held in",
        "lift": " ",
        "drop": " ",
        "next": "paper.3",
        "position": "665:3"
    },
    "paper.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "paper"
            ]
        ],
        "next": "paper.4",
        "position": "665:3"
    },
    "paper.4": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "paper.5",
        "position": "665:3"
    },
    "paper.5": {
        "type": "switch",
        "expression": [
            "get",
            "paper"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "paper.5.1",
            "paper.5.2",
            "paper.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "665:3"
    },
    "paper.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "paper.6",
        "position": "665:3"
    },
    "paper.5.2": {
        "type": "goto",
        "next": "paper.6",
        "position": "665:3"
    },
    "paper.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "paper.6",
        "position": "665:3"
    },
    "paper.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "paper.7",
        "position": "666:5"
    },
    "paper.7": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "airplane"
            ]
        ],
        "branch": "paper.choice",
        "next": "paper.8",
        "position": "666:5"
    },
    "paper.8": {
        "type": "text",
        "text": "You already have a paper airplane and you agree that you can both fly in one if you shrink yourselves.",
        "lift": " ",
        "drop": " ",
        "next": "paper.choice",
        "position": "668:3"
    },
    "paper.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "airplane"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "paper.choice.1",
        "next": "paper.choice.0.1",
        "position": "674:5"
    },
    "paper.choice.0.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "paper"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "paper.choice.1",
        "next": "paper.choice.0.2",
        "position": "674:5"
    },
    "paper.choice.0.2": {
        "type": "opt",
        "question": [
            "paper.choice.0.4",
            "paper.choice.0.5"
        ],
        "answer": [
            "paper.choice.0.3",
            "paper.choice.0.5",
            "paper.choice.0.6",
            "paper.choice.0.8"
        ],
        "keywords": [
            "fold paper",
            "make airplane"
        ],
        "next": "paper.choice.1",
        "position": "674:5"
    },
    "paper.choice.0.3": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "674:5"
    },
    "paper.choice.0.4": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "674:5"
    },
    "paper.choice.0.5": {
        "type": "text",
        "text": "old a sheet of paper into an airplane.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "674:5"
    },
    "paper.choice.0.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "paper"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "paper"
        ],
        "next": "paper.choice.0.7",
        "position": "674:5"
    },
    "paper.choice.0.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "airplane"
        ],
        "next": null,
        "position": "674:5"
    },
    "paper.choice.0.8": {
        "type": "goto",
        "next": "return",
        "position": "675:5"
    },
    "paper.choice.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "paper"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "paper.choice.2",
        "next": "paper.choice.1.1",
        "position": "677:5"
    },
    "paper.choice.1.1": {
        "type": "opt",
        "question": [
            "paper.choice.1.3",
            "paper.choice.1.4"
        ],
        "answer": [
            "paper.choice.1.2",
            "paper.choice.1.4",
            "paper.choice.1.5",
            "paper.choice.1.7"
        ],
        "keywords": [
            "drop paper",
            "scene"
        ],
        "next": "paper.choice.2",
        "position": "677:5"
    },
    "paper.choice.1.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "677:5"
    },
    "paper.choice.1.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "677:5"
    },
    "paper.choice.1.4": {
        "type": "text",
        "text": "rop the paper.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "677:5"
    },
    "paper.choice.1.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "paper"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "paper"
        ],
        "next": "paper.choice.1.6",
        "position": "677:5"
    },
    "paper.choice.1.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "677:5"
    },
    "paper.choice.1.7": {
        "type": "goto",
        "next": "return",
        "position": "678:5"
    },
    "paper.choice.2": {
        "type": "opt",
        "question": [
            "paper.choice.2.2",
            "paper.choice.2.3"
        ],
        "answer": [
            "paper.choice.2.1",
            "paper.choice.2.3",
            "paper.choice.2.4"
        ],
        "keywords": [
            "",
            "keep",
            "paper"
        ],
        "next": "paper.choice.3",
        "position": "678:5"
    },
    "paper.choice.2.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "678:5"
    },
    "paper.choice.2.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "678:5"
    },
    "paper.choice.2.3": {
        "type": "text",
        "text": "eep the paper.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "678:5"
    },
    "paper.choice.2.4": {
        "type": "goto",
        "next": "return",
        "position": "679:3"
    },
    "paper.choice.3": {
        "type": "ask",
        "position": "679:3"
    },
    "grow.airplane.clue": {
        "type": "args",
        "locals": [],
        "next": "grow.airplane.clue.1",
        "position": "682:3"
    },
    "grow.airplane.clue.1": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "and",
                    [
                        "and",
                        [
                            "get",
                            "flower"
                        ],
                        [
                            "get",
                            "airplane"
                        ]
                    ],
                    [
                        "not",
                        [
                            "get",
                            "giant.airplane"
                        ]
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "launch.pad"
                    ]
                ]
            ]
        ],
        "branch": null,
        "next": "grow.airplane.clue.2",
        "position": "683:5"
    },
    "grow.airplane.clue.2": {
        "type": "text",
        "text": "“Clearly this airplane is not going to eat the flower. We will have to splash a growing potion on it or it will never carry us both,” says the",
        "lift": " ",
        "drop": " ",
        "next": "grow.airplane.clue.3",
        "position": "686:5"
    },
    "grow.airplane.clue.3": {
        "type": "switch",
        "expression": [
            "get",
            "grow.airplane.clue.3"
        ],
        "variable": "grow.airplane.clue.3",
        "value": 0,
        "mode": "rand",
        "branches": [
            "grow.airplane.clue.3.1",
            "grow.airplane.clue.3.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "686:5"
    },
    "grow.airplane.clue.3.1": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "grow.airplane.clue.4",
        "position": "686:5"
    },
    "grow.airplane.clue.3.2": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "grow.airplane.clue.4",
        "position": "686:5"
    },
    "grow.airplane.clue.4": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "21953:5"
    },
    "grow.airplane.formula": {
        "type": "args",
        "locals": [],
        "next": "grow.airplane.formula.1",
        "position": "688:3"
    },
    "grow.airplane.formula.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "airplane"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "grow.airplane.formula.1.1",
        "position": "691:5"
    },
    "grow.airplane.formula.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "growing.potion"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "grow.airplane.formula.1.2",
        "position": "691:5"
    },
    "grow.airplane.formula.1.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "grow.airplane.formula.1.3",
        "position": "691:5"
    },
    "grow.airplane.formula.1.3": {
        "type": "opt",
        "question": [
            "grow.airplane.formula.1.5",
            "grow.airplane.formula.1.6",
            "grow.airplane.formula.1.7"
        ],
        "answer": [
            "grow.airplane.formula.1.4",
            "grow.airplane.formula.1.6",
            "grow.airplane.formula.1.8",
            "grow.airplane.formula.1.13"
        ],
        "keywords": [
            "airplane",
            "grow airplane",
            "growing-potion"
        ],
        "next": null,
        "position": "691:5"
    },
    "grow.airplane.formula.1.4": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "691:5"
    },
    "grow.airplane.formula.1.5": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "691:5"
    },
    "grow.airplane.formula.1.6": {
        "type": "text",
        "text": "plash the growing potion on your little paper airplane",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "691:5"
    },
    "grow.airplane.formula.1.7": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "691:5"
    },
    "grow.airplane.formula.1.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "airplane"
        ],
        "next": "grow.airplane.formula.1.9",
        "position": "691:5"
    },
    "grow.airplane.formula.1.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "giant.airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "giant.airplane"
        ],
        "next": "grow.airplane.formula.1.10",
        "position": "691:5"
    },
    "grow.airplane.formula.1.10": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "growing.potion"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "growing.potion"
        ],
        "next": "grow.airplane.formula.1.11",
        "position": "691:5"
    },
    "grow.airplane.formula.1.11": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": "grow.airplane.formula.1.12",
        "position": "691:5"
    },
    "grow.airplane.formula.1.12": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "691:5"
    },
    "grow.airplane.formula.1.13": {
        "type": "text",
        "text": "and it grows into a fabulous paper jet liner for two very small people. One of you has to hold it with both hands to keep it from catching the wind. The other keeps the now empty vial.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "695:5"
    },
    "airplane": {
        "type": "text",
        "text": "You have a paper airplane. It isn’t quite big enough to carry the boy and girl, even if they were tiny.",
        "lift": " ",
        "drop": " ",
        "next": "airplane.choice",
        "position": "700:3"
    },
    "airplane.choice": {
        "type": "call",
        "branch": "airplane.storage",
        "args": [],
        "next": "airplane.choice.1",
        "position": "701:3"
    },
    "airplane.choice.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "airplane"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "airplane.choice.2",
        "next": "airplane.choice.1.1",
        "position": "704:5"
    },
    "airplane.choice.1.1": {
        "type": "opt",
        "question": [
            "airplane.choice.1.3",
            "airplane.choice.1.4"
        ],
        "answer": [
            "airplane.choice.1.2",
            "airplane.choice.1.4",
            "airplane.choice.1.5",
            "airplane.choice.1.7"
        ],
        "keywords": [
            "drop airplane",
            "scene",
            "throw airplane"
        ],
        "next": "airplane.choice.2",
        "position": "704:5"
    },
    "airplane.choice.1.2": {
        "type": "text",
        "text": "You t",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "704:5"
    },
    "airplane.choice.1.3": {
        "type": "text",
        "text": "T",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "704:5"
    },
    "airplane.choice.1.4": {
        "type": "text",
        "text": "hrow the airplane away.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "704:5"
    },
    "airplane.choice.1.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "airplane"
        ],
        "next": "airplane.choice.1.6",
        "position": "704:5"
    },
    "airplane.choice.1.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "704:5"
    },
    "airplane.choice.1.7": {
        "type": "text",
        "text": "It catches the wind and flies away into the sea.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "706:5"
    },
    "airplane.choice.2": {
        "type": "opt",
        "question": [
            "airplane.choice.2.2",
            "airplane.choice.2.3"
        ],
        "answer": [
            "airplane.choice.2.1",
            "airplane.choice.2.3",
            "airplane.choice.2.4"
        ],
        "keywords": [
            "",
            "airplane",
            "keep"
        ],
        "next": "airplane.choice.3",
        "position": "706:5"
    },
    "airplane.choice.2.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "706:5"
    },
    "airplane.choice.2.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "706:5"
    },
    "airplane.choice.2.3": {
        "type": "text",
        "text": "eep the airplane.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "706:5"
    },
    "airplane.choice.2.4": {
        "type": "goto",
        "next": "return",
        "position": "707:3"
    },
    "airplane.choice.3": {
        "type": "ask",
        "position": "707:3"
    },
    "giant.airplane": {
        "type": "text",
        "text": "You have a giant paper airplane. You prevent the wind from carrying it off with all of two hands.",
        "lift": " ",
        "drop": " ",
        "next": "giant.airplane.1",
        "position": "713:5"
    },
    "giant.airplane.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "at"
            ],
            [
                "get",
                "hills"
            ]
        ],
        "branch": "giant.airplane.choice",
        "next": "giant.airplane.2",
        "position": "713:5"
    },
    "giant.airplane.2": {
        "type": "text",
        "text": "You need to find somewhere to put this down.",
        "lift": " ",
        "drop": " ",
        "next": "giant.airplane.choice",
        "position": "714:3"
    },
    "giant.airplane.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "hills"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "giant.airplane.choice.1",
        "next": "giant.airplane.choice.0.1",
        "position": "717:5"
    },
    "giant.airplane.choice.0.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "placed.ballista"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "giant.airplane.choice.1",
        "next": "giant.airplane.choice.0.2",
        "position": "717:5"
    },
    "giant.airplane.choice.0.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "giant.airplane"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "giant.airplane.choice.1",
        "next": "giant.airplane.choice.0.3",
        "position": "717:5"
    },
    "giant.airplane.choice.0.3": {
        "type": "opt",
        "question": [
            "giant.airplane.choice.0.5",
            "giant.airplane.choice.0.6"
        ],
        "answer": [
            "giant.airplane.choice.0.4",
            "giant.airplane.choice.0.6",
            "giant.airplane.choice.0.7",
            "giant.airplane.choice.0.11"
        ],
        "keywords": [
            "placed-ballista",
            "put giant airplane on ballista",
            "scene"
        ],
        "next": "giant.airplane.choice.1",
        "position": "717:5"
    },
    "giant.airplane.choice.0.4": {
        "type": "text",
        "text": "You p",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "717:5"
    },
    "giant.airplane.choice.0.5": {
        "type": "text",
        "text": "P",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "717:5"
    },
    "giant.airplane.choice.0.6": {
        "type": "text",
        "text": "lace the plane on the launch platform.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "717:5"
    },
    "giant.airplane.choice.0.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "placed.ballista"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "placed.ballista"
        ],
        "next": "giant.airplane.choice.0.8",
        "position": "717:5"
    },
    "giant.airplane.choice.0.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "launch.pad"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "launch.pad"
        ],
        "next": "giant.airplane.choice.0.9",
        "position": "717:5"
    },
    "giant.airplane.choice.0.9": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "giant.airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "giant.airplane"
        ],
        "next": "giant.airplane.choice.0.10",
        "position": "717:5"
    },
    "giant.airplane.choice.0.10": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "717:5"
    },
    "giant.airplane.choice.0.11": {
        "type": "goto",
        "next": "return",
        "position": "718:5"
    },
    "giant.airplane.choice.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "giant.airplane"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "giant.airplane.choice.2",
        "next": "giant.airplane.choice.1.1",
        "position": "720:5"
    },
    "giant.airplane.choice.1.1": {
        "type": "opt",
        "question": [
            "giant.airplane.choice.1.3",
            "giant.airplane.choice.1.4"
        ],
        "answer": [
            "giant.airplane.choice.1.2",
            "giant.airplane.choice.1.4",
            "giant.airplane.choice.1.5",
            "giant.airplane.choice.1.7"
        ],
        "keywords": [
            "drop giant airplane",
            "throw airplane"
        ],
        "next": "giant.airplane.choice.2",
        "position": "720:5"
    },
    "giant.airplane.choice.1.2": {
        "type": "text",
        "text": "You l",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "720:5"
    },
    "giant.airplane.choice.1.3": {
        "type": "text",
        "text": "L",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "720:5"
    },
    "giant.airplane.choice.1.4": {
        "type": "text",
        "text": "et the wind take the plane.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "720:5"
    },
    "giant.airplane.choice.1.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "giant.airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "giant.airplane"
        ],
        "next": "giant.airplane.choice.1.6",
        "position": "720:5"
    },
    "giant.airplane.choice.1.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "720:5"
    },
    "giant.airplane.choice.1.7": {
        "type": "goto",
        "next": "return",
        "position": "721:5"
    },
    "giant.airplane.choice.2": {
        "type": "opt",
        "question": [
            "giant.airplane.choice.2.2",
            "giant.airplane.choice.2.3"
        ],
        "answer": [
            "giant.airplane.choice.2.1",
            "giant.airplane.choice.2.3",
            "giant.airplane.choice.2.4"
        ],
        "keywords": [
            "",
            "airplane",
            "keep"
        ],
        "next": "giant.airplane.choice.3",
        "position": "721:5"
    },
    "giant.airplane.choice.2.1": {
        "type": "text",
        "text": "You h",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "721:5"
    },
    "giant.airplane.choice.2.2": {
        "type": "text",
        "text": "H",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "721:5"
    },
    "giant.airplane.choice.2.3": {
        "type": "text",
        "text": "old the plane firmly.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "721:5"
    },
    "giant.airplane.choice.2.4": {
        "type": "goto",
        "next": "return",
        "position": "722:3"
    },
    "giant.airplane.choice.3": {
        "type": "ask",
        "position": "722:3"
    },
    "hammer.storage": {
        "type": "args",
        "locals": [],
        "next": "hammer.storage.1",
        "position": "725:3"
    },
    "hammer.storage.1": {
        "type": "jump",
        "condition": [
            "<>",
            [
                "get",
                "at"
            ],
            [
                "get",
                "hills"
            ]
        ],
        "branch": null,
        "next": "hammer.storage.2",
        "position": "726:5"
    },
    "hammer.storage.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "airplane"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hammer.storage.3",
        "next": "hammer.storage.2.1",
        "position": "729:7"
    },
    "hammer.storage.2.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "stored.airplane"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hammer.storage.3",
        "next": "hammer.storage.2.2",
        "position": "729:7"
    },
    "hammer.storage.2.2": {
        "type": "opt",
        "question": [
            "hammer.storage.2.4",
            "hammer.storage.2.5"
        ],
        "answer": [
            "hammer.storage.2.3",
            "hammer.storage.2.5",
            "hammer.storage.2.8",
            "hammer.storage.2.11"
        ],
        "keywords": [
            "scene",
            "store airplane"
        ],
        "next": "hammer.storage.3",
        "position": "729:7"
    },
    "hammer.storage.2.3": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "729:7"
    },
    "hammer.storage.2.4": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "729:7"
    },
    "hammer.storage.2.5": {
        "type": "text",
        "text": "tore",
        "lift": "",
        "drop": " ",
        "next": "hammer.storage.2.6",
        "position": "729:7"
    },
    "hammer.storage.2.6": {
        "type": "switch",
        "expression": [
            "get",
            "airplane"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "hammer.storage.2.6.1",
            "hammer.storage.2.6.2",
            "hammer.storage.2.6.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "729:7"
    },
    "hammer.storage.2.6.1": {
        "type": "goto",
        "next": "hammer.storage.2.7",
        "position": "729:7"
    },
    "hammer.storage.2.6.2": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "hammer.storage.2.7",
        "position": "729:7"
    },
    "hammer.storage.2.6.3": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "hammer.storage.2.7",
        "position": "729:7"
    },
    "hammer.storage.2.7": {
        "type": "text",
        "text": "airplane in your pumpkin hut.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "729:7"
    },
    "hammer.storage.2.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "airplane"
        ],
        "next": "hammer.storage.2.9",
        "position": "729:7"
    },
    "hammer.storage.2.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "stored.airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "stored.airplane"
        ],
        "next": "hammer.storage.2.10",
        "position": "729:7"
    },
    "hammer.storage.2.10": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "729:7"
    },
    "hammer.storage.2.11": {
        "type": "goto",
        "next": "return",
        "position": "729:7"
    },
    "hammer.storage.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "stored.airplane"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hammer.storage.4",
        "next": "hammer.storage.3.1",
        "position": "732:7"
    },
    "hammer.storage.3.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hammer.storage.4",
        "next": "hammer.storage.3.2",
        "position": "732:7"
    },
    "hammer.storage.3.2": {
        "type": "opt",
        "question": [
            "hammer.storage.3.4",
            "hammer.storage.3.5"
        ],
        "answer": [
            "hammer.storage.3.3",
            "hammer.storage.3.5",
            "hammer.storage.3.6",
            "hammer.storage.3.9"
        ],
        "keywords": [
            "homestead",
            "retrieve airplane"
        ],
        "next": "hammer.storage.4",
        "position": "732:7"
    },
    "hammer.storage.3.3": {
        "type": "text",
        "text": "You r",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "732:7"
    },
    "hammer.storage.3.4": {
        "type": "text",
        "text": "R",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "732:7"
    },
    "hammer.storage.3.5": {
        "type": "text",
        "text": "etrieve the airplane from your pumpkin hut.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "732:7"
    },
    "hammer.storage.3.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "airplane"
        ],
        "next": "hammer.storage.3.7",
        "position": "732:7"
    },
    "hammer.storage.3.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "stored.airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "stored.airplane"
        ],
        "next": "hammer.storage.3.8",
        "position": "732:7"
    },
    "hammer.storage.3.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "732:7"
    },
    "hammer.storage.3.9": {
        "type": "goto",
        "next": "return",
        "position": "732:7"
    },
    "hammer.storage.4": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hammer"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hammer.storage.5",
        "next": "hammer.storage.4.1",
        "position": "736:7"
    },
    "hammer.storage.4.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "stored.hammer"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hammer.storage.5",
        "next": "hammer.storage.4.2",
        "position": "736:7"
    },
    "hammer.storage.4.2": {
        "type": "opt",
        "question": [
            "hammer.storage.4.4",
            "hammer.storage.4.5"
        ],
        "answer": [
            "hammer.storage.4.3",
            "hammer.storage.4.5",
            "hammer.storage.4.8",
            "hammer.storage.4.11"
        ],
        "keywords": [
            "scene",
            "store hammer"
        ],
        "next": "hammer.storage.5",
        "position": "736:7"
    },
    "hammer.storage.4.3": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "736:7"
    },
    "hammer.storage.4.4": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "736:7"
    },
    "hammer.storage.4.5": {
        "type": "text",
        "text": "tore",
        "lift": "",
        "drop": " ",
        "next": "hammer.storage.4.6",
        "position": "736:7"
    },
    "hammer.storage.4.6": {
        "type": "switch",
        "expression": [
            "get",
            "hammer"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "hammer.storage.4.6.1",
            "hammer.storage.4.6.2",
            "hammer.storage.4.6.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "736:7"
    },
    "hammer.storage.4.6.1": {
        "type": "goto",
        "next": "hammer.storage.4.7",
        "position": "736:7"
    },
    "hammer.storage.4.6.2": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "hammer.storage.4.7",
        "position": "736:7"
    },
    "hammer.storage.4.6.3": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "hammer.storage.4.7",
        "position": "736:7"
    },
    "hammer.storage.4.7": {
        "type": "text",
        "text": "hammer in your pumpkin hut.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "736:7"
    },
    "hammer.storage.4.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hammer"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hammer"
        ],
        "next": "hammer.storage.4.9",
        "position": "736:7"
    },
    "hammer.storage.4.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "stored.hammer"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "stored.hammer"
        ],
        "next": "hammer.storage.4.10",
        "position": "736:7"
    },
    "hammer.storage.4.10": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "736:7"
    },
    "hammer.storage.4.11": {
        "type": "goto",
        "next": "return",
        "position": "736:7"
    },
    "hammer.storage.5": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "stored.hammer"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "hammer.storage.5.1",
        "position": "739:7"
    },
    "hammer.storage.5.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "hammer.storage.5.2",
        "position": "739:7"
    },
    "hammer.storage.5.2": {
        "type": "opt",
        "question": [
            "hammer.storage.5.4",
            "hammer.storage.5.5"
        ],
        "answer": [
            "hammer.storage.5.3",
            "hammer.storage.5.5",
            "hammer.storage.5.6",
            "hammer.storage.5.9"
        ],
        "keywords": [
            "homestead",
            "retrieve hammer"
        ],
        "next": null,
        "position": "739:7"
    },
    "hammer.storage.5.3": {
        "type": "text",
        "text": "You r",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "739:7"
    },
    "hammer.storage.5.4": {
        "type": "text",
        "text": "R",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "739:7"
    },
    "hammer.storage.5.5": {
        "type": "text",
        "text": "etrieve the hammer from your pumpkin hut.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "739:7"
    },
    "hammer.storage.5.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hammer"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hammer"
        ],
        "next": "hammer.storage.5.7",
        "position": "739:7"
    },
    "hammer.storage.5.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "stored.hammer"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "stored.hammer"
        ],
        "next": "hammer.storage.5.8",
        "position": "739:7"
    },
    "hammer.storage.5.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "739:7"
    },
    "hammer.storage.5.9": {
        "type": "goto",
        "next": "return",
        "position": "739:7"
    },
    "airplane.storage": {
        "type": "args",
        "locals": [],
        "next": "airplane.storage.1",
        "position": "742:3"
    },
    "airplane.storage.1": {
        "type": "jump",
        "condition": [
            "<>",
            [
                "get",
                "at"
            ],
            [
                "get",
                "hills"
            ]
        ],
        "branch": null,
        "next": "airplane.storage.2",
        "position": "743:5"
    },
    "airplane.storage.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "airplane"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "airplane.storage.3",
        "next": "airplane.storage.2.1",
        "position": "746:7"
    },
    "airplane.storage.2.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "stored.airplane"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "airplane.storage.3",
        "next": "airplane.storage.2.2",
        "position": "746:7"
    },
    "airplane.storage.2.2": {
        "type": "opt",
        "question": [
            "airplane.storage.2.4",
            "airplane.storage.2.5"
        ],
        "answer": [
            "airplane.storage.2.3",
            "airplane.storage.2.5",
            "airplane.storage.2.8",
            "airplane.storage.2.11"
        ],
        "keywords": [
            "scene",
            "store airplane"
        ],
        "next": "airplane.storage.3",
        "position": "746:7"
    },
    "airplane.storage.2.3": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "746:7"
    },
    "airplane.storage.2.4": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "746:7"
    },
    "airplane.storage.2.5": {
        "type": "text",
        "text": "tore",
        "lift": "",
        "drop": " ",
        "next": "airplane.storage.2.6",
        "position": "746:7"
    },
    "airplane.storage.2.6": {
        "type": "switch",
        "expression": [
            "get",
            "airplane"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "airplane.storage.2.6.1",
            "airplane.storage.2.6.2",
            "airplane.storage.2.6.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "746:7"
    },
    "airplane.storage.2.6.1": {
        "type": "goto",
        "next": "airplane.storage.2.7",
        "position": "746:7"
    },
    "airplane.storage.2.6.2": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "airplane.storage.2.7",
        "position": "746:7"
    },
    "airplane.storage.2.6.3": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "airplane.storage.2.7",
        "position": "746:7"
    },
    "airplane.storage.2.7": {
        "type": "text",
        "text": "airplane in your pumpkin hut.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "746:7"
    },
    "airplane.storage.2.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "airplane"
        ],
        "next": "airplane.storage.2.9",
        "position": "746:7"
    },
    "airplane.storage.2.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "stored.airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "stored.airplane"
        ],
        "next": "airplane.storage.2.10",
        "position": "746:7"
    },
    "airplane.storage.2.10": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "746:7"
    },
    "airplane.storage.2.11": {
        "type": "goto",
        "next": "return",
        "position": "746:7"
    },
    "airplane.storage.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "stored.airplane"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "airplane.storage.3.1",
        "position": "749:7"
    },
    "airplane.storage.3.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hand"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "airplane.storage.3.2",
        "position": "749:7"
    },
    "airplane.storage.3.2": {
        "type": "opt",
        "question": [
            "airplane.storage.3.4",
            "airplane.storage.3.5"
        ],
        "answer": [
            "airplane.storage.3.3",
            "airplane.storage.3.5",
            "airplane.storage.3.6",
            "airplane.storage.3.9"
        ],
        "keywords": [
            "homestead",
            "retrieve airplane"
        ],
        "next": null,
        "position": "749:7"
    },
    "airplane.storage.3.3": {
        "type": "text",
        "text": "You r",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "749:7"
    },
    "airplane.storage.3.4": {
        "type": "text",
        "text": "R",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "749:7"
    },
    "airplane.storage.3.5": {
        "type": "text",
        "text": "etrieve the airplane from your pumpkin hut.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "749:7"
    },
    "airplane.storage.3.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "airplane"
        ],
        "next": "airplane.storage.3.7",
        "position": "749:7"
    },
    "airplane.storage.3.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "stored.airplane"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "stored.airplane"
        ],
        "next": "airplane.storage.3.8",
        "position": "749:7"
    },
    "airplane.storage.3.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "749:7"
    },
    "airplane.storage.3.9": {
        "type": "goto",
        "next": "return",
        "position": "749:7"
    },
    "hammer": {
        "type": "text",
        "text": "You have a hammer.",
        "lift": " ",
        "drop": " ",
        "next": "hammer.1",
        "position": "754:5"
    },
    "hammer.1": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "and",
                    [
                        "not",
                        [
                            "get",
                            "airplane"
                        ]
                    ],
                    [
                        "not",
                        [
                            "get",
                            "paper"
                        ]
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "soaked.reed"
                    ]
                ]
            ]
        ],
        "branch": "hammer.choice",
        "next": "hammer.2",
        "position": "754:5"
    },
    "hammer.2": {
        "type": "text",
        "text": "A hammer might be better than a rock for making pulp for paper. You’ll after all need to make a paper airplane to fly away from this island.",
        "lift": " ",
        "drop": " ",
        "next": "hammer.choice",
        "position": "758:3"
    },
    "hammer.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "hammer"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hammer.choice.1",
        "next": "hammer.choice.0.1",
        "position": "761:5"
    },
    "hammer.choice.0.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "soaked.reed"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hammer.choice.1",
        "next": "hammer.choice.0.2",
        "position": "761:5"
    },
    "hammer.choice.0.2": {
        "type": "opt",
        "question": [
            "hammer.choice.0.4",
            "hammer.choice.0.5",
            "hammer.choice.0.6"
        ],
        "answer": [
            "hammer.choice.0.3",
            "hammer.choice.0.5",
            "hammer.choice.0.7",
            "hammer.choice.0.9"
        ],
        "keywords": [
            "mash reed",
            "soaked-reed"
        ],
        "next": "hammer.choice.1",
        "position": "761:5"
    },
    "hammer.choice.0.3": {
        "type": "text",
        "text": "You m",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "761:5"
    },
    "hammer.choice.0.4": {
        "type": "text",
        "text": "M",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "761:5"
    },
    "hammer.choice.0.5": {
        "type": "text",
        "text": "ash reeds with hammer",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "761:5"
    },
    "hammer.choice.0.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "761:5"
    },
    "hammer.choice.0.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "soaked.reed"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "soaked.reed"
        ],
        "next": "hammer.choice.0.8",
        "position": "761:5"
    },
    "hammer.choice.0.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "paper"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "paper"
        ],
        "next": null,
        "position": "761:5"
    },
    "hammer.choice.0.9": {
        "type": "text",
        "text": ", creating a mushy pulp from the reeds’ pith. You leave these to dry and they become coarse paper.",
        "lift": "",
        "drop": " ",
        "next": "return",
        "position": "764:3"
    },
    "hammer.choice.1": {
        "type": "call",
        "branch": "hammer.storage",
        "args": [],
        "next": "hammer.choice.2",
        "position": "764:3"
    },
    "hammer.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "hammer"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hammer.choice.3",
        "next": "hammer.choice.2.1",
        "position": "769:5"
    },
    "hammer.choice.2.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "<>",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "hills"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "hammer.choice.3",
        "next": "hammer.choice.2.2",
        "position": "769:5"
    },
    "hammer.choice.2.2": {
        "type": "opt",
        "question": [
            "hammer.choice.2.4",
            "hammer.choice.2.5",
            "hammer.choice.2.6"
        ],
        "answer": [
            "hammer.choice.2.3",
            "hammer.choice.2.5",
            "hammer.choice.2.7",
            "hammer.choice.2.9"
        ],
        "keywords": [
            "drop hammer",
            "scene"
        ],
        "next": "hammer.choice.3",
        "position": "769:5"
    },
    "hammer.choice.2.3": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "769:5"
    },
    "hammer.choice.2.4": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "769:5"
    },
    "hammer.choice.2.5": {
        "type": "text",
        "text": "rop the hammer",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "769:5"
    },
    "hammer.choice.2.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "769:5"
    },
    "hammer.choice.2.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "hammer"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hammer"
        ],
        "next": "hammer.choice.2.8",
        "position": "769:5"
    },
    "hammer.choice.2.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "769:5"
    },
    "hammer.choice.2.9": {
        "type": "text",
        "text": ", (in the quite literal sense) losing it",
        "lift": "",
        "drop": " ",
        "next": "hammer.choice.2.10",
        "position": "770:5"
    },
    "hammer.choice.2.10": {
        "type": "switch",
        "expression": [
            "get",
            "at"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "hammer.choice.2.10.1",
            "hammer.choice.2.10.2",
            "hammer.choice.2.10.3",
            "hammer.choice.2.10.4"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "771:5"
    },
    "hammer.choice.2.10.1": {
        "type": "text",
        "text": "in the grass.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "772:5"
    },
    "hammer.choice.2.10.2": {
        "type": "text",
        "text": "in a thicket of bamboo.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "773:5"
    },
    "hammer.choice.2.10.3": {
        "type": "text",
        "text": "in the sea.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "774:5"
    },
    "hammer.choice.2.10.4": {
        "type": "text",
        "text": "in the caldera.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "775:5"
    },
    "hammer.choice.3": {
        "type": "opt",
        "question": [
            "hammer.choice.3.2",
            "hammer.choice.3.3"
        ],
        "answer": [
            "hammer.choice.3.1",
            "hammer.choice.3.3",
            "hammer.choice.3.4"
        ],
        "keywords": [],
        "next": "hammer.choice.4",
        "position": "776:5"
    },
    "hammer.choice.3.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "776:5"
    },
    "hammer.choice.3.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "776:5"
    },
    "hammer.choice.3.3": {
        "type": "text",
        "text": "eep the hammer.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "776:5"
    },
    "hammer.choice.3.4": {
        "type": "goto",
        "next": "return",
        "position": "777:3"
    },
    "hammer.choice.4": {
        "type": "ask",
        "position": "777:3"
    },
    "rock": {
        "type": "text",
        "text": "You have",
        "lift": " ",
        "drop": " ",
        "next": "rock.1",
        "position": "781:3"
    },
    "rock.1": {
        "type": "switch",
        "expression": [
            "get",
            "rock"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "rock.1.1",
            "rock.1.2",
            "rock.1.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "781:3"
    },
    "rock.1.1": {
        "type": "goto",
        "next": "rock.2",
        "position": "781:3"
    },
    "rock.1.2": {
        "type": "text",
        "text": "a rock",
        "lift": "",
        "drop": "",
        "next": "rock.2",
        "position": "781:3"
    },
    "rock.1.3": {
        "type": "text",
        "text": "load of stones",
        "lift": "",
        "drop": "",
        "next": "rock.2",
        "position": "781:3"
    },
    "rock.2": {
        "type": "text",
        "text": "held in",
        "lift": " ",
        "drop": " ",
        "next": "rock.3",
        "position": "781:3"
    },
    "rock.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "rock"
            ]
        ],
        "next": "rock.4",
        "position": "781:3"
    },
    "rock.4": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "rock.5",
        "position": "782:3"
    },
    "rock.5": {
        "type": "switch",
        "expression": [
            "get",
            "rock"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "rock.5.1",
            "rock.5.2",
            "rock.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "782:3"
    },
    "rock.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "rock.6",
        "position": "782:3"
    },
    "rock.5.2": {
        "type": "goto",
        "next": "rock.6",
        "position": "782:3"
    },
    "rock.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "rock.6",
        "position": "782:3"
    },
    "rock.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "rock.7",
        "position": "783:5"
    },
    "rock.7": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "and",
                    [
                        "get",
                        "soaked.reed"
                    ],
                    [
                        "not",
                        [
                            "get",
                            "bamboo"
                        ]
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "hammer"
                    ]
                ]
            ]
        ],
        "branch": "rock.9",
        "next": "rock.8",
        "position": "783:5"
    },
    "rock.8": {
        "type": "text",
        "text": "You might be able to use these soaked reeds to bind the rock to something and make a hammer.",
        "lift": " ",
        "drop": " ",
        "next": "rock.9",
        "position": "786:3"
    },
    "rock.9": {
        "type": "call",
        "branch": "tap.formula",
        "args": [],
        "next": "rock.10",
        "position": "786:3"
    },
    "rock.10": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "hammer"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "rock.11",
        "next": "rock.10.1",
        "position": "789:5"
    },
    "rock.10.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "rock"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "rock.11",
        "next": "rock.10.2",
        "position": "789:5"
    },
    "rock.10.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "soaked.reed"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "rock.11",
        "next": "rock.10.3",
        "position": "789:5"
    },
    "rock.10.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "bamboo"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "rock.11",
        "next": "rock.10.4",
        "position": "789:5"
    },
    "rock.10.4": {
        "type": "opt",
        "question": [
            "rock.10.6",
            "rock.10.7",
            "rock.10.8"
        ],
        "answer": [
            "rock.10.5",
            "rock.10.7",
            "rock.10.9",
            "rock.10.14"
        ],
        "keywords": [
            "bamboo",
            "make hammer",
            "soaked-reed"
        ],
        "next": "rock.11",
        "position": "789:5"
    },
    "rock.10.5": {
        "type": "text",
        "text": "You b",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "789:5"
    },
    "rock.10.6": {
        "type": "text",
        "text": "B",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "789:5"
    },
    "rock.10.7": {
        "type": "text",
        "text": "ind the rock to the bamboo with the reed",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "789:5"
    },
    "rock.10.8": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "789:5"
    },
    "rock.10.9": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "rock"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "rock"
        ],
        "next": "rock.10.10",
        "position": "789:5"
    },
    "rock.10.10": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "soaked.reed"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "soaked.reed"
        ],
        "next": "rock.10.11",
        "position": "789:5"
    },
    "rock.10.11": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "bamboo"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "bamboo"
        ],
        "next": "rock.10.12",
        "position": "789:5"
    },
    "rock.10.12": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hammer"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hammer"
        ],
        "next": "rock.10.13",
        "position": "789:5"
    },
    "rock.10.13": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "789:5"
    },
    "rock.10.14": {
        "type": "text",
        "text": ", constructing a sturdy hammer. Perhaps you can use this to mash things to pulp.",
        "lift": "",
        "drop": " ",
        "next": "return",
        "position": "25785:5"
    },
    "rock.11": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "rock"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "rock.12",
        "next": "rock.11.1",
        "position": "796:5"
    },
    "rock.11.1": {
        "type": "opt",
        "question": [
            "rock.11.3",
            "rock.11.4"
        ],
        "answer": [
            "rock.11.2",
            "rock.11.4",
            "rock.11.7",
            "rock.11.9"
        ],
        "keywords": [
            "drop rock",
            "scene"
        ],
        "next": "rock.12",
        "position": "796:5"
    },
    "rock.11.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "796:5"
    },
    "rock.11.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "796:5"
    },
    "rock.11.4": {
        "type": "text",
        "text": "rop",
        "lift": "",
        "drop": " ",
        "next": "rock.11.5",
        "position": "796:5"
    },
    "rock.11.5": {
        "type": "switch",
        "expression": [
            "get",
            "rock"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "rock.11.5.1",
            "rock.11.5.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "796:5"
    },
    "rock.11.5.1": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "rock.11.6",
        "position": "796:5"
    },
    "rock.11.5.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "rock.11.6",
        "position": "796:5"
    },
    "rock.11.6": {
        "type": "text",
        "text": "rock.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "796:5"
    },
    "rock.11.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "rock"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "rock"
        ],
        "next": "rock.11.8",
        "position": "796:5"
    },
    "rock.11.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "796:5"
    },
    "rock.11.9": {
        "type": "goto",
        "next": "return",
        "position": "797:5"
    },
    "rock.12": {
        "type": "opt",
        "question": [
            "rock.12.2",
            "rock.12.3"
        ],
        "answer": [
            "rock.12.1",
            "rock.12.3",
            "rock.12.6"
        ],
        "keywords": [
            "",
            "keep",
            "rock"
        ],
        "next": "rock.13",
        "position": "798:5"
    },
    "rock.12.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "798:5"
    },
    "rock.12.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "798:5"
    },
    "rock.12.3": {
        "type": "text",
        "text": "eep the rock",
        "lift": "",
        "drop": "",
        "next": "rock.12.4",
        "position": "798:5"
    },
    "rock.12.4": {
        "type": "switch",
        "expression": [
            "get",
            "rock"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "rock.12.4.1",
            "rock.12.4.2",
            "rock.12.4.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "798:5"
    },
    "rock.12.4.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "rock.12.5",
        "position": "798:5"
    },
    "rock.12.4.2": {
        "type": "goto",
        "next": "rock.12.5",
        "position": "798:5"
    },
    "rock.12.4.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "rock.12.5",
        "position": "798:5"
    },
    "rock.12.5": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "798:5"
    },
    "rock.12.6": {
        "type": "goto",
        "next": "return",
        "position": "799:3"
    },
    "rock.13": {
        "type": "ask",
        "position": "799:3"
    },
    "rubber": {
        "type": "text",
        "text": "You have a mass of rubber held in",
        "lift": " ",
        "drop": " ",
        "next": "rubber.1",
        "position": "803:3"
    },
    "rubber.1": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "rubber"
            ]
        ],
        "next": "rubber.2",
        "position": "803:3"
    },
    "rubber.2": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "rubber.3",
        "position": "803:3"
    },
    "rubber.3": {
        "type": "switch",
        "expression": [
            "get",
            "rubber"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "rubber.3.1",
            "rubber.3.2",
            "rubber.3.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "803:3"
    },
    "rubber.3.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "rubber.4",
        "position": "803:3"
    },
    "rubber.3.2": {
        "type": "goto",
        "next": "rubber.4",
        "position": "803:3"
    },
    "rubber.3.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "rubber.4",
        "position": "803:3"
    },
    "rubber.4": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "rubber.5",
        "position": "804:3"
    },
    "rubber.5": {
        "type": "call",
        "branch": "ballista.formula",
        "args": [],
        "next": "rubber.6",
        "position": "804:3"
    },
    "rubber.6": {
        "type": "opt",
        "question": [
            "rubber.6.2",
            "rubber.6.3",
            "rubber.6.4"
        ],
        "answer": [
            "rubber.6.1",
            "rubber.6.3",
            "rubber.6.5"
        ],
        "keywords": [
            "drop rubber",
            "scene"
        ],
        "next": "rubber.7",
        "position": "806:5"
    },
    "rubber.6.1": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "806:5"
    },
    "rubber.6.2": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "806:5"
    },
    "rubber.6.3": {
        "type": "text",
        "text": "rop the mass of rubber",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "806:5"
    },
    "rubber.6.4": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "806:5"
    },
    "rubber.6.5": {
        "type": "text",
        "text": ", freeing",
        "lift": "",
        "drop": " ",
        "next": "rubber.6.6",
        "position": "807:5"
    },
    "rubber.6.6": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "rubber"
            ]
        ],
        "next": "rubber.6.7",
        "position": "807:5"
    },
    "rubber.6.7": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "rubber.6.8",
        "position": "807:5"
    },
    "rubber.6.8": {
        "type": "switch",
        "expression": [
            "get",
            "rubber"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "rubber.6.8.1",
            "rubber.6.8.2",
            "rubber.6.8.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "807:5"
    },
    "rubber.6.8.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "rubber.6.9",
        "position": "807:5"
    },
    "rubber.6.8.2": {
        "type": "goto",
        "next": "rubber.6.9",
        "position": "807:5"
    },
    "rubber.6.8.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "rubber.6.9",
        "position": "807:5"
    },
    "rubber.6.9": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "rubber.6.10",
        "position": "808:5"
    },
    "rubber.6.10": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "get",
                "rubber"
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": "rubber.6.11",
        "position": "808:5"
    },
    "rubber.6.11": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "rubber"
        ],
        "next": "return",
        "position": "808:5"
    },
    "rubber.7": {
        "type": "opt",
        "question": [
            "rubber.7.2",
            "rubber.7.3"
        ],
        "answer": [
            "rubber.7.1",
            "rubber.7.3",
            "rubber.7.4"
        ],
        "keywords": [
            "",
            "keep",
            "rubber"
        ],
        "next": "rubber.8",
        "position": "810:5"
    },
    "rubber.7.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "810:5"
    },
    "rubber.7.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "810:5"
    },
    "rubber.7.3": {
        "type": "text",
        "text": "eep the rubber.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "810:5"
    },
    "rubber.7.4": {
        "type": "goto",
        "next": "return",
        "position": "810:5"
    },
    "rubber.8": {
        "type": "ask",
        "position": "812:3"
    },
    "ballista.formula": {
        "type": "args",
        "locals": [],
        "next": "ballista.formula.1",
        "position": "814:3"
    },
    "ballista.formula.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "not",
                [
                    "get",
                    "ballista"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "ballista.formula.1.1",
        "position": "817:5"
    },
    "ballista.formula.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "bamboo"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "ballista.formula.1.2",
        "position": "817:5"
    },
    "ballista.formula.1.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "rubber"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "ballista.formula.1.3",
        "position": "817:5"
    },
    "ballista.formula.1.3": {
        "type": "opt",
        "question": [
            "ballista.formula.1.5",
            "ballista.formula.1.6"
        ],
        "answer": [
            "ballista.formula.1.4",
            "ballista.formula.1.6",
            "ballista.formula.1.7",
            "ballista.formula.1.10"
        ],
        "keywords": [
            "make ballista"
        ],
        "next": null,
        "position": "817:5"
    },
    "ballista.formula.1.4": {
        "type": "text",
        "text": "You a",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "817:5"
    },
    "ballista.formula.1.5": {
        "type": "text",
        "text": "A",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "817:5"
    },
    "ballista.formula.1.6": {
        "type": "text",
        "text": "ssemble a sort of giant slingshot with the rubber and a forked pair of bamboo shoots.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "818:5"
    },
    "ballista.formula.1.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "bamboo"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "bamboo"
        ],
        "next": "ballista.formula.1.8",
        "position": "818:5"
    },
    "ballista.formula.1.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "rubber"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "rubber"
        ],
        "next": "ballista.formula.1.9",
        "position": "818:5"
    },
    "ballista.formula.1.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "ballista"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "ballista"
        ],
        "next": null,
        "position": "818:5"
    },
    "ballista.formula.1.10": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "shrinking.potion"
            ]
        ],
        "branch": "return",
        "next": "ballista",
        "position": "819:7"
    },
    "ballista": {
        "type": "text",
        "text": "You have a giant slingshot, held in two hands.",
        "lift": " ",
        "drop": " ",
        "next": "ballista.1",
        "position": "824:5"
    },
    "ballista.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "rock"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "ballista.2",
        "next": "ballista.1.1",
        "position": "825:5"
    },
    "ballista.1.1": {
        "type": "opt",
        "question": [
            "ballista.1.3",
            "ballista.1.4",
            "ballista.1.5"
        ],
        "answer": [
            "ballista.1.2",
            "ballista.1.4",
            "ballista.1.6",
            "ballista.1.8"
        ],
        "keywords": [
            "throw rock with ballista"
        ],
        "next": "ballista.2",
        "position": "825:5"
    },
    "ballista.1.2": {
        "type": "text",
        "text": "You t",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "825:5"
    },
    "ballista.1.3": {
        "type": "text",
        "text": "T",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "825:5"
    },
    "ballista.1.4": {
        "type": "text",
        "text": "hrow a rock with the giant slingshot",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "825:5"
    },
    "ballista.1.5": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "825:5"
    },
    "ballista.1.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "rock"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "rock"
        ],
        "next": "ballista.1.7",
        "position": "825:5"
    },
    "ballista.1.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "825:5"
    },
    "ballista.1.8": {
        "type": "text",
        "text": ", sending it sailing far out to sea. You don’t even see it splash. “It seems a waste of a stone,” the",
        "lift": "",
        "drop": " ",
        "next": "ballista.1.9",
        "position": "828:5"
    },
    "ballista.1.9": {
        "type": "switch",
        "expression": [
            "get",
            "ballista.1.9"
        ],
        "variable": "ballista.1.9",
        "value": 0,
        "mode": "rand",
        "branches": [
            "ballista.1.9.1",
            "ballista.1.9.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "828:5"
    },
    "ballista.1.9.1": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "ballista.1.10",
        "position": "828:5"
    },
    "ballista.1.9.2": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "ballista.1.10",
        "position": "828:5"
    },
    "ballista.1.10": {
        "type": "text",
        "text": "says, “but it freed a hand.”",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "830:5"
    },
    "ballista.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "ballista"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "ballista.3",
        "next": "ballista.2.1",
        "position": "832:5"
    },
    "ballista.2.1": {
        "type": "opt",
        "question": [
            "ballista.2.3",
            "ballista.2.4"
        ],
        "answer": [
            "ballista.2.2",
            "ballista.2.4",
            "ballista.2.5",
            "ballista.2.7"
        ],
        "keywords": [
            "drop ballista"
        ],
        "next": "ballista.3",
        "position": "832:5"
    },
    "ballista.2.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "832:5"
    },
    "ballista.2.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "832:5"
    },
    "ballista.2.4": {
        "type": "text",
        "text": "estroy the giant slingshot.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "832:5"
    },
    "ballista.2.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "ballista"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "ballista"
        ],
        "next": "ballista.2.6",
        "position": "832:5"
    },
    "ballista.2.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "832:5"
    },
    "ballista.2.7": {
        "type": "goto",
        "next": "return",
        "position": "833:5"
    },
    "ballista.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "hills"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "ballista.4",
        "next": "ballista.3.1",
        "position": "835:5"
    },
    "ballista.3.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "ballista"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "ballista.4",
        "next": "ballista.3.2",
        "position": "835:5"
    },
    "ballista.3.2": {
        "type": "opt",
        "question": [
            "ballista.3.4",
            "ballista.3.5"
        ],
        "answer": [
            "ballista.3.3",
            "ballista.3.5",
            "ballista.3.6",
            "ballista.3.9"
        ],
        "keywords": [
            "put ballista",
            "scene"
        ],
        "next": "ballista.4",
        "position": "835:5"
    },
    "ballista.3.3": {
        "type": "text",
        "text": "You i",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "835:5"
    },
    "ballista.3.4": {
        "type": "text",
        "text": "I",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "835:5"
    },
    "ballista.3.5": {
        "type": "text",
        "text": "nstall the giant slingshot atop a rolling hill.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "835:5"
    },
    "ballista.3.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "ballista"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "ballista"
        ],
        "next": "ballista.3.7",
        "position": "835:5"
    },
    "ballista.3.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "placed.ballista"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "placed.ballista"
        ],
        "next": "ballista.3.8",
        "position": "835:5"
    },
    "ballista.3.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "835:5"
    },
    "ballista.3.9": {
        "type": "text",
        "text": "You aim it toward home.",
        "lift": " ",
        "drop": " ",
        "next": "ballista.3.10",
        "position": "837:7"
    },
    "ballista.3.10": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "not",
                    [
                        "get",
                        "airplane"
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "giant.airplane"
                    ]
                ]
            ]
        ],
        "branch": "ballista.3.12",
        "next": "ballista.3.11",
        "position": "837:7"
    },
    "ballista.3.11": {
        "type": "text",
        "text": "Now you need something to launch.",
        "lift": " ",
        "drop": " ",
        "next": "ballista.3.12",
        "position": "839:7"
    },
    "ballista.3.12": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "airplane"
            ]
        ],
        "branch": "hills.choice",
        "next": "ballista.3.13",
        "position": "839:7"
    },
    "ballista.3.13": {
        "type": "text",
        "text": "You could send an airplane really far with this, if the airplane were big enough for it.",
        "lift": " ",
        "drop": " ",
        "next": "hills.choice",
        "position": "841:5"
    },
    "ballista.4": {
        "type": "opt",
        "question": [
            "ballista.4.2",
            "ballista.4.3"
        ],
        "answer": [
            "ballista.4.1",
            "ballista.4.3",
            "ballista.4.4"
        ],
        "keywords": [
            "",
            "ballista",
            "keep"
        ],
        "next": "ballista.5",
        "position": "843:5"
    },
    "ballista.4.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "843:5"
    },
    "ballista.4.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "843:5"
    },
    "ballista.4.3": {
        "type": "text",
        "text": "eep the giant slingshot.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "843:5"
    },
    "ballista.4.4": {
        "type": "goto",
        "next": "return",
        "position": "844:3"
    },
    "ballista.5": {
        "type": "ask",
        "position": "844:3"
    },
    "vial.formula": {
        "type": "args",
        "locals": [],
        "next": "vial.formula.1",
        "position": "847:3"
    },
    "vial.formula.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "mountain"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "vial.formula.1.1",
        "position": "850:5"
    },
    "vial.formula.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "or",
                [
                    "get",
                    "reed"
                ],
                [
                    "get",
                    "bamboo"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "vial.formula.1.2",
        "position": "850:5"
    },
    "vial.formula.1.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "sand.pumpkin"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "vial.formula.1.3",
        "position": "850:5"
    },
    "vial.formula.1.3": {
        "type": "opt",
        "question": [
            "vial.formula.1.5",
            "vial.formula.1.6"
        ],
        "answer": [
            "vial.formula.1.4",
            "vial.formula.1.6",
            "vial.formula.1.7",
            "vial.formula.1.9"
        ],
        "keywords": [
            "blow glass",
            "make vials",
            "scene"
        ],
        "next": null,
        "position": "850:5"
    },
    "vial.formula.1.4": {
        "type": "text",
        "text": "You b",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "850:5"
    },
    "vial.formula.1.5": {
        "type": "text",
        "text": "B",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "850:5"
    },
    "vial.formula.1.6": {
        "type": "text",
        "text": "low a pair of of glass vials from molten sand in the cinder cone.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "850:5"
    },
    "vial.formula.1.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "sand.pumpkin"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "sand.pumpkin"
        ],
        "next": "vial.formula.1.8",
        "position": "850:5"
    },
    "vial.formula.1.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "vial"
            ],
            [
                "val",
                2
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": null,
        "position": "850:5"
    },
    "vial.formula.1.9": {
        "type": "goto",
        "next": "return",
        "position": "850:5"
    },
    "vial": {
        "type": "text",
        "text": "You have",
        "lift": " ",
        "drop": " ",
        "next": "vial.1",
        "position": "854:3"
    },
    "vial.1": {
        "type": "switch",
        "expression": [
            "get",
            "vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "vial.1.1",
            "vial.1.2",
            "vial.1.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "854:3"
    },
    "vial.1.1": {
        "type": "goto",
        "next": "vial.2",
        "position": "854:3"
    },
    "vial.1.2": {
        "type": "text",
        "text": "a vial",
        "lift": "",
        "drop": "",
        "next": "vial.2",
        "position": "854:3"
    },
    "vial.1.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "vial"
            ]
        ],
        "next": "vial.1.3.1",
        "position": "854:3"
    },
    "vial.1.3.1": {
        "type": "text",
        "text": "vials",
        "lift": " ",
        "drop": "",
        "next": "vial.2",
        "position": "854:3"
    },
    "vial.2": {
        "type": "text",
        "text": "held in",
        "lift": " ",
        "drop": " ",
        "next": "vial.3",
        "position": "854:3"
    },
    "vial.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "vial"
            ]
        ],
        "next": "vial.4",
        "position": "854:3"
    },
    "vial.4": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "vial.5",
        "position": "855:3"
    },
    "vial.5": {
        "type": "switch",
        "expression": [
            "get",
            "vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "vial.5.1",
            "vial.5.2",
            "vial.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "855:3"
    },
    "vial.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "vial.6",
        "position": "855:3"
    },
    "vial.5.2": {
        "type": "goto",
        "next": "vial.6",
        "position": "855:3"
    },
    "vial.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "vial.6",
        "position": "855:3"
    },
    "vial.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "vial.choice",
        "position": "856:3"
    },
    "vial.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "vial"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "vial.choice.1",
        "next": "vial.choice.0.1",
        "position": "858:5"
    },
    "vial.choice.0.1": {
        "type": "opt",
        "question": [
            "vial.choice.0.3",
            "vial.choice.0.4",
            "vial.choice.0.7"
        ],
        "answer": [
            "vial.choice.0.2",
            "vial.choice.0.4",
            "vial.choice.0.8",
            "vial.choice.0.10"
        ],
        "keywords": [
            "drop vial",
            "scene"
        ],
        "next": "vial.choice.1",
        "position": "858:5"
    },
    "vial.choice.0.2": {
        "type": "text",
        "text": "You d",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "858:5"
    },
    "vial.choice.0.3": {
        "type": "text",
        "text": "D",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "858:5"
    },
    "vial.choice.0.4": {
        "type": "text",
        "text": "rop",
        "lift": "",
        "drop": " ",
        "next": "vial.choice.0.5",
        "position": "858:5"
    },
    "vial.choice.0.5": {
        "type": "switch",
        "expression": [
            "get",
            "vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "vial.choice.0.5.1",
            "vial.choice.0.5.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "858:5"
    },
    "vial.choice.0.5.1": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "vial.choice.0.6",
        "position": "858:5"
    },
    "vial.choice.0.5.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "vial.choice.0.6",
        "position": "858:5"
    },
    "vial.choice.0.6": {
        "type": "text",
        "text": "glass vial",
        "lift": " ",
        "drop": "",
        "next": null,
        "position": "858:5"
    },
    "vial.choice.0.7": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "858:5"
    },
    "vial.choice.0.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": "vial.choice.0.9",
        "position": "858:5"
    },
    "vial.choice.0.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "858:5"
    },
    "vial.choice.0.10": {
        "type": "text",
        "text": "and it shatters into sharp bits.",
        "lift": " ",
        "drop": " ",
        "next": "vial.choice.0.11",
        "position": "860:7"
    },
    "vial.choice.0.11": {
        "type": "jump",
        "condition": [
            "not",
            [
                "get",
                "vial"
            ]
        ],
        "branch": "return",
        "next": "vial.choice.0.12",
        "position": "860:7"
    },
    "vial.choice.0.12": {
        "type": "text",
        "text": "You have",
        "lift": " ",
        "drop": " ",
        "next": "vial.choice.0.13",
        "position": "860:7"
    },
    "vial.choice.0.13": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "vial"
            ]
        ],
        "next": "vial.choice.0.14",
        "position": "860:7"
    },
    "vial.choice.0.14": {
        "type": "text",
        "text": "remaining vial",
        "lift": " ",
        "drop": "",
        "next": "vial.choice.0.15",
        "position": "860:7"
    },
    "vial.choice.0.15": {
        "type": "switch",
        "expression": [
            "get",
            "vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "vial.choice.0.15.1",
            "vial.choice.0.15.2",
            "vial.choice.0.15.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "860:7"
    },
    "vial.choice.0.15.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "vial.choice.0.16",
        "position": "860:7"
    },
    "vial.choice.0.15.2": {
        "type": "goto",
        "next": "vial.choice.0.16",
        "position": "860:7"
    },
    "vial.choice.0.15.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "vial.choice.0.16",
        "position": "860:7"
    },
    "vial.choice.0.16": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "return",
        "position": "861:5"
    },
    "vial.choice.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "beach"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "vial.choice.2",
        "next": "vial.choice.1.1",
        "position": "863:5"
    },
    "vial.choice.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "vial"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "vial.choice.2",
        "next": "vial.choice.1.2",
        "position": "863:5"
    },
    "vial.choice.1.2": {
        "type": "opt",
        "question": [
            "vial.choice.1.4",
            "vial.choice.1.5"
        ],
        "answer": [
            "vial.choice.1.3",
            "vial.choice.1.5",
            "vial.choice.1.8",
            "vial.choice.1.10"
        ],
        "keywords": [
            "fill vial with brine",
            "sea"
        ],
        "next": "vial.choice.2",
        "position": "863:5"
    },
    "vial.choice.1.3": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "863:5"
    },
    "vial.choice.1.4": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "863:5"
    },
    "vial.choice.1.5": {
        "type": "text",
        "text": "ill",
        "lift": "",
        "drop": " ",
        "next": "vial.choice.1.6",
        "position": "863:5"
    },
    "vial.choice.1.6": {
        "type": "switch",
        "expression": [
            "get",
            "vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "vial.choice.1.6.1",
            "vial.choice.1.6.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "863:5"
    },
    "vial.choice.1.6.1": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "vial.choice.1.7",
        "position": "863:5"
    },
    "vial.choice.1.6.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "vial.choice.1.7",
        "position": "863:5"
    },
    "vial.choice.1.7": {
        "type": "text",
        "text": "vial with brine from the sea.",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "863:5"
    },
    "vial.choice.1.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": "vial.choice.1.9",
        "position": "863:5"
    },
    "vial.choice.1.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "brine.vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "brine.vial"
        ],
        "next": null,
        "position": "863:5"
    },
    "vial.choice.1.10": {
        "type": "goto",
        "next": "return",
        "position": "864:5"
    },
    "vial.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                "==",
                [
                    "get",
                    "at"
                ],
                [
                    "get",
                    "hills"
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "vial.choice.3",
        "next": "vial.choice.2.1",
        "position": "866:5"
    },
    "vial.choice.2.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "vial"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "vial.choice.3",
        "next": "vial.choice.2.2",
        "position": "866:5"
    },
    "vial.choice.2.2": {
        "type": "opt",
        "question": [
            "vial.choice.2.4",
            "vial.choice.2.5"
        ],
        "answer": [
            "vial.choice.2.3",
            "vial.choice.2.5",
            "vial.choice.2.8",
            "vial.choice.2.10"
        ],
        "keywords": [
            "fill vial with freshwater",
            "stream"
        ],
        "next": "vial.choice.3",
        "position": "866:5"
    },
    "vial.choice.2.3": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "866:5"
    },
    "vial.choice.2.4": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "866:5"
    },
    "vial.choice.2.5": {
        "type": "text",
        "text": "ill",
        "lift": "",
        "drop": " ",
        "next": "vial.choice.2.6",
        "position": "866:5"
    },
    "vial.choice.2.6": {
        "type": "switch",
        "expression": [
            "get",
            "vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "vial.choice.2.6.1",
            "vial.choice.2.6.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "866:5"
    },
    "vial.choice.2.6.1": {
        "type": "text",
        "text": "the",
        "lift": "",
        "drop": "",
        "next": "vial.choice.2.7",
        "position": "866:5"
    },
    "vial.choice.2.6.2": {
        "type": "text",
        "text": "a",
        "lift": "",
        "drop": "",
        "next": "vial.choice.2.7",
        "position": "866:5"
    },
    "vial.choice.2.7": {
        "type": "text",
        "text": "vial with fresh water from the river.",
        "lift": " ",
        "drop": "",
        "next": null,
        "position": "866:5"
    },
    "vial.choice.2.8": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": "vial.choice.2.9",
        "position": "866:5"
    },
    "vial.choice.2.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "freshwater.vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "freshwater.vial"
        ],
        "next": null,
        "position": "866:5"
    },
    "vial.choice.2.10": {
        "type": "goto",
        "next": "return",
        "position": "867:5"
    },
    "vial.choice.3": {
        "type": "opt",
        "question": [
            "vial.choice.3.2",
            "vial.choice.3.3"
        ],
        "answer": [
            "vial.choice.3.1",
            "vial.choice.3.3",
            "vial.choice.3.6"
        ],
        "keywords": [
            "",
            "keep",
            "vial"
        ],
        "next": "vial.choice.4",
        "position": "867:5"
    },
    "vial.choice.3.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "867:5"
    },
    "vial.choice.3.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "867:5"
    },
    "vial.choice.3.3": {
        "type": "text",
        "text": "eep the vial",
        "lift": "",
        "drop": "",
        "next": "vial.choice.3.4",
        "position": "867:5"
    },
    "vial.choice.3.4": {
        "type": "switch",
        "expression": [
            "get",
            "vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "vial.choice.3.4.1",
            "vial.choice.3.4.2",
            "vial.choice.3.4.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "867:5"
    },
    "vial.choice.3.4.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "vial.choice.3.5",
        "position": "867:5"
    },
    "vial.choice.3.4.2": {
        "type": "goto",
        "next": "vial.choice.3.5",
        "position": "867:5"
    },
    "vial.choice.3.4.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "vial.choice.3.5",
        "position": "867:5"
    },
    "vial.choice.3.5": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "867:5"
    },
    "vial.choice.3.6": {
        "type": "goto",
        "next": "return",
        "position": "868:3"
    },
    "vial.choice.4": {
        "type": "ask",
        "position": "868:3"
    },
    "brine.vial.pumpkin.formula": {
        "type": "args",
        "locals": [],
        "next": "brine.vial.pumpkin.formula.1",
        "position": "871:3"
    },
    "brine.vial.pumpkin.formula.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "brine.pumpkin"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "brine.vial.pumpkin.formula.1.1",
        "position": "874:5"
    },
    "brine.vial.pumpkin.formula.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "vial"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "brine.vial.pumpkin.formula.1.2",
        "position": "874:5"
    },
    "brine.vial.pumpkin.formula.1.2": {
        "type": "opt",
        "question": [
            "brine.vial.pumpkin.formula.1.4",
            "brine.vial.pumpkin.formula.1.5"
        ],
        "answer": [
            "brine.vial.pumpkin.formula.1.3",
            "brine.vial.pumpkin.formula.1.5",
            "brine.vial.pumpkin.formula.1.6",
            "brine.vial.pumpkin.formula.1.8"
        ],
        "keywords": [
            "brine-pumpkin",
            "fill vial with brine from pumpkin"
        ],
        "next": null,
        "position": "874:5"
    },
    "brine.vial.pumpkin.formula.1.3": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "874:5"
    },
    "brine.vial.pumpkin.formula.1.4": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "874:5"
    },
    "brine.vial.pumpkin.formula.1.5": {
        "type": "text",
        "text": "ill a vial with brine from the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "874:5"
    },
    "brine.vial.pumpkin.formula.1.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": "brine.vial.pumpkin.formula.1.7",
        "position": "874:5"
    },
    "brine.vial.pumpkin.formula.1.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "brine.vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "brine.vial"
        ],
        "next": null,
        "position": "874:5"
    },
    "brine.vial.pumpkin.formula.1.8": {
        "type": "goto",
        "next": "return",
        "position": "874:5"
    },
    "brine.vial": {
        "type": "text",
        "text": "You have",
        "lift": " ",
        "drop": " ",
        "next": "brine.vial.1",
        "position": "878:3"
    },
    "brine.vial.1": {
        "type": "switch",
        "expression": [
            "get",
            "brine.vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "brine.vial.1.1",
            "brine.vial.1.2",
            "brine.vial.1.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "878:3"
    },
    "brine.vial.1.1": {
        "type": "goto",
        "next": "brine.vial.2",
        "position": "878:3"
    },
    "brine.vial.1.2": {
        "type": "text",
        "text": "a vial",
        "lift": "",
        "drop": "",
        "next": "brine.vial.2",
        "position": "878:3"
    },
    "brine.vial.1.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "brine.vial"
            ]
        ],
        "next": "brine.vial.1.3.1",
        "position": "878:3"
    },
    "brine.vial.1.3.1": {
        "type": "text",
        "text": "vials",
        "lift": " ",
        "drop": "",
        "next": "brine.vial.2",
        "position": "878:3"
    },
    "brine.vial.2": {
        "type": "text",
        "text": "of brine held in",
        "lift": " ",
        "drop": " ",
        "next": "brine.vial.3",
        "position": "879:3"
    },
    "brine.vial.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "brine.vial"
            ]
        ],
        "next": "brine.vial.4",
        "position": "879:3"
    },
    "brine.vial.4": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "brine.vial.5",
        "position": "879:3"
    },
    "brine.vial.5": {
        "type": "switch",
        "expression": [
            "get",
            "brine.vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "brine.vial.5.1",
            "brine.vial.5.2",
            "brine.vial.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "879:3"
    },
    "brine.vial.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "brine.vial.6",
        "position": "879:3"
    },
    "brine.vial.5.2": {
        "type": "goto",
        "next": "brine.vial.6",
        "position": "879:3"
    },
    "brine.vial.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "brine.vial.6",
        "position": "879:3"
    },
    "brine.vial.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "brine.vial.choice",
        "position": "880:3"
    },
    "brine.vial.choice": {
        "type": "call",
        "branch": "shrinking.potion.formula",
        "args": [],
        "next": "brine.vial.choice.1",
        "position": "881:3"
    },
    "brine.vial.choice.1": {
        "type": "call",
        "branch": "growing.potion.formula",
        "args": [],
        "next": "brine.vial.choice.2",
        "position": "882:3"
    },
    "brine.vial.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "brine.vial"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "brine.vial.choice.3",
        "next": "brine.vial.choice.2.1",
        "position": "885:5"
    },
    "brine.vial.choice.2.1": {
        "type": "opt",
        "question": [
            "brine.vial.choice.2.3",
            "brine.vial.choice.2.4"
        ],
        "answer": [
            "brine.vial.choice.2.2",
            "brine.vial.choice.2.4",
            "brine.vial.choice.2.5",
            "brine.vial.choice.2.7"
        ],
        "keywords": [
            "scene",
            "spill brine from vial"
        ],
        "next": "brine.vial.choice.3",
        "position": "885:5"
    },
    "brine.vial.choice.2.2": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "885:5"
    },
    "brine.vial.choice.2.3": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "885:5"
    },
    "brine.vial.choice.2.4": {
        "type": "text",
        "text": "pill the brine from the vial.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "885:5"
    },
    "brine.vial.choice.2.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "brine.vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "brine.vial"
        ],
        "next": "brine.vial.choice.2.6",
        "position": "885:5"
    },
    "brine.vial.choice.2.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": null,
        "position": "885:5"
    },
    "brine.vial.choice.2.7": {
        "type": "goto",
        "next": "return",
        "position": "886:5"
    },
    "brine.vial.choice.3": {
        "type": "opt",
        "question": [
            "brine.vial.choice.3.2",
            "brine.vial.choice.3.3"
        ],
        "answer": [
            "brine.vial.choice.3.1",
            "brine.vial.choice.3.3",
            "brine.vial.choice.3.6"
        ],
        "keywords": [
            "",
            "brine-vial",
            "keep"
        ],
        "next": "brine.vial.choice.4",
        "position": "887:5"
    },
    "brine.vial.choice.3.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "887:5"
    },
    "brine.vial.choice.3.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "887:5"
    },
    "brine.vial.choice.3.3": {
        "type": "text",
        "text": "eep the brine vial",
        "lift": "",
        "drop": "",
        "next": "brine.vial.choice.3.4",
        "position": "887:5"
    },
    "brine.vial.choice.3.4": {
        "type": "switch",
        "expression": [
            "get",
            "brine.vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "brine.vial.choice.3.4.1",
            "brine.vial.choice.3.4.2",
            "brine.vial.choice.3.4.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "887:5"
    },
    "brine.vial.choice.3.4.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "brine.vial.choice.3.5",
        "position": "887:5"
    },
    "brine.vial.choice.3.4.2": {
        "type": "goto",
        "next": "brine.vial.choice.3.5",
        "position": "887:5"
    },
    "brine.vial.choice.3.4.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "brine.vial.choice.3.5",
        "position": "887:5"
    },
    "brine.vial.choice.3.5": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "887:5"
    },
    "brine.vial.choice.3.6": {
        "type": "goto",
        "next": "return",
        "position": "888:3"
    },
    "brine.vial.choice.4": {
        "type": "ask",
        "position": "888:3"
    },
    "shrinking.potion.formula": {
        "type": "args",
        "locals": [],
        "next": "shrinking.potion.formula.1",
        "position": "891:3"
    },
    "shrinking.potion.formula.1": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "and",
                    [
                        "get",
                        "mushroom"
                    ],
                    [
                        "get",
                        "freshwater.vial"
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "brine.vial"
                    ]
                ]
            ]
        ],
        "branch": "shrinking.potion.formula.3",
        "next": "shrinking.potion.formula.2",
        "position": "892:5"
    },
    "shrinking.potion.formula.2": {
        "type": "text",
        "text": "You might be able to make a shrinking potion with this mushroom, since it did quite well on the lion, but perhaps sweet water won’t ferment a mushroom like it does the blue flowers.",
        "lift": " ",
        "drop": " ",
        "next": "shrinking.potion.formula.3",
        "position": "896:5"
    },
    "shrinking.potion.formula.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "mushroom"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "shrinking.potion.formula.3.1",
        "position": "898:5"
    },
    "shrinking.potion.formula.3.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "brine.vial"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "shrinking.potion.formula.3.2",
        "position": "898:5"
    },
    "shrinking.potion.formula.3.2": {
        "type": "opt",
        "question": [
            "shrinking.potion.formula.3.4",
            "shrinking.potion.formula.3.5"
        ],
        "answer": [
            "shrinking.potion.formula.3.3",
            "shrinking.potion.formula.3.5",
            "shrinking.potion.formula.3.6",
            "shrinking.potion.formula.3.10"
        ],
        "keywords": [
            "brine-vial",
            "make shrinking potion",
            "mushroom"
        ],
        "next": null,
        "position": "898:5"
    },
    "shrinking.potion.formula.3.3": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "898:5"
    },
    "shrinking.potion.formula.3.4": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "898:5"
    },
    "shrinking.potion.formula.3.5": {
        "type": "text",
        "text": "erment a mushroom in the vial of brine.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "898:5"
    },
    "shrinking.potion.formula.3.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "mushroom"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "mushroom"
        ],
        "next": "shrinking.potion.formula.3.7",
        "position": "898:5"
    },
    "shrinking.potion.formula.3.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "brine.vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "brine.vial"
        ],
        "next": "shrinking.potion.formula.3.8",
        "position": "898:5"
    },
    "shrinking.potion.formula.3.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "shrinking.potion"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "shrinking.potion"
        ],
        "next": "shrinking.potion.formula.3.9",
        "position": "898:5"
    },
    "shrinking.potion.formula.3.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "898:5"
    },
    "shrinking.potion.formula.3.10": {
        "type": "goto",
        "next": "return",
        "position": "898:5"
    },
    "shrinking.potion": {
        "type": "text",
        "text": "You have",
        "lift": " ",
        "drop": " ",
        "next": "shrinking.potion.1",
        "position": "902:3"
    },
    "shrinking.potion.1": {
        "type": "switch",
        "expression": [
            "get",
            "shrinking.potion"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "shrinking.potion.1.1",
            "shrinking.potion.1.2",
            "shrinking.potion.1.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "902:3"
    },
    "shrinking.potion.1.1": {
        "type": "goto",
        "next": "shrinking.potion.2",
        "position": "902:3"
    },
    "shrinking.potion.1.2": {
        "type": "text",
        "text": "a vial",
        "lift": "",
        "drop": "",
        "next": "shrinking.potion.2",
        "position": "902:3"
    },
    "shrinking.potion.1.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "shrinking.potion"
            ]
        ],
        "next": "shrinking.potion.1.3.1",
        "position": "902:3"
    },
    "shrinking.potion.1.3.1": {
        "type": "text",
        "text": "vials",
        "lift": " ",
        "drop": "",
        "next": "shrinking.potion.2",
        "position": "902:3"
    },
    "shrinking.potion.2": {
        "type": "text",
        "text": "of shrinking potion.",
        "lift": " ",
        "drop": " ",
        "next": "shrinking.potion.choice",
        "position": "904:3"
    },
    "shrinking.potion.choice": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "shrinking.potion"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "shrinking.potion.choice.1",
        "next": "shrinking.potion.choice.0.1",
        "position": "908:5"
    },
    "shrinking.potion.choice.0.1": {
        "type": "opt",
        "question": [
            "shrinking.potion.choice.0.3",
            "shrinking.potion.choice.0.4"
        ],
        "answer": [
            "shrinking.potion.choice.0.2",
            "shrinking.potion.choice.0.4",
            "shrinking.potion.choice.0.5",
            "shrinking.potion.choice.0.7"
        ],
        "keywords": [
            "scene",
            "spill shrinking potion"
        ],
        "next": "shrinking.potion.choice.1",
        "position": "908:5"
    },
    "shrinking.potion.choice.0.2": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "908:5"
    },
    "shrinking.potion.choice.0.3": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "908:5"
    },
    "shrinking.potion.choice.0.4": {
        "type": "text",
        "text": "pill the shrinking potion from the vial.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "908:5"
    },
    "shrinking.potion.choice.0.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "shrinking.potion"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "shrinking.potion"
        ],
        "next": "shrinking.potion.choice.0.6",
        "position": "908:5"
    },
    "shrinking.potion.choice.0.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": null,
        "position": "908:5"
    },
    "shrinking.potion.choice.0.7": {
        "type": "goto",
        "next": "return",
        "position": "909:5"
    },
    "shrinking.potion.choice.1": {
        "type": "opt",
        "question": [
            "shrinking.potion.choice.1.2",
            "shrinking.potion.choice.1.3"
        ],
        "answer": [
            "shrinking.potion.choice.1.1",
            "shrinking.potion.choice.1.3",
            "shrinking.potion.choice.1.4"
        ],
        "keywords": [
            "",
            "keep",
            "shrinking-potion"
        ],
        "next": "shrinking.potion.choice.2",
        "position": "910:5"
    },
    "shrinking.potion.choice.1.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "910:5"
    },
    "shrinking.potion.choice.1.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "910:5"
    },
    "shrinking.potion.choice.1.3": {
        "type": "text",
        "text": "eep the vial of shrinking potion.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "910:5"
    },
    "shrinking.potion.choice.1.4": {
        "type": "goto",
        "next": "return",
        "position": "911:3"
    },
    "shrinking.potion.choice.2": {
        "type": "ask",
        "position": "911:3"
    },
    "freshwater.vial.pumpkin.formula": {
        "type": "args",
        "locals": [],
        "next": "freshwater.vial.pumpkin.formula.1",
        "position": "914:3"
    },
    "freshwater.vial.pumpkin.formula.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                "get",
                "freshwater.pumpkin"
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "freshwater.vial.pumpkin.formula.1.1",
        "position": "917:5"
    },
    "freshwater.vial.pumpkin.formula.1.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "vial"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "freshwater.vial.pumpkin.formula.1.2",
        "position": "917:5"
    },
    "freshwater.vial.pumpkin.formula.1.2": {
        "type": "opt",
        "question": [
            "freshwater.vial.pumpkin.formula.1.4",
            "freshwater.vial.pumpkin.formula.1.5"
        ],
        "answer": [
            "freshwater.vial.pumpkin.formula.1.3",
            "freshwater.vial.pumpkin.formula.1.5",
            "freshwater.vial.pumpkin.formula.1.6",
            "freshwater.vial.pumpkin.formula.1.8"
        ],
        "keywords": [
            "fill vial with freshwater from pumpkin",
            "freshwater-pumpkin"
        ],
        "next": null,
        "position": "917:5"
    },
    "freshwater.vial.pumpkin.formula.1.3": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "917:5"
    },
    "freshwater.vial.pumpkin.formula.1.4": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "917:5"
    },
    "freshwater.vial.pumpkin.formula.1.5": {
        "type": "text",
        "text": "ill a vial with fresh water from the pumpkin.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "917:5"
    },
    "freshwater.vial.pumpkin.formula.1.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": "freshwater.vial.pumpkin.formula.1.7",
        "position": "917:5"
    },
    "freshwater.vial.pumpkin.formula.1.7": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "freshwater.vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "freshwater.vial"
        ],
        "next": null,
        "position": "917:5"
    },
    "freshwater.vial.pumpkin.formula.1.8": {
        "type": "goto",
        "next": "return",
        "position": "917:5"
    },
    "freshwater.vial": {
        "type": "text",
        "text": "You have",
        "lift": " ",
        "drop": " ",
        "next": "freshwater.vial.1",
        "position": "921:3"
    },
    "freshwater.vial.1": {
        "type": "switch",
        "expression": [
            "get",
            "freshwater.vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "freshwater.vial.1.1",
            "freshwater.vial.1.2",
            "freshwater.vial.1.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "921:3"
    },
    "freshwater.vial.1.1": {
        "type": "goto",
        "next": "freshwater.vial.2",
        "position": "921:3"
    },
    "freshwater.vial.1.2": {
        "type": "text",
        "text": "a vial",
        "lift": "",
        "drop": "",
        "next": "freshwater.vial.2",
        "position": "921:3"
    },
    "freshwater.vial.1.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "freshwater.vial"
            ]
        ],
        "next": "freshwater.vial.1.3.1",
        "position": "921:3"
    },
    "freshwater.vial.1.3.1": {
        "type": "text",
        "text": "vials",
        "lift": " ",
        "drop": "",
        "next": "freshwater.vial.2",
        "position": "921:3"
    },
    "freshwater.vial.2": {
        "type": "text",
        "text": "of fresh water held in",
        "lift": " ",
        "drop": " ",
        "next": "freshwater.vial.3",
        "position": "922:3"
    },
    "freshwater.vial.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "freshwater.vial"
            ]
        ],
        "next": "freshwater.vial.4",
        "position": "922:3"
    },
    "freshwater.vial.4": {
        "type": "text",
        "text": "hand",
        "lift": " ",
        "drop": "",
        "next": "freshwater.vial.5",
        "position": "922:3"
    },
    "freshwater.vial.5": {
        "type": "switch",
        "expression": [
            "get",
            "freshwater.vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "freshwater.vial.5.1",
            "freshwater.vial.5.2",
            "freshwater.vial.5.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "922:3"
    },
    "freshwater.vial.5.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "freshwater.vial.6",
        "position": "922:3"
    },
    "freshwater.vial.5.2": {
        "type": "goto",
        "next": "freshwater.vial.6",
        "position": "922:3"
    },
    "freshwater.vial.5.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "freshwater.vial.6",
        "position": "922:3"
    },
    "freshwater.vial.6": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "freshwater.vial.choice",
        "position": "923:3"
    },
    "freshwater.vial.choice": {
        "type": "call",
        "branch": "shrinking.potion.formula",
        "args": [],
        "next": "freshwater.vial.choice.1",
        "position": "924:3"
    },
    "freshwater.vial.choice.1": {
        "type": "call",
        "branch": "growing.potion.formula",
        "args": [],
        "next": "freshwater.vial.choice.2",
        "position": "925:3"
    },
    "freshwater.vial.choice.2": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "freshwater.vial"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "freshwater.vial.choice.3",
        "next": "freshwater.vial.choice.2.1",
        "position": "928:5"
    },
    "freshwater.vial.choice.2.1": {
        "type": "opt",
        "question": [
            "freshwater.vial.choice.2.3",
            "freshwater.vial.choice.2.4"
        ],
        "answer": [
            "freshwater.vial.choice.2.2",
            "freshwater.vial.choice.2.4",
            "freshwater.vial.choice.2.5",
            "freshwater.vial.choice.2.7"
        ],
        "keywords": [
            "scene",
            "spill freshwater from vial"
        ],
        "next": "freshwater.vial.choice.3",
        "position": "928:5"
    },
    "freshwater.vial.choice.2.2": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "928:5"
    },
    "freshwater.vial.choice.2.3": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "928:5"
    },
    "freshwater.vial.choice.2.4": {
        "type": "text",
        "text": "pill the water from the vial.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "928:5"
    },
    "freshwater.vial.choice.2.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "freshwater.vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "freshwater.vial"
        ],
        "next": "freshwater.vial.choice.2.6",
        "position": "928:5"
    },
    "freshwater.vial.choice.2.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": null,
        "position": "928:5"
    },
    "freshwater.vial.choice.2.7": {
        "type": "goto",
        "next": "return",
        "position": "929:5"
    },
    "freshwater.vial.choice.3": {
        "type": "opt",
        "question": [
            "freshwater.vial.choice.3.2",
            "freshwater.vial.choice.3.3"
        ],
        "answer": [
            "freshwater.vial.choice.3.1",
            "freshwater.vial.choice.3.3",
            "freshwater.vial.choice.3.6"
        ],
        "keywords": [
            "",
            "freshwater-vial",
            "keep"
        ],
        "next": "freshwater.vial.choice.4",
        "position": "930:5"
    },
    "freshwater.vial.choice.3.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "930:5"
    },
    "freshwater.vial.choice.3.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "930:5"
    },
    "freshwater.vial.choice.3.3": {
        "type": "text",
        "text": "eep the fresh water vial",
        "lift": "",
        "drop": "",
        "next": "freshwater.vial.choice.3.4",
        "position": "930:5"
    },
    "freshwater.vial.choice.3.4": {
        "type": "switch",
        "expression": [
            "get",
            "freshwater.vial"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "freshwater.vial.choice.3.4.1",
            "freshwater.vial.choice.3.4.2",
            "freshwater.vial.choice.3.4.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "930:5"
    },
    "freshwater.vial.choice.3.4.1": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "freshwater.vial.choice.3.5",
        "position": "930:5"
    },
    "freshwater.vial.choice.3.4.2": {
        "type": "goto",
        "next": "freshwater.vial.choice.3.5",
        "position": "930:5"
    },
    "freshwater.vial.choice.3.4.3": {
        "type": "text",
        "text": "s",
        "lift": "",
        "drop": "",
        "next": "freshwater.vial.choice.3.5",
        "position": "930:5"
    },
    "freshwater.vial.choice.3.5": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "930:5"
    },
    "freshwater.vial.choice.3.6": {
        "type": "goto",
        "next": "return",
        "position": "931:3"
    },
    "freshwater.vial.choice.4": {
        "type": "ask",
        "position": "931:3"
    },
    "growing.potion.formula": {
        "type": "args",
        "locals": [],
        "next": "growing.potion.formula.1",
        "position": "934:3"
    },
    "growing.potion.formula.1": {
        "type": "jump",
        "condition": [
            "not",
            [
                "and",
                [
                    "and",
                    [
                        "get",
                        "flower"
                    ],
                    [
                        "get",
                        "brine.vial"
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "freshwater.vial"
                    ]
                ]
            ]
        ],
        "branch": "growing.potion.formula.3",
        "next": "growing.potion.formula.2",
        "position": "935:5"
    },
    "growing.potion.formula.2": {
        "type": "text",
        "text": "You recall that you grew your homestead with a pumpkin filled with fresh water. This vial of brine might not be the key to a growing potion.",
        "lift": " ",
        "drop": " ",
        "next": "growing.potion.formula.3",
        "position": "938:5"
    },
    "growing.potion.formula.3": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "flower"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "growing.potion.formula.3.1",
        "position": "940:5"
    },
    "growing.potion.formula.3.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "freshwater.vial"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": null,
        "next": "growing.potion.formula.3.2",
        "position": "940:5"
    },
    "growing.potion.formula.3.2": {
        "type": "opt",
        "question": [
            "growing.potion.formula.3.4",
            "growing.potion.formula.3.5"
        ],
        "answer": [
            "growing.potion.formula.3.3",
            "growing.potion.formula.3.5",
            "growing.potion.formula.3.6",
            "growing.potion.formula.3.10"
        ],
        "keywords": [
            "flower",
            "freshwater-vial",
            "make growing potion"
        ],
        "next": null,
        "position": "940:5"
    },
    "growing.potion.formula.3.3": {
        "type": "text",
        "text": "You f",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "940:5"
    },
    "growing.potion.formula.3.4": {
        "type": "text",
        "text": "F",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "940:5"
    },
    "growing.potion.formula.3.5": {
        "type": "text",
        "text": "erment a flower in the vial of fresh water.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "940:5"
    },
    "growing.potion.formula.3.6": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "flower"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "flower"
        ],
        "next": "growing.potion.formula.3.7",
        "position": "940:5"
    },
    "growing.potion.formula.3.7": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "freshwater.vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "freshwater.vial"
        ],
        "next": "growing.potion.formula.3.8",
        "position": "940:5"
    },
    "growing.potion.formula.3.8": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "growing.potion"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "growing.potion"
        ],
        "next": "growing.potion.formula.3.9",
        "position": "940:5"
    },
    "growing.potion.formula.3.9": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "hand"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "hand"
        ],
        "next": null,
        "position": "940:5"
    },
    "growing.potion.formula.3.10": {
        "type": "text",
        "text": "The water turns into a blue potion for growing.",
        "lift": " ",
        "drop": " ",
        "next": "return",
        "position": "942:5"
    },
    "growing.potion": {
        "type": "text",
        "text": "You have",
        "lift": " ",
        "drop": " ",
        "next": "growing.potion.1",
        "position": "945:3"
    },
    "growing.potion.1": {
        "type": "switch",
        "expression": [
            "get",
            "growing.potion"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "growing.potion.1.1",
            "growing.potion.1.2",
            "growing.potion.1.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "945:3"
    },
    "growing.potion.1.1": {
        "type": "goto",
        "next": "growing.potion.2",
        "position": "945:3"
    },
    "growing.potion.1.2": {
        "type": "text",
        "text": "a vial",
        "lift": "",
        "drop": "",
        "next": "growing.potion.2",
        "position": "945:3"
    },
    "growing.potion.1.3": {
        "type": "call",
        "branch": "number",
        "args": [
            [
                "get",
                "growing.potion"
            ]
        ],
        "next": "growing.potion.1.3.1",
        "position": "945:3"
    },
    "growing.potion.1.3.1": {
        "type": "text",
        "text": "vials",
        "lift": " ",
        "drop": "",
        "next": "growing.potion.2",
        "position": "945:3"
    },
    "growing.potion.2": {
        "type": "text",
        "text": "of growing potion.",
        "lift": " ",
        "drop": " ",
        "next": "growing.potion.choice",
        "position": "947:3"
    },
    "growing.potion.choice": {
        "type": "call",
        "branch": "grow.airplane.formula",
        "args": [],
        "next": "growing.potion.choice.1",
        "position": "949:3"
    },
    "growing.potion.choice.1": {
        "type": "jump",
        "condition": [
            "==",
            [
                ">=",
                [
                    "get",
                    "growing.potion"
                ],
                [
                    "val",
                    1
                ]
            ],
            [
                "val",
                0
            ]
        ],
        "branch": "growing.potion.choice.2",
        "next": "growing.potion.choice.1.1",
        "position": "952:5"
    },
    "growing.potion.choice.1.1": {
        "type": "opt",
        "question": [
            "growing.potion.choice.1.3",
            "growing.potion.choice.1.4"
        ],
        "answer": [
            "growing.potion.choice.1.2",
            "growing.potion.choice.1.4",
            "growing.potion.choice.1.5",
            "growing.potion.choice.1.7"
        ],
        "keywords": [
            "scene",
            "spill growing potion"
        ],
        "next": "growing.potion.choice.2",
        "position": "952:5"
    },
    "growing.potion.choice.1.2": {
        "type": "text",
        "text": "You s",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "952:5"
    },
    "growing.potion.choice.1.3": {
        "type": "text",
        "text": "S",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "952:5"
    },
    "growing.potion.choice.1.4": {
        "type": "text",
        "text": "pill the growing potion from the vial.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "952:5"
    },
    "growing.potion.choice.1.5": {
        "type": "move",
        "source": [
            "-",
            [
                "get",
                "growing.potion"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "growing.potion"
        ],
        "next": "growing.potion.choice.1.6",
        "position": "952:5"
    },
    "growing.potion.choice.1.6": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "vial"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "vial"
        ],
        "next": null,
        "position": "952:5"
    },
    "growing.potion.choice.1.7": {
        "type": "goto",
        "next": "return",
        "position": "953:5"
    },
    "growing.potion.choice.2": {
        "type": "opt",
        "question": [
            "growing.potion.choice.2.2",
            "growing.potion.choice.2.3"
        ],
        "answer": [
            "growing.potion.choice.2.1",
            "growing.potion.choice.2.3",
            "growing.potion.choice.2.4"
        ],
        "keywords": [
            "",
            "growing-potion",
            "keep"
        ],
        "next": "growing.potion.choice.3",
        "position": "954:5"
    },
    "growing.potion.choice.2.1": {
        "type": "text",
        "text": "You k",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "954:5"
    },
    "growing.potion.choice.2.2": {
        "type": "text",
        "text": "K",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "954:5"
    },
    "growing.potion.choice.2.3": {
        "type": "text",
        "text": "eep the vial of growing potion.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "954:5"
    },
    "growing.potion.choice.2.4": {
        "type": "goto",
        "next": "return",
        "position": "955:3"
    },
    "growing.potion.choice.3": {
        "type": "ask",
        "position": "955:3"
    },
    "return": {
        "type": "par",
        "next": "return.1",
        "position": "959:3"
    },
    "return.1": {
        "type": "switch",
        "expression": [
            "get",
            "at"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "return.1.1",
            "return.1.2",
            "return.1.3",
            "return.1.4"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "961:3"
    },
    "return.1.1": {
        "type": "goto",
        "next": "hills",
        "position": "961:3"
    },
    "return.1.2": {
        "type": "goto",
        "next": "jungle",
        "position": "962:3"
    },
    "return.1.3": {
        "type": "goto",
        "next": "beach",
        "position": "963:3"
    },
    "return.1.4": {
        "type": "goto",
        "next": "mountain",
        "position": "964:3"
    },
    "maybe.break": {
        "type": "args",
        "locals": [],
        "next": "maybe.break.1",
        "position": "967:3"
    },
    "maybe.break.1": {
        "type": "opt",
        "question": [
            "maybe.break.1.1"
        ],
        "answer": [
            "maybe.break.1.2"
        ],
        "keywords": [
            "break"
        ],
        "next": null,
        "position": "968:5"
    },
    "maybe.break.1.1": {
        "type": "text",
        "text": "Take a break.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "968:5"
    },
    "maybe.break.1.2": {
        "type": "call",
        "branch": "break",
        "args": [],
        "next": "return",
        "position": "969:5"
    },
    "break": {
        "type": "args",
        "locals": [],
        "next": "break.1",
        "position": "971:3"
    },
    "break.1": {
        "type": "switch",
        "expression": [
            "get",
            "break"
        ],
        "variable": null,
        "value": 0,
        "mode": "loop",
        "branches": [
            "break.1.1",
            "break.1.2",
            "break.1.3",
            "break.1.4",
            "break.1.5",
            "break.1.6",
            "break.1.7",
            "break.1.8"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "972:3"
    },
    "break.1.1": {
        "type": "text",
        "text": "The",
        "lift": " ",
        "drop": " ",
        "next": "break.1.1.1",
        "position": "973:5"
    },
    "break.1.1.1": {
        "type": "switch",
        "expression": [
            "get",
            "break.1.1.1"
        ],
        "variable": "break.1.1.1",
        "value": 0,
        "mode": "rand",
        "branches": [
            "break.1.1.1.1",
            "break.1.1.1.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "973:5"
    },
    "break.1.1.1.1": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "break.1.1.2",
        "position": "973:5"
    },
    "break.1.1.1.2": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "break.1.1.2",
        "position": "973:5"
    },
    "break.1.1.2": {
        "type": "text",
        "text": "cries, “I sorely wish we had not lost our potions in the crash.”",
        "lift": " ",
        "drop": " ",
        "next": "break.2",
        "position": "974:3"
    },
    "break.1.2": {
        "type": "text",
        "text": "The",
        "lift": " ",
        "drop": " ",
        "next": "break.1.2.1",
        "position": "974:3"
    },
    "break.1.2.1": {
        "type": "switch",
        "expression": [
            "get",
            "break.1.2.1"
        ],
        "variable": "break.1.2.1",
        "value": 0,
        "mode": "rand",
        "branches": [
            "break.1.2.1.1",
            "break.1.2.1.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "974:3"
    },
    "break.1.2.1.1": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "break.1.2.1.1.1",
        "position": "974:3"
    },
    "break.1.2.1.1.1": {
        "type": "move",
        "source": [
            "val",
            0
        ],
        "target": [
            "get",
            "reply"
        ],
        "next": "break.1.2.2",
        "position": "974:3"
    },
    "break.1.2.1.2": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "break.1.2.1.2.1",
        "position": "974:3"
    },
    "break.1.2.1.2.1": {
        "type": "move",
        "source": [
            "val",
            1
        ],
        "target": [
            "get",
            "reply"
        ],
        "next": "break.1.2.2",
        "position": "974:3"
    },
    "break.1.2.2": {
        "type": "text",
        "text": "asks, “Do you wonder if we will ever get home?” The",
        "lift": " ",
        "drop": " ",
        "next": "break.1.2.3",
        "position": "975:5"
    },
    "break.1.2.3": {
        "type": "switch",
        "expression": [
            "get",
            "reply"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "break.1.2.3.1",
            "break.1.2.3.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "975:5"
    },
    "break.1.2.3.1": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "break.1.2.4",
        "position": "975:5"
    },
    "break.1.2.3.2": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "break.1.2.4",
        "position": "975:5"
    },
    "break.1.2.4": {
        "type": "text",
        "text": "replies, “Oh, I do not wonder at all. We will surely.”",
        "lift": " ",
        "drop": " ",
        "next": "break.2",
        "position": "976:3"
    },
    "break.1.3": {
        "type": "text",
        "text": "“This island is lovely,” you both agree, “but it is not home, and Mom and Dad will surely miss us if we don’t return before they come back with the groceries.”",
        "lift": " ",
        "drop": " ",
        "next": "break.2",
        "position": "978:3"
    },
    "break.1.4": {
        "type": "text",
        "text": "“I don’t suppose you brought a book?” the",
        "lift": " ",
        "drop": " ",
        "next": "break.1.4.1",
        "position": "978:3"
    },
    "break.1.4.1": {
        "type": "switch",
        "expression": [
            "get",
            "break.1.4.1"
        ],
        "variable": "break.1.4.1",
        "value": 0,
        "mode": "rand",
        "branches": [
            "break.1.4.1.1",
            "break.1.4.1.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "978:3"
    },
    "break.1.4.1.1": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "break.1.4.2",
        "position": "978:3"
    },
    "break.1.4.1.2": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "break.1.4.2",
        "position": "978:3"
    },
    "break.1.4.2": {
        "type": "text",
        "text": "asks.",
        "lift": " ",
        "drop": " ",
        "next": "break.2",
        "position": "979:3"
    },
    "break.1.5": {
        "type": "text",
        "text": "“I could stay here forever,” says the",
        "lift": " ",
        "drop": " ",
        "next": "break.1.5.1",
        "position": "979:3"
    },
    "break.1.5.1": {
        "type": "switch",
        "expression": [
            "get",
            "break.1.5.1"
        ],
        "variable": "break.1.5.1",
        "value": 0,
        "mode": "rand",
        "branches": [
            "break.1.5.1.1",
            "break.1.5.1.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "979:3"
    },
    "break.1.5.1.1": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "break.1.5.2",
        "position": "979:3"
    },
    "break.1.5.1.2": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "break.1.5.2",
        "position": "979:3"
    },
    "break.1.5.2": {
        "type": "text",
        "text": ", “but we have school tomorrow.”",
        "lift": "",
        "drop": " ",
        "next": "break.2",
        "position": "981:3"
    },
    "break.1.6": {
        "type": "text",
        "text": "“I can’t wait to get home to our workshop. I’m sure this would never have happened with our styrofoam-hulled airplane. We need to finish the motor,” says the",
        "lift": " ",
        "drop": " ",
        "next": "break.1.6.1",
        "position": "983:5"
    },
    "break.1.6.1": {
        "type": "switch",
        "expression": [
            "get",
            "break.1.6.1"
        ],
        "variable": "break.1.6.1",
        "value": 0,
        "mode": "rand",
        "branches": [
            "break.1.6.1.1",
            "break.1.6.1.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "983:5"
    },
    "break.1.6.1.1": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "break.1.6.2",
        "position": "983:5"
    },
    "break.1.6.1.2": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "break.1.6.2",
        "position": "983:5"
    },
    "break.1.6.2": {
        "type": "text",
        "text": ".",
        "lift": "",
        "drop": " ",
        "next": "break.2",
        "position": "984:3"
    },
    "break.1.7": {
        "type": "text",
        "text": "“We have never made paper for our planes before,” says the",
        "lift": " ",
        "drop": " ",
        "next": "break.1.7.1",
        "position": "984:3"
    },
    "break.1.7.1": {
        "type": "switch",
        "expression": [
            "get",
            "break.1.7.1"
        ],
        "variable": "break.1.7.1",
        "value": 0,
        "mode": "rand",
        "branches": [
            "break.1.7.1.1",
            "break.1.7.1.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "984:3"
    },
    "break.1.7.1.1": {
        "type": "text",
        "text": "boy, and the girl replies,",
        "lift": "",
        "drop": " ",
        "next": "break.1.7.2",
        "position": "985:5"
    },
    "break.1.7.1.2": {
        "type": "text",
        "text": "girl, and the boy replies,",
        "lift": "",
        "drop": " ",
        "next": "break.1.7.2",
        "position": "985:5"
    },
    "break.1.7.2": {
        "type": "text",
        "text": "“Indeed. This is quite an adventure.",
        "lift": " ",
        "drop": " ",
        "next": "break.1.7.3",
        "position": "987:5"
    },
    "break.1.7.3": {
        "type": "switch",
        "expression": [
            "not",
            [
                "and",
                [
                    "not",
                    [
                        "get",
                        "giant.airplane"
                    ]
                ],
                [
                    "not",
                    [
                        "get",
                        "launch.pad"
                    ]
                ]
            ]
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "break.1.7.3.1",
            "break.1.7.3.2"
        ],
        "weights": [
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "987:5"
    },
    "break.1.7.3.1": {
        "type": "text",
        "text": "We will have to",
        "lift": " ",
        "drop": " ",
        "next": "break.1.7.3.1.1",
        "position": "989:7"
    },
    "break.1.7.3.1.1": {
        "type": "switch",
        "expression": [
            "not",
            [
                "get",
                "airplane"
            ]
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "break.1.7.3.1.1.1",
            "break.1.7.3.1.1.2"
        ],
        "weights": [
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "989:7"
    },
    "break.1.7.3.1.1.1": {
        "type": "text",
        "text": "make a little paper and",
        "lift": " ",
        "drop": "",
        "next": "break.1.7.3.1.2",
        "position": "989:7"
    },
    "break.1.7.3.1.1.2": {
        "type": "goto",
        "next": "break.1.7.3.1.2",
        "position": "989:7"
    },
    "break.1.7.3.1.2": {
        "type": "text",
        "text": "grow the airplane.”",
        "lift": " ",
        "drop": " ",
        "next": "break.2",
        "position": "991:5"
    },
    "break.1.7.3.2": {
        "type": "goto",
        "next": "break.2",
        "position": "991:5"
    },
    "break.1.8": {
        "type": "text",
        "text": "“I am not sure whether I like cats or dogs better,” says the",
        "lift": " ",
        "drop": " ",
        "next": "break.1.8.1",
        "position": "993:5"
    },
    "break.1.8.1": {
        "type": "switch",
        "expression": [
            "get",
            "break.1.8.1"
        ],
        "variable": "break.1.8.1",
        "value": 0,
        "mode": "rand",
        "branches": [
            "break.1.8.1.1",
            "break.1.8.1.2"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "993:5"
    },
    "break.1.8.1.1": {
        "type": "text",
        "text": "boy",
        "lift": "",
        "drop": "",
        "next": "break.1.8.2",
        "position": "993:5"
    },
    "break.1.8.1.2": {
        "type": "text",
        "text": "girl",
        "lift": "",
        "drop": "",
        "next": "break.1.8.2",
        "position": "993:5"
    },
    "break.1.8.2": {
        "type": "text",
        "text": ", “but I would sure love for us to take one on our adventures.”",
        "lift": "",
        "drop": " ",
        "next": "break.2",
        "position": "995:3"
    },
    "break.2": {
        "type": "move",
        "source": [
            "+",
            [
                "get",
                "break"
            ],
            [
                "val",
                1
            ]
        ],
        "target": [
            "get",
            "break"
        ],
        "next": "break.3",
        "position": "995:3"
    },
    "break.3": {
        "type": "opt",
        "question": [
            "break.3.1"
        ],
        "answer": [
            "break.3.2"
        ],
        "keywords": [
            "",
            "back"
        ],
        "next": "break.4",
        "position": "996:5"
    },
    "break.3.1": {
        "type": "text",
        "text": "“Let’s get back to work.”",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "996:5"
    },
    "break.3.2": {
        "type": "goto",
        "next": null,
        "position": "996:5"
    },
    "break.4": {
        "type": "opt",
        "question": [
            "break.4.1"
        ],
        "answer": [
            "break.4.4"
        ],
        "keywords": [
            "more"
        ],
        "next": "break.5",
        "position": "997:5"
    },
    "break.4.1": {
        "type": "text",
        "text": "“Let’s",
        "lift": "",
        "drop": " ",
        "next": "break.4.2",
        "position": "997:5"
    },
    "break.4.2": {
        "type": "switch",
        "expression": [
            "get",
            "break.4.2"
        ],
        "variable": "break.4.2",
        "value": 0,
        "mode": "rand",
        "branches": [
            "break.4.2.1",
            "break.4.2.2",
            "break.4.2.3"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "997:5"
    },
    "break.4.2.1": {
        "type": "text",
        "text": "chat",
        "lift": "",
        "drop": "",
        "next": "break.4.3",
        "position": "997:5"
    },
    "break.4.2.2": {
        "type": "text",
        "text": "rest",
        "lift": "",
        "drop": "",
        "next": "break.4.3",
        "position": "997:5"
    },
    "break.4.2.3": {
        "type": "text",
        "text": "talk",
        "lift": "",
        "drop": "",
        "next": "break.4.3",
        "position": "997:5"
    },
    "break.4.3": {
        "type": "text",
        "text": "more.”",
        "lift": " ",
        "drop": " ",
        "next": null,
        "position": "997:5"
    },
    "break.4.4": {
        "type": "goto",
        "next": "break",
        "position": "997:5"
    },
    "break.5": {
        "type": "opt",
        "question": [
            "break.5.1"
        ],
        "answer": [
            "break.5.2"
        ],
        "keywords": [
            "",
            "reset"
        ],
        "next": "break.6",
        "position": "998:5"
    },
    "break.5.1": {
        "type": "text",
        "text": "“Let’s start over from the beginning.”",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "998:5"
    },
    "break.5.2": {
        "type": "text",
        "text": "Are you certain that you would like to start over? All progress will be lost.",
        "lift": " ",
        "drop": " ",
        "next": "break.5.3",
        "position": "1001:7"
    },
    "break.5.3": {
        "type": "opt",
        "question": [
            "break.5.3.2",
            "break.5.3.3"
        ],
        "answer": [
            "break.5.3.1",
            "break.5.3.3",
            "break.5.3.4"
        ],
        "keywords": [
            "yes"
        ],
        "next": "break.5.4",
        "position": "1001:7"
    },
    "break.5.3.1": {
        "type": "text",
        "text": "The boy and girl clasp their hands in a secret magical handshake and t",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "1002:7"
    },
    "break.5.3.2": {
        "type": "text",
        "text": "T",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "1002:7"
    },
    "break.5.3.3": {
        "type": "text",
        "text": "ravel back in time to the outset on Peruácru Island.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1002:7"
    },
    "break.5.3.4": {
        "type": "call",
        "branch": "reset",
        "args": [],
        "next": "break.5.3.5",
        "position": "1003:7"
    },
    "break.5.3.5": {
        "type": "opt",
        "question": [
            "break.5.3.5.1"
        ],
        "answer": [
            "break.5.3.5.2"
        ],
        "keywords": [],
        "next": "break.5.3.6",
        "position": "1004:9"
    },
    "break.5.3.5.1": {
        "type": "text",
        "text": "Continue...",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1004:9"
    },
    "break.5.3.5.2": {
        "type": "goto",
        "next": "introduction",
        "position": "1004:9"
    },
    "break.5.3.6": {
        "type": "ask",
        "position": "1005:7"
    },
    "break.5.4": {
        "type": "opt",
        "question": [
            "break.5.4.2",
            "break.5.4.3"
        ],
        "answer": [
            "break.5.4.1",
            "break.5.4.3",
            "break.5.4.4"
        ],
        "keywords": [
            "",
            "no"
        ],
        "next": "break.5.5",
        "position": "1006:7"
    },
    "break.5.4.1": {
        "type": "text",
        "text": "You g",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "1006:7"
    },
    "break.5.4.2": {
        "type": "text",
        "text": "G",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "1006:7"
    },
    "break.5.4.3": {
        "type": "text",
        "text": "et back to working on your escape from Peruácru Island.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1007:7"
    },
    "break.5.4.4": {
        "type": "goto",
        "next": null,
        "position": "1007:7"
    },
    "break.5.5": {
        "type": "ask",
        "position": "1008:5"
    },
    "break.6": {
        "type": "ask",
        "position": "1009:3"
    },
    "credits": {
        "type": "text",
        "text": "The boy says, “Escape from Peruácru Island was illustrated by my sister, Kathleen Kowal”.",
        "lift": " ",
        "drop": " ",
        "next": "credits.1",
        "position": "1014:5"
    },
    "credits.1": {
        "type": "opt",
        "question": [
            "credits.1.1"
        ],
        "answer": [
            "credits.1.2"
        ],
        "keywords": [
            ""
        ],
        "next": "credits.2",
        "position": "1014:5"
    },
    "credits.1.1": {
        "type": "text",
        "text": "What else then?",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1014:5"
    },
    "credits.1.2": {
        "type": "goto",
        "next": "credits.4",
        "position": "1015:5"
    },
    "credits.2": {
        "type": "opt",
        "question": [
            "credits.2.1"
        ],
        "answer": [
            "credits.2.2"
        ],
        "keywords": [],
        "next": "credits.3",
        "position": "1015:5"
    },
    "credits.2.1": {
        "type": "text",
        "text": "Start over?",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1015:5"
    },
    "credits.2.2": {
        "type": "goto",
        "next": "start",
        "position": "1015:5"
    },
    "credits.3": {
        "type": "ask",
        "position": "1016:3"
    },
    "credits.4": {
        "type": "text",
        "text": "The girl says, “Escape from Peruácru Island was written by my brother, Kristopher Kowal”.",
        "lift": "",
        "drop": " ",
        "next": "credits.5",
        "position": "1020:5"
    },
    "credits.5": {
        "type": "opt",
        "question": [
            "credits.5.1"
        ],
        "answer": [
            "credits.5.2"
        ],
        "keywords": [
            ""
        ],
        "next": "credits.6",
        "position": "1020:5"
    },
    "credits.5.1": {
        "type": "text",
        "text": "Is there more?",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1020:5"
    },
    "credits.5.2": {
        "type": "goto",
        "next": "credits.8",
        "position": "1021:5"
    },
    "credits.6": {
        "type": "opt",
        "question": [
            "credits.6.1"
        ],
        "answer": [
            "credits.6.2"
        ],
        "keywords": [],
        "next": "credits.7",
        "position": "1021:5"
    },
    "credits.6.1": {
        "type": "text",
        "text": "Try again?",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1021:5"
    },
    "credits.6.2": {
        "type": "goto",
        "next": "start",
        "position": "1021:5"
    },
    "credits.7": {
        "type": "ask",
        "position": "1022:3"
    },
    "credits.8": {
        "type": "text",
        "text": "As one, the boy and girl say, “We hold the copyright for Escape from Peruácru Island, which we finished in 2017.”",
        "lift": "",
        "drop": " ",
        "next": "credits.9",
        "position": "1026:5"
    },
    "credits.9": {
        "type": "opt",
        "question": [
            "credits.9.1"
        ],
        "answer": [
            "credits.9.2"
        ],
        "keywords": [
            ""
        ],
        "next": "credits.10",
        "position": "1026:5"
    },
    "credits.9.1": {
        "type": "text",
        "text": "Does this go on?",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1026:5"
    },
    "credits.9.2": {
        "type": "goto",
        "next": "credits.12",
        "position": "1027:5"
    },
    "credits.10": {
        "type": "opt",
        "question": [
            "credits.10.1"
        ],
        "answer": [
            "credits.10.2"
        ],
        "keywords": [],
        "next": "credits.11",
        "position": "1027:5"
    },
    "credits.10.1": {
        "type": "text",
        "text": "One more time.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1027:5"
    },
    "credits.10.2": {
        "type": "goto",
        "next": "start",
        "position": "1027:5"
    },
    "credits.11": {
        "type": "ask",
        "position": "1028:3"
    },
    "credits.12": {
        "type": "text",
        "text": "The boy says, “Do you suppose we will do another?”. The girl replies, “We just might.”.",
        "lift": "",
        "drop": " ",
        "next": "credits.13",
        "position": "1032:5"
    },
    "credits.13": {
        "type": "opt",
        "question": [
            "credits.13.1"
        ],
        "answer": [
            "credits.13.2"
        ],
        "keywords": [
            ""
        ],
        "next": "credits.14",
        "position": "1032:5"
    },
    "credits.13.1": {
        "type": "text",
        "text": "Keep it coming.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1032:5"
    },
    "credits.13.2": {
        "type": "goto",
        "next": "credits.16",
        "position": "1033:5"
    },
    "credits.14": {
        "type": "opt",
        "question": [
            "credits.14.1"
        ],
        "answer": [
            "credits.14.2"
        ],
        "keywords": [],
        "next": "credits.15",
        "position": "1033:5"
    },
    "credits.14.1": {
        "type": "text",
        "text": "Can I try again?",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1033:5"
    },
    "credits.14.2": {
        "type": "goto",
        "next": "start",
        "position": "1033:5"
    },
    "credits.15": {
        "type": "ask",
        "position": "1034:3"
    },
    "credits.16": {
        "type": "text",
        "text": "The girl says, “Thank you for supporting our game.”, and the boy continues, “We appreciate you hanging on to the end.”",
        "lift": "",
        "drop": " ",
        "next": "credits.17",
        "position": "1038:5"
    },
    "credits.17": {
        "type": "opt",
        "question": [
            "credits.17.1"
        ],
        "answer": [
            "credits.17.2"
        ],
        "keywords": [],
        "next": "credits.18",
        "position": "1038:5"
    },
    "credits.17.1": {
        "type": "text",
        "text": "Wait, I missed something.",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1038:5"
    },
    "credits.17.2": {
        "type": "goto",
        "next": "credits",
        "position": "1039:5"
    },
    "credits.18": {
        "type": "opt",
        "question": [
            "credits.18.1"
        ],
        "answer": [
            "credits.18.2"
        ],
        "keywords": [],
        "next": "credits.19",
        "position": "1039:5"
    },
    "credits.18.1": {
        "type": "text",
        "text": "One more time!",
        "lift": "",
        "drop": " ",
        "next": null,
        "position": "1039:5"
    },
    "credits.18.2": {
        "type": "goto",
        "next": "start",
        "position": "1039:5"
    },
    "credits.19": {
        "type": "ask",
        "position": "1040:3"
    },
    "number": {
        "type": "args",
        "locals": [
            "number"
        ],
        "next": "number.1",
        "position": "1043:3"
    },
    "number.1": {
        "type": "switch",
        "expression": [
            "get",
            "number"
        ],
        "variable": null,
        "value": 0,
        "mode": "walk",
        "branches": [
            "number.1.1",
            "number.1.2",
            "number.1.3",
            "number.1.4",
            "number.1.5"
        ],
        "weights": [
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ],
            [
                "val",
                1
            ]
        ],
        "next": null,
        "position": "1044:3"
    },
    "number.1.1": {
        "type": "text",
        "text": "no",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "1044:3"
    },
    "number.1.2": {
        "type": "text",
        "text": "one",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "1044:3"
    },
    "number.1.3": {
        "type": "text",
        "text": "two",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "1044:3"
    },
    "number.1.4": {
        "type": "text",
        "text": "three",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "1044:3"
    },
    "number.1.5": {
        "type": "text",
        "text": "four",
        "lift": "",
        "drop": "",
        "next": null,
        "position": "1044:3"
    }
}

}],["play.html","peruacru","play.html",{"./play":22,"gutentag/repeat.html":2},function (require, exports, module, __filename, __dirname){

// peruacru/play.html
// ------------------

"use strict";
var $SUPER = require("./play");
module.exports = PeruacruPlay;
function PeruacruPlay(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV viewport
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("viewport", component);
    if (component.setAttribute) {
        component.setAttribute("id", "viewport_gsf30z");
    }
    if (scope.componentsFor["viewport"]) {
        scope.componentsFor["viewport"].setAttribute("for", "viewport_gsf30z")
    }
    if (component.setAttribute) {
        component.setAttribute("class", "viewport");
    }
    // /DIV viewport
    parents[parents.length] = parent; parent = node;
    // DIV
        // DIV narrative
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        scope.hookup("narrative", component);
        if (component.setAttribute) {
            component.setAttribute("id", "narrative_tciv9v");
        }
        if (scope.componentsFor["narrative"]) {
            scope.componentsFor["narrative"].setAttribute("for", "narrative_tciv9v")
        }
        if (component.setAttribute) {
            component.setAttribute("class", "narrative");
        }
        // /DIV narrative
        parents[parents.length] = parent; parent = node;
        // DIV
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // DIV stage
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        scope.hookup("stage", component);
        if (component.setAttribute) {
            component.setAttribute("id", "stage_a2e02p");
        }
        if (scope.componentsFor["stage"]) {
            scope.componentsFor["stage"].setAttribute("for", "stage_a2e02p")
        }
        if (component.setAttribute) {
            component.setAttribute("class", "stage");
        }
        // /DIV stage
        parents[parents.length] = parent; parent = node;
        // DIV
            // DIV scene
            node = document.createElement("DIV");
            parent.appendChild(node);
            component = node.actualNode;
            scope.hookup("scene", component);
            if (component.setAttribute) {
                component.setAttribute("id", "scene_z7jo11");
            }
            if (scope.componentsFor["scene"]) {
                scope.componentsFor["scene"].setAttribute("for", "scene_z7jo11")
            }
            if (component.setAttribute) {
                component.setAttribute("class", "scene");
            }
            // /DIV scene
            parents[parents.length] = parent; parent = node;
            // DIV
                // DIV peruacru
                node = document.createElement("DIV");
                parent.appendChild(node);
                component = node.actualNode;
                scope.hookup("peruacru", component);
                if (component.setAttribute) {
                    component.setAttribute("id", "peruacru_hx6dyr");
                }
                if (scope.componentsFor["peruacru"]) {
                    scope.componentsFor["peruacru"].setAttribute("for", "peruacru_hx6dyr")
                }
                if (component.setAttribute) {
                    component.setAttribute("class", "peruacru");
                }
                // /DIV peruacru
                parents[parents.length] = parent; parent = node;
                // DIV
                    // DIV hills
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("hills", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "hills_pn7umb");
                    }
                    if (scope.componentsFor["hills"]) {
                        scope.componentsFor["hills"].setAttribute("for", "hills_pn7umb")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "hills");
                    }
                    // /DIV hills
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV jungle
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("jungle", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "jungle_amlawl");
                    }
                    if (scope.componentsFor["jungle"]) {
                        scope.componentsFor["jungle"].setAttribute("for", "jungle_amlawl")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "jungle");
                    }
                    // /DIV jungle
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV beach
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("beach", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "beach_86b9am");
                    }
                    if (scope.componentsFor["beach"]) {
                        scope.componentsFor["beach"].setAttribute("for", "beach_86b9am")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "beach");
                    }
                    // /DIV beach
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV mountain
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("mountain", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "mountain_owxq6d");
                    }
                    if (scope.componentsFor["mountain"]) {
                        scope.componentsFor["mountain"].setAttribute("for", "mountain_owxq6d")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "mountain");
                    }
                    // /DIV mountain
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV homestead
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("homestead", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "homestead_y6o4fy");
                    }
                    if (scope.componentsFor["homestead"]) {
                        scope.componentsFor["homestead"].setAttribute("for", "homestead_y6o4fy")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "prop homestead");
                    }
                    // /DIV homestead
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV bridge
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("bridge", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "bridge_vhvwyu");
                    }
                    if (scope.componentsFor["bridge"]) {
                        scope.componentsFor["bridge"].setAttribute("for", "bridge_vhvwyu")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "prop bridge");
                    }
                    // /DIV bridge
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV tap
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("tap", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "tap_ixbfa");
                    }
                    if (scope.componentsFor["tap"]) {
                        scope.componentsFor["tap"].setAttribute("for", "tap_ixbfa")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "prop tap");
                    }
                    // /DIV tap
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV lion
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("lion", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "lion_xro45u");
                    }
                    if (scope.componentsFor["lion"]) {
                        scope.componentsFor["lion"].setAttribute("for", "lion_xro45u")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "prop lion");
                    }
                    // /DIV lion
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV cat
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("cat", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "cat_f891ng");
                    }
                    if (scope.componentsFor["cat"]) {
                        scope.componentsFor["cat"].setAttribute("for", "cat_f891ng")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "prop cat");
                    }
                    // /DIV cat
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV tap
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("tap", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "tap_5yk3hw");
                    }
                    if (scope.componentsFor["tap"]) {
                        scope.componentsFor["tap"].setAttribute("for", "tap_5yk3hw")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "prop tap");
                    }
                    // /DIV tap
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV placed-ballista
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("placed-ballista", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "placed-ballista_5grzhc");
                    }
                    if (scope.componentsFor["placed-ballista"]) {
                        scope.componentsFor["placed-ballista"].setAttribute("for", "placed-ballista_5grzhc")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "prop placed-ballista");
                    }
                    // /DIV placed-ballista
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV launch-pad
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("launch-pad", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "launch-pad_ntahlx");
                    }
                    if (scope.componentsFor["launch-pad"]) {
                        scope.componentsFor["launch-pad"].setAttribute("for", "launch-pad_ntahlx")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "prop launch-pad");
                    }
                    // /DIV launch-pad
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV flowers
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("flowers", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "flowers_4j5sq4");
                    }
                    if (scope.componentsFor["flowers"]) {
                        scope.componentsFor["flowers"].setAttribute("for", "flowers_4j5sq4")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target flowers");
                    }
                    // /DIV flowers
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV stream
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("stream", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "stream_4q5b54");
                    }
                    if (scope.componentsFor["stream"]) {
                        scope.componentsFor["stream"].setAttribute("for", "stream_4q5b54")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target stream");
                    }
                    // /DIV stream
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV pumpkins
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("pumpkins", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "pumpkins_ct8yu6");
                    }
                    if (scope.componentsFor["pumpkins"]) {
                        scope.componentsFor["pumpkins"].setAttribute("for", "pumpkins_ct8yu6")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target pumpkins");
                    }
                    // /DIV pumpkins
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV bamboos
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("bamboos", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "bamboos_ssqj01");
                    }
                    if (scope.componentsFor["bamboos"]) {
                        scope.componentsFor["bamboos"].setAttribute("for", "bamboos_ssqj01")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target bamboos");
                    }
                    // /DIV bamboos
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV mushrooms
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("mushrooms", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "mushrooms_8i8nn2");
                    }
                    if (scope.componentsFor["mushrooms"]) {
                        scope.componentsFor["mushrooms"].setAttribute("for", "mushrooms_8i8nn2")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target mushrooms");
                    }
                    // /DIV mushrooms
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV rubber-tree
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("rubber-tree", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "rubber-tree_7zw5aj");
                    }
                    if (scope.componentsFor["rubber-tree"]) {
                        scope.componentsFor["rubber-tree"].setAttribute("for", "rubber-tree_7zw5aj")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target rubber-tree");
                    }
                    // /DIV rubber-tree
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV trail
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("trail", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "trail_9thoap");
                    }
                    if (scope.componentsFor["trail"]) {
                        scope.componentsFor["trail"].setAttribute("for", "trail_9thoap")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target trail");
                    }
                    // /DIV trail
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV lava-flow
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("lava-flow", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "lava-flow_sp7jxs");
                    }
                    if (scope.componentsFor["lava-flow"]) {
                        scope.componentsFor["lava-flow"].setAttribute("for", "lava-flow_sp7jxs")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target lava-flow");
                    }
                    // /DIV lava-flow
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV bridgewater
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("bridgewater", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "bridgewater_9gdt57");
                    }
                    if (scope.componentsFor["bridgewater"]) {
                        scope.componentsFor["bridgewater"].setAttribute("for", "bridgewater_9gdt57")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target bridgewater");
                    }
                    // /DIV bridgewater
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV corner
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("corner", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "corner_meetkb");
                    }
                    if (scope.componentsFor["corner"]) {
                        scope.componentsFor["corner"].setAttribute("for", "corner_meetkb")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target corner");
                    }
                    // /DIV corner
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV sea
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("sea", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "sea_3yw261");
                    }
                    if (scope.componentsFor["sea"]) {
                        scope.componentsFor["sea"].setAttribute("for", "sea_3yw261")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target sea");
                    }
                    // /DIV sea
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV reeds
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("reeds", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "reeds_f2zb2o");
                    }
                    if (scope.componentsFor["reeds"]) {
                        scope.componentsFor["reeds"].setAttribute("for", "reeds_f2zb2o")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "target reeds");
                    }
                    // /DIV reeds
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                    // DIV curtain
                    node = document.createElement("DIV");
                    parent.appendChild(node);
                    component = node.actualNode;
                    scope.hookup("curtain", component);
                    if (component.setAttribute) {
                        component.setAttribute("id", "curtain_edl3br");
                    }
                    if (scope.componentsFor["curtain"]) {
                        scope.componentsFor["curtain"].setAttribute("for", "curtain_edl3br")
                    }
                    if (component.setAttribute) {
                        component.setAttribute("class", "curtain");
                    }
                    // /DIV curtain
                    parents[parents.length] = parent; parent = node;
                    // DIV
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            // DIV inventory
            node = document.createElement("DIV");
            parent.appendChild(node);
            component = node.actualNode;
            scope.hookup("inventory", component);
            if (component.setAttribute) {
                component.setAttribute("id", "inventory_a7ats2");
            }
            if (scope.componentsFor["inventory"]) {
                scope.componentsFor["inventory"].setAttribute("for", "inventory_a7ats2")
            }
            if (component.setAttribute) {
                component.setAttribute("class", "inventory");
            }
            // /DIV inventory
            parents[parents.length] = parent; parent = node;
            // DIV
                // REPEAT items
                node = document.createBody();
                parent.appendChild(node);
                parents[parents.length] = parent; parent = node;
                // REPEAT
                    node = {tagName: "repeat"};
                    node.component = $THIS$0;
                    callee = scope.nest();
                    callee.argument = node;
                    callee.id = "items";
                    component = new $REPEAT(parent, callee);
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                scope.hookup("items", component);
                if (component.setAttribute) {
                    component.setAttribute("id", "items_3y3t1o");
                }
                if (scope.componentsFor["items"]) {
                    scope.componentsFor["items"].setAttribute("for", "items_3y3t1o")
                }
                // /REPEAT items
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
}
var $THIS = PeruacruPlay
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $REPEAT = require("gutentag/repeat.html");
var $THIS$0 = function PeruacruPlay$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV slot
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("slot", component);
    if (component.setAttribute) {
        component.setAttribute("id", "slot_l7mgty");
    }
    if (scope.componentsFor["slot"]) {
        scope.componentsFor["slot"].setAttribute("for", "slot_l7mgty")
    }
    if (component.setAttribute) {
        component.setAttribute("class", "slot");
    }
    // /DIV slot
    parents[parents.length] = parent; parent = node;
    // DIV
        // DIV item
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        scope.hookup("item", component);
        if (component.setAttribute) {
            component.setAttribute("id", "item_a2z4wp");
        }
        if (scope.componentsFor["item"]) {
            scope.componentsFor["item"].setAttribute("for", "item_a2z4wp")
        }
        if (component.setAttribute) {
            component.setAttribute("class", "item");
        }
        // /DIV item
        parents[parents.length] = parent; parent = node;
        // DIV
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};

}],["play.js","peruacru","play.js",{"kni/engine":6,"./document":17,"kni/story":9,"./peruacru.json":20,"ndim/point2":12,"ndim/region2":14,"./animation":16,"./stage":23,"./inventory":19},function (require, exports, module, __filename, __dirname){

// peruacru/play.js
// ----------------

'use strict';

var Engine = require('kni/engine');
var Document = require('./document');
var Story = require('kni/story');
var story = require('./peruacru.json');
var Point2 = require('ndim/point2');
var Region2 = require('ndim/region2');
var A = require('./animation');
var stage = require('./stage');
var Inventory = require('./inventory');

var aspectBias = 1.5;

module.exports = Play;

function Play(body, scope) {
    this.engine = null;
    this.at = -1;
    this.animator = scope.animator.add(this);
    this.animator.requestMeasure();

    // handheld and non-handheld
    this.stageSize = new Point2(1024, 842);
    this.windowSize = new Point2();
    // handheld only
    this.stageScaleSize = new Point2();
    // non-handheld only
    this.windowCenter = new Point2();
    this.viewportSize = new Point2();
    this.viewportScale = new Point2();
    this.viewportOffset = new Point2();

    this.inventory = new Inventory(this);

    this.tail = A.idle;

    // provided in init
    this.items = null;
    // components
    this.stage = null;
    this.narrative = null;
    this.peruacru = null;
    this.viewport = null;
}


// -- RESPONSIVE LAYOUT --

Play.prototype.measure = function measure() {
    this.windowSize.x = window.innerWidth;
    this.windowSize.y = window.innerHeight;
    this.animator.requestDraw();
};

Play.prototype.draw = function draw() {
    // reset
    this.viewport.classList.remove('landscape');
    this.viewport.classList.remove('portrait');
    this.narrative.classList.remove('landscape');
    this.narrative.classList.remove('portrait');

    if (this.windowSize.x <= 480 || this.windowSize.y <= 480) {
        // reset oversize
        this.viewport.style.transform = 'none';

        // handheld
        var scale = this.windowSize.x / this.stageSize.x;
        this.stageScaleSize.copyFrom(this.stageSize).scaleThis(scale);
        this.stage.style.transform = 'scale(' + scale + ')';
        this.narrative.style.top = this.stageScaleSize.y + 'px';
    } else {
        // reset handheld
        this.stage.style.transform = 'none';
        this.narrative.style.top = '';

        // oversize: laptop, desktop, or battlestation
        this.viewportSize.copyFrom(this.stageSize);
        if (this.windowSize.x > this.windowSize.y * aspectBias) {
            this.viewportSize.x *= aspectBias;
            this.narrative.classList.add('landscape');
            this.viewport.classList.add('landscape');
        } else {
            this.viewportSize.y += 714;
            this.narrative.classList.add('portrait');
            this.viewport.classList.add('portrait');
        }

        // this.windowCenter
        //     .copyFrom(this.windowSize)
        //     .scaleThis(0.5);
        this.viewportScale
            .copyFrom(this.windowSize)
            .divThis(this.viewportSize);
        // var viewportScale = 0.1;
        var viewportScale = Math.min(this.viewportScale.x, this.viewportScale.y);
        this.viewportOffset
            .copyFrom(this.windowSize)
            .scaleThis(1/viewportScale)
            .subThis(this.viewportSize)
            .scaleThis(0.5)
            .roundThis();
        this.viewport.style.transform = (
            'scale(' + viewportScale + ', ' + viewportScale + ') ' +
            'translate(' + this.viewportOffset.x + 'px, ' + this.viewportOffset.y + 'px)'
        );
    }
};

Play.prototype.handleEvent = function handleEvent(event) {
    if (event.type === 'resize') {
        this.animator.requestMeasure();
    } else if (event.type === 'click') {
        console.log('click', event.currentTarget.keyword)
        if (this.click(event.currentTarget.keyword)) {
            console.log('clicked', event.currentTarget.keyword);
            event.stopPropagation();
            event.preventDefault();
        }
    }
};


// -- KNI ENGINE HOOKS --

Play.prototype.answer = function _answer(answer, engine) {
};

Play.prototype.choice = function _choice(choice, engine) {
    var keywords = choice.keywords;
    console.log('> ' + keywords.join(', '));
    for (var i = 0; i < keywords.length; i++) {
        var keyword = choice.keywords[i];
        if (stage.triggers[keyword]) {
            this.animate(stage.triggers[keyword].call(this.inventory) || A.idle);
            return;
        }
    }
};

Play.prototype.ask = function ask(engine) {
    var at = engine.global.get('at');
    console.log('ask', at, engine.label);
    if (this.at !== at) {
        this.animate(new SceneChange(this, this.at, at));
        if (this.at !== -1) {
            this.animate(new A.AwaitTransitionEnd(this.peruacru));
        }
        this.at = at;
    }
    this.updateItems();
    this.updateProps();
};


Play.prototype.waypoint = function (waypoint) {
    var json = JSON.stringify(waypoint);
    window.history.pushState(waypoint, '', '#' + btoa(json));
    localStorage.setItem('peruacru.kni', json);
};


// -- HOOKUP VIEW COMPONENTS --

Play.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.init(scope);
    } else if (id === 'items:iteration') {
        this.initItem(component, scope);
    }
};

Play.prototype.initItem = function initItem(iteration, scope) {
    var item = iteration.value;
    item.iteration = iteration;
    item.slot = scope.components.slot;
    item.element = scope.components.item;
    item.element.classList.add(item.name);
    item.element.keyword = item.name;
    item.element.addEventListener('click', this);
};

Play.prototype.init = function init(scope) {
    var play = this;

    this.viewport = scope.components.viewport;
    this.stage = scope.components.stage;
    this.peruacru = scope.components.peruacru;
    this.narrative = scope.components.narrative;
    this.items = scope.components.items;

    for (var i = 0; i < stage.targets.length; i++) {
        var name = stage.targets[i];
        var target = scope.components[name];
        target.keyword = name;
        target.addEventListener('click', this);
    }

    this.peruacru.keyword = 'scene';
    this.peruacru.addEventListener('click', this);

    window.addEventListener('resize', this);

    var doc = new Document(scope.components.narrative, null, null);
    var engine = this.engine = new Engine({
        story: story,
        render: doc,
        dialog: doc,
        handler: this
    });

    doc.clear();

    var waypoint;
    var json;
    if (waypoint = window.location.hash || null) {
        try {
            waypoint = atob(waypoint.slice(1));
            waypoint = JSON.parse(waypoint);
        } catch (error) {
            console.error(error);
            waypoint = null;
        }
    } else if (json = localStorage.getItem('peruacru.kni')) {
        try {
            waypoint = JSON.parse(json);
        } catch (error) {
            console.error(error);
            waypoint = null;
        }
        window.history.replaceState(waypoint, '', '#' + btoa(json));
    }

    window.onpopstate = function onpopstate(event) {
        console.log('> back');
        engine.resume(event.state);
    };

    engine.resume(waypoint);

    window.onkeypress = function onkeypress(event) {
        var key = event.code;
        var match = /^Digit(\d+)$/.exec(key);
        if (match) {
            engine.answer(match[1]);
        } else if (key === 'KeyR') {
            engine.goto('start');
            engine.resume();
        } else if (key === 'KeyH' || key === 'KeyA') {
            play.go('west');
        } else if (key === 'KeyJ' || key === 'KeyS') {
            play.go('south');
        } else if (key === 'KeyK' || key === 'KeyW') {
            play.go('north');
        } else if (key === 'KeyL' || key === 'KeyD') {
            play.go('east');
        } else if (key === 'Space') {
            engine.answer('');
        }
    };

    window.onkeyup = function onkeyup(event) {
        var key = event.code;
        if (key === 'ArrowDown') {
            play.go('south');
        } else if (key === 'ArrowLeft') {
            play.go('west');
        } else if (key === 'ArrowRight') {
            play.go('east');
        } else if (key === 'ArrowUp') {
            play.go('north');
        }
    };
};

Play.prototype.go = function _go(answer) {
    var engine = this.engine;
    var went = false;
    if (
        engine.keywords[answer] == null &&
        engine.keywords[""] != null
    ) {
        engine.answer('');
        went = true;
    }
    if (engine.keywords[answer] != null) {
        engine.answer(answer);
        went = true;
    }
    return went;
};

Play.prototype.click = function click(answer) {
    var engine = this.engine;
    if (engine.keywords[answer] != null) {
        engine.answer(answer);
        return true;
    }
    return false;
};

// -- SYNCHRONIZE MODEL AND STAGE/INVENTORY --

Play.prototype.animate = function animate(action) {
    var next = this.tail.then(action);
    if (!next.then) {
        console.error('wat', this.tail.constructor.name, '->', next.constructor.name, action.constructor.name);
    }
    this.tail = next;
};

Play.prototype.updateItems = function updateItems() {
    this.dropItems();
    if (this.initialized) {
        this.takeItems();
    } else {
        this.initialized = true;
        this.retakeItems();
    }
};

Play.prototype.dropItems = function dropItems() {
    var animations = [];
    for (var i = 0; i < stage.items.length; i++) {
        var name = stage.items[i];
        var actual = this.inventory.count(name);
        var expected = this.engine.global.get(name.replace('-', '.'));
        while (expected < actual) {
            animations.push(this.inventory.drop(name));
            actual--;
        }
    }
    this.animate(new A.Parallel(animations));
};

Play.prototype.takeItems = function takeItems() {
    var animations = [];
    for (var i = 0; i < stage.items.length; i++) {
        var name = stage.items[i];
        var expected = this.engine.global.get(name.replace('-', '.'));
        var actual = this.inventory.count(name);
        while (expected > actual) {
            animations.push(this.inventory.take(name));
            actual++;
        }
    }
    this.animate(new A.Parallel(animations));
};

Play.prototype.retakeItems = function retakeItems() {
    for (var i = 0; i < stage.items.length; i++) {
        var name = stage.items[i];
        var actual = this.inventory.count(name);
        var expected = this.engine.global.get(name.replace('-', '.'));
        while (expected > actual) {
            this.inventory.retake(name);
            actual++;
        }
    }
};

Play.prototype.updateProps = function updateProps() {
    for (var i = 0; i < stage.props.length; i++) {
        var name = stage.props[i];
        var show = this.engine.global.get(name.replace('-', '.'));
        if (show) {
            this.inventory.showProp(name).act();
        } else {
            this.inventory.hideProp(name).act();
        }
    }
};

Play.prototype.end = function end(engine) {
    this.updateItems();
    this.updateProps();
};

Play.prototype.resetItems = function resetItems() {
    this.dropItems();
    this.retakeItems();
};

Play.prototype.addToScene = function (item) {
    this.items.value.push(item);
};

Play.prototype.removeFromScene = function (item) {
    this.items.value.swap(item.iteration.index, 1);
};

function SceneChange(main, source, target) {
    this.main = main;
    this.source = source;
    this.target = target;
}

SceneChange.prototype.act = function act() {
    var main = this.main;

    main.peruacru.classList.remove('at-' + stage.scenes[this.source]);
    main.narrative.classList.remove('at-' + stage.scenes[this.source]);

    main.peruacru.classList.add('at-' + stage.scenes[this.target]);
    main.narrative.classList.add('at-' + stage.scenes[this.target]);
};

}],["stage.js","peruacru","stage.js",{"./animation":16},function (require, exports, module, __filename, __dirname){

// peruacru/stage.js
// -----------------

'use strict';

var A = require('./animation');

exports.scenes = ['hills', 'jungle', 'beach', 'mountain'];

exports.items = [
    'airplane',
    'giant-airplane',
    'bamboo',
    'ballista',
    'brine-pumpkin',
    'brine-vial',
    'flower',
    'freshwater-pumpkin',
    'freshwater-vial',
    'growing-potion',
    'hammer',
    'mushroom',
    'paper',
    'pumpkin',
    'reed',
    'rock',
    'rubber',
    'sand-pumpkin',
    'sap-pumpkin',
    'slingshot',
    'shrinking-potion',
    'soaked-reed',
    'vial',
];

exports.props = [
    'homestead',
    'bridge',
    'lion',
    'cat',
    'tap',
    'placed-ballista',
    'launch-pad',
    'curtain',
];

exports.targets = exports.props.concat([
    'flowers',
    'stream',
    'pumpkins',
    'bamboos',
    'bridgewater',
    'mushrooms',
    'rubber-tree',
    'trail',
    'lava-flow',
    'corner',
    'reeds',
    'sea'
]);

exports.big = {
    'pumpkin': true,
    'freshwater-pumpkin': true,
    'sap-pumpkin': true,
    'sand-pumpkin': true,
    'brine-pumpkin': true,
    'ballista': true,
    'giant-airplane': true,
};

exports.triggers = {
    'fill pumpkin with fresh water': function () {
        return this.replace('pumpkin', 'freshwater-pumpkin');
    },
    'fill pumpkin with brine': function () {
        return this.replace('pumpkin', 'brine-pumpkin');
    },
    'fill pumpkin with sap': function () {
        return this.replace('pumpkin', 'sap-pumpkin');
    },
    'fill pumpkin with sand': function () {
        return this.replace('pumpkin', 'sand-pumpkin');
    },
    'spill freshwater pumpkin': function () {
        return this.replace('freshwater-pumpkin', 'pumpkin');
    },
    'spill sand pumpkin': function () {
        return this.replace('sand-pumpkin', 'pumpkin');
    },
    'spill sap from pumpkin': function () {
        return this.replace('sap-pumpkin', 'pumpkin');
    },
    'spill brine pumpkin': function () {
        return this.replace('brine-pumpkin', 'pumpkin');
    },
    'fill vial with brine': function () {
        return this.replace('vial', 'brine-vial');
    },
    'spill freshwater vial': function () {
        return this.replace('freshwater-vial', 'vial');
    },
    'spill brine vial': function () {
        return this.replace('brine-vial', 'vial');
    },
    'fill vial with freshwater': function () {
        return this.replace('vial', 'freshwater-vial');
    },
    'fill vial with brine from pumpkin': function () {
        return this.replace('vial', 'brine-vial');
    },
    'fill vial with freshwater from pumpkin': function () {
        return this.replace('vial', 'freshwater-vial');
    },
    'spill growing potion': function () {
        return this.replace('growing-potion', 'vial');
    },
    'spill shrinking potion': function () {
        return this.replace('shrinking-potion', 'vial');
    },
    'get reed': function () {
        return this.take('reed', 'over-reeds');
    },
    'store hammer': function () {
        return this.drop('hammer', 'over-homestead');
    },
    'retrieve hammer': function () {
        return this.take('hammer', 'over-homestead');
    },
    'store airplane': function () {
        return this.drop('airplane', 'over-homestead');
    },
    'retrieve airplane': function () {
        return this.take('airplane', 'over-homestead');
    },
    'grow homestead': function () {
        var pumpkin = this.move('freshwater-pumpkin', 'over-homestead');
        var flower = this.move('flower', 'over-homestead');
        return new A.Series([
            new A.Parallel([
                pumpkin.move,
                flower.move,
            ]),
            new A.Parallel([
                pumpkin.drop,
                flower.drop,
                this.showProp('homestead')
            ])
        ]);
    },
    'build bridge': function () {
        var moves = [];
        var drops = [];
        for (var i = 0; i < 3; i++) {
            var anim = this.move('bamboo', 'over-bridge');
            moves.push(anim.move);
            drops.push(anim.drop);
        }
        return new A.Series([
            new A.Parallel(moves),
            new A.Parallel(drops),
            this.showProp('bridge')
        ]);
    },
    'put ballista': function () {
        var ballista = this.move('ballista', 'over-ballista');
        return new A.Series([
            ballista.move,
            new A.Parallel([
                ballista.drop,
                this.showProp('placed-ballista')
            ])
        ]);
    },
    'mash reed': function () {
        return this.replace('soaked-reed', 'paper');
    },
    'make airplane': function () {
        return this.replace('paper', 'airplane');
    },
    'make shrinking potion': function () {
        var vial = this.replaceUtility('brine-vial', 'shrinking-potion');
        return new A.Series([
            this.drop('mushroom', vial.before.position),
            vial.animation,
        ]);
    },
    'make growing potion': function () {
        var vial = this.replaceUtility('freshwater-vial', 'growing-potion');
        return new A.Series([
            this.drop('flower', vial.before.position),
            vial.animation,
        ]);
    },
    'grow airplane': function () {
        return new A.Series([
            new A.Parallel([
                this.drop('airplane'),
                this.drop('growing-potion'),
            ]),
            new A.Parallel([
                this.take('giant-airplane'),
                this.take('vial'),
            ]),
        ]);
    },
    'launch': function () {
        return new A.Series([
            new A.Parallel([
                this.drop('shrinking-potion'),
                this.drop('shrinking-potion')
            ]),
            this.hideProp('giant-airplane'),
            this.showProp('curtain'),
        ])
    },
    'soak reeds in pumpkin': function () {
        return this.replace('reed', 'soaked-reed');
    },
    'put giant airplane on ballista': function () {
        var airplane = this.move('giant-airplane', 'over-ballista');
        return new A.Series([
            airplane.move,
            new A.Parallel([
                airplane.drop,
                this.hideProp('placed-ballista'),
                this.showProp('launch-pad')
            ])
        ]);
    },
    'give lion mushroom': function () {
        var mushroom = this.move('mushroom', 'over-lion');
        return new A.Series([
            mushroom.move,
            new A.Parallel([
                mushroom.drop,
                this.showProp('cat'),
                this.hideProp('lion')
            ])
        ]);
    },
    'tap rubber tree': function () {
        if (this.count('rock')) {
            return new A.Series([
                new A.Parallel([
                    this.drop('rock'),
                    this.drop('bamboo'),
                ]),
                this.showProp('tap'),
                this.take('rock')
            ]);
        } else {
            return new A.Series([
                new A.Parallel([
                    this.drop('hammer'),
                    this.drop('bamboo'),
                ]),
                this.showProp('tap'),
                this.take('hammer')
            ]);
        }
    },
};

}],["index.js","pop-observe","index.js",{"./observable-array":25,"./observable-object":27,"./observable-range":28,"./observable-map":26},function (require, exports, module, __filename, __dirname){

// pop-observe/index.js
// --------------------

"use strict";

require("./observable-array");
var Oa = require("./observable-array");
var Oo = require("./observable-object");
var Or = require("./observable-range");
var Om = require("./observable-map");

exports.makeArrayObservable = Oa.makeArrayObservable;

for (var name in Oo) {
    exports[name] = Oo[name];
}
for (var name in Or) {
    exports[name] = Or[name];
}
for (var name in Om) {
    exports[name] = Om[name];
}


}],["observable-array.js","pop-observe","observable-array.js",{"./observable-object":27,"./observable-range":28,"./observable-map":26,"pop-swap/swap":30},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-array.js
// -------------------------------

/*
 * Based in part on observable arrays from Motorola Mobility’s Montage
 * Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
 *
 * 3-Clause BSD License
 * https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
 */

/**
 * This module is responsible for observing changes to owned properties of
 * objects and changes to the content of arrays caused by method calls. The
 * interface for observing array content changes establishes the methods
 * necessary for any collection with observable content.
 */

var Oo = require("./observable-object");
var Or = require("./observable-range");
var Om = require("./observable-map");

var array_swap = require("pop-swap/swap");
var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;
var array_reverse = Array.prototype.reverse;
var array_sort = Array.prototype.sort;
var array_empty = [];

var observableArrayProperties = {

    swap: {
        value: function swap(start, minusLength, plus) {
            if (plus) {
                if (!Array.isArray(plus)) {
                    plus = array_slice.call(plus);
                }
            } else {
                plus = array_empty;
            }

            if (start < 0) {
                start = this.length + start;
            } else if (start > this.length) {
                var holes = start - this.length;
                var newPlus = Array(holes + plus.length);
                for (var i = 0, j = holes; i < plus.length; i++, j++) {
                    if (i in plus) {
                        newPlus[j] = plus[i];
                    }
                }
                plus = newPlus;
                start = this.length;
            }

            if (start + minusLength > this.length) {
                // Truncate minus length if it extends beyond the length
                minusLength = this.length - start;
            } else if (minusLength < 0) {
                // It is the JavaScript way.
                minusLength = 0;
            }

            var minus;
            if (minusLength === 0) {
                // minus will be empty
                if (plus.length === 0) {
                    // at this point if plus is empty there is nothing to do.
                    return []; // [], but spare us an instantiation
                }
                minus = array_empty;
            } else {
                minus = array_slice.call(this, start, start + minusLength);
            }

            var diff = plus.length - minus.length;
            var oldLength = this.length;
            var newLength = Math.max(this.length + diff, start + plus.length);
            var longest = Math.max(oldLength, newLength);
            var observedLength = Math.min(longest, this.observedLength);

            // dispatch before change events
            if (diff) {
                Oo.dispatchPropertyWillChange(this, "length", newLength, oldLength);
            }
            Or.dispatchRangeWillChange(this, plus, minus, start);
            if (diff === 0) {
                // Substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        Oo.dispatchPropertyWillChange(this, i, plus[j], minus[j]);
                        Om.dispatchMapWillChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < plus.length) {
                            if (plus[j] !== this[i]) {
                                Oo.dispatchPropertyWillChange(this, i, plus[j], this[i]);
                                Om.dispatchMapWillChange(this, "update", i, plus[j], this[i]);
                            }
                        } else {
                            if (this[i - diff] !== this[i]) {
                                Oo.dispatchPropertyWillChange(this, i, this[i - diff], this[i]);
                                Om.dispatchMapWillChange(this, "update", i, this[i - diff], this[i]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < plus.length) {
                            if (plus[j] !== void 0) {
                                Oo.dispatchPropertyWillChange(this, i, plus[j]);
                            }
                            Om.dispatchMapWillChange(this, "create", i, plus[j]);
                        } else {
                            if (this[i - diff] !== void 0) {
                                Oo.dispatchPropertyWillChange(this, i, this[i - diff]);
                            }
                            Om.dispatchMapWillChange(this, "create", i, this[i - diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (this[i] !== void 0) {
                            Oo.dispatchPropertyWillChange(this, i, void 0, this[i]);
                        }
                        Om.dispatchMapWillChange(this, "delete", i, void 0, this[i]);
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            // actual work
            array_swap(this, start, minusLength, plus);

            // dispatch after change events
            if (diff === 0) { // substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        Oo.dispatchPropertyChange(this, i, plus[j], minus[j]);
                        Om.dispatchMapChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                Oo.dispatchPropertyChange(this, i, this[i], minus[j]);
                                Om.dispatchMapChange(this, "update", i, this[i], minus[j]);
                            }
                        } else {
                            if (this[i] !== this[i + diff]) {
                                Oo.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                                Om.dispatchMapChange(this, "update", i, this[i], this[i + diff]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                Oo.dispatchPropertyChange(this, i, this[i], minus[j]);
                            }
                            Om.dispatchMapChange(this, "create", i, this[i], minus[j]);
                        } else {
                            if (this[i] !== this[i + diff]) {
                                Oo.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                            }
                            Om.dispatchMapChange(this, "create", i, this[i], this[i + diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (j < minus.length) {
                            if (minus[j] !== void 0) {
                                Oo.dispatchPropertyChange(this, i, void 0, minus[j]);
                            }
                            Om.dispatchMapChange(this, "delete", i, void 0, minus[j]);
                        } else {
                            if (this[i + diff] !== void 0) {
                                Oo.dispatchPropertyChange(this, i, void 0, this[i + diff]);
                            }
                            Om.dispatchMapChange(this, "delete", i, void 0, this[i + diff]);
                        }
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            Or.dispatchRangeChange(this, plus, minus, start);
            if (diff) {
                Oo.dispatchPropertyChange(this, "length", newLength, oldLength);
            }
        },
        writable: true,
        configurable: true
    },

    splice: {
        value: function splice(start, minusLength) {
            if (start > this.length) {
                start = this.length;
            }
            var result = this.slice(start, start + minusLength);
            this.swap.call(this, start, minusLength, array_slice.call(arguments, 2));
            return result;
        },
        writable: true,
        configurable: true
    },

    // splice is the array content change utility belt.  forward all other
    // content changes to splice so we only have to write observer code in one
    // place

    reverse: {
        value: function reverse() {
            var reversed = this.slice();
            reversed.reverse();
            this.swap(0, this.length, reversed);
            return this;
        },
        writable: true,
        configurable: true
    },

    sort: {
        value: function sort() {
            var sorted = this.slice();
            array_sort.apply(sorted, arguments);
            this.swap(0, this.length, sorted);
            return this;
        },
        writable: true,
        configurable: true
    },

    set: {
        value: function set(index, value) {
            this.swap(index, index >= this.length ? 0 : 1, [value]);
            return true;
        },
        writable: true,
        configurable: true
    },

    shift: {
        value: function shift() {
            if (this.length) {
                var result = this[0];
                this.swap(0, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    pop: {
        value: function pop() {
            if (this.length) {
                var result = this[this.length - 1];
                this.swap(this.length - 1, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    push: {
        value: function push(value) {
            this.swap(this.length, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    unshift: {
        value: function unshift(value) {
            this.swap(0, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    clear: {
        value: function clear() {
            this.swap(0, this.length);
        },
        writable: true,
        configurable: true
    }

};

var hiddenProperty = {
    value: null,
    enumerable: false,
    writable: true,
    configurable: true
};

var observableArrayOwnProperties = {
    observed: hiddenProperty,
    observedLength: hiddenProperty,

    propertyObservers: hiddenProperty,
    wrappedPropertyDescriptors: hiddenProperty,

    rangeChangeObservers: hiddenProperty,
    rangeWillChangeObservers: hiddenProperty,
    dispatchesRangeChanges: hiddenProperty,

    mapChangeObservers: hiddenProperty,
    mapWillChangeObservers: hiddenProperty,
    dispatchesMapChanges: hiddenProperty
};

// use different strategies for making arrays observable between Internet
// Explorer and other browsers.
var protoIsSupported = {}.__proto__ === Object.prototype;
var bestowObservableArrayProperties;
if (protoIsSupported) {
    var observableArrayPrototype = Object.create(Array.prototype, observableArrayProperties);
    bestowObservableArrayProperties = function (array) {
        array.__proto__ = observableArrayPrototype;
    };
} else {
    bestowObservableArrayProperties = function (array) {
        Object.defineProperties(array, observableArrayProperties);
    };
}

exports.makeArrayObservable = makeArrayObservable;
function makeArrayObservable(array) {
    if (array.observed) {
        return;
    }
    bestowObservableArrayProperties(array);
    Object.defineProperties(array, observableArrayOwnProperties);
    array.observedLength = 0;
    array.observed = true;
}

// For ObservableObject
exports.makePropertyObservable = makePropertyObservable;
function makePropertyObservable(array, index) {
    makeArrayObservable(array);
    if (~~index === index && index >= 0) { // Note: NaN !== NaN, ~~"foo" !== "foo"
        makeIndexObservable(array, index);
    }
}

// For ObservableRange
exports.makeRangeChangesObservable = makeRangeChangesObservable;
function makeRangeChangesObservable(array) {
    makeArrayObservable(array);
}

// For ObservableMap
exports.makeMapChangesObservable = makeMapChangesObservable;
function makeMapChangesObservable(array) {
    makeArrayObservable(array);
    makeIndexObservable(array, Infinity);
}

function makeIndexObservable(array, index) {
    if (index >= array.observedLength) {
        array.observedLength = index + 1;
    }
}


}],["observable-map.js","pop-observe","observable-map.js",{"./observable-array":25},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-map.js
// -----------------------------

"use strict";

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

module.exports = ObservableMap;
function ObservableMap() {
    throw new Error("Can't construct. ObservableMap is a mixin.");
}

ObservableMap.prototype.observeMapChange = function (handler, name, note, capture) {
    return observeMapChange(this, handler, name, note, capture);
};

ObservableMap.prototype.observeMapWillChange = function (handler, name, note) {
    return observeMapChange(this, handler, name, note, true);
};

ObservableMap.prototype.dispatchMapChange = function (type, key, plus, minus, capture) {
    return dispatchMapChange(this, type, key, plus, minus, capture);
};

ObservableMap.prototype.dispatchMapWillChange = function (type, key, plus, minus) {
    return dispatchMapWillChange(this, type, key, plus, minus, true);
};

ObservableMap.prototype.getMapChangeObservers = function (capture) {
    return getMapChangeObservers(this, capture);
};

ObservableMap.prototype.getMapWillChangeObservers = function () {
    return getMapChangeObservers(this, true);
};

ObservableMap.observeMapChange = observeMapChange;
function observeMapChange(object, handler, name, note, capture) {
    makeMapChangesObservable(object);
    var observers = getMapChangeObservers(object, capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new MapChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "MapChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapChange) {
            observer.handlerMethodName = "handleMapChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    } else {
        var methodName = "handle" + propertyName + "MapWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapWillChange) {
            observer.handlerMethodName = "handleMapWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableMap.observeMapWillChange = observeMapWillChange;
function observeMapWillChange(object, handler, name, note) {
    return observeMapChange(object, handler, name, note, true);
}

ObservableMap.dispatchMapChange = dispatchMapChange;
function dispatchMapChange(object, type, key, plus, minus, capture) {
    if (plus === minus) {
        return;
    }
    if (!dispatching) { // TODO && !debug?
        return startMapChangeDispatchContext(object, type, key, plus, minus, capture);
    }
    var observers = getMapChangeObservers(object, capture);
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(type, key, plus, minus);
    }
}

ObservableMap.dispatchMapWillChange = dispatchMapWillChange;
function dispatchMapWillChange(object, type, key, plus, minus) {
    return dispatchMapChange(object, type, key, plus, minus, true);
}

function startMapChangeDispatchContext(object, type, key, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchMapChange(object, type, key, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Map change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Map change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.clear();
        }
    }
}

function getMapChangeObservers(object, capture) {
    if (capture) {
        if (!object.mapWillChangeObservers) {
            object.mapWillChangeObservers = [];
        }
        return object.mapWillChangeObservers;
    } else {
        if (!object.mapChangeObservers) {
            object.mapChangeObservers = [];
        }
        return object.mapChangeObservers;
    }
}

function getMapWillChangeObservers(object) {
    return getMapChangeObservers(object, true);
}

function makeMapChangesObservable(object) {
    if (Array.isArray(object)) {
        Oa.makeMapChangesObservable(object);
    }
    if (object.makeMapChangesObservable) {
        object.makeMapChangesObservable();
    }
    object.dispatchesMapChanges = true;
}

function MapChangeObserver() {
    this.init();
}

MapChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

MapChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " map changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

MapChangeObserver.prototype.dispatch = function (type, key, plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, key, type, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, key, type, this.object);
    } else {
        throw new Error(
            "Can't dispatch map change for " + JSON.stringify(this.name) + " to " + handler +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

var Oa = require("./observable-array");

}],["observable-object.js","pop-observe","observable-object.js",{"./observable-array":25},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-object.js
// --------------------------------

/*jshint node: true*/
"use strict";

// XXX Note: exceptions thrown from handlers and handler cancelers may
// interfere with dispatching to subsequent handlers of any change in progress.
// It is unlikely that plans are recoverable once an exception interferes with
// change dispatch. The internal records should not be corrupt, but observers
// might miss an intermediate property change.

var owns = Object.prototype.hasOwnProperty;

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

// Reusable property descriptor
var hiddenValueProperty = {
    value: null,
    writable: true,
    enumerable: false,
    configurable: true
};

module.exports = ObservableObject;
function ObservableObject() {
    throw new Error("Can't construct. ObservableObject is a mixin.");
}

ObservableObject.prototype.observePropertyChange = function (name, handler, note, capture) {
    return observePropertyChange(this, name, handler, note, capture);
};

ObservableObject.prototype.observePropertyWillChange = function (name, handler, note) {
    return observePropertyWillChange(this, name, handler, note);
};

ObservableObject.prototype.dispatchPropertyChange = function (name, plus, minus, capture) {
    return dispatchPropertyChange(this, name, plus, minus, capture);
};

ObservableObject.prototype.dispatchPropertyWillChange = function (name, plus, minus) {
    return dispatchPropertyWillChange(this, name, plus, minus);
};

ObservableObject.prototype.getPropertyChangeObservers = function (name, capture) {
    return getPropertyChangeObservers(this, name, capture);
};

ObservableObject.prototype.getPropertyWillChangeObservers = function (name) {
    return getPropertyWillChangeObservers(this, name);
};

ObservableObject.prototype.makePropertyObservable = function (name) {
    return makePropertyObservable(this, name);
};

ObservableObject.prototype.preventPropertyObserver = function (name) {
    return preventPropertyObserver(this, name);
};

ObservableObject.prototype.PropertyChangeObserver = PropertyChangeObserver;

// Constructor interface with polymorphic delegation if available

ObservableObject.observePropertyChange = function (object, name, handler, note, capture) {
    if (object.observePropertyChange) {
        return object.observePropertyChange(name, handler, note, capture);
    } else {
        return observePropertyChange(object, name, handler, note, capture);
    }
};

ObservableObject.observePropertyWillChange = function (object, name, handler, note) {
    if (object.observePropertyWillChange) {
        return object.observePropertyWillChange(name, handler, note);
    } else {
        return observePropertyWillChange(object, name, handler, note);
    }
};

ObservableObject.dispatchPropertyChange = function (object, name, plus, minus, capture) {
    if (object.dispatchPropertyChange) {
        return object.dispatchPropertyChange(name, plus, minus, capture);
    } else {
        return dispatchPropertyChange(object, name, plus, minus, capture);
    }
};

ObservableObject.dispatchPropertyWillChange = function (object, name, plus, minus) {
    if (object.dispatchPropertyWillChange) {
        return object.dispatchPropertyWillChange(name, plus, minus);
    } else {
        return dispatchPropertyWillChange(object, name, plus, minus);
    }
};

ObservableObject.makePropertyObservable = function (object, name) {
    if (object.makePropertyObservable) {
        return object.makePropertyObservable(name);
    } else {
        return makePropertyObservable(object, name);
    }
};

ObservableObject.preventPropertyObserver = function (object, name) {
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
};

// Implementation

function observePropertyChange(object, name, handler, note, capture) {
    ObservableObject.makePropertyObservable(object, name);
    var observers = getPropertyChangeObservers(object, name, capture);

    var observer;
    if (observerFreeList.length) { // TODO && !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new PropertyChangeObserver();
    }

    observer.object = object;
    observer.propertyName = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;
    observer.value = object[name];

    // Precompute dispatch method names.

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var specificChangeMethodName = "handle" + propertyName + "PropertyChange";
        var genericChangeMethodName = "handlePropertyChange";
        if (handler[specificChangeMethodName]) {
            observer.handlerMethodName = specificChangeMethodName;
        } else if (handler[genericChangeMethodName]) {
            observer.handlerMethodName = genericChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    } else {
        var specificWillChangeMethodName = "handle" + propertyName + "PropertyWillChange";
        var genericWillChangeMethodName = "handlePropertyWillChange";
        if (handler[specificWillChangeMethodName]) {
            observer.handlerMethodName = specificWillChangeMethodName;
        } else if (handler[genericWillChangeMethodName]) {
            observer.handlerMethodName = genericWillChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    }

    observers.push(observer);

    // TODO issue warnings if the number of handler records exceeds some
    // concerning quantity as a harbinger of a memory leak.
    // TODO Note that if this is garbage collected without ever being called,
    // it probably indicates a programming error.
    return observer;
}

function observePropertyWillChange(object, name, handler, note) {
    return observePropertyChange(object, name, handler, note, true);
}

function dispatchPropertyChange(object, name, plus, minus, capture) {
    if (!dispatching) { // TODO && !debug?
        return startPropertyChangeDispatchContext(object, name, plus, minus, capture);
    }
    var observers = getPropertyChangeObservers(object, name, capture).slice();
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(plus, minus);
    }
}

function dispatchPropertyWillChange(object, name, plus, minus) {
    dispatchPropertyChange(object, name, plus, minus, true);
}

function startPropertyChangeDispatchContext(object, name, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchPropertyChange(object, name, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Property change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Property change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.length = 0;
        }
    }
}

function getPropertyChangeObservers(object, name, capture) {
    if (!object.propertyObservers) {
        hiddenValueProperty.value = Object.create(null);
        Object.defineProperty(object, "propertyObservers", hiddenValueProperty);
    }
    var observersByKey = object.propertyObservers;
    var phase = capture ? "WillChange" : "Change";
    var key = name + phase;
    if (!Object.prototype.hasOwnProperty.call(observersByKey, key)) {
        observersByKey[key] = [];
    }
    return observersByKey[key];
}

function getPropertyWillChangeObservers(object, name) {
    return getPropertyChangeObservers(object, name, true);
}

function PropertyChangeObserver() {
    this.init();
    // Object.seal(this); // Maybe one day, this won't deoptimize.
}

PropertyChangeObserver.prototype.init = function () {
    this.object = null;
    this.propertyName = null;
    // Peer observers, from which to pluck itself upon cancelation.
    this.observers = null;
    // On which to dispatch property change notifications.
    this.handler = null;
    // Precomputed handler method name for change dispatch
    this.handlerMethodName = null;
    // Returned by the last property change notification, which must be
    // canceled before the next change notification, or when this observer is
    // finally canceled.
    this.childObserver = null;
    // For the discretionary use of the user, perhaps to track why this
    // observer has been created, or whether this observer should be
    // serialized.
    this.note = null;
    // Whether this observer dispatches before a change occurs, or after
    this.capture = null;
    // The last known value
    this.value = null;
};

PropertyChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.propertyName) + " on " + this.object +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

PropertyChangeObserver.prototype.dispatch = function (plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    if (minus === void 0) {
        minus = this.value;
    }
    this.value = plus;

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }
    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, this.propertyName, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, this.propertyName, this.object);
    } else {
        throw new Error(
            "Can't dispatch " + JSON.stringify(handlerMethodName) + " property change on " + object +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

function makePropertyObservable(object, name) {
    if (Array.isArray(object)) {
        return Oa.makePropertyObservable(object, name);
    }

    var wrappedDescriptor = wrapPropertyDescriptor(object, name);

    if (!wrappedDescriptor) {
        return;
    }

    var thunk;
    // in both of these new descriptor variants, we reuse the wrapped
    // descriptor to either store the current value or apply getters
    // and setters. this is handy since we can reuse the wrapped
    // descriptor if we uninstall the observer. We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ("value" in wrappedDescriptor) {
        thunk = makeValuePropertyThunk(name, wrappedDescriptor);
    } else { // "get" or "set", but not necessarily both
        thunk = makeGetSetPropertyThunk(name, wrappedDescriptor);
    }

    Object.defineProperty(object, name, thunk);
}

/**
 * Prevents a thunk from being installed on a property, assuming that the
 * underlying type will dispatch the change manually, or intends the property
 * to stick on all instances.
 */
function preventPropertyObserver(object, name) {
    var wrappedDescriptor = wrapPropertyDescriptor(object, name);
    Object.defineProperty(object, name, wrappedDescriptor);
}

function wrapPropertyDescriptor(object, name) {
    // Arrays are special. We do not support direct setting of properties
    // on an array. instead, call .set(index, value). This is observable.
    // "length" property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.
    if (Array.isArray(object)) {
        return;
    }

    if (!Object.isExtensible(object, name)) {
        return;
    }

    var wrappedDescriptor = getPropertyDescriptor(object, name);
    var wrappedPrototype = wrappedDescriptor.prototype;

    var existingWrappedDescriptors = wrappedPrototype.wrappedPropertyDescriptors;
    if (existingWrappedDescriptors && owns.call(existingWrappedDescriptors, name)) {
        return;
    }

    var wrappedPropertyDescriptors = object.wrappedPropertyDescriptors;
    if (!wrappedPropertyDescriptors) {
        wrappedPropertyDescriptors = {};
        hiddenValueProperty.value = wrappedPropertyDescriptors;
        Object.defineProperty(object, "wrappedPropertyDescriptors", hiddenValueProperty);
    }

    if (owns.call(wrappedPropertyDescriptors, name)) {
        // If we have already recorded a wrapped property descriptor,
        // we have already installed the observer, so short-here.
        return;
    }

    if (!wrappedDescriptor.configurable) {
        return;
    }

    // Memoize the descriptor so we know not to install another layer. We
    // could use it to uninstall the observer, but we do not to avoid GC
    // thrashing.
    wrappedPropertyDescriptors[name] = wrappedDescriptor;

    // Give up *after* storing the wrapped property descriptor so it
    // can be restored by uninstall. Unwritable properties are
    // silently not overriden. Since success is indistinguishable from
    // failure, we let it pass but don't waste time on intercepting
    // get/set.
    if (!wrappedDescriptor.writable && !wrappedDescriptor.set) {
        return;
    }

    // If there is no setter, it is not mutable, and observing is moot.
    // Manual dispatch may still apply.
    if (wrappedDescriptor.get && !wrappedDescriptor.set) {
        return;
    }

    return wrappedDescriptor;
}

function getPropertyDescriptor(object, name) {
    // walk up the prototype chain to find a property descriptor for the
    // property name.
    var descriptor;
    var prototype = object;
    do {
        descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (descriptor) {
            break;
        }
        prototype = Object.getPrototypeOf(prototype);
    } while (prototype);
    if (descriptor) {
        descriptor.prototype = prototype;
        return descriptor;
    } else {
        // or default to an undefined value
        return {
            prototype: object,
            value: undefined,
            enumerable: false,
            writable: true,
            configurable: true
        };
    }
}

function makeValuePropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            return state[name];
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            if (plus === state[name]) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            wrappedDescriptor.value = plus;
            state[name] = plus;

            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function makeGetSetPropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            if (wrappedDescriptor.get) {
                return wrappedDescriptor.get.apply(this, arguments);
            }
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (state[name] === plus) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            // call through to actual setter
            if (wrappedDescriptor.set) {
                wrappedDescriptor.set.apply(this, arguments);
                state[name] = plus;
            }

            // use getter, if possible, to adjust the plus value if the setter
            // adjusted it, for example a setter for an array property that
            // retains the original array and replaces its content, or a setter
            // that coerces the value to an expected type.
            if (wrappedDescriptor.get) {
                plus = wrappedDescriptor.get.apply(this, arguments);
            }

            // dispatch the new value: the given value if there is
            // no getter, or the actual value if there is one
            // TODO spec
            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function initState(object) {
    Object.defineProperty(object, "__state__", {
        value: {
            __this__: object
        },
        writable: true,
        enumerable: false,
        configurable: true
    });
}

var Oa = require("./observable-array");

}],["observable-range.js","pop-observe","observable-range.js",{"./observable-array":25},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-range.js
// -------------------------------

/*global -WeakMap*/
"use strict";

// TODO review all error messages for consistency and helpfulness across observables

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

module.exports = ObservableRange;
function ObservableRange() {
    throw new Error("Can't construct. ObservableRange is a mixin.");
}

ObservableRange.prototype.observeRangeChange = function (handler, name, note, capture) {
    return observeRangeChange(this, handler, name, note, capture);
};

ObservableRange.prototype.observeRangeWillChange = function (handler, name, note) {
    return observeRangeChange(this, handler, name, note, true);
};

ObservableRange.prototype.dispatchRangeChange = function (plus, minus, index, capture) {
    return dispatchRangeChange(this, plus, minus, index, capture);
};

ObservableRange.prototype.dispatchRangeWillChange = function (plus, minus, index) {
    return dispatchRangeChange(this, plus, minus, index, true);
};

ObservableRange.prototype.getRangeChangeObservers = function (capture) {
};

ObservableRange.prototype.getRangeWillChangeObservers = function () {
    return getRangeChangeObservers(this, true);
};

ObservableRange.observeRangeChange = observeRangeChange;
function observeRangeChange(object, handler, name, note, capture) {
    makeRangeChangesObservable(object);
    var observers = getRangeChangeObservers(object, capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new RangeChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "RangeChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeChange) {
            observer.handlerMethodName = "handleRangeChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    } else {
        var methodName = "handle" + propertyName + "RangeWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeWillChange) {
            observer.handlerMethodName = "handleRangeWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableRange.observeRangeWillChange = observeRangeWillChange;
function observeRangeWillChange(object, handler, name, note) {
    return observeRangeChange(object, handler, name, note, true);
}

ObservableRange.dispatchRangeChange = dispatchRangeChange;
function dispatchRangeChange(object, plus, minus, index, capture) {
    if (!dispatching) { // TODO && !debug?
        return startRangeChangeDispatchContext(object, plus, minus, index, capture);
    }
    var observers = getRangeChangeObservers(object, capture);
    for (var observerIndex = 0; observerIndex < observers.length; observerIndex++) {
        var observer = observers[observerIndex];
        // The slicing ensures that handlers cannot interfere with another by
        // altering these arguments.
        observer.dispatch(plus.slice(), minus.slice(), index);
    }
}

ObservableRange.dispatchRangeWillChange = dispatchRangeWillChange;
function dispatchRangeWillChange(object, plus, minus, index) {
    return dispatchRangeChange(object, plus, minus, index, true);
}

function startRangeChangeDispatchContext(object, plus, minus, index, capture) {
    dispatching = true;
    try {
        dispatchRangeChange(object, plus, minus, index, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Range change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Range change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            if (observerToFreeList.clear) {
                observerToFreeList.clear();
            } else {
                observerToFreeList.length = 0;
            }
        }
    }
}

function makeRangeChangesObservable(object) {
    if (Array.isArray(object)) {
        Oa.makeRangeChangesObservable(object);
    }
    if (object.makeRangeChangesObservable) {
        object.makeRangeChangesObservable();
    }
    object.dispatchesRangeChanges = true;
}

function getRangeChangeObservers(object, capture) {
    if (capture) {
        if (!object.rangeWillChangeObservers) {
            object.rangeWillChangeObservers = [];
        }
        return object.rangeWillChangeObservers;
    } else {
        if (!object.rangeChangeObservers) {
            object.rangeChangeObservers = [];
        }
        return object.rangeChangeObservers;
    }
}

/*
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
*/

function RangeChangeObserver() {
    this.init();
}

RangeChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

RangeChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " range changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

RangeChangeObserver.prototype.dispatch = function (plus, minus, index) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, index, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, index, this.object);
    } else {
        throw new Error(
            "Can't dispatch range change to " + handler
        );
    }

    this.childObserver = childObserver;

    return this;
};

var Oa = require("./observable-array");

}],["pop-swap.js","pop-swap","pop-swap.js",{"./swap":30},function (require, exports, module, __filename, __dirname){

// pop-swap/pop-swap.js
// --------------------

"use strict";

var swap = require("./swap");

module.exports = polymorphicSwap;
function polymorphicSwap(array, start, minusLength, plus) {
    if (typeof array.swap === "function") {
        array.swap(start, minusLength, plus);
    } else {
        swap(array, start, minusLength, plus);
    }
}


}],["swap.js","pop-swap","swap.js",{},function (require, exports, module, __filename, __dirname){

// pop-swap/swap.js
// ----------------

"use strict";

// Copyright (C) 2014 Montage Studio
// https://github.com/montagejs/collections/blob/7c674d49c04955f01bbd2839f90936e15aceea2f/operators/swap.js

var array_slice = Array.prototype.slice;

module.exports = swap;
function swap(array, start, minusLength, plus) {
    // Unrolled implementation into JavaScript for a couple reasons.
    // Calling splice can cause large stack sizes for large swaps. Also,
    // splice cannot handle array holes.
    if (plus) {
        if (!Array.isArray(plus)) {
            plus = array_slice.call(plus);
        }
    } else {
        plus = Array.empty;
    }

    if (start < 0) {
        start = array.length + start;
    } else if (start > array.length) {
        array.length = start;
    }

    if (start + minusLength > array.length) {
        // Truncate minus length if it extends beyond the length
        minusLength = array.length - start;
    } else if (minusLength < 0) {
        // It is the JavaScript way.
        minusLength = 0;
    }

    var diff = plus.length - minusLength;
    var oldLength = array.length;
    var newLength = array.length + diff;

    if (diff > 0) {
        // Head Tail Plus Minus
        // H H H H M M T T T T
        // H H H H P P P P T T T T
        //         ^ start
        //         ^-^ minus.length
        //           ^ --> diff
        //         ^-----^ plus.length
        //             ^------^ tail before
        //                 ^------^ tail after
        //                   ^ start iteration
        //                       ^ start iteration offset
        //             ^ end iteration
        //                 ^ end iteration offset
        //             ^ start + minus.length
        //                     ^ length
        //                   ^ length - 1
        for (var index = oldLength - 1; index >= start + minusLength; index--) {
            var offset = index + diff;
            if (index in array) {
                array[offset] = array[index];
            } else {
                // Oddly, PhantomJS complains about deleting array
                // properties, unless you assign undefined first.
                array[offset] = void 0;
                delete array[offset];
            }
        }
    }
    for (var index = 0; index < plus.length; index++) {
        if (index in plus) {
            array[start + index] = plus[index];
        } else {
            array[start + index] = void 0;
            delete array[start + index];
        }
    }
    if (diff < 0) {
        // Head Tail Plus Minus
        // H H H H M M M M T T T T
        // H H H H P P T T T T
        //         ^ start
        //         ^-----^ length
        //         ^-^ plus.length
        //             ^ start iteration
        //                 ^ offset start iteration
        //                     ^ end
        //                         ^ offset end
        //             ^ start + minus.length - plus.length
        //             ^ start - diff
        //                 ^------^ tail before
        //             ^------^ tail after
        //                     ^ length - diff
        //                     ^ newLength
        for (var index = start + plus.length; index < oldLength - diff; index++) {
            var offset = index - diff;
            if (offset in array) {
                array[index] = array[offset];
            } else {
                array[index] = void 0;
                delete array[index];
            }
        }
    }
    array.length = newLength;
}


}],["index.js","raf","index.js",{"performance-now":15},function (require, exports, module, __filename, __dirname){

// raf/index.js
// ------------

var now = require('performance-now')
  , root = typeof window === 'undefined' ? global : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function(object) {
  if (!object) {
    object = root;
  }
  object.requestAnimationFrame = raf
  object.cancelAnimationFrame = caf
}

}],["dom.js","wizdom","dom.js",{},function (require, exports, module, __filename, __dirname){

// wizdom/dom.js
// -------------

"use strict";

module.exports = Document;
function Document(namespace) {
    this.doctype = null;
    this.documentElement = null;
    this.namespaceURI = namespace || "";
}

Document.prototype.nodeType = 9;
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Comment = Comment;
Document.prototype.Attr = Attr;
Document.prototype.NamedNodeMap = NamedNodeMap;

Document.prototype.createTextNode = function (text) {
    return new this.TextNode(this, text);
};

Document.prototype.createComment = function (text) {
    return new this.Comment(this, text);
};

Document.prototype.createElement = function (type, namespace) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createElementNS = function (namespace, type) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createAttribute = function (name, namespace) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

Document.prototype.createAttributeNS = function (namespace, name) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

function Node(document) {
    this.ownerDocument = document;
    this.parentNode = null;
    this.firstChild = null;
    this.lastChild = null;
    this.previousSibling = null;
    this.nextSibling = null;
}

Node.prototype.appendChild = function appendChild(childNode) {
    return this.insertBefore(childNode, null);
};

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (!childNode) {
        throw new Error("Can't insert null child");
    }
    if (childNode.ownerDocument !== this.ownerDocument) {
        throw new Error("Can't insert child from foreign document");
    }
    if (childNode.parentNode) {
        childNode.parentNode.removeChild(childNode);
    }
    var previousSibling;
    if (nextSibling) {
        previousSibling = nextSibling.previousSibling;
    } else {
        previousSibling = this.lastChild;
    }
    if (previousSibling) {
        previousSibling.nextSibling = childNode;
    }
    if (nextSibling) {
        nextSibling.previousSibling = childNode;
    }
    childNode.nextSibling = nextSibling;
    childNode.previousSibling = previousSibling;
    childNode.parentNode = this;
    if (!nextSibling) {
        this.lastChild = childNode;
    }
    if (!previousSibling) {
        this.firstChild = childNode;
    }
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove null child");
    }
    var parentNode = childNode.parentNode;
    if (parentNode !== this) {
        throw new Error("Can't remove node that is not a child of parent");
    }
    if (childNode === parentNode.firstChild) {
        parentNode.firstChild = childNode.nextSibling;
    }
    if (childNode === parentNode.lastChild) {
        parentNode.lastChild = childNode.previousSibling;
    }
    if (childNode.previousSibling) {
        childNode.previousSibling.nextSibling = childNode.nextSibling;
    }
    if (childNode.nextSibling) {
        childNode.nextSibling.previousSibling = childNode.previousSibling;
    }
    childNode.previousSibling = null;
    childNode.parentNode = null;
    childNode.nextSibling = null;
    return childNode;
};

function TextNode(document, text) {
    Node.call(this, document);
    this.data = text;
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

function Comment(document, text) {
    Node.call(this, document);
    this.data = text;
}

Comment.prototype = Object.create(Node.prototype);
Comment.prototype.constructor = Comment;
Comment.prototype.nodeType = 8;

function Element(document, type, namespace) {
    Node.call(this, document);
    this.tagName = type;
    this.namespaceURI = namespace;
    this.attributes = new this.ownerDocument.NamedNodeMap();
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

Element.prototype.hasAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return !!attr;
};

Element.prototype.getAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return attr ? attr.value : null;
};

Element.prototype.setAttribute = function (name, value, namespace) {
    var attr = this.ownerDocument.createAttribute(name, namespace);
    attr.value = value;
    this.attributes.setNamedItem(attr, namespace);
};

Element.prototype.removeAttribute = function (name, namespace) {
    this.attributes.removeNamedItem(name, namespace);
};

Element.prototype.hasAttributeNS = function (namespace, name) {
    return this.hasAttribute(name, namespace);
};

Element.prototype.getAttributeNS = function (namespace, name) {
    return this.getAttribute(name, namespace);
};

Element.prototype.setAttributeNS = function (namespace, name, value) {
    this.setAttribute(name, value, namespace);
};

Element.prototype.removeAttributeNS = function (namespace, name) {
    this.removeAttribute(name, namespace);
};

function Attr(ownerDocument, name, namespace) {
    this.ownerDocument = ownerDocument;
    this.name = name;
    this.value = null;
    this.namespaceURI = namespace;
}

Attr.prototype.nodeType = 2;

function NamedNodeMap() {
    this.length = 0;
}

NamedNodeMap.prototype.getNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    return this[key];
};

NamedNodeMap.prototype.setNamedItem = function (attr) {
    var namespace = attr.namespaceURI || "";
    var name = attr.name;
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var previousAttr = this[key];
    if (!previousAttr) {
        this[this.length] = attr;
        this.length++;
        previousAttr = null;
    }
    this[key] = attr;
    return previousAttr;
};

NamedNodeMap.prototype.removeNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var attr = this[key];
    if (!attr) {
        throw new Error("Not found");
    }
    var index = Array.prototype.indexOf.call(this, attr);
    delete this[key];
    delete this[index];
    this.length--;
};

NamedNodeMap.prototype.item = function (index) {
    return this[index];
};

NamedNodeMap.prototype.getNamedItemNS = function (namespace, name) {
    return this.getNamedItem(name, namespace);
};

NamedNodeMap.prototype.setNamedItemNS = function (attr) {
    return this.setNamedItem(attr);
};

NamedNodeMap.prototype.removeNamedItemNS = function (namespace, name) {
    return this.removeNamedItem(name, namespace);
};

}]])("peruacru/index.js")