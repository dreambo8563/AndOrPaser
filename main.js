"use strict";
exports.__esModule = true;
var evaluate_1 = require("./evaluate");
var parser_1 = require("./parser");
var r = "(规则3 and (规则1 and 规则2) and 规则4)";
var l = "((规则3 and 规则1) and 规则2)";
var s = '(规则1 and 规则2)';
// 词法解析 example
// while (!t.eof()) {
//   console.log('  t.next :>> ',   t.next());
// }
// parse(TokenStream(InputStream(s)))
// parse(TokenStream(InputStream(l)))
// parse(TokenStream(InputStream(r)))
// parse(TokenStream(InputStream()))
// parser(s)
// parser(r)
// parser(l)
var data = {
    "规则3": {
        prop: "level",
        operator: "in",
        value: [1, 2, 3]
    },
    "规则1": {
        prop: "workcode",
        operator: "=",
        value: "076533"
    },
    "规则2": {
        prop: "department_ids",
        operator: "!=",
        value: "D011111"
    },
    "规则4": {
        prop: "department_ids",
        operator: "=",
        value: "D22222"
    },
    "规则5": {
        prop: "age",
        operator: ">=",
        value: 18
    },
    "规则6": {
        prop: "isManager",
        operator: "=",
        value: 1
    }
};
var ast = (0, parser_1["default"])("((规则3 and 规则1) AND (规则2 or 规则4) or (规则5 and  规则6))");
// console.log('ast :>> ', JSON.stringify(ast,null,2));
console.log((0, evaluate_1.astString)(ast));
console.log((0, evaluate_1.evaluate)(ast, data));
