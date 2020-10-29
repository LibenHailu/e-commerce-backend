const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    avatar: String!
    token: String
  }
  type Recipe {
    id: ID!
    title: String!
    image: String!
    description: String!
    procedures: [String!]!
    createdAt: String
    createdBy: User
  }
  type RecipePage {
    recipes: [Recipe]
    hasMore: Boolean
  }
  type Query {
    getUser(email: String!, password: String!): User!
    getRecipePage(pageNum: Int!, pageSize: Int!): RecipePage!
  }
  type Mutation {
    loginUser(email: String!, password: String!): User!

    addUser(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!

    addRecipe(
      title: String!
      image: String!
      description: String!
      procedures: [String!]!
    ): Recipe!

    updateRecipe(
      recipeId: ID!
      title: String!
      image: String!
      description: String!
      procedures: [String!]!
    ): Recipe
  }
`;
