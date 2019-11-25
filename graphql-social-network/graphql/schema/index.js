'use strict';

const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    

type User {
  id: ID!
  nickname: String!
  email: Mail!
  password: String
  followed: [User]!
  following: [User]!,
  liked: [Post]!,
  posts: [Post]!  
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
  author: User!,
  body: String
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
  author: ID!
  body: String!
}


type RootQuery {
  users: [User!]!
  mails: [Mail!]!
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
