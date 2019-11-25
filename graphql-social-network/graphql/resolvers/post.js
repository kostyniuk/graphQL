'use strict';

const bcrypt = require('bcryptjs');
const db = require('../../db/index');

module.exports = {

  getPosts: async () => {
    const { rows } = await db.query(`SELECT * from post;`);
    return rows;
  },

  createPost: async args => {
    const { author, body } = args.postInput;
    try {
      const date = new Date().toISOString();
      const { rows } = await db.query(
        `INSERT INTO post (author, body, posted_at) VALUES ($1, $2, $3) RETURNING id`,
        [author, body, date]
      );
      const { id } = rows[0];

      const getUser = await db.query(`SELECT posts FROM bloger WHERE id = $1`, [author])
      const {posts} = getUser.rows[0]
      posts.push(id);

      const updateUserPosts = await db.query(`UPDATE bloger SET posts = $1 WHERE id = $2`, [posts, author]);
      return {
        id,
        author,
        body,
        likes: [],
        posted_at: date,
      };
    } catch (err) {
      throw err;
    }
  }
}