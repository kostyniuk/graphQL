'use strict';

const bcrypt = require('bcryptjs');
const db = require('../../db/index');

const mailNesting = async mailId => {
  const { rows } = await db.query(`SELECT * From mail WHERE login = $1;`, [
    mailId
  ]);
  return rows[0];
};

const authorNesting = async authorId => {
  const { rows } = await db.query(`SELECT * From bloger WHERE id = $1;`, [
    authorId
  ]);
  //return rows[0]
  return {
    ...rows[0],
    email: mailNesting.bind(this, rows[0].email)
  };
};

const postNesting = async postIds => {
  const results = await Promise.all(
    postIds.map(async postId => {
      const { rows } = await db.query(`SELECT * from post WHERE id = $1;`, [
        postId
      ]);
      return {
        ...rows[0],
        author: authorNesting.bind(this, rows[0].author)
      };
    })
  );
  return results;
};

const followingNesting = async userIds => {
  const results = await Promise.all(
    userIds.map(async userId => {
      const { rows } = await db.query(`SELECT * from bloger WHERE id = $1;`, [
        userId
      ]);
      return {
        ...rows[0],
        posts: postNesting.bind(this, rows[0].posts),
        liked: postNesting.bind(this, rows[0].liked_posts),
        email: mailNesting.bind(this, rows[0].email),
        following: followingNesting.bind(this, rows[0].following),
        followed: followingNesting.bind(this, rows[0].followed)
      };
    })
  );
  return results;
};

module.exports = {
  getUsers: async () => {
    const { rows } = await db.query(`SELECT * from bloger;`);
    return rows.map(record => ({
      ...record,
      posts: postNesting.bind(this, record.posts),
      liked: postNesting.bind(this, record.liked_posts),
      email: mailNesting.bind(this, record.email),
      following: followingNesting.bind(this, record.following),
      followed: followingNesting.bind(this, record.followed)
    }));
  },

  createUser: async args => {
    const { nickname, email, password } = args.userInput;
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
      const { rows } = await db.query(
        `INSERT INTO bloger (nickname, email, password, following, followed, posts, liked_posts 
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [nickname, email, hashedPassword, [], [], [], []]
      );
      const { id } = rows[0];
      return {
        id,
        nickname,
        email,
        password: '',
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
};
