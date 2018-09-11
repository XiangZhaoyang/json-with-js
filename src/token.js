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
