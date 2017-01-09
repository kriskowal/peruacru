'use strict';

var Engine = require('kni/engine');
var Story = require('kni/story');
var Document = require('./document');
var story = require('./peruacru.json');
var Point2 = require('ndim/point2');

module.exports = Main;

var scenes = ['hills', 'jungle', 'beach', 'mountain'];

function Main(body, scope) {
    this.engine = null;
    this.at = -1;
    this.animator = scope.animator.add(this);
    this.animator.requestMeasure();
    this.viewport = null;
    this.viewportSize = new Point2();
    this.viewportCenter = new Point2();
    this.frame = null;
    this.frameSize = new Point2(1024, 714);
    this.frameOffset = new Point2();
    this.frameScale = new Point2();
}

Main.prototype.measure = function measure() {
    this.viewportSize.x = window.innerWidth;
    this.viewportSize.y = window.innerHeight;
    this.animator.requestDraw();
};

Main.prototype.draw = function draw() {
    this.viewportCenter.copyFrom(this.viewportSize).scaleThis(0.5);
    this.frameScale.copyFrom(this.viewportSize).divThis(this.frameSize);
    var frameScale = Math.min(this.frameScale.x, this.frameScale.y);
    this.frameOffset.copyFrom(this.viewportSize).scaleThis(1/frameScale).subThis(this.frameSize).scaleThis(0.5).roundThis();
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
    }
};

Main.prototype.answer = function answer(answer, engine) {
    console.log('>', answer);
};

Main.prototype.ask = function ask(engine) {
    var at = engine.global.get('at');
    if (this.at !== at) {
        this.at = at;
        document.body.className = 'at-' + scenes[at];
        this.peruacru.className = 'peruacru at-' + scenes[at];
        this.narrative.className = 'narrative at-' + scenes[at];
    }
};

Main.prototype.waypoint = function (waypoint) {
    var json = JSON.stringify(waypoint);
    window.history.pushState(waypoint, '', '#' + btoa(json));
    localStorage.setItem('peruacru.kni', json);
};

Main.prototype.init = function init(scope) {
    this.viewport = scope.components.viewport;
    this.peruacru = scope.components.peruacru;
    this.narrative = scope.components.narrative;

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
        }
    };
};
