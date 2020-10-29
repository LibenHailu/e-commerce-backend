const { ApolloServer } = require("apollo-server");
const connectDb = require("./config/db");
const typeDefs = require("./qraphql/typedefs");
const resolvers = require("./qraphql/resolvers");

//connecting to database
connectDb();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});
// listinig to server
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
