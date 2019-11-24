'use strict';

const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    

type User {
  id: ID!
  nickname: String!
  email: String!
  password: String
  followed: [Int]!
  following: [Int]!,
  liked: [Int]!,
  posts: [Int]!  
}

type Mail {
  id: ID!
  first_name: String!
  last_name: String!
  login: String!
  password: String!
}

type Post {
  id: ID!
  user: Int!,
  likes: [Int]!
  posted_at: String!
}

input UserInput {
  nickname: String!
  email: String!
  password: String!
}

input MailInput {
  login: String!
  first_name: String!
  last_name: String!
  password: String!
}

input PostInput {
  user: ID!
  body: String!
}

type RootQuery {
  users: [User!]!
  posts: [Post!]!
}

type RootMutation {
  createUser(userInput: UserInput): User!
  createMail(mailInput: MailInput): Mail!
  createPost(postInput: PostInput): Post!
}

schema {
  query: RootQuery,
  mutation: RootMutation
}
`);
