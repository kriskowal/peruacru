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
];

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
