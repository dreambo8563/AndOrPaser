import { astString, evaluate } from "./evaluate"
import parser from "./parser"
import { IContext } from "./types"

const r = "(规则3 and (规则1 and 规则2) and 规则4)"
const l = "((规则3 and 规则1) and 规则2)"
const s ='(规则1 and 规则2)'
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
const ast =parser("((规则3 and 规则1) AND (规则2 or 规则4) or (规则5 and  规则6))")
// console.log('ast :>> ', JSON.stringify(ast,null,2));
console.log(astString(ast));
console.log( evaluate(ast,data));