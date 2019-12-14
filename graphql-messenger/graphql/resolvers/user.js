/* eslint-disable no-useless-catch */
'use strict';

const bcrypt = require('bcryptjs');

const db = require('../../db/index');
const date = require('../../helpers/date');

const spreadMessages = async (arrOfIds) => {
  console.log(arrOfIds)
  const messages = Promise.all(arrOfIds.map( async (id, i, arr) => {
    const {rows} = await db.query(`SELECT * FROM ${mailsTable} WHERE id = $1`, [id])
    const message = rows[0]
    return message
  }))
  return messages
}

const resBuilder = async arrOfRes => {
  return arrOfRes.map( async (obj) => { 
    //const message = 
    //console.log({message})
    return {
    id: obj.id,
    nickname: obj.nickname,
    firstName: obj.firstname,
    lastName: obj.lastname,
    number: obj.number,
    email: obj.email,
    password: obj.password,
    messages: await spreadMessages(obj.messages)
    }
  });
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

const updateField = async (action, table, field, original, toChange, id) => {
  if (action === 'insert') {
    //console.log({action, table, field, original, toChange, id})
    original.push(toChange)
    const data = Array.from(new Set(original))
    //console.log({data, id})
    const result = await db.query(`UPDATE ${table} SET ${field} = $1 WHERE id = $2;`, [data, id])
    return true;
  }
  if (action === 'extract') {
    // for deleting messages
  }
}

const usersTable = 'person';
const userFields = ['nickname', 'firstname', 'lastname', 'number', 'email', 'password', 'messages']
const mailsTable = 'message';
const mailFields = ['body', 'sentat', 'sender', 'receiver']


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
        throw new Error('User which you aim to send a message doesn\'t exist')
      }

      const sentAt = date.now();
      
      const messageNew = await db.query(`INSERT INTO ${mailsTable} (${mailFields.join(', ')}) VALUES ($1, $2, $3, $4) RETURNING id; `, [body, sentAt, from, to])
      const mailId = messageNew.rows[0].id

      updateField('insert', usersTable, 'messages', senderMessages, mailId, sender.id)
      updateField('insert', usersTable, 'messages', receiverMessages, mailId, receiver.id)
      
      return 'Message sent';
    } catch (err) {
      throw err
    }
  }
};
