'use strict';

var Engine = require('kni/engine');
var Story = require('kni/story');
var Document = require('./document');
var story = require('./peruacru.json');
var Point2 = require('ndim/point2');
var Region2 = require('ndim/region2');

module.exports = Main;

var scenes = ['hills', 'jungle', 'beach', 'mountain'];

var items = [
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

var props = [
    'homestead',
    'lion',
    'cat',
    'tap',
    'placed-ballista',
    'launch-pad',
];

var big = {
    'pumpkin': true,
    'freshwater-pumpkin': true,
    'sap-pumpkin': true,
    'sand-pumpkin': true,
    'brine-pumpkin': true,
    'ballista': true,
    'giant-airplane': true,
};

var triggers = {
    'fill pumpkin with fresh water': function () {
        this.replace('pumpkin', 'freshwater-pumpkin');
    },
    'fill pumpkin with brine': function () {
        this.replace('pumpkin', 'brine-pumpkin');
    },
    'fill pumpkin with sap': function () {
        this.replace('pumpkin', 'sap-pumpkin');
    },
    'fill pumpkin with sand': function () {
        this.replace('pumpkin', 'sand-pumpkin');
    },
    'spill freshwater pumpkin': function () {
        this.replace('freshwater-pumpkin', 'pumpkin');
    },
    'spill sand pumpkin': function () {
        this.replace('sand-pumpkin', 'pumpkin');
    },
    'spill sap from pumpkin': function () {
        this.replace('sap-pumpkin', 'pumpkin');
    },
    'spill brine pumpkin': function () {
        this.replace('brine-pumpkin', 'pumpkin');
    },
    'fill vial with brine': function () {
        this.replace('vial', 'brine-vial');
    },
    'spill freshwater vial': function () {
        this.replace('freshwater-vial', 'vial');
    },
    'spill brine vial': function () {
        this.replace('brine-vial', 'vial');
    },
    'fill vial with freshwater': function () {
        this.replace('vial', 'freshwater-vial');
    },
    'fill vial with brine from pumpkin': function () {
        this.replace('vial', 'brine-vial');
    },
    'fill vial with freshwater from pumpkin': function () {
        this.replace('vial', 'freshwater-vial');
    },
    'grow homestead': function () {
        this.drop('freshwater-pumpkin');
        this.drop('flower');
        // TODO reveal homestead
    },
    'put ballista': function () {
        this.drop('ballista');
        // TODO animate ballista to launch pad and reveal launch pad.
    },
    'put giant airplane on ballista': function () {
        this.drop('giant-airplane');
        // TODO animate airplane onto ballista
    },
    'mash reed': function () {
        this.replace('soaked-reed', 'paper');
    },
    'make airplane': function () {
        this.replace('paper', 'airplane');
    },
    'make shrinking potion': function () {
        this.drop('mushroom');
        this.replace('brine-vial', 'shrinking-potion');
    },
    'make growing potion': function () {
        this.drop('flower');
        this.replace('freshwater-vial', 'growing-potion');
    },
    'grow airplane': function () {
        this.drop('airplane');
        this.take('giant-airplane');
        this.replace('growing-potion', 'vial');
    },
    'launch': function () {
        this.replace('shrinking-potion', 'vial');
        this.replace('shrinking-potion', 'vial');
    }
};

function Item(name, main) {
    this.main = main;
    this.name = name;
    this.position = null;
    this.element = null;
    this.iteration = null;
}

function Main(body, scope) {
    this.engine = null;
    this.at = -1;
    this.animator = scope.animator.add(this);
    this.animator.requestMeasure();
    this.viewport = null;
    this.viewportSize = new Point2();
    this.viewportCenter = new Point2();
    this.sceneSize = new Point2(1024, 842);
    this.frame = null;
    this.frameSize = new Point2();
    this.frameOffset = new Point2();
    this.frameScale = new Point2();
    this.narrativeRegion = new Region2(new Point2(), new Point2());

    // Inventory slots
    this.boyLeft = null;
    this.boyRight = null;
    this.boy = null;
    this.girlLeft = null;
    this.girlRight = null;
    this.girl = null;

    // Inventory contents
    this.inventory = {};
}

Main.prototype.take = function (name) {
    console.log('take', name);
    var item = this.createItem(name);
    this.retain(item);
    this.addToScene(item);
    this.addToInventory(item);
};

Main.prototype.retake = function (name) {
    console.log('retake', name);
    var item = this.createItem(name);
    this.retain(item);
    this.addToScene(item);
    this.addToInventory(item);
};

Main.prototype.drop = function (name) {
    console.log('drop', name);
    var item = this.popFromInventory(name);
    this.release(item);
    this.removeFromScene(item);
};

Main.prototype.replace = function (beforeName, afterName) {
    var before = this.popFromInventory(beforeName);
    var after = this.createItem(afterName);

    after.position = before.position;
    if (after.position == 'item-0') {
        this.boyLeft = this.boy = after;
    } else if (after.position === 'item-1') {
        this.boyRight = this.boy = after;
    } else if (after.position === 'item-2') {
        this.girlLeft = this.girl = after;
    } else if (after.position === 'item-3') {
        this.girlRight = this.girl = after;
    } else if (after.position === 'item-0-1') {
        this.boyLeft = this.boyRight = this.boy = after;
    } else if (after.position === 'item-1-2') {
        this.boyRight = this.girlsLeft = this.boy = this.girl = after;
    } else if (after.position === 'item-2-3') {
        this.girlLeft = this.girlRight = this.girl = after;
    }

    this.addToInventory(after);
    this.removeFromScene(before);
    this.addToScene(after);
};

Main.prototype.count = function (name) {
    if (!this.inventory[name]) {
        return 0;
    }
    return this.inventory[name].length;
};

Main.prototype.createItem = function (name) {
    var item = new Item(name, this);
    return item;
};

Main.prototype.addToInventory = function (item) {
    var name = item.name;
    if (!this.inventory[name]) {
        this.inventory[name] = [];
    }
    this.inventory[name].push(item);
};

Main.prototype.popFromInventory = function (name) {
    return this.inventory[name].pop();
};

Main.prototype.addToScene = function (item) {
    this.items.value.push(item);
};

Main.prototype.removeFromScene = function (item) {
    this.items.value.swap(item.iteration.index, 1);
};

Main.prototype.retain = function retain(item) {
    var name = item.name;
    if (big[name]) {
        this.retain2(item);
    } else {
        this.retain1(item);
    }
};

Main.prototype.release = function release(item) {
    var name = item.name;
    if (big[name]) {
        this.release2(item);
    } else {
        this.release1(item);
    }
};

Main.prototype.retain1 = function retain1(item) {
    if (this.boyLeft == null) {
        this.boyLeft = item;
        this.boy = item;
        item.position = 'item-0';
        return 'item-0';
    } else if (this.boyRight == null) {
        this.boyRight = item;
        this.boy = item;
        item.position = 'item-1';
        return 'item-1';
    } else if (this.girlRight == null) {
        this.girlRight = item;
        this.girl = item;
        item.position = 'item-3';
        return 'item-3';
    } else if (this.girlLeft == null) {
        this.girlLeft = item;
        this.girl = item;
        item.position = 'item-2';
        return 'item-2';
    } else {
        console.error('retain1 failure');
    }
};

Main.prototype.release1 = function release1(item) {
    var position = item.position;
    item.position = null;
    if (position === 'item-0') {
        this.boyLeft = null;
        this.boy = this.boyRight;
        return 'item-0';
    } else if (position === 'item-1') {
        this.boyRight = null;
        this.boy = this.boyLeft;
        return 'item-1';
    } else if (position === 'item-2') {
        this.girlLeft = null;
        this.girl = this.girlRight;
        return 'item-2';
    } else if (position === 'item-3') {
        this.girlRight = null;
        this.girl = this.girlLeft;
        return 'item-3';
    }
};

Main.prototype.retain2 = function retain2(item) {
    if (this.boy == null) {
        this.boyLeft = item;
        this.boyRight = item;
        this.boy = item;
        item.position = 'item-0-1';
        return 'item-0-1';
    } else if (this.girl == null) {
        this.girlLeft = item;
        this.girlRight = item;
        this.girl = item;
        item.position = 'item-2-3';
        return 'item-2-3';
    } else if (this.boyRight == null && this.girlLeft == null) {
        this.girl = item;
        this.boy = item;
        this.girlLeft = item;
        this.boyRight = item;
        item.position = 'item-1-2';
        return 'item-1-2';
    } else if (this.boyRight != null) {
        var move = this.boyRight;
        this.removeFromScene(move);
        this.release(move);
        this.retain2(item);
        this.retain(move);
        this.addToScene(move);
    } else if (this.girlLeft != null) {
        var move = this.girlLeft;
        this.removeFromScene(move);
        this.release(move);
        this.retain2(item);
        this.retain(move);
        this.addToScene(move);
    } else {
        console.error('retain2 failure');
    }
};

Main.prototype.release2 = function release2(item) {
    var position = item.position;
    item.position = null;
    if (position === 'item-0-1') {
        this.boy = null;
        this.boyLeft = null;
        this.boyRight = null;
        return 'item-0-1';
    } else if (position === 'item-1-2') {
        this.girlLeft = null;
        this.girl = this.girlRight;
        this.boyRight = null;
        this.boy = this.boyLeft;
        return 'item-2-3';
    } else if (position === 'item-2-3') {
        this.girl = null;
        this.girlLeft = null;
        this.girlRight = null;
        return 'item-2-3';
    }
};

Main.prototype.measure = function measure() {
    this.viewportSize.x = window.innerWidth;
    this.viewportSize.y = window.innerHeight;
    this.animator.requestDraw();
};

Main.prototype.draw = function draw() {
    this.frameSize.copyFrom(this.sceneSize);
    if (this.viewportSize.x > this.viewportSize.y * 1.5) {
        this.frameSize.x *= 3/2;
        this.narrative.classList.remove('portrait');
        this.viewport.classList.remove('portrait');
    } else {
        this.frameSize.y *= 2;
        this.narrative.classList.add('portrait');
        this.viewport.classList.add('portrait');
    }
    this.viewportCenter
        .copyFrom(this.viewportSize)
        .scaleThis(0.5);
    this.frameScale
        .copyFrom(this.viewportSize)
        .divThis(this.frameSize);
    var frameScale = Math.min(this.frameScale.x, this.frameScale.y);
    this.frameOffset
        .copyFrom(this.viewportSize)
        .scaleThis(1/frameScale)
        .subThis(this.frameSize)
        .scaleThis(0.5)
        .roundThis();
    this.viewport.style.transform = (
        'scale(' + frameScale + ', ' + frameScale + ') ' +
        'translate(' + this.frameOffset.x + 'px, ' + this.frameOffset.y + 'px)'
    );
};

Main.prototype.handleEvent = function handleEvent(event) {
    if (event.type === 'resize') {
        this.animator.requestMeasure();
    }
};

Main.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.init(scope);
    } else if (id === 'items:iteration') {
        this.initItem(component, scope);
    }
};

