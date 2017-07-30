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
