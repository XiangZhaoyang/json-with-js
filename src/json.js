import { err } from './err';
import { token as tokenFun } from './token';

export function parse(code) {
  let tokens = tokenFun(code);
  let tokenStream = new TokenStream(tokens);
  let token = tokenStream.getToken();
  let rt = null;
  if (isBraceBegin(token)) {
    rt = new ObjTree([], null, 'obj');
    walkObj(tokenStream, rt);
  } else if (isSquareBegin(token)) {
    rt = new ObjTree([], null, 'array');
    walkArray(tokenStream, rt);
  } else {
    err('请以"{"或"["符号开始!', token.row, token.column, token.token);
  }
  return rt;
}

function walkObj(tokenStream, parent) {
  let token = tokenStream.getToken();
  if (!isBraceBegin(token)) {
    err('obj要以"{"开始', token.row, token.column, token.token);
  }
  tokenStream.next();
  token = tokenStream.getToken();
  while (isDoubleQuotation(token)) {
    let parentNode = parseString(tokenStream);
    tokenStream.next();
    token = tokenStream.getToken();
    if (!isColon(token)) {
      err('obj缺少":', token.row, token.column, token.token);
    } else {
      tokenStream.next();
      token = tokenStream.getToken();
      if (isDoubleQuotation(token)) {
        let childNode = parseString(tokenStream);
        parentNode.insert(childNode);
        ASTAdd(parent, parentNode);
      } else if (isBraceBegin(token)) {
        walkObj(tokenStream, parentNode);
      } else {
        err(`obj出现未定义字符串${token.token}`, token.row, token.column, token.token);
      }
    }
    tokenStream.next();
    token = tokenStream.getToken();
    if (isComma(token)) {
      tokenStream.next();
      token = tokenStream.getToken();
    }
  }
  if (isBraceEnd(token)) {
    tokenStream.next();
  } else {
    err('obj要以"}"结束', token.row, token.column, token.token);
  }
}

function walkArray(tokenStream, parent) {
  let token = tokenStream.getToken();
  if (!isSquareBegin(token)) {
    err('array要以"["开始', token.row, token.column, token.token);
  }
  tokenStream.next();
  token = tokenStream.getToken();
  if (isBraceBegin(token)) {
    let newParentNode = new ObjTree([], null, 'boj');
    ASTAdd(parent, newParentNode);
    walkObj(tokenStream, newParentNode)
  }
  while(isDoubleQuotation(token)) {
    let node = parseString(tokenStream);
    ASTAdd(parent, node);
    tokenStream.next();
    token = tokenStream.getToken();
    if (isComma(token)) {
      tokenStream.next();
      token = tokenStream.getToken();
    }
  }
  if (isSquareBegin(token)) {
    let parentNode = new ObjTree([], null, 'array');
    parent.insert(parentNode);
    walkArray(tokenStream, parentNode);
  } else if (isSquareEnd(token)) {
    tokenStream.next();
  } else {
    err('array要以"]"结束', token.row, token.column, token.token);
  }
}

function parseString(tokenStream) {
  let token = tokenStream.getToken();
  if (!isDoubleQuotation(token)) {
    err('string要以"开始', token.row, token.column, token.token);
  }
  tokenStream.next();
  token = tokenStream.getToken();
  let node = null;
  if (isIdentifier(token)) {
    node = new ObjTree(token.token, token);
    tokenStream.next();
  }
  token = tokenStream.getToken();
  if (!isDoubleQuotation(token)) {
    err('string要以"结束', token.row, token.column, token.token);
  }
  return node;
}

function isBraceBegin(token) {
  return token.syn === 1;
}

function isBraceEnd(token) {
  return token.syn === 2;
}

function isSquareBegin(token) {
  return token.syn === 5;
}

function isSquareEnd(token) {
  return token.syn === 6;
}

function isDoubleQuotation(token) {
  return token.syn === 3;
}

function isColon(token) {
  return token.syn === 4;
}

function isComma(token) {
  return token.syn === 7;
}

function isIdentifier(token) {
  return token.syn === 10;
}

class ObjTree {
  constructor(item, node ,type) {
    this.children = [];
    this.ele = item;
    this.node = node;
    this.type = type;
    this.parent = null;
  }
  insert(node) {
    this.children.push(node);
    node.parent = this;
  }
  appendTo(node) {
    node.children.push(this);
    this.parent = node;
  }
  toJSON() {
    return JSON.stringify.call(this);
  }
}

function ASTAdd(root, node) {
  root.insert(node);
}

class TokenStream {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }
  next() {
    if (this.index > this.tokens.length - 1) {
      return -1;
    } else {
      this.index += 1;
      return this.index;
    }
  }
  pre() {
    if (this.index > 0) {
      this.index -= 1;
      return this.index;
    } else {
      return -1;
    }
  }
  getIndex() {
    return this.index;
  }
  getToken() {
    return this.tokens[this.index];
  }
  getNextToken() {
    return this.tokens[this.index + 1];
  }
}
