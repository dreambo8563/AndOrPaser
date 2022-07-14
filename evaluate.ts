import { IContext, IExpressionNode, IVarNode } from "./types"

    
export function evaluate(exp:IExpressionNode|IVarNode,data:IContext):string {
  switch (exp.type) {
    case "expression":
     return `(${evaluate(exp.left,data)} ${exp.operator.value} ${evaluate(exp.right,data)})` 
    case 'var':
      const v =  exp.value
      const d = data[v]
      if(!d){
        throw new Error(`未找到${v} 对应的数据` );
      }
      return `${d.prop} ${d.operator} ${ transform(d.value)}`
    default:
      return ""
  }
}
export  function astString(exp:IExpressionNode|IVarNode):string {
  switch (exp.type) {
    case "expression":
     return `(${astString(exp.left)} ${exp.operator.value} ${astString(exp.right)})` 
    case 'var':
    return exp.value
      
    default:
      return ""
  }
}

function transform(d:unknown) {
  if(Array.isArray(d)){
    return `(${d.join(",")})`
  }
  if(typeof d ==='string'){
    return `"${d}"`
  }
  return d
}