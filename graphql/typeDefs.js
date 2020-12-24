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

  type Like {
    id: ID!
    product: Product!
    user: User!
  }

  type Cart {
    id: ID!
    product: Product!
    user: User!
    quantity: Int!
  }

  type Order {
    id: ID!
    product: Product!
    user: User!
    quantity: Int!
  }

  type ProductPage {
    products: [Product]
    hasMore: Boolean
  }

  type OrderPage {
    id: ID
    user: User
    orders: [Order]
    hasMore: Boolean
  }

  type LikePage {
    id: ID
    user: User
    likes: [Product]
    hasMore: Boolean
  }

  type InCart {
    product: Product
    quantity: Int
  }

  type CartPage {
    id: ID
    user: User
    myCart: [InCart]!
    hasMore: Boolean
  }

  type Clear implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
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
    getProductPage(pageNum: Int!, pageSize: Int!): ProductPage!
    getOrderPage(pageNum: Int!, pageSize: Int!): OrderPage!
    getLikePage(pageNum: Int!, pageSize: Int!): LikePage!
    getCartPage(pageNum: Int!, pageSize: Int!): CartPage!
  }

  type Mutation {
    registerUser(input: RegisterUserInput!): User!
    loginUser(email: String!, password: String!): User!
    deleteUser: User!
    updateUser(input: UpdateUserInput!): User!
    addProduct(input: ProductInput!): Product!
    addRate(id: ID!, rate: Int!): Product!
    addLike(product: ID!): Like!
    deleteLike(product: ID!): Like!
    clearLikes: Clear!
    addOrder(product: ID!, quantity: Int!): Order!
    deleteOrder(product: ID!): Order!
    clearOrders: Clear!
    addToCart(product: ID!, quantity: Int!): Cart!
    deleteFromCart(product: ID!): Cart!
    clearMyCart: Clear!
    checkOut(product: ID!): Cart!
  }
`;
