/* eslint-disable no-useless-catch */
'use strict';

const bcrypt = require('bcryptjs');

const db = require('../../db/index');

const spreadMessages = async (arrOfIds) => {
  //console.log(arrOfIds)
  const messages = await Promise.all(
    arrOfIds.map(async (id, i, arr) => {
      const {
        rows
      } = await db.query(`SELECT * FROM ${mailsTable} WHERE id = $1`, [id]);
      const message = rows[0];
      return message;
    })
  );
  return messages.map(async (message, i, arr) => {
    const senderInfo = await db.query(querySelection, [message.sender]);
    const receiverInfo = await db.query(querySelection, [message.receiver]);
    message.receiver = resBuilder.bind(this, receiverInfo.rows); // we must use bind in dynamic relations to avoid endless recursion
    message.sender = resBuilder.bind(this, senderInfo.rows);
    //console.log({mes: message.receiver(), res: message.sender()})
    return message;
  });
};

const resBuilder = arrOfRes => {
  const result = arrOfRes.map(obj => {
    return {
      id: obj.id,
      nickname: obj.nickname,
      firstName: obj.firstname,
      lastName: obj.lastname,
      number: obj.number,
      email: obj.email,
      password: obj.password,
      messages: spreadMessages.bind(this, obj.messages)
    };
  });

  if (result.length === 1) {
    return result[0];
  }
  return result;
};

const messageBuilder = (id, from, to, body) => {
  const date = new Date().toISOString();
  return {
    id,
    body,
    sentAt: date,
    sender: from,
    receiver: to
  };
};

const updateField = require('../../helpers/updateField')

const usersTable = 'person';
const userFields = [
  'nickname',
  'firstname',
  'lastname',
  'number',
  'email',
  'password',
  'messages'
];
const mailsTable = 'message';
const mailFields = ['body', 'sentat', 'sender', 'receiver'];

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
      const sender = rows[0];
      const senderMessages = sender.messages;

      let result = await db.query(querySelection, [to]);
      const receiver = result.rows[0];
      const receiverMessages = receiver.messages;

      if (!receiver) {
        throw new Error("User which you aim to send a message doesn't exist");
      }

      const sentAt = new Date().toISOString()

      const messageNew = await db.query(
        `INSERT INTO ${mailsTable} (${mailFields.join(
          ', '
        )}) VALUES ($1, $2, $3, $4) RETURNING id; `,
        [body, sentAt, from, to]
      );
      const mailId = messageNew.rows[0].id;

      updateField(
        'insert',
        usersTable,
        'messages',
        senderMessages,
        mailId,
        sender.id
      );
      updateField(
        'insert',
        usersTable,
        'messages',
        receiverMessages,
        mailId,
        receiver.id
      );

      return 'Message sent';
    } catch (err) {
      throw err;
    }
  }
};
