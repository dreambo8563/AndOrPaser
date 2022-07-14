"use strict";
exports.__esModule = true;
exports.parse = void 0;
// 字符串 -> 字符流
function InputStream(input) {
    var len = input.length;
    var pos = 0;
    return {
        next: next,
        peek: peek,
        eof: eof,
        croak: croak
    };
    function next() {
        //获取下一个字符
        return input.charAt(pos++);
    }
    function peek() {
        // 获取当前字符
        return input.charAt(pos);
    }
    function eof() {
        // 是否已经结束
        return pos >= len;
    }
    function croak(msg) {
        // 错误
        throw new Error(msg);
    }
}
// 字符流转换为 token 流 词法分析 将字符串形式的代码转换为一个语法片段数组 Tokens
function TokenStream(input) {
    var current = null;
    var keywords = " or and ";
    return {
        next: next,
        peek: peek,
        eof: eof,
        croak: input.croak
    };
    function is_keyword(x) {
        // 是否是关键词
        return keywords.indexOf(" " + x.toLowerCase() + " ") >= 0;
    }
    function is_id(ch) {
        // 是否是变量
        return /[规则0-9orand]/i.test(ch);
    }
    function is_punc(ch) {
        // 是否是标点
        return "()".indexOf(ch) >= 0;
    }
    function is_whitespace(ch) {
        // 是否是空格
        return ch.trim().length === 0;
    }
    function read_while(predicate) {
        // 只要符合predicate 就一直读取, 获取到整个区间的 string
        var str = "";
        while (!input.eof() && predicate(input.peek()))
            str += input.next();
        return str;
    }
    function read_ident() {
        // 读取整个变量或者关键词
        var id = read_while(is_id);
        return {
            type: is_keyword(id) ? "kw" : "var",
            value: id
        };
    }
    function read_next() {
        // 先去除开头的空格
        read_while(is_whitespace);
        if (input.eof())
            return null;
        // 当前字符
        var ch = input.peek();
        // 是变量或者关键词就读出来
        if (is_id(ch))
            return read_ident();
        // 是标点 就返回
        if (is_punc(ch))
            return {
                type: "punc",
                value: input.next()
            };
        input.croak("未知字符: " + ch);
        return null;
    }
    function peek() {
        // 获取当前 token
        return current || (current = read_next());
    }
    function next() {
        // 获取下个 token
        var tok = current;
        current = null;
        return tok || read_next();
    }
    function eof() {
        // 是否已经结束
        return peek() == null;
    }
}
//解析 token 流 
function parse(stream) {
    var _a, _b, _c;
    if (!stream.eof() && ((_a = stream.peek()) === null || _a === void 0 ? void 0 : _a.value) !== '(') {
        //要求所有表达式都被()包裹, 且不能连续 进行 or/and
        stream.croak("需要以(开头,所有表达式都应该在()内");
    }
    // 解析() 表达式
    var node = parseBracket(stream);
    if (!stream.eof()) {
        // 如果有后续表达式
        if (((_b = stream.peek()) === null || _b === void 0 ? void 0 : _b.type) !== 'kw') {
            stream.croak("".concat((_c = stream.peek()) === null || _c === void 0 ? void 0 : _c.value, "\u7684\u4F4D\u7F6E\u5E94\u8BE5\u4E3A or/and"));
        }
        // 解析为右侧表达式
        var wrapper = {
            type: 'expression',
            left: node,
            operator: stream.peek()
        };
        stream.next();
        wrapper.right = parseExpressionRight(stream, wrapper);
        return wrapper;
    }
    //    console.info('n,stream.peek() :>> ', JSON.stringify(node,null,2));
    return node;
}
exports.parse = parse;
function parseBracket(stream) {
    var cur = stream.peek();
    if ((cur === null || cur === void 0 ? void 0 : cur.value) === '(') {
        var node = {
            type: "expression"
        };
        stream.next();
        // 解析() 内表达式
        node = parseExpression(stream, node);
        return node;
    }
    else {
        stream.croak("".concat(cur === null || cur === void 0 ? void 0 : cur.value, " \u7684\u4F4D\u7F6E\u5E94\u8BE5\u4EE5(\u5F00\u59CB"));
    }
}
function parseExpressionLeft(stream, node) {
    stream.peek();
    var left = stream.peek();
    // console.log('parseExpressionLeft :>> ', left);
    if ((left === null || left === void 0 ? void 0 : left.value) === '(') {
        // 左侧如果是嵌套的((a or c) and b), 需要解析结果给 left 节点
        stream.peek();
        node.left = parseBracket(stream);
    }
    else if ((left === null || left === void 0 ? void 0 : left.type) === 'var') {
        // 左侧 为简单变量, 直接解析
        node.left = left;
    }
    else {
        stream.croak("".concat(left === null || left === void 0 ? void 0 : left.value, " \u4E0D\u662F\u4E00\u4E2A\u89C4\u5219\u540D\u53D8\u91CF"));
    }
    return node;
}
function parseExpressionRight(stream, node) {
    var _a;
    var right = stream.peek();
    // console.log('right :>> ',right);
    if ((right === null || right === void 0 ? void 0 : right.value) === '(') {
        // 如果右侧为复杂表达式 (a or (b and c)), 解析结果给 right 节点
        stream.peek();
        node.right = parseBracket(stream);
    }
    else if ((right === null || right === void 0 ? void 0 : right.type) !== 'var') {
        stream.croak("".concat(right === null || right === void 0 ? void 0 : right.value, " \u4E0D\u662F\u4E00\u4E2A\u89C4\u5219\u540D\u53D8\u91CF"));
    }
    else {
        // 简单右侧节点
        node.right = right;
    }
    var current = null;
    // console.log('eof',  stream.eof(),node);
    if (((_a = node.right) === null || _a === void 0 ? void 0 : _a.type) !== 'expression') {
        current = stream.next();
        // console.log( "rrrr", current );
    }
    else {
        current = stream.peek();
    }
    // console.log('node :>> ', JSON.stringify(node));
    var end = stream.next();
    // console.log('end :>> ', end,current);
    if ((end === null || end === void 0 ? void 0 : end.type) === 'kw') {
        //! test
        // 右侧连续 (a and b and c)
        // 把之前的整体作为left节点
        node = {
            type: 'expression',
            left: node,
            operator: end
        };
        //    console.log('continueRigth(stream,node) :>> ',);
        // continueRigth(stream,node)
        return parseExpressionRight(stream, node);
    }
    if ((end === null || end === void 0 ? void 0 : end.value) === ')') {
        return node;
    }
    else {
        stream.croak("".concat(right === null || right === void 0 ? void 0 : right.value, " \u540E\u9762\u7F3A\u5C11\u7ED3\u675F)"));
        return node;
    }
}
function parseExpression(stream, node) {
    var _a, _b;
    var n = parseExpressionLeft(stream, node);
    //   console.log(' left node  :>> ', node );
    if (((_a = n.left) === null || _a === void 0 ? void 0 : _a.type) !== 'expression') {
        stream.next();
    }
    var op = stream.next();
    // console.log('op :>> ', op);
    if ((op === null || op === void 0 ? void 0 : op.type) !== 'kw') {
        stream.croak("".concat((_b = n === null || n === void 0 ? void 0 : n.left) === null || _b === void 0 ? void 0 : _b.value, " \u540E\u9762\u9700\u8981\u8DDF\u5173\u952E\u8BCDand/or"));
    }
    n.operator = op;
    n = parseExpressionRight(stream, node);
    return n;
}
function default_1(str) {
    return parse(TokenStream(InputStream(str)));
}
exports["default"] = default_1;
