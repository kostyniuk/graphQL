'use strict';

const bcrypt = require('bcryptjs');
const db = require('../../db/index');

const mailNesting = async mailId => {
  console.log('here')

  const { rows } = await db.query(`SELECT * From mail WHERE login = $1;`, [
    mailId
  ]);
  console.log({mailNesting: rows[0]})
  return rows[0];
};


const authorNesting =  async authorId => {
  const { rows } = await db.query(`SELECT * From bloger WHERE id = $1;`, [authorId]);
  console.log({postNesting: rows[0]})
  //return rows[0]
  return {
    ...rows[0],
    email: mailNesting.bind(this, rows[0].email)
  }
}


module.exports = {

  getPosts: async () => {
    const { rows } = await db.query(`SELECT * from post;`);
    return rows.map(record => ({
      ...record,
      author: authorNesting.bind(this, record.author)
    }))
  },

  createPost: async args => {
    const { author, body } = args.postInput;
    try {
      const date = new Date().toISOString();
      const { rows } = await db.query(
        `INSERT INTO post (author, body, likes, posted_at) VALUES ($1, $2, $3, $4) RETURNING id`,
        [author, body, [] ,date]
      );
      const { id } = rows[0];

      const getUser = await db.query(`SELECT posts FROM bloger WHERE id = $1`, [author])
      const {posts} = getUser.rows[0]
      posts.push(id);

      const updateUserPosts = await db.query(`UPDATE bloger SET posts = $1 WHERE id = $2`, [posts, author]);
      return {
        id,
        author: authorNesting.bind(this, author),
        body,
        likes: [],
        posted_at: date,
      };
    } catch (err) {
      throw err;
    }
  }
}