'use strict';

const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    
type User {
  id: ID!
  nickname: String!
  firstName: String!
  lastName: String!
  number: String!
  email: String!
  password: String!
  messages: [Message]!
}

type Message {
  id: ID!
  body: String!
  sentAt: String!
  sender: ID!
  receiver: ID!
}

input UserInput {
  nickname: String!
  firstName: String!
  lastName: String!
  number: String!
  email: String!
  password: String!
}

input MessageInput {
  body: String!
}

type RootQuery {
  users: [User!]!
  getUser(id: ID): User!
}

type RootMutation {
  createUser(userInput: UserInput): String!
  deleteUser(id: ID, password: String!): String!

}

schema {
  query: RootQuery,
  mutation: RootMutation
}
`);
