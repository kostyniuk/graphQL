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
  },

  updateMail: async args => {
    try {
      let { id, password, first_name, last_name } = args.mailInput;
      let hashedPassword;

      if (password) {
        hashedPassword = await bcrypt.hash(password, 12);
      }

      const { rows } = await db.query(`SELECT * FROM mail WHERE id = $1`, [
        id
      ]);
      if (!rows.length)
        throw new Error('User with given id is not represented at the DB');
      
        const updated = {
        id,
        login: rows[0].login,
        first_name: first_name || rows[0].first_name,
        last_name: last_name || rows[0].last_name,
        password: hashedPassword || rows[0].password,
      };

      const updating = await db.query(
        `UPDATE mail SET first_name = $1, last_name = $2, password = $3 WHERE id = $4;`,
        [updated.first_name, updated.last_name, updated.password, id]
      );
     
      return updated;
    } catch (err) {
      throw err;
    }
  }
    
    
    

}