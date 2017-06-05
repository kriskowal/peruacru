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
        this.boyRight = this.girlsLeft = this.boy = this.girl = after;
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
        this.component.classList.add('show-prop');
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
        this.component.classList.remove('show-prop');
        return new A.AwaitTransitionEnd(this.component, 'hide prop').act();
    }
    return A.idle;
};
