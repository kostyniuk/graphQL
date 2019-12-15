'use strict';

const db = require('../../db/index');
const updateFields = require('../../helpers/updateField');
const queryBuilder = require('../../helpers/queryBuilder');

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

const querySelection = `SELECT * FROM ${mailsTable} WHERE id = $1`;
const queryDeletion = `DELETE FROM ${mailsTable} WHERE id = $1`;

module.exports = {
  deleteMessage: async (args, req) => {
    const { id } = args;

    let { rows } = await db.query(
      queryBuilder('SELECT', '*', mailsTable, 'id'),
      [id]
    );
    if (!rows[0]) {
      throw new Error('Message with received id not represented in DB.')
    }
    //console.log(rows[0])
    const { sender, receiver } = rows[0];
    //console.log({sender, receiver})

    const resultSender = await db.query(
      queryBuilder('SELECT', '*', usersTable, 'id'),
      [sender]
    );

    const resultReceiver = await db.query(
      queryBuilder('SELECT', '*', usersTable, 'id'),
      [receiver]
    );

    const senderMessages = resultSender.rows[0].messages;
    const receiverMessages = resultReceiver.rows[0].messages;

    updateFields(
      'extract',
      usersTable,
      'messages',
      senderMessages,
      id,
      resultSender.rows[0].id
    );
    updateFields(
      'extract',
      usersTable,
      'messages',
      receiverMessages,
      id,
      resultReceiver.rows[0].id
    );

    const removing = await db.query(
      queryBuilder('DELETE', '', mailsTable, 'id'),
      [id]
    );

    return 'Message succesfully deleted'
  }
};
