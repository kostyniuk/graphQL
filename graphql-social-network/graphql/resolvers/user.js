'use strict';

const bcrypt = require('bcryptjs');
const db = require('../../db/index');

module.exports = {
  
  getUsers: async () => {
    const { rows } = await db.query(`SELECT * from bloger;`);
    return rows;
  },

  createUser: async args => {
    const { nickname, email, password } = args.userInput;
    try {
      const { rows } = await db.query(
        `INSERT INTO bloger (nickname, email, password, following, followed, posts, liked_posts 
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [nickname, email, password, [], [], [], []]
      );
      const { id } = rows[0];
      return {
        id,
        nickname,
        email,
        password,
        followed: [],
        following: [],
        liked: [],
        posts: []
      };
    } catch (err) {
      throw err;
    }
  },

  modifyUser: async argv => {}

}