Main.prototype.answer = function _answer(answer, engine) {
};

Main.prototype.choice = function _choice(choice, engine) {
    var keywords = choice.keywords;
    console.log('> ' + keywords.join(', '));
    for (var i = 0; i < keywords.length; i++) {
        var keyword = choice.keywords[i];
        if (triggers[keyword]) {
            triggers[keyword].call(this);
            return;
        }
    }
};

Main.prototype.ask = function ask(engine) {
    var at = engine.global.get('at');
    if (this.at !== at) {
        this.peruacru.classList.remove('at-' + scenes[this.at]);
        this.narrative.classList.remove('at-' + scenes[this.at]);
        this.at = at;
        this.peruacru.classList.add('at-' + scenes[this.at]);
        this.narrative.classList.add('at-' + scenes[this.at]);
    }
    this.updateItems();
    this.updateProps();
};

Main.prototype.end = function end(engine) {
    this.updateItems();
    this.updateProps();
};

Main.prototype.resetItems = function resetItems() {
    for (var i = 0; i < items.length; i++) {
        var name = items[i];
        var actual = this.count(name);
        var expected = this.engine.global.get(name.replace('-', '.'));
        while (expected < actual) {
            this.drop(name);
            actual--;
        }
    }
    for (var i = 0; i < items.length; i++) {
        var name = items[i];
        var actual = this.count(name);
        var expected = this.engine.global.get(name.replace('-', '.'));
        while (expected > actual) {
            this.retake(name);
            actual++;
        }
    }
};

