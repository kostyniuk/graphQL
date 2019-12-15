'use strict';

const db = require('../db/index')

module.exports = async (action, table, field, original, toChange, id) => {
  if (action === 'insert') {
    //console.log({action, table, field, original, toChange, id})
    original.push(toChange);
    const data = Array.from(new Set(original));
    //console.log({data, id})
    const result = await db.query(
      `UPDATE ${table} SET ${field} = $1 WHERE id = $2;`,
      [data, id]
    );
    return true;
  }
  if (action === 'extract') {
    // for deleting messages
  }
};
