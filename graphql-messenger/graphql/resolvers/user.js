'use strict';

const db = require('../../db/index');

const resBuilder = arrOfRes => {
  return arrOfRes.map(obj => ({
    id: obj.id,
    nickname: obj.nickname,
    firstName: obj.firstname,
    lastName: obj.lastname,
    number: obj.number,
    email: obj.email,
    password: obj.password
  }))
}

const table = 'person';

module.exports = {
  getUsers: async () => {
    const {rows} = await db.query(`SELECT * FROM ${table};`)
    return resBuilder(rows)
  }, 

  getUser: async ({id}) => {
    const {rows} = await db.query(`SELECT * FROM ${table} WHERE id = $1;`, [id])
    return resBuilder(rows)[0]
  }

}