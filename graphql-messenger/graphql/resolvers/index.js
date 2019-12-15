'use strict';

const userResolver = require('./user');
const messageResolver = require('./message');

module.exports = {

  users: userResolver.getUsers,
  getUser: userResolver.getUser,
  createUser: userResolver.createUser,
  deleteUser: userResolver.deleteUser,
  sendMessage: userResolver.sendMessage,
  deleteMessage: messageResolver.deleteMessage


};


