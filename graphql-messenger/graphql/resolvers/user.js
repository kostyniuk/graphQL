/* eslint-disable no-useless-catch */
'use strict';

const bcrypt = require('bcryptjs');

const db = require('../../db/index');

const resBuilder = arrOfRes => {
  return arrOfRes.map(obj => ({
    id: obj.id,
    nickname: obj.nickname,
    firstName: obj.firstname,
    lastName: obj.lastname,
    number: obj.number,
    email: obj.email,
    password: obj.password
  }));
};

const table = 'person';

module.exports = {
  getUsers: async () => {
    try {
      const { rows } = await db.query(`SELECT * FROM ${table};`);
      return resBuilder(rows);
    } catch (err) {
      throw err;
    }
  },

  getUser: async ({ id }) => {
    const { rows } = await db.query(`SELECT * FROM ${table} WHERE id = $1;`, [
      id
    ]);
    return resBuilder(rows)[0];
  },

  createUser: async args => {
    const {
      nickname,
      firstName,
      lastName,
      number,
      email,
      password
    } = args.userInput;
    const hashed = await bcrypt.hash(password, 12);
    const fields = [nickname, firstName, lastName, number, email, hashed];
    const query = `
    INSERT INTO ${table} (nickname, firstName, lastName, number, email, password)
    VALUES($1, $2, $3, $4, $5, $6) RETURNING id ;`;
    const { rows } = await db.query(query, fields);
    const { id } = rows[0];
    return `User succesfully created with the id - ${id}`;
  },

  deleteUser: async args => {
    try {

      const { id, password } = args;

      const querySelection = `SELECT * FROM ${table} WHERE id = $1`;
      const queryDeletion = `DELETE FROM ${table} WHERE id = $1`;

      let { rows } = await db.query(querySelection, [id]);

      if (!rows[0]) {
        throw new Error('User with received id not found');
      }

      const hashedPass = rows[0].password
      
      const isMatching = await bcrypt.compare(password, hashedPass)

      if (!isMatching) {
        throw new Error('Password isn\'t right');
      }

      const result = await db.query(queryDeletion, [id])

      return `User with id =  ${id} successfully deleted`
    } catch (err) {
      throw err
    }
  }
};
