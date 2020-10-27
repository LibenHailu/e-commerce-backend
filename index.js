const { ApolloServer, gql } = require("apollo-server");
const connectDb = require("./config/db");
const mongoose = require("mongoose");
const User = require("./model/User");

//connecting to database
connectDb();

const typeDefs = gql`
  type User {
    userName: String!
    email: String!
    password: String!
    avatar: String!
  }

  type Query {
    getUser(email: String!, password: String!): User
  }

  type Mutation {
    addUser(userName: String!, email: String!, password: String!): User
  }
`;

const resolvers = {
  Query: {
    getUser: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (user.password === password) {
          return user;
        }
        return new Error("User not found");
      } catch (err) {
        return new Error("User not found");
      }
    },
  },

  Mutation: {
    addUser: async (_, { userName, email, password }) => {
      try {
        const user = await new User({
          userName,
          email,
          password,
        }).save();

        return user;
      } catch (err) {
        return new Error("User not found");
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

// TODO
// adding descriptive comment
//  adding hasing password
// sendin jwt
