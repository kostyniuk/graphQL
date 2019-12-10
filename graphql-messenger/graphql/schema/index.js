'use strict';

const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    
type User {
  id: ID!
  nickname: String!
  firstName: String!
  lastName: String!
  number: String!
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
}

input MessageInput {
  body: String!
}

type RootQuery {
  users: [User!]!
}

type RootMutation {
  createUser(userInput: UserInput): User!

}

schema {
  query: RootQuery,
  mutation: RootMutation
}
`);
