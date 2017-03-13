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
function AwaitTransitionEnd(element) {
    this.element = element;
    this.wait = new Wait();
    this.timeout = null;
}

AwaitTransitionEnd.prototype.act = function act() {
    var self = this;
    if (this.element == null) {
        return;
    }
    this.element.addEventListener('transitionend', this);
    // console.log('wait for transition', this.element.className);
    this.timeout = setTimeout(function onTimeout() {
        self.handleEvent();
    }, timeout);
    return this.wait;
};

AwaitTransitionEnd.prototype.handleEvent = function handleEvent() {
    // console.log('transition end', this.element.className);
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
function AddClass(element, className) {
    this.element = element;
    this.className = className;
}

AddClass.prototype.act = function act() {
    if (this.element != null) {
        this.element.classList.add(this.className);
    }
};

exports.RemoveClass = RemoveClass;
function RemoveClass(element, className) {
    this.element = element;
    this.className = className;
}

RemoveClass.prototype.act = function act() {
    if (this.element != null) {
        this.element.classList.remove(this.className);
    }
};

exports.Mark = Mark;
function Mark(/*...args*/) {
    this.message = Array.prototype.join.call(arguments, ' ');
}

Mark.prototype.act = function act() {
    console.log(this.message);
    return idle;
};
