'use strict';

//const querySelection = `SELECT * FROM ${mailsTable} WHERE id = $1`;

module.exports = (action, fields, table, fieldToSearch) => {

  if (action.toLowerCase() === 'select') return `${action} ${fields} FROM ${table} WHERE ${fieldToSearch} = $1;`;

  if (action.toLowerCase() === 'delete') return `${action} FROM ${table} WHERE ${fieldToSearch} = $1;`;

  return 'query hasn\'t been created';
};
