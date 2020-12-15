const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    token: String
  }

  type Product {
    id: ID!
    title: String!
    description: String!
    price: Float!
    image: String!
    rate: Float
  }

  input RegisterUserInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  input UpdateUserInput {
    username: String!
    email: String!
    oldPassword: String!
    newPassword: String!
  }

  input ProductInput {
    title: String!
    description: String!
    price: Float!
    image: String!
  }

  type Query {
    product(id: ID!): Product!
  }

  type Mutation {
    registerUser(input: RegisterUserInput!): User!
    loginUser(email: String!, password: String!): User!
    deleteUser: User!
    updateUser(input: UpdateUserInput!): User!
    addProduct(input: ProductInput!): Product!
    addRate(id: ID!, rate: Int!): Product!
  }
`;
