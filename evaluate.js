"use strict";
exports.__esModule = true;
exports.astString = exports.evaluate = void 0;
function evaluate(exp, data) {
    switch (exp.type) {
        case "expression":
            return "(".concat(evaluate(exp.left, data), " ").concat(exp.operator.value, " ").concat(evaluate(exp.right, data), ")");
        case 'var':
            var v = exp.value;
            var d = data[v];
            if (!d) {
                throw new Error("\u672A\u627E\u5230".concat(v, " \u5BF9\u5E94\u7684\u6570\u636E"));
            }
            return "".concat(d.prop, " ").concat(d.operator, " ").concat(transform(d.value));
        default:
            return "";
    }
}
exports.evaluate = evaluate;
function astString(exp) {
    switch (exp.type) {
        case "expression":
            return "(".concat(astString(exp.left), " ").concat(exp.operator.value, " ").concat(astString(exp.right), ")");
        case 'var':
            return exp.value;
        default:
            return "";
    }
}
exports.astString = astString;
function transform(d) {
    if (Array.isArray(d)) {
        return "(".concat(d.join(","), ")");
    }
    if (typeof d === 'string') {
        return "\"".concat(d, "\"");
    }
    return d;
}
