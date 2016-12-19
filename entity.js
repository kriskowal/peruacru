'use strict';

module.exports = Entity;

function Entity(body, scope) {
    this.name = null;
    this.scene = null;
}

Entity.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.element = scope.components.element;
        this.label = scope.components.label;
        this.element.addEventListener('click', this);
        this.element.addEventListener('dragstart', this);
        this.element.addEventListener('dragover', this);
        this.element.addEventListener('dragenter', this);
        this.element.addEventListener('dragleave', this);
        this.element.addEventListener('drop', this);
        this.element.addEventListener('dragend', this);
    }
};

Entity.prototype.setAttribute = function setAttribute(key, value) {
    if (key === 'name') {
        this.name = value;
        this.label.value = value.replace(/^inventory /, '');
        this.scene.named[value] = this;
    } else if (key === 'class') {
        this.element.classList.add(value);
    } else if (key === 'draggable') {
        this.element.setAttribute('draggable', value);
    }
};

Entity.prototype.handleEvent = function handleEvent(event) {
    if (event.type === 'dragstart') {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.setData('text/plain', this.name);
    } else if (event.type === 'dragover' || event.type === 'dragenter') {
        event.preventDefault();
        event.stopPropagation();
    } else if (event.type === 'dragend') {
        event.preventDefault();
        event.stopPropagation();
        var name = event.dataTransfer.getData('text/plain');
        this.scene.drop(this.name);
        return false;
    } else if (event.type === 'drop') {
        event.preventDefault();
        event.stopPropagation();
        var name = event.dataTransfer.getData('text/plain');
        if (name) {
            this.scene.drag(name, this.name);
        } else {
            this.scene.drop(this.name);
        }
    } else if (event.type === 'click') {
        event.preventDefault();
        event.stopPropagation();
        this.scene.click(this.name);
    }
};
