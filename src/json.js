// example
// { "name": "Anna" }
// Id=letter（letter| digit）*
// 单词符号 种类识别码
// {        1
// }        2
// "        3
// :        4
// [        5
// ]        6
// Id       10

export function token(code) {
  let column = 0,
    row = 1,
    index = 0;
  let ch;
  let i = 0;
  let next = i + 1;
  let tokens = [];
  while (typeof (ch = code[i]) !== 'undefined') {
    index += 1;
    column += 1;
    next = i + 1;
    let count = 1;
    if (isWorld(ch)) {
      let token = ch;
      while (isWorld(code[next])) {
        token += code[next];
        i += 1;
        index += 1;
        column += 1;
        next = i + 1;
        count += 1;
      }
      let item = {
        token: token,
        index: index,
        column: column,
        row: row,
        count: count,
        syn: 10
      };
      tokens.push(item);
    } else if (ch === '\n') {
      row += 1;
      column = 0;
    } else {
      let item = {
        token: ch,
        index: index,
        column: column,
        row: row,
        count: 1,
        syn: -1
      };
      switch(ch) {
        case '\n':
          row += 1;
          column = 0;
          break;
        case '{':
          item.syn = 1;
          tokens.push(item);
          break;
        case '}':
          item.syn = 2;
          tokens.push(item);
          break;
        case '"':
          item.syn = 3;
          tokens.push(item);
          break;
        case ':':
          item.syn = 4;
          tokens.push(item);
          break;
        case '[':
          item.syn = 5;
          tokens.push(item);
          break;
        case ']':
          item.syn = 6;
          tokens.push(item);
          break;
      }
    }
    i += 1;
  }
  return tokens;
}

let rt;

function parse(code) {
  let tokens = token(code);
  let tokenObj = new Token(tokens);
  let token = tokenObj.getToken();
  if (!isBraceBegin(token) || !isSquareBegin(token)) {
    console.log('请以"{"或"["符号开始!');
    return;
  }
  if (isBraceBegin(token)) {
    let rt = {};
    tokenObj.next();
  }
}

function walkObj(tokenObj) {
  let token = tokenObj.getToken();
  if (!isBraceBegin(token)) {
    console.log('obj要以"{"开始');
    return;
  }
  tokenObj.next();
  // if (!rt) rt = {};
  token = tokenObj.getToken();
  // if () {
  //   rt;
  // }
}

function walkArray(tokenObj) {}

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

function isIdentifier(token) {
  return token.syn === 10;
}

class ObjTree {
  constructor(item) {
    this.node = {
      children: [],
      ele: item,
      parent: null
    };
  }
  insert(node) {
    this.children.push(node);
    node.parent = this;
  }
}

class Token {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }
  next() {
    if (this.index < this.length - 1) {
      this.index += 1;
      return this.index;
    } else {
      return -1;
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

function isWorld(ch) {
  let reg = /\w/;
  return reg.test(ch);
}

// let codeTest = '{"name": "xiangzhaoyang"}';
// let tokens_r = token(codeTest);
// console.log(tokens_r);
