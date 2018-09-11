export function err(message, row, column, token) {
  throw new Error(`${message} ${row}:${column} ${token}`);
}
