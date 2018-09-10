'use strict';

// example
// { "name": "Anna" }
// Id=letter（letter| digit）*
// 单词符号 种类识别码
// {        1
// }        2
// "        3
// :        4
// Id       10
function token(code) {
  let column = 0,
    row = 1,
    index = 0;
  let ch;
  let i = 0;
  let next = i + 1;
  let tokens = [];
  let item;
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
    } else switch(ch) {
      case '\n':
        row += 1;
        column = 0;
        break;
      case '{':
        item = {
          token: ch,
          index: index,
          column: column,
          row: row,
          count: 1,
          syn: 1
        };
        tokens.push(item);
        break;
      case '}':
        item = {
          token: ch,
          index: index,
          column: column,
          row: row,
          count: 1,
          syn: 2
        };
        tokens.push(item);
        break;
      case '"':
        item = {
          token: ch,
          index: index,
          column: column,
          row: row,
          count: 1,
          syn: 3
        };
        tokens.push(item);
        break;
      case ':':
        item = {
          token: ch,
          index: index,
          column: column,
          row: row,
          count: 1,
          syn: 4
        };
        tokens.push(item);
        break;
    }
    i += 1;
  }
  return tokens;
}

function isWorld(ch) {
  let reg = /\w/;
  return reg.test(ch);
}

// let codeTest = '{"name": "xiangzhaoyang"}';
// let tokens_r = token(codeTest);
// console.log(tokens_r);

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
    fs.writeFile(writeFilePath, JSON.stringify(tokens));
  }
});
