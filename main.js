'use strict';

var Engine = require('kni/engine');
var Story = require('kni/story');
var Document = require('kni/document');
var story = require('./peruacru.json');
var Point2 = require('ndim/point2');
var Region2 = require('ndim/region2');
var A = require('./animation');

var aspectBias = 1.5;

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
    'bridge',
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
        return new A.Parallel([
            this.replace('shrinking-potion', 'vial'),
            this.replace('shrinking-potion', 'vial')
        ]);
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
        return new A.Series([
            new A.Parallel([
                this.drop('rock'),
                this.drop('bamboo'),
            ]),
            this.showProp('tap'),
            this.take('rock')
        ]);
    },
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
    this.props = {};

    this.tail = A.idle;
}

Main.prototype.animate = function animate(action) {
    var next = this.tail.then(action);
    if (!next.then) {
        console.error('wat', this.tail.constructor.name, '->', next.constructor.name, action.constructor.name);
    }
    this.tail = next;
};

Main.prototype.take = function (name, over) {
    console.log('take', name);
    var item = this.createItem(name);
    this.retain(item);
    this.addToScene(item);
    this.addToInventory(item);
    item.element.classList.add(over || 'trash');
    return new A.Series([
        new A.AwaitDraw(),
        new A.AwaitDraw(),
        new A.AddClass(item.element, 'item-show'),
        new A.AddClass(item.element, 'item-store'),
        new A.AddClass(item.slot, item.position),
        new A.RemoveClass(item.element, over || 'trash'),
        new A.AwaitTransitionEnd(item.element)
    ]);
};

Main.prototype.retake = function (name) {
    console.log('retake', name);
    var item = this.createItem(name);
    this.retain(item);
    this.addToScene(item);
    this.addToInventory(item);
    item.element.classList.add('item-store', 'item-show');
    item.slot.classList.add(item.position);
};

Main.prototype.drop = function (name, over) {
    console.log('drop', name);
    var item = this.popFromInventory(name);
    this.release(item);
    return new A.Series([
        new A.RemoveClass(item.element, 'item-show'),
        new A.RemoveClass(item.element, 'item-store'),
        new A.AddClass(item.element, over || 'trash'),
        new A.RemoveClass(item.slot, item.position),
        new A.AwaitTransitionEnd(item.element),
        new RemoveFromScene(this, item)
    ]);
};

