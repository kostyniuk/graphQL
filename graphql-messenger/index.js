'use strict';

const express = require('express');
const graphqlHttp = require('express-graphql');
const bodyParser = require('body-parser');
const db = require('./db/index');

const graphqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers/index');

//const authCheck = require('./middleware/isAuth');

const app = express();

app.use(bodyParser.json());

//app.use(authCheck);

app.use(
  '/graphql',
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true
  })
);

const DBtest = async () => {
  const {rows} = await db.query(`SELECT * FROM person;`, [])
  console.log(rows)
}

DBtest()

app.listen(3000, () => {
  console.log('Server is listening at http://localhost:3000');
});