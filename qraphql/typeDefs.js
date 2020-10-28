const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    id: ID!
    userName: String!
    email: String!
    password: String!
    avatar: String!
    token: String!
  }

  type Query {
    getUser(email: String!, password: String!): User
  }

  type Mutation {
    addUser(userName: String!, email: String!, password: String!): User
  }
`;