Main.prototype.updateItems = function updateItems() {
    for (var i = 0; i < items.length; i++) {
        var name = items[i];
        var actual = this.count(name);
        var expected = this.engine.global.get(name.replace('-', '.'));
        while (expected < actual) {
            this.drop(name);
            actual--;
        }
    }
    for (var i = 0; i < items.length; i++) {
        var name = items[i];
        var actual = this.count(name);
        var expected = this.engine.global.get(name.replace('-', '.'));
        while (expected > actual) {
            this.take(name);
            actual++;
        }
    }
};

Main.prototype.updateProps = function updateProps() {
    for (var i = 0; i < props.length; i++) {
        var name = props[i];
        var show = this.engine.global.get(name.replace('-', '.'));
        this.scope.components[name].style.display = show ? 'block' : 'none';
    }
};

Main.prototype.waypoint = function (waypoint) {
    var json = JSON.stringify(waypoint);
    window.history.pushState(waypoint, '', '#' + btoa(json));
    localStorage.setItem('peruacru.kni', json);
};

Main.prototype.init = function init(scope) {
    var main = this;

    this.viewport = scope.components.viewport;
    this.peruacru = scope.components.peruacru;
    this.narrative = scope.components.narrative;
    this.items = scope.components.items;

    window.addEventListener('resize', this);

    var doc = new Document(scope.components.narrative);
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

    this.resetItems();

    window.onkeypress = function onkeypress(event) {
        var key = event.code;
        var match = /^Digit(\d+)$/.exec(key);
        if (match) {
            engine.answer(match[1]);
        } else if (key === 'KeyR') {
            engine.resume();
        } else if (key === 'KeyH' || key === 'KeyA') {
            main.go('west');
        } else if (key === 'KeyJ' || key === 'KeyS') {
            main.go('south');
        } else if (key === 'KeyK' || key === 'KeyW') {
            main.go('north');
        } else if (key === 'KeyL' || key === 'KeyD') {
            main.go('east');
        } else if (key === 'Space') {
            engine.answer('');
        }
    };

    window.onkeyup = function onkeyup(event) {
        var key = event.code;
        if (key === 'ArrowDown') {
            main.go('south');
        } else if (key === 'ArrowLeft') {
            main.go('west');
        } else if (key === 'ArrowRight') {
            main.go('east');
        } else if (key === 'ArrowUp') {
            main.go('north');
        }
    };
};

Main.prototype.go = function _go(answer) {
    var engine = this.engine;
    if (
        engine.keywords[answer] == null &&
        engine.keywords[""] != null
    ) {
        engine.answer('');
    }
    engine.answer(answer);
};

Main.prototype.initItem = function initItem(iteration, scope) {
    var item = iteration.value;
    item.iteration = iteration;
    item.element = scope.components.item;
    item.element.classList.add(item.position);
    item.element.classList.add(item.name);
};
