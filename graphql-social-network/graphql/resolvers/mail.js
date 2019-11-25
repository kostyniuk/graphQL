'use strict';

const bcrypt = require('bcryptjs');
const db = require('../../db/index');

module.exports = {
  
  getMails: async () => {
    const { rows } = await db.query(`SELECT * from mail;`);
    return rows;
  },

  createMail: async args => {
    const { first_name, last_name, login, password } = args.mailInput;
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const {
        rows
      } = await db.query(
        `INSERT INTO mail (first_name, last_name, login, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first_name, last_name, login, hashedPassword]
      );
      const { id } = rows[0];
      return {
        id,
        login,
        first_name,
        last_name,
        password: ''
      };
    } catch (err) {
      throw err;
    }
  }
}