export interface IInputStream {
  next: () => string;
  peek: () => string;
  eof: () => boolean;
  croak: (msg: string) => void;
}
export interface ITokenStream{
  next: () => IToken | null;
  peek: () => IToken | null;
  eof: () => boolean;
  croak: (msg: string) => void;
}
export interface IToken{
  type:'kw'|"punc"|'var';
  value:string
}


export interface IContext{
  [key:string]:{
    prop:string,
    value:any,
    operator:"in"|"="|"!="|">="
  }
}

export interface IVarNode{
  type:"var";
  value:string;
}

export interface IOperatorNode{
  type: "kw";
  value: "and"|"or";
}

export interface IExpressionNode{
  type:"expression"
  left:IExpressionNode|IVarNode
  right:IExpressionNode|IVarNode
  operator:IOperatorNode
}