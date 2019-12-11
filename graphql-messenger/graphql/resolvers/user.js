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
    password: obj.password,
    messages: obj.messages
  }));
};

const messageBuilder = (id, from, to, body) => {
  const date = new Date().toISOString()
  return {
    id,
    body,
    sentAt: date,
    sender: from,
    receiver: to
  }
}

const usersTable = 'person';
const mailsTable = 'messages';

const querySelection = `SELECT * FROM ${usersTable} WHERE id = $1`;
const queryDeletion = `DELETE FROM ${usersTable} WHERE id = $1`;

module.exports = {
  getUsers: async () => {
    try {
      const { rows } = await db.query(`SELECT * FROM ${usersTable};`);
      return resBuilder(rows);
    } catch (err) {
      throw err;
    }
  },

  getUser: async ({ id }) => {
    const {
      rows
    } = await db.query(`SELECT * FROM ${usersTable} WHERE id = $1;`, [id]);
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
    const fields = [nickname, firstName, lastName, number, email, hashed, []];
    const query = `
    INSERT INTO ${usersTable} (nickname, firstName, lastName, number, email, password, messages)
    VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id ;`;
    const { rows } = await db.query(query, fields);
    const { id } = rows[0];
    return `User succesfully created with the id - ${id}`;
  },

  deleteUser: async args => {
    try {
      const { id, password } = args;

      let { rows } = await db.query(querySelection, [id]);

      if (!rows[0]) {
        throw new Error('User with received id not found');
      }

      const hashedPass = rows[0].password;

      const isMatching = await bcrypt.compare(password, hashedPass);

      if (!isMatching) {
        throw new Error("Password isn't right");
      }

      const result = await db.query(queryDeletion, [id]);

      return `User with id =  ${id} successfully deleted`;
    } catch (err) {
      throw err;
    }
  },

  sendMessage: async (args, req) => {
    try {
      const { from, to, body } = args;

      let { rows } = await db.query(querySelection, [from]);
      const senderMessages = rows[0].messages;

      let result = await db.query(querySelection, [to]);
      const receiver = result.rows[0];

      if (!receiver) {
        throw new Error('User which you aim to send a message doesn\'t exist')
      }

      const receiverMessages = receiver.messages;
      console.log({ from, body, to, senderMessages, receiverMessages });
      return 'Message sent';
    } catch (err) {
      throw err
    }
  }
};
