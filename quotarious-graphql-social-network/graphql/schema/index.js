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
  liked_posts: [Post]!,
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
  body: String!
}

input UserUpdateInput {
  id: ID!
  nickname: String
  email: String
  password: String
}

input MailUpdateInput {
  id: ID!
  first_name: String
  last_name: String
  password: String
}

input PostUpdateInput {
  id: ID!,
  body: String
}

type AuthData {
  userId: ID!
  token: String!
  expiresIn: Int!
}

type RootQuery {
  users: [User!]!
  mails: [Mail!]!
  posts: [Post!]!

  login(email: String!, password: String!): AuthData!

}

type RootMutation {
  createUser(userInput: UserInput): User!
  updateUser(userInput: UserInput): User!
  deleteUser(password: String!): String!

  createMail(mailInput: MailInput): Mail!
  updateMail(mailInput: MailUpdateInput): Mail!
  deleteMail(id: ID!): String!

  createPost(postInput: PostInput): Post!
  updatePost(postInput: PostUpdateInput): Post!
  deletePost(id: ID!): String

  likePost(id: ID!): User!
  followUser(id: ID!): User!

}

schema {
  query: RootQuery,
  mutation: RootMutation
}
`);
