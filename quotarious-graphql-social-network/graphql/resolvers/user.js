'use strict';

const bcrypt = require('bcryptjs');
const db = require('../../db/index');
const jwt = require('jsonwebtoken');

const produceInput = () => {};

const updateFields = async (mutationType, table, id, field, idObj) => {
  try {
    console.log({mutationType, table, id, field, idObj });
    const subject = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [
      id
    ]);
    console.log(subject.rows[0]);
    subject.rows[0][field].push(idObj);
    const fieldUpd = [
      ...new Set(subject.rows[0][field].map(x => x.toString()))
    ];
    const updatedAuthorized = await db.query(
      `UPDATE ${table} SET ${field} = $1 WHERE id = $2`,
      [fieldUpd, id]
    );
    console.log({ fieldUpd, updatedAuthorized });
    return fieldUpd;
  } catch (err) {
    console.log(err);
  }
};

const mailNesting = async mailId => {
  const { rows } = await db.query(`SELECT * From mail WHERE login = $1;`, [
    mailId
  ]);
  return rows[0];
};

const authorNesting = async authorId => {
  //console.log({mjkdf: 'dasjkadsnk'})
  console.log({authorId})
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
  console.log(postIds)
  const results = await Promise.all(
    postIds.map(async postId => {
      const { rows } = await db.query(`SELECT * from post WHERE id = $1;`, [
        postId
      ]);
      //console.log({ here: rows[0].author });
      return {
        ...rows[0],
        author: authorNesting.bind(this, rows[0].author)
      };
    })
  );
  console.log({results})
  return results;
};

const followingNesting = async userIds => {
  console.log({ userIds });
  const results = await Promise.all(
    userIds.map(async userId => {
      const { rows } = await db.query(`SELECT * from bloger WHERE id = $1;`, [
        userId
      ]);
      console.log({res: rows[0]})
      const returning = {
        ...rows[0],
        posts: postNesting.bind(this, rows[0].posts),
        liked: postNesting.bind(this, rows[0].liked_posts),
        email: mailNesting.bind(this, rows[0].email),
        following: followingNesting.bind(this, rows[0].following),
        followed: followingNesting.bind(this, rows[0].followed)
      };
      //console.log({returning})
      return returning 
    })
  );
  //console.log('dsf')
  //console.log({results})
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

  modifyUser: async args => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated');
    }

    try {
      let { id, nickname, email, password } = args.userInput;
      let hashedPassword;

      id = req.userId;

      if (password) {
        hashedPassword = await bcrypt.hash(password, 12);
      }

      const { rows } = await db.query(`SELECT * FROM bloger WHERE id = $1`, [
        id
      ]);
      if (!rows.length)
        throw new Error('User with given id is not represented at the DB');

      const updated = {
        id,
        nickname: nickname || rows[0].nickname,
        email: await mailNesting(email || rows[0].email),
        password: '',
        following: await followingNesting(rows[0].following),
        followed: await followingNesting(rows[0].followed),
        posts: await postNesting(rows[0].posts),
        liked_posts: await postNesting(rows[0].liked_posts)
      };

      const updating = await db.query(
        `UPDATE bloger SET nickname = $1, email = $2, password = $3 WHERE id = $4;`,
        [updated.nickname, updated.email.login, updated.password, id]
      );
      return updated;
    } catch (err) {
      throw err;
    }
  },

  login: async ({ email, password }) => {
    const isEmailExist = await db.query(
      `SELECT * from bloger WHERE email = $1;`,
      [email]
    );
    if (!isEmailExist.rows.length) {
      throw new Error(
        "User with received email isn't presented at our social network"
      );
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      isEmailExist.rows[0].password
    );
    if (!isPasswordCorrect) {
      throw new Error("Password isn't right");
    }

    const token = jwt.sign(
      { userId: isEmailExist.rows[0].id, email },
      'somesupersecretkey',
      {
        expiresIn: '1h'
      }
    );

    return {
      userId: isEmailExist.rows[0].id,
      token,
      expiresIn: 1
    };
  },

  likePost: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('Unauthenticated');
      }

      const { userId } = req;
      const { id } = args;

      await updateFields('add',  'post', id, 'likes', userId);
      await updateFields('add', 'bloger', userId, 'liked_posts', id);

      const user = await db.query(`SELECT * FROM bloger WHERE id = $1`, [
        userId
      ]);

      const updated = {
        id: userId,
        nickname: user.rows[0].nickname,
        email: await mailNesting(user.rows[0].email),
        password: '',
        following: await followingNesting(user.rows[0].following),
        followed: await followingNesting(user.rows[0].followed),
        posts: await postNesting(user.rows[0].posts),
        liked_posts: await postNesting(user.rows[0].liked_posts)
      };

      console.log({updated})

      return updated;
    } catch (err) {
      throw err;
    }
  },

  followUser: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('Unauthenticated');
      }

      const { userId } = req;
      const { id } = args;

      await updateFields('add', 'bloger', userId, 'following', id);
      await updateFields('add', 'bloger', id, 'followed', userId);

      const authorized = await db.query(`SELECT * FROM bloger WHERE id = $1`, [
        userId
      ]);

      return {
        id: userId,
        nickname: authorized.rows[0].nickname,
        email: await mailNesting(authorized.rows[0].email),
        password: '',
        following: await followingNesting(authorized.rows[0].following),
        followed: await followingNesting(authorized.rows[0].followed),
        posts: await postNesting(authorized.rows[0].posts),
        liked_posts: await postNesting(authorized.rows[0].liked_posts)
      };
    } catch (err) {
      throw err;
    }
  },

  deleteUser: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('Unauthenticated');
      }

      const { userId } = req;
      const { password } = args;

      //await updateFields('bloger', userId, 'following', id);
      //await updateFields('bloger', id, 'followed', userId);

      const { rows } = await db.query(`SELECT * FROM bloger WHERE id = $1`, [
        userId
      ]);
      const realPassword = rows[0].password;
      const isPassRight = await bcrypt.compare(password, realPassword);

      if (isPassRight) {
        const rowCount = await db.query(
          `DELETE FROM bloger WHERE id = $1;`,
          [userId]
        );
        return 'User deleted';
      }

      return "User can't be deleted. Password isn't right.";
    } catch (err) {
      throw err;
    }
  }
};
