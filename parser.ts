import { IInputStream, ITokenStream, IToken, IExpressionNode, IVarNode, IOperatorNode } from "./types";



// 字符串 -> 字符流
 function InputStream(input:string) {
const len = input.length;
let pos = 0;
  return {
      next  : next,
      peek  : peek,
      eof   : eof,
      croak : croak,
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
      return pos>=len;
  }
  function croak(msg:string) {
    // 错误
      throw new Error(msg );
  }
}

// 字符流转换为 token 流 词法分析 将字符串形式的代码转换为一个语法片段数组 Tokens
function TokenStream(input:IInputStream) :ITokenStream{
    let current: IToken|null = null;
    const keywords = " or and ";
    return {
        next  : next,
        peek  : peek,
        eof   : eof,
        croak : input.croak
    };
    function is_keyword(x:string) {
        // 是否是关键词
        return keywords.indexOf(" " + x.toLowerCase() + " ") >= 0;
    }
  
    function is_id(ch:string) {
        // 是否是变量
        return /[规则0-9orand]/i.test(ch);
    }
  
    function is_punc(ch:string) {
        // 是否是标点
        return "()".indexOf(ch) >= 0;
    }
    function is_whitespace(ch:string) {
        // 是否是空格
        return ch.trim().length===0
    }
    function read_while(predicate:(str:string)=>boolean) {
        // 只要符合predicate 就一直读取, 获取到整个区间的 string
        let str = "";
        while (!input.eof() && predicate(input.peek()))
            str += input.next();
        return str;
    }

    function read_ident() :IToken{
        // 读取整个变量或者关键词
         const id = read_while(is_id);
        return {
            type  : is_keyword(id) ? "kw" : "var",
            value : id
        };
    }
  
  
    function read_next():null|IToken {
        // 先去除开头的空格
        read_while(is_whitespace);
        if (input.eof()) return null;
        // 当前字符
        const ch = input.peek();
    // 是变量或者关键词就读出来
        if (is_id(ch)) return read_ident();
        // 是标点 就返回
        if (is_punc(ch)) return {
            type  : "punc",
            value : input.next()
        };
       
        input.croak("未知字符: " + ch);
        return null
    }
    function peek() {
        // 获取当前 token
        return current || (current = read_next());
    }
    function next() {
        // 获取下个 token
        const tok = current;
        current = null;
        return tok || read_next();
    }
    function eof() {
        // 是否已经结束
        return peek() == null;
    }
  
}


//解析 token 流 
export  function parse(stream:ITokenStream):IExpressionNode {
    if(!stream.eof()  && stream.peek()?.value !=='('){
        //要求所有表达式都被()包裹, 且不能连续 进行 or/and
        stream.croak("需要以(开头,所有表达式都应该在()内")
    }
    // 解析() 表达式
   let node =  parseBracket(stream)

   if(!stream.eof() ){
    // 如果有后续表达式
    if( stream.peek()?.type !=='kw'){
        stream.croak(`${stream.peek()?.value}的位置应该为 or/and`)
    }
    // 解析为右侧表达式
       const wrapper:Partial<IExpressionNode> = {
            type:'expression',
            left:node,
            operator:stream.peek() as IOperatorNode,
        };
        stream.next()
        wrapper.right = parseExpressionRight(stream,wrapper)
        return wrapper as IExpressionNode
   }
//    console.info('n,stream.peek() :>> ', JSON.stringify(node,null,2));
   return node as IExpressionNode
   
}

function parseBracket(stream:ITokenStream):IExpressionNode|undefined {
    const cur = stream.peek()
    if(cur?.value==='('){
        let node = {
            type:"expression"
        } as Pick<IExpressionNode,'type'>
        stream.next()
        // 解析() 内表达式
       node = parseExpression(stream,node) as IExpressionNode
       return node as IExpressionNode
    }else{
        stream.croak(`${cur?.value} 的位置应该以(开始`)
    }   
}

function parseExpressionLeft(stream:ITokenStream,node:Partial<IExpressionNode>):IExpressionNode {
    stream.peek()
    const left = stream.peek()
    // console.log('parseExpressionLeft :>> ', left);
    if(left?.value ==='('){
        // 左侧如果是嵌套的((a or c) and b), 需要解析结果给 left 节点
        stream.peek()
        node.left = parseBracket(stream) as IExpressionNode
    }else  if(left?.type==='var'){
        // 左侧 为简单变量, 直接解析
        node.left = left as IVarNode
       
    }else{
        stream.croak(`${left?.value} 不是一个规则名变量`)
    }

    return node as IExpressionNode
}

function parseExpressionRight(stream:ITokenStream,node:Partial<IExpressionNode>):IExpressionNode {
    const right = stream.peek()
    // console.log('right :>> ',right);
    if(right?.value ==='('){
        // 如果右侧为复杂表达式 (a or (b and c)), 解析结果给 right 节点
        stream.peek()
        node.right = parseBracket(stream) as IExpressionNode
    } else if(right?.type !=='var'){
        stream.croak(`${right?.value} 不是一个规则名变量`)
    }else{
        // 简单右侧节点
        node.right = right as IVarNode
    }
    let current = null 
    // console.log('eof',  stream.eof(),node);
   if(node.right?.type!=='expression'){
    current =  stream.next()
    // console.log( "rrrr", current );
   }else{
    current =stream.peek()
   }

    // console.log('node :>> ', JSON.stringify(node));
    const end = stream.next()
    // console.log('end :>> ', end,current);
    if(end?.type==='kw'){
        //! test
        // 右侧连续 (a and b and c)
        // 把之前的整体作为left节点
        node ={
            type:'expression',
            left:node as IExpressionNode,
            operator:end as IOperatorNode,
        };
    //    console.log('continueRigth(stream,node) :>> ',);
        // continueRigth(stream,node)
        return    parseExpressionRight(stream,node)
    }
    if(end?.value ===')'){
        return node as IExpressionNode

    }else{
        stream.croak(`${right?.value} 后面缺少结束)`)
         return node  as IExpressionNode
    }
}


function parseExpression(stream:ITokenStream,node:Partial<IExpressionNode>) {
    let n = parseExpressionLeft(stream,node) as Partial<IExpressionNode>
//   console.log(' left node  :>> ', node );

  if( n.left?.type!=='expression'){
    stream.next()
  }

    const op = stream.next()
    // console.log('op :>> ', op);
    if(op?.type!=='kw'){
        stream.croak(`${(n?.left as IVarNode)?.value} 后面需要跟关键词and/or`)
    }
    n.operator=op as IOperatorNode

    n = parseExpressionRight(stream,node) as Partial<IExpressionNode>

    return n
}

export default function (str:string) {
    return parse(TokenStream(InputStream(str)))
}