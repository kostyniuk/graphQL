const bcrypt = require('bcryptjs');

module.exports = {
  users: () => {
    return [{
      id: 2,
      nickname: 'dada',
      email: 'dada',
      password: 'daads',
      followed: [],
      following: [],
      liked: [],
      posts: []
    }
    ]}
};
