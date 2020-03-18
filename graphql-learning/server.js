var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var app = express();

const mockDB = [
  { id: 1, name: 'Steph', age: 32, hobbies: ['golf', 'cooking'] },
  { id: 2, name: 'D\'Angelo', age: 24, hobbies: ['fashion', 'football'] },
  { id: 3, name: 'Andrew', age: 25, hobbies: ['hockey', 'dancing'] }
];

var schema = buildSchema(`
  type Person {
    id: ID!
    name: String!
    age: Int!
    hobbies: [String!]
  }

  input PersonInput {
    name: String!
    age: Int!
    hobbies: [String!]
  }

  type RootQuery {
    users: [Person!]!
    getUser(name: String): Person!
  }
  type RootMutation {
    createPerson(personInput: PersonInput): Person!
  }
  schema {
    query: RootQuery,
    mutation: RootMutation
  }
`);

var root = {
  users: () => {
    return mockDB;
  }, 
  //getUser({name})
};

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
