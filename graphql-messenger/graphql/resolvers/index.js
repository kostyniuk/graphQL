'use strict';

const userResolver = require('./user');
const messageResolver = require('./user');

module.exports = {

  users: userResolver.getUsers,
  getUser: userResolver.getUser


}


