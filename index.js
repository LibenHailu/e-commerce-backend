const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const connectDB = require("./config/db");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");

//connecting to database
connectDB();

const PORT = process.env.PORT || 4000;
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
app.listen({ port: PORT }, () => {
  console.log(`🚀  Server ready`);
});
