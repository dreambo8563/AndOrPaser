# AndOrPaser


### 解决问题

用户需要手写表达式 类似 `((规则3 and 规则1) AND (规则2 or 规则4) or (规则5 and  规则6))`, 接口会根据表达式配置的条件提取数据
- 每一个规则都是在页面里配置的数据维度例如

```js
const data:IContext={
  "规则3":{
    prop:"level",
    operator:"in",
    value:[1,2,3]
  },
  "规则1":{
    prop:"workcode",
    operator:"=",
    value:"076533"
  },
  "规则2":{
    prop:"department_ids",
    operator:"!=",
    value:"D011111"
  },
  "规则4":{
    prop:"department_ids",
    operator:"=",
    value:"D22222"
  },
  "规则5":{
    prop:"age",
    operator:">=",
    value:18
  },
  "规则6":{
    prop:"isManager",
    operator:"=",
    value:1
  }
}
```

#### parse 的流程

1. 将输入的 string  => 输入流, 提供了基本的 next(获取下一个字符), peek(当前字符), eof(是否结束),croak(报错) 方法

2. 将输入流转化为 token 流, 也 就是**词法分析**. 把字符提取为独立的Token
- kw 为关键词 -> 这里支持 **and** 和 **or** 两个操作符 作为关键词
- var 为变量 -> 这里规定用户只能输入 *规则+数字* 的格式, 类似 *规则1*
- punc 为标点 -> 这里只可以存在 () 作为标点

3. 将token 流转化为 ast 进行解析

4. 将 ast和配置的维度数据 解释 为 sql 语句的条件部分

### 举例

```js
const ast =parser("((规则3 and 规则1) AND (规则2 or 规则4) or (规则5 and  规则6))")
```
AST 为:
```json
{
  "type": "expression",
  "left": {
    "type": "expression",
    "left": {
      "type": "expression",
      "left": {
        "type": "var",
        "value": "规则3"
      },
      "operator": {
        "type": "kw",
        "value": "and"
      },
      "right": {
        "type": "var",
        "value": "规则1"
      }
    },
    "operator": {
      "type": "kw",
      "value": "AND"
    },
    "right": {
      "type": "expression",
      "left": {
        "type": "var",
        "value": "规则2"
      },
      "operator": {
        "type": "kw",
        "value": "or"
      },
      "right": {
        "type": "var",
        "value": "规则4"
      }
    }
  },
  "operator": {
    "type": "kw",
    "value": "or"
  },
  "right": {
    "type": "expression",
    "left": {
      "type": "var",
      "value": "规则5"
    },
    "operator": {
      "type": "kw",
      "value": "and"
    },
    "right": {
      "type": "var",
      "value": "规则6"
    }
  }
}
```

**astString(ast)** 会将 ast 解释为原表达式, 只不过会加上没有的(), **and** 和 **or** 是从左到右的优先级.
>__(__((规则3 and 规则1) AND (规则2 or 规则4)__)__ or (规则5 and 规则6))


```js
evaluate(ast,data)
```

**evaluate** 会真正解释为 sql 条件
>(((level in (1,2,3) and workcode = "076533") AND (department_ids != "D011111" or department_ids = "D22222")) or (age >= 18 and isManager = 1))

### 本地运行
用的 ts 编写, 本地需要安装 typescript

`tsc main.ts && node main.js`