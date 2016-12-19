'use strict';
exports.translate = function (module) {
    var text = module.text;
    var table = text.split('\n')
        .filter(Boolean)
        .map(function (line) {return line.split(',');});
    module.text = 'module.exports = ' + JSON.stringify(table);
    module.extension = 'js';
}
