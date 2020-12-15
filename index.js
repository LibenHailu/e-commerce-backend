const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const connectDB = require("./config/db");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");

//connecting to database
connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});

const app = express();

server.applyMiddleware({ app });

// serving images inside public/images
app.use(express.static("public"));

// listinig to server
app.listen({ port: 4000 }, () => {
  console.log(`🚀  Server ready at http://localhost:4000`);
});
