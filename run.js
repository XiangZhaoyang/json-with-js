'use strict';

function err(message, row, column, token) {
  throw new Error(`${message} ${row}:${column} ${token}`);
}

// token.js 词法解析

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
// ,        7
// Id       10

function token(code) {
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
        case ',':
          item.syn = 7;
          tokens.push(item);
          break;
      }
    }
    i += 1;
  }
  return tokens;
}

function isWorld(ch) {
  let reg = /\w/;
  return reg.test(ch);
}

function parse(code) {
  let tokens = token(code);
  let tokenStream = new TokenStream(tokens);
  let token$$1 = tokenStream.getToken();
  let rt = null;
  if (isBraceBegin(token$$1)) {
    rt = new ObjTree([], null, 'obj');
    walkObj(tokenStream, rt);
  } else if (isSquareBegin(token$$1)) {
    rt = new ObjTree([], null, 'array');
    walkArray(tokenStream, rt);
  } else {
    err('请以"{"或"["符号开始!', token$$1.row, token$$1.column, token$$1.token);
  }
  return rt;
}

function walkObj(tokenStream, parent) {
  let token$$1 = tokenStream.getToken();
  if (!isBraceBegin(token$$1)) {
    err('obj要以"{"开始', token$$1.row, token$$1.column, token$$1.token);
  }
  tokenStream.next();
  token$$1 = tokenStream.getToken();
  while (isDoubleQuotation(token$$1)) {
    let parentNode = parseString(tokenStream);
    tokenStream.next();
    token$$1 = tokenStream.getToken();
    if (!isColon(token$$1)) {
      err('obj缺少":', token$$1.row, token$$1.column, token$$1.token);
    } else {
      tokenStream.next();
      token$$1 = tokenStream.getToken();
      if (isDoubleQuotation(token$$1)) {
        let childNode = parseString(tokenStream);
        parentNode.insert(childNode);
        ASTAdd(parent, parentNode);
      } else if (isBraceBegin(token$$1)) {
        walkObj(tokenStream, parentNode);
      } else {
        err(`obj出现未定义字符串${token$$1.token}`, token$$1.row, token$$1.column, token$$1.token);
      }
    }
    tokenStream.next();
    token$$1 = tokenStream.getToken();
    if (isComma(token$$1)) {
      tokenStream.next();
      token$$1 = tokenStream.getToken();
    }
  }
  if (isBraceEnd(token$$1)) {
    tokenStream.next();
  } else {
    err('obj要以"}"结束', token$$1.row, token$$1.column, token$$1.token);
  }
}

function walkArray(tokenStream, parent) {
  let token$$1 = tokenStream.getToken();
  if (!isSquareBegin(token$$1)) {
    err('array要以"["开始', token$$1.row, token$$1.column, token$$1.token);
  }
  tokenStream.next();
  token$$1 = tokenStream.getToken();
  if (isBraceBegin(token$$1)) {
    let newParentNode = new ObjTree([], null, 'boj');
    ASTAdd(parent, newParentNode);
    walkObj(tokenStream, newParentNode);
  }
  while(isDoubleQuotation(token$$1)) {
    let node = parseString(tokenStream);
    ASTAdd(parent, node);
    tokenStream.next();
    token$$1 = tokenStream.getToken();
    if (isComma(token$$1)) {
      tokenStream.next();
      token$$1 = tokenStream.getToken();
    }
  }
  if (isSquareBegin(token$$1)) {
    let parentNode = new ObjTree([], null, 'array');
    parent.insert(parentNode);
    walkArray(tokenStream, parentNode);
  } else if (isSquareEnd(token$$1)) {
    tokenStream.next();
  } else {
    err('array要以"]"结束', token$$1.row, token$$1.column, token$$1.token);
  }
}

function parseString(tokenStream) {
  let token$$1 = tokenStream.getToken();
  if (!isDoubleQuotation(token$$1)) {
    err('string要以"开始', token$$1.row, token$$1.column, token$$1.token);
  }
  tokenStream.next();
  token$$1 = tokenStream.getToken();
  let node = null;
  if (isIdentifier(token$$1)) {
    node = new ObjTree(token$$1.token, token$$1);
    tokenStream.next();
  }
  token$$1 = tokenStream.getToken();
  if (!isDoubleQuotation(token$$1)) {
    err('string要以"结束', token$$1.row, token$$1.column, token$$1.token);
  }
  return node;
}

function isBraceBegin(token$$1) {
  return token$$1.syn === 1;
}

function isBraceEnd(token$$1) {
  return token$$1.syn === 2;
}

function isSquareBegin(token$$1) {
  return token$$1.syn === 5;
}

function isSquareEnd(token$$1) {
  return token$$1.syn === 6;
}

function isDoubleQuotation(token$$1) {
  return token$$1.syn === 3;
}

function isColon(token$$1) {
  return token$$1.syn === 4;
}

function isComma(token$$1) {
  return token$$1.syn === 7;
}

function isIdentifier(token$$1) {
  return token$$1.syn === 10;
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
    // return `{ children: ${JSON.stringify(this.children)}, ele: ${JSON.stringify(this.ele)}, ` + 
      // `node: ${JSON.stringify(this.node)}, type: ${JSON.stringify(this.type)}, parent: ${JSON.stringify(this.parent)} }`;
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

const argv = process.argv.slice(2);

const filePath = argv[0];
const wfilePath = argv[1];

const fs = require('fs');
const path = require('path');

const codePath = path.resolve(__dirname, filePath);
const writeFilePath = path.resolve(__dirname, wfilePath || 'json_tokens.txt');

fs.readFile(codePath, 'utf-8', (err, data) => {
  if (err) throw err;
  else {
    let tokens = token(data);
    console.log(tokens);
    let ast = parse(data);
    console.log(ast);
    fs.writeFile(writeFilePath, JSON.stringify(ast));
  }
});
