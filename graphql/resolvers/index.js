const userResolvers = require("./userResolvers");
const productResolvers = require("./productResolvers");
const likeResolvers = require("./likeResolvers");
const orderResolvers = require("./orderResolvers");
const cartResolvers = require("./cartResolvers");

module.exports = {
  MutationResponse: {
    __resolveType(mutationResponse, context, info) {
      return null;
    },
  },
  Query: {
    ...productResolvers.Query,
    ...orderResolvers.Query,
    ...likeResolvers.Query,
    ...cartResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...productResolvers.Mutation,
    ...likeResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...cartResolvers.Mutation,
  },
};
