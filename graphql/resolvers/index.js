const userResolver = require("./userResolvers");
const productResolver = require("./productResolvers");

module.exports = {
  Query: {
    ...productResolver.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...productResolver.Mutation,
  },
};
