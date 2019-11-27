'use strict';

const db = require('../../db/index');

const mailNesting = async mailId => {
  console.log('here');

  const { rows } = await db.query(`SELECT * From mail WHERE login = $1;`, [
    mailId
  ]);
  console.log({ mailNesting: rows[0] });
  return rows[0];
};

const authorNesting = async authorId => {
  const { rows } = await db.query(`SELECT * From bloger WHERE id = $1;`, [
    authorId
  ]);
  return {
    ...rows[0],
    email: mailNesting.bind(this, rows[0].email)
  };
};

const deleteElFromArrbyVal = (arr, val) => {
  const index = arr.indexOf(val);
  if (index > -1) arr.splice(index, 1);
  return arr;
};

const updateAuthor = async postId => {
  try {
    postId = parseInt(postId);
    const data = await db.query(`SELECT id, posts, liked_posts from bloger;`);
    const ids = [];
    data.rows.forEach(obj => ids.push(obj.id));

    data.rows.map(arr => deleteElFromArrbyVal(arr.posts, postId));
    data.rows.map(arr => deleteElFromArrbyVal(arr.liked_posts, postId));


    for (let i = 0; i < ids.length; i++) {
      await db.query(
        `UPDATE bloger SET posts = $1, liked_posts = $2 WHERE id = $3`,
        [data.rows[i].posts, data.rows[i].liked_posts, ids[i]]
      );
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getPosts: async () => {
    const { rows } = await db.query(`SELECT * from post;`);
    return rows.map(record => ({
      ...record,
      author: authorNesting.bind(this, record.author)
    }));
  },

  createPost: async args => {
    const { author, body } = args.postInput;
    try {
      const date = new Date().toISOString();
      const {
        rows
      } = await db.query(
        `INSERT INTO post (author, body, likes, posted_at) VALUES ($1, $2, $3, $4) RETURNING id`,
        [author, body, [], date]
      );
      const { id } = rows[0];

      const getUser = await db.query(`SELECT posts FROM bloger WHERE id = $1`, [
        author
      ]);
      const { posts } = getUser.rows[0];
      posts.push(id);

      const updateUserPosts = await db.query(
        `UPDATE bloger SET posts = $1 WHERE id = $2`,
        [posts, author]
      );
      return {
        id,
        author: authorNesting.bind(this, author),
        body,
        likes: [],
        posted_at: date
      };
    } catch (err) {
      throw err;
    }
  },

  updatePost: async args => {
    try {
      let { id, body } = args.postInput;

      const { rows } = await db.query(`SELECT * FROM post WHERE id = $1`, [id]);
      if (!rows.length)
        throw new Error('Post with given id is not represented at the DB');

      const updated = {
        id,
        body: body || rows[0].body,
        author: authorNesting(rows[0].author),
        likes: rows[0].likes,
        posted_at: rows[0].posted_at
      };

      const updating = await db.query(
        `UPDATE post SET body = $1 WHERE id = $2;`,
        [body, id]
      );

      return updated;
    } catch (err) {
      throw err;
    }
  },

  deletePost: async args => {
    try {
      const { id } = args;
      const { rowCount } = await db.query(`DELETE FROM post WHERE id = $1`, [
        id
      ]);
      console.log(id);
      updateAuthor(id);
      if (!rowCount)
        throw new Error(
          `Post with with received id(id = ${id}) can't be deleted. DB have no post with that id.`
        );

      return `Post(id = ${id}) succesfully deleted`;
    } catch (err) {
      throw err;
    }
  }
};
