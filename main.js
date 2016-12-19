'use strict';

var Engine = require('kni/engine');
var Story = require('kni/story');
var Document = require('kni/document');
var story = require('./peruacru.json');
var Entity = require('./entity.html');
var Point2 = require('ndim/point2');

var actions = require('./actions.csv');

module.exports = Main;

var scenes = ['hills', 'jungle', 'beach', 'mountain'];
var sceneOffsets = {
    hills: {x: 0, y: 0},
    jungle: {x: 0, y: -600},
    beach: {x: -600, y: -600},
    mountain: {x: -600, y: 0}
};

var inventory = [
    "bamboo",
    "flower",
    "freshwater.pumpkin",
    "brine.pumpkin",
    "mushroom",
    "pumpkin",
    "reed",
    "soaked.reed",
    "rock",
    "rubber",
    "sand.pumpkin",
    "sap.pumpkin",
    "shrinking.potion",
    "growing.potion",
    "slingshot",
    "vial",
    "brine.vial",
    "freshwater.vial",
    "hammer",
    "paper",
    "airplane",
    "ballista"
];

function Mode(scene) {
    this.scene = scene;
}

function Main(body, scope) {
    this.engine = null;
    this.entities = [];
    this.named = {};
    this.scenes = {};
    this.at = -1;
    this.chain = Promise.resolve();
    this.mode = new Mode(this);
    this.animator = scope.animator.add(this);
    this.animator.requestMeasure();
    this.viewportSize = new Point2();
    this.viewportCenter = new Point2();
    this.frameSize = new Point2();
    this.frameOffset = new Point2();
}

Main.prototype.measure = function measure() {
    if (this.viewport) {
        this.viewportSize.x = this.viewport.offsetWidth;
        this.viewportSize.y = Math.max(0, this.viewport.offsetHeight - 125);
        this.animator.requestDraw();
    }
};

Main.prototype.draw = function draw() {
    this.viewportCenter.copyFrom(this.viewportSize).scaleThis(0.5);
    this.frameSize.copyFrom(this.viewportSize);
    this.frameSize.x = this.frameSize.y = Math.min(this.frameSize.x, this.frameSize.y);
    this.frameOffset.copyFrom(this.frameSize).scaleThis(-0.5).addThis(this.viewportCenter);
    this.frameScale = this.frameSize.x / 600;
    this.frame.style.transform = (
        'translate(' + this.frameOffset.x + 'px, ' + this.frameOffset.y + 'px) ' +
        'scale(' + this.frameScale + ', ' + this.frameScale + ') '
    );
};

Main.prototype.advance = function advance(mode) {
    if (mode) {
        this.mode = mode;
        return true;
    }
    return false;
};

Main.prototype.handleEvent = function handleEvent(event) {
    console.log('event', event.type);
    if (event.type === 'click') {
        // target is viewport
        this.engine.answer("");
    } else if (event.type === 'resize') {
        this.animator.requestMeasure();
    }
};

Main.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.init(scope);
    } else if (id === 'inventory') {
        this.inventory = component;
    } else if (scenes.indexOf(id) >= 0) {
        this.scenes[id] = component;
    } else if (id === 'items') {
        this.items = component;
    } else if (id === 'items:iteration') {
        var entity = scope.components.item;
        this.entities.push(entity);
        entity.scene = this;
        entity.inventory = true;
        entity.setAttribute('name', component.value);
        entity.setAttribute('draggable', 'true');
    }
    if (component instanceof Entity) {
        this.entities.push(component);
        component.scene = this;
    }
};

Main.prototype.answer = function answer(answer, engine) {
    console.log('>', answer);
};

Main.prototype.click = function click(keyword) {
    console.log('click', keyword);
    for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        if (action[1] === 'click' && (action[2] || action[0]) === keyword) {
            console.log('clicked', action[0]);
            if (this.engine.keywords[action[2]]) {
                this.engine.answer(action[2]);
            }
            this.engine.answer(action[0]);
            break;
        }
    }
};

Main.prototype.drag = function drag(source, target) {
    console.log('drag', source, target);
    for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        if (action[1] === 'drag' && action[2] === source && action[3] === target) {
            console.log('dragged', action[0]);
            this.engine.answer(action[0]);
            break;
        }
    }
};

Main.prototype.drop = function drop(name) {
    for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        if (action[1] === 'drop' && action[2] === name) {
            console.log('dropped', action[0]);
            this.engine.answer(action[0]);
            break;
        }
    }
};

Main.prototype.ask = function ask(engine) {
    var at = engine.global.get('at');
    if (this.at !== at) {
        this.at = at;
        for (var i = 0; i < scenes.length; i++) {
            var scene = this.scenes[scenes[i]];
            if (at === i) {
                scene.style.opacity = '1';
            } else {
                scene.style.opacity = '0';
            }
        }
        console.log('SCENE', scenes[at], scene);
        this.peruacru.className = 'peruacru at-' + scenes[at];
    }
    console.log('keywords', Object.keys(engine.keywords));
    for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        var type = action[1];
        if (type === 'drag') {
            var subject = action[2];
            var object = action[3];
            if (this.named[subject]) {
                this.named[subject].element.style.display = 'block';
            }
            if (this.named[object]) {
                this.named[object].element.style.display = 'block';
            }
        } else if (type === 'drop' || type === 'click') {
            var subject = action[2];
            if (this.named[subject]) {
                this.named[subject].element.style.display = 'block';
            }
        }
    }
    var items = [];
    for (var i = 0; i < inventory.length; i++) {
        var name = inventory[i];
        var count = engine.global.get(name);
        for (var j = 0; j < count; j++) {
            items.push('inventory ' + name.replace(/\./g, ' '));
        }
    }
    this.items.value.swap(0, this.items.value.length, items);
};

Main.prototype.waypoint = function (waypoint) {
    var json = JSON.stringify(waypoint);
    window.history.pushState(waypoint, '', '#' + btoa(json));
    localStorage.setItem('peruacru.kni', json);
};

Main.prototype.init = function init(scope) {

    window.addEventListener('resize', this);

    this.viewport = scope.components.viewport;
    this.viewport.addEventListener('click', this);

    this.frame = scope.components.frame;

    this.peruacru = scope.components.peruacru;

    var keywords = scope.components.keywords;

    var reset = scope.components.reset;
    reset.onclick = function onclick() {
        engine.resume();
    };

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
        }
    };
};