Main.prototype.move = function (name, over) {
    console.log('move', name, over);
    var item = this.popFromInventory(name);
    this.release(item);
    return {
        move: new A.Series([
            new A.RemoveClass(item.element, 'item-store'),
            new A.AddClass(item.element, over),
            new A.RemoveClass(item.slot, item.position),
            new A.AwaitTransitionEnd(item.element),
        ]),
        drop: new A.Series([
            new A.AwaitDraw(),
            new A.RemoveClass(item.element, 'item-show'),
            new A.AwaitTransitionEnd(item.element),
            new RemoveFromScene(this, item)
        ])
    };
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

Main.prototype.retain1 = function retain1(item) {
    if (this.boyLeft == null) {
        this.boyLeft = item;
        this.boy = item;
        item.position = 'slot-0';
        return 'slot-0';
    } else if (this.boyRight == null) {
        this.boyRight = item;
        this.boy = item;
        item.position = 'slot-1';
        return 'slot-1';
    } else if (this.girlRight == null) {
        this.girlRight = item;
        this.girl = item;
        item.position = 'slot-3';
        return 'slot-3';
    } else if (this.girlLeft == null) {
        this.girlLeft = item;
        this.girl = item;
        item.position = 'slot-2';
        return 'slot-2';
    } else {
        console.error('retain1 failure');
    }
};

Main.prototype.retain2 = function retain2(item) {
    if (this.boy == null) {
        this.boyLeft = item;
        this.boyRight = item;
        this.boy = item;
        item.position = 'slot-0-1';
        return 'slot-0-1';
    } else if (this.girl == null) {
        this.girlLeft = item;
        this.girlRight = item;
        this.girl = item;
        item.position = 'slot-2-3';
        return 'slot-2-3';
    } else if (this.boyRight == null && this.girlLeft == null) {
        this.girl = item;
        this.boy = item;
        this.girlLeft = item;
        this.boyRight = item;
        item.position = 'slot-1-2';
        return 'slot-1-2';
    } else if (this.boyRight != null) {
        // TODO these cases are dubious in correctness, since they adjust
        // positions without triggering move animations or CSS adjustments.
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

Main.prototype.release = function release(item) {
    var name = item.name;
    if (big[name]) {
        this.release2(item);
    } else {
        this.release1(item);
    }
};

Main.prototype.release1 = function release1(item) {
    var position = item.position;
    if (position === 'slot-0') {
        this.boyLeft = null;
        this.boy = this.boyRight;
        return 'slot-0';
    } else if (position === 'slot-1') {
        this.boyRight = null;
        this.boy = this.boyLeft;
        return 'slot-1';
    } else if (position === 'slot-2') {
        this.girlLeft = null;
        this.girl = this.girlRight;
        return 'slot-2';
    } else if (position === 'slot-3') {
        this.girlRight = null;
        this.girl = this.girlLeft;
        return 'slot-3';
    }
};

Main.prototype.release2 = function release2(item) {
    var position = item.position;
    if (position === 'slot-0-1') {
        this.boy = null;
        this.boyLeft = null;
        this.boyRight = null;
        return 'slot-0-1';
    } else if (position === 'slot-1-2') {
        this.girlLeft = null;
        this.girl = this.girlRight;
        this.boyRight = null;
        this.boy = this.boyLeft;
        return 'slot-2-3';
    } else if (position === 'slot-2-3') {
        this.girl = null;
        this.girlLeft = null;
        this.girlRight = null;
        return 'slot-2-3';
    }
};

Main.prototype.replace = function replace(beforeName, afterName) {
    return this.replaceUtility(beforeName, afterName).animation;
};

Main.prototype.replaceUtility = function (beforeName, afterName) {
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
        this.boyRight = this.girlsLeft = this.boy = this.girl = after;
    } else if (after.position === 'slot-2-3') {
        this.girlLeft = this.girlRight = this.girl = after;
    }

    this.addToInventory(after);
    return {
        before: before,
        after: after,
        animation: new Replace(this, before, after, before.position)
    };
};

function Replace(main, before, after, position) {
    this.main = main;
    this.before = before;
    this.after = after;
    this.position = position;
}

Replace.prototype.act = function act() {
    this.main.addToScene(this.after);
    this.after.element.classList.add('item-store');
    this.after.slot.classList.add(this.position);
    return new A.Series([
        new A.AwaitDraw(),
        new A.AddClass(this.after.element, 'item-show'),
        new A.AwaitTransitionEnd(this.after.element),
        new RemoveFromScene(this.main, this.before)
    ]).act();
};

Main.prototype.measure = function measure() {
    this.viewportSize.x = window.innerWidth;
    this.viewportSize.y = window.innerHeight;
    this.animator.requestDraw();
};

Main.prototype.draw = function draw() {
    this.frameSize.copyFrom(this.sceneSize);
    if (this.viewportSize.x > this.viewportSize.y * aspectBias) {
        this.frameSize.x *= aspectBias;
        this.narrative.classList.remove('portrait');
        this.viewport.classList.remove('portrait');
    } else {
        this.frameSize.y += 714;
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

Main.prototype.answer = function _answer(answer, engine) {
};

Main.prototype.choice = function _choice(choice, engine) {
    var keywords = choice.keywords;
    console.log('> ' + keywords.join(', '));
    for (var i = 0; i < keywords.length; i++) {
        var keyword = choice.keywords[i];
        if (triggers[keyword]) {
            this.animate(triggers[keyword].call(this) || A.idle);
            return;
        }
    }
};

Main.prototype.ask = function ask(engine) {
    var at = engine.global.get('at');
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

function SceneChange(main, source, target) {
    this.main = main;
    this.source = source;
    this.target = target;
}

SceneChange.prototype.act = function act() {
    console.log('scene change');
    var main = this.main;
    main.peruacru.classList.remove('at-' + scenes[this.source]);
    main.narrative.classList.remove('at-' + scenes[this.source]);
    main.peruacru.classList.add('at-' + scenes[this.target]);
    main.narrative.classList.add('at-' + scenes[this.target]);
};

Main.prototype.end = function end(engine) {
    this.updateItems();
    this.updateProps();
};

Main.prototype.resetItems = function resetItems() {
    this.dropItems();
    this.retakeItems();
};

Main.prototype.updateItems = function updateItems() {
    this.dropItems();
    if (this.initialized) {
        this.takeItems();
    } else {
        this.initialized = true;
        this.retakeItems();
    }
};

Main.prototype.dropItems = function dropItems() {
    var animations = [];
    for (var i = 0; i < items.length; i++) {
        var name = items[i];
        var actual = this.count(name);
        var expected = this.engine.global.get(name.replace('-', '.'));
        while (expected < actual) {
            animations.push(this.drop(name));
            actual--;
        }
    }
    this.animate(new A.Parallel(animations));
};

Main.prototype.takeItems = function takeItems() {
    var animations = [];
    for (var i = 0; i < items.length; i++) {
        var name = items[i];
        var actual = this.count(name);
        var expected = this.engine.global.get(name.replace('-', '.'));
        while (expected > actual) {
            animations.push(this.take(name));
            actual++;
        }
    }
    this.animate(new A.Parallel(animations));
};

Main.prototype.retakeItems = function retakeItems() {
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

Main.prototype.updateProps = function updateProps() {
    for (var i = 0; i < props.length; i++) {
        var name = props[i];
        var show = this.engine.global.get(name.replace('-', '.'));
        if (show) {
            A.idle.then(this.showProp(name));
        } else {
            A.idle.then(this.hideProp(name));
        }
    }
};

Main.prototype.showProp = function (prop) {
    if (!this.props[prop]) {
        this.props[prop] = true;
        return new ShowProp(this.scope.components[prop]);
    }
    return A.noop;
};

function ShowProp(component) {
    this.component = component;
}

ShowProp.prototype.act = function act() {
    if (!this.component.classList.contains('show-prop')) {
        this.component.classList.add('show-prop');
        return new A.AwaitTransitionEnd(this.component).act();
    }
    return A.idle;
};

Main.prototype.hideProp = function (prop) {
    if (this.props[prop]) {
        this.props[prop] = false;
        return new HideProp(this.scope.components[prop]);
    }
    return A.noop;
};

function HideProp(component) {
    this.component = component;
}

HideProp.prototype.act = function act() {
    if (this.component.classList.contains('show-prop')) {
        this.component.classList.remove('show-prop');
        return new A.AwaitTransitionEnd(this.component).act();
    }
    return A.idle;
};

Main.prototype.count = function (name) {
    if (!this.inventory[name]) {
        return 0;
    }
    return this.inventory[name].length;
};

Main.prototype.waypoint = function (waypoint) {
    var json = JSON.stringify(waypoint);
    window.history.pushState(waypoint, '', '#' + btoa(json));
    localStorage.setItem('peruacru.kni', json);
};

Main.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.init(scope);
    } else if (id === 'items:iteration') {
        this.initItem(component, scope);
    }
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

Main.prototype.initItem = function initItem(iteration, scope) {
    var item = iteration.value;
    item.iteration = iteration;
    item.slot = scope.components.slot;
    item.element = scope.components.item;
    item.element.classList.add(item.name);
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

function RemoveFromScene(main, item) {
    this.main = main;
    this.item = item;
}

RemoveFromScene.prototype.act = function act() {
    this.main.removeFromScene(this.item);
};
