import { parse } from './json';
import { token } from './token';

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
    // console.log(tokens);
    let ast = parse(data);
    // console.log(ast);
    fs.writeFile(writeFilePath, JSON.stringify(ast));
  }
})
