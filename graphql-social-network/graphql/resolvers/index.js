const bcrypt = require('bcryptjs');

const db = require('../../db/index');
const userResolver = require('./user');
const mailResolver = require('./mail');
const postResolver = require('./post');

module.exports = {
  
  users: userResolver.getUsers,
  mails: mailResolver.getMails,
  posts: postResolver.getPosts,

  createUser: userResolver.createUser,
  createMail: mailResolver.createMail,
  createPost: postResolver.createPost,

  updateUser: userResolver.modifyUser

};
