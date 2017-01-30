'use strict';

var A = require('./animation');

A.delay(1000).then({act: function () {
    console.log('A');
    return A.delay(1000, 20).then({act: function (twenty) {
        console.log('B', twenty, 20);
        return new A.Idle(10);
    }});
}}).then({act: function (ten) {
    console.log('C', ten, 10);
    return A.delay(1000, 30).then({act: function (thirty) {
        console.log('D', 30, thirty);
        return A.delay(1000);
    }});
}});

